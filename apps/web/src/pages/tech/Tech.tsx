"use client"

import { useEffect, useState } from "react"
import { API } from "@lib/api"

type MCQ = { id: string; question: string; options: string[]; index: number; total: number }
type RunResult = { passed: number; total: number; results: { ok: boolean; got: any; want: any }[]; error?: string }

export default function Tech() {
  const [sessionId, setSessionId] = useState<string | null>(null)

  // MCQ state
  const [q, setQ] = useState<MCQ | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState<number>(0)
  const [mcqDone, setMcqDone] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Coding state
  const [code, setCode] = useState<string>(
    [
      "def solve(a, b):",
      "    # TODO: implement the solution",
      "    return a + b",
      "",
      "# You can define helper functions above if needed.",
    ].join("\n"),
  )
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState<RunResult | null>(null)

  useEffect(() => {
    // Proctor: tab visibility + webcam request
    const onVis = () => {
      API.proctorEvent({ session_id: sessionId || "local", type: document.hidden ? "tab_blur" : "tab_focus" }).catch(
        () => {},
      )
    }
    document.addEventListener("visibilitychange", onVis)
    navigator.mediaDevices
      ?.getUserMedia?.({ video: true })
      .then(() => {
        API.proctorEvent({ session_id: sessionId || "local", type: "webcam_on" }).catch(() => {})
      })
      .catch(() => {
        API.proctorEvent({ session_id: sessionId || "local", type: "webcam_off" }).catch(() => {})
      })
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [sessionId])

  async function startSession() {
    const r = await API.sessionCreate("tech")
    setSessionId(r.session_id)
    setScore(0)
    setLastCorrect(null)
    setMcqDone(false)
    setSelected(null)
    await fetchNext(r.session_id)
  }

  async function fetchNext(id?: string) {
    const sid = id || sessionId
    if (!sid) return
    const n = await API.mcqNext(sid)
    if (!n || !n.id) {
      setQ(null)
      setMcqDone(true)
    } else {
      setQ(n)
      setSelected(null)
      setLastCorrect(null)
    }
  }

  async function submitAnswer() {
    if (!sessionId || !q || selected === null) return
    setSubmitting(true)
    try {
      const r = await API.mcqSubmit({ session_id: sessionId, question_id: q.id, selected_index: selected })
      setLastCorrect(!!r.correct)
      setScore(r.total_score ?? score)
      if (!r.next_available) {
        setMcqDone(true)
        setQ(null)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function runCode() {
    setRunning(true)
    setRunResult(null)
    try {
      const r = await API.codeRun({ problem_id: "sum_two", lang: "python", code })
      setRunResult(r)
    } catch (e) {
      alert("Run failed. Please try again.")
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <h2>Technical Round</h2>
      <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={startSession}>
          Start session
        </button>
        {sessionId && <span className="badge">Session: {sessionId}</span>}
        <span className="badge" aria-live="polite">
          MCQ Score: {score}
        </span>
      </div>

      <section className="card" style={{ padding: 16 }}>
        <h3>MCQs</h3>
        {!sessionId && <p className="text-muted">Start a session to begin the MCQ round.</p>}

        {sessionId && !mcqDone && q && (
          <div className="stack" style={{ gap: 12 }}>
            <div className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>
              Question {q.index} of {q.total}
            </div>
            <div style={{ fontWeight: 600 }}>{q.question}</div>
            <fieldset style={{ border: "0", padding: 0 }}>
              <legend className="sr-only">Options</legend>
              <div className="stack">
                {q.options.map((opt, i) => (
                  <label key={i} className="row" style={{ gap: 8 }}>
                    <input type="radio" name={`mcq_${q.id}`} checked={selected === i} onChange={() => setSelected(i)} />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-secondary" onClick={submitAnswer} disabled={selected === null || submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => fetchNext()}
                disabled={q == null || submitting}
                aria-label="Next question"
              >
                Next question
              </button>
            </div>

            {lastCorrect !== null && (
              <div
                className="badge"
                style={{
                  background: lastCorrect ? "var(--accent)" : "var(--muted)",
                  color: lastCorrect ? "#0b2545" : "white",
                }}
                aria-live="polite"
              >
                {lastCorrect ? "Correct" : "Incorrect"}
              </div>
            )}
          </div>
        )}

        {sessionId && (mcqDone || (!q && !submitting)) && (
          <div className="stack" style={{ marginTop: 8 }}>
            <div className="text-muted">MCQ section completed.</div>
            <button className="btn btn-ghost" onClick={() => fetchNext()}>
              Review last question / Try fetching again
            </button>
          </div>
        )}
      </section>

      <section className="card" style={{ padding: 16 }}>
        <h3>Coding: Sum Two Numbers — implement solve(a,b)</h3>
        <div className="stack" style={{ gap: 8 }}>
          <textarea
            className="textarea"
            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", minHeight: 180 }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            aria-label="Code editor"
          />
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-secondary" onClick={runCode} disabled={running}>
              {running ? "Running..." : "Run"}
            </button>
          </div>

          {runResult && (
            <div className="stack" style={{ gap: 8 }}>
              <div className="text-muted">
                Passed {runResult.passed} / {runResult.total}
              </div>
              {runResult.error && (
                <div className="badge" style={{ background: "var(--muted)", color: "white" }}>
                  Error: {runResult.error}
                </div>
              )}
              <div className="stack">
                {runResult.results?.map((r, idx) => (
                  <div key={idx} className="row" style={{ gap: 8 }}>
                    <span
                      className="badge"
                      style={{ background: r.ok ? "var(--accent)" : "var(--muted)", color: r.ok ? "#0b2545" : "white" }}
                    >
                      {r.ok ? "Pass" : "Fail"}
                    </span>
                    <span className="text-muted">
                      Got: {String(r.got)} · Want: {String(r.want)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
