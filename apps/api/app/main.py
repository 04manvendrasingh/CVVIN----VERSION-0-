from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid
import asyncio
import json
import subprocess
import tempfile
import textwrap
import os

app = FastAPI(title="CVVIN API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory stores (MVP)
STORE: Dict[str, Any] = {
    "profiles": {},      # user_id -> profile
    "resumes": {},       # resume_id -> text or info
    "jds": {},           # jd_id -> text
    "sessions": {},      # session_id -> {type, mcq_index, score, events: []}
    "proctor_events": {},# session_id -> [events]
}

def _load_json(path: str):
    here = os.path.dirname(__file__)
    with open(os.path.join(here, "data", path), "r", encoding="utf-8") as f:
        return json.load(f)

MCQ_BANK = _load_json("mcq_bank.json")
CODING = _load_json("coding_problem.json")

@app.get("/v1/health")
async def health():
    return {"status": "ok"}

class ExchangeReq(BaseModel):
    token: str

@app.post("/v1/auth/exchange")
async def auth_exchange(req: ExchangeReq):
    # mock
    return {"jwt": f"mock-{uuid.uuid4()}", "user": {"id": str(uuid.uuid4()), "email": "mockuser@gmail.com"}}

@app.post("/v1/profile")
async def save_profile(user_id: str, profile: Dict[str, Any]):
    STORE["profiles"][user_id] = profile
    return {"ok": True, "profile": profile}

@app.post("/v1/resumes")
async def upload_resume(file: UploadFile = File(...)):
    rid = str(uuid.uuid4())
    text = (await file.read()).decode(errors="ignore")
    STORE["resumes"][rid] = {"name": file.filename, "text": text}
    return {"resume_id": rid}

class JDReq(BaseModel):
    jd_text: str

@app.post("/v1/jds")
async def post_jd(req: JDReq):
    jid = str(uuid.uuid4())
    STORE["jds"][jid] = {"text": req.jd_text}
    return {"jd_id": jid}

class MatchReq(BaseModel):
    resume_id: str
    jd_id: str

def simple_cosine(a: str, b: str):
    # Very simple bag-of-words cosine similarity
    import math
    import re
    tok = lambda s: [t for t in re.split(r"[^a-zA-Z0-9]+", s.lower()) if t]
    A, B = tok(a), tok(b)
    va, vb = {}, {}
    for t in A: va[t] = va.get(t, 0)+1
    for t in B: vb[t] = vb.get(t, 0)+1
    keys = set(va) | set(vb)
    dot = sum(va.get(k,0)*vb.get(k,0) for k in keys)
    na = math.sqrt(sum(v*v for v in va.values()))
    nb = math.sqrt(sum(v*v for v in vb.values()))
    return dot/(na*nb) if na and nb else 0.0

@app.post("/v1/match")
async def match(req: MatchReq):
    r = STORE["resumes"].get(req.resume_id, {})
    j = STORE["jds"].get(req.jd_id, {})
    score = simple_cosine(r.get("text",""), j.get("text",""))
    # Mocked skills/gaps
    return {"score": score, "skills": [{"name":"python","level":"intermediate"},{"name":"react","level":"beginner"}], "gaps": ["kubernetes","aws"]}

@app.post("/v1/questions/generate")
async def generate_questions(jd_id: Optional[str] = None):
    return {"mcqs": MCQ_BANK, "coding": [{"id": CODING["id"], "title": CODING["title"]}]}

class SessionReq(BaseModel):
    type: str

@app.post("/v1/sessions")
async def create_session(req: SessionReq):
    sid = str(uuid.uuid4())
    STORE["sessions"][sid] = {"type": req.type, "mcq_index": 0, "score": 0}
    STORE["proctor_events"].setdefault(sid, [])
    return {"session_id": sid}

@app.post("/v1/mcq/next")
async def mcq_next(session_id: str):
    s = STORE["sessions"].get(session_id)
    if not s: return {"id": None, "question": None, "options": [], "index": 0, "total": 0}
    idx = s["mcq_index"]
    total = len(MCQ_BANK)
    if idx >= total:
      return {"id": None, "question": None, "options": [], "index": idx, "total": total}
    q = MCQ_BANK[idx]
    return {"id": q["id"], "question": q["question"], "options": q["options"], "index": idx+1, "total": total}

class McqSubmitReq(BaseModel):
  session_id: str
  question_id: str
  selected_index: int

@app.post("/v1/mcq/submit")
async def mcq_submit(req: McqSubmitReq):
    s = STORE["sessions"].get(req.session_id)
    if not s: return {"correct": False, "score_delta": 0, "total_score": 0, "next_available": False}
    # find q
    q = next((x for x in MCQ_BANK if x["id"] == req.question_id), None)
    correct = (q and q["answer"] == req.selected_index)
    delta = 1 if correct else 0
    s["score"] += delta
    s["mcq_index"] += 1
    next_available = s["mcq_index"] < len(MCQ_BANK)
    return {"correct": bool(correct), "score_delta": delta, "total_score": s["score"], "next_available": next_available}

class CodeRunReq(BaseModel):
    problem_id: str
    lang: str
    code: str

def run_python_with_tests(code: str, tests: List[Dict[str, Any]]):
    prog = textwrap.dedent(f"""
    {code}

    import json
    def _run():
        results = []
        try:
            for t in TESTS:
                got = solve(*t['input'])
                ok = got == t['output']
                results.append({{'ok': ok, 'got': got, 'want': t['output']}})
            print(json.dumps({{'results': results}}))
        except Exception as e:
            print(json.dumps({{'error': str(e)}}))
    if __name__ == '__main__':
        TESTS = {json.dumps(tests)}
        _run()
    """)
    with tempfile.NamedTemporaryFile('w', suffix='.py', delete=False) as f:
        f.write(prog)
        path = f.name
    try:
        out = subprocess.run(['python', path], capture_output=True, text=True, timeout=2)
        data = json.loads(out.stdout.strip() or '{}')
        if 'error' in data: return False, data
        results = data.get('results', [])
        passed = sum(1 for r in results if r.get('ok'))
        return passed == len(results), {"passed": passed, "total": len(results), "results": results}
    except subprocess.TimeoutExpired:
        return False, {"error": "timeout"}
    finally:
        try: os.unlink(path)
        except: pass

@app.post("/v1/code/run")
async def code_run(req: CodeRunReq):
    if req.lang != "python":
        return {"passed": 0, "total": 0, "results": [], "error": "only python supported in dev"}
    tests = CODING["tests"]
    ok, data = run_python_with_tests(req.code, tests)
    if "error" in data:
        return {"passed": 0, "total": len(tests), "results": [], "error": data["error"]}
    return { "passed": data["passed"], "total": data["total"], "results": data["results"] }

@app.post("/v1/hr/ask")
async def hr_ask(session_id: str):
    q = [
        "Tell me about yourself.",
        "Describe a challenging project you worked on.",
        "What are your strengths and weaknesses?"
    ]
    i = len(STORE["proctor_events"].get(session_id, [])) % len(q)
    return {"question": q[i]}

@app.post("/v1/hr/ingest")
async def hr_ingest(transcript: Optional[str] = Form(None), audio: Optional[UploadFile] = File(None)):
    text = transcript or ""
    words = len(text.split()) if text else 0
    metrics = {
        "words_per_min_approx": min(160, max(60, words // 3)),
        "filler_ratio_approx": 0.05 if "um" not in text.lower() else 0.15,
        "sentiment_approx": "positive" if "enjoy" in text.lower() else "neutral"
    }
    return {"transcript": text, "metrics": metrics}

class ProctorEvent(BaseModel):
    session_id: str
    type: str
    meta: Optional[Dict[str, Any]] = None

@app.post("/v1/proctor/events")
async def proctor_events(ev: ProctorEvent):
    STORE["proctor_events"].setdefault(ev.session_id, []).append({"type": ev.type, "meta": ev.meta})
    return {"ok": True}

@app.get("/v1/proctor/flags")
async def proctor_flags(session_id: str):
    evs = STORE["proctor_events"].get(session_id, [])
    hard = any(e["type"] == "webcam_off" for e in evs)
    soft = sum(1 for e in evs if e["type"] == "tab_blur")
    return {"events": evs, "hard_flag": hard, "soft_flag_count": soft}

class FeedbackReq(BaseModel):
    session_id: str

@app.post("/v1/feedback/finalize")
async def feedback_finalize(req: FeedbackReq):
    s = STORE["sessions"].get(req.session_id, {"score": 0})
    summary = {
        "mcq_score": s.get("score", 0),
        "hr_turns": 3,
        "coding": "attempted"
    }
    return {"summary": summary, "scores": {"mcq": s.get("score", 0), "hr": 0.7, "coding": 1}}
