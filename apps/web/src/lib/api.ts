const BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8000"

async function api<T = any>(path: string, opts?: RequestInit): Promise<T> {
  const url = `${BASE}${path}`
  try {
    const res = await fetch(url, { headers: { "Content-Type": "application/json", ...(opts?.headers || {}) }, ...opts })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.headers.get("content-type")?.includes("application/json")
      ? await res.json()
      : ((await res.text()) as any)
  } catch (e) {
    // Fallback mock if server not running
    if (path === "/v1/health") return { status: "mock-ok" } as any
    throw e
  }
}

export const API = {
  health: () => api("/v1/health"),
  authExchange: (token: string) => api("/v1/auth/exchange", { method: "POST", body: JSON.stringify({ token }) }),
  saveProfile: (userId: string, body: any) =>
    api(`/v1/profile?user_id=${encodeURIComponent(userId)}`, { method: "POST", body: JSON.stringify(body) }),
  uploadResume: async (file: File) => {
    const fd = new FormData()
    fd.append("file", file)
    const url = `${BASE}/v1/resumes`
    const res = await fetch(url, { method: "POST", body: fd })
    return res.json()
  },
  uploadJD: (jd_text: string) => api("/v1/jds", { method: "POST", body: JSON.stringify({ jd_text }) }),
  match: (resume_id: string, jd_id: string) =>
    api("/v1/match", { method: "POST", body: JSON.stringify({ resume_id, jd_id }) }),
  sessionCreate: (type: "tech" | "hr") => api("/v1/sessions", { method: "POST", body: JSON.stringify({ type }) }),
  mcqNext: (session_id: string) => api(`/v1/mcq/next?session_id=${session_id}`, { method: "POST" }),
  mcqSubmit: (body: any) => api("/v1/mcq/submit", { method: "POST", body: JSON.stringify(body) }),
  codeRun: (body: any) => api("/v1/code/run", { method: "POST", body: JSON.stringify(body) }),
  hrAsk: (session_id: string) => api(`/v1/hr/ask?session_id=${session_id}`, { method: "POST" }),
  hrIngest: async (body: { transcript?: string; audio?: File }) => {
    const url = `${BASE}/v1/hr/ingest`
    if (body.audio) {
      const fd = new FormData()
      if (body.transcript) fd.append("transcript", body.transcript)
      fd.append("audio", body.audio)
      const res = await fetch(url, { method: "POST", body: fd })
      return res.json()
    }
    return api("/v1/hr/ingest", { method: "POST", body: JSON.stringify({ transcript: body.transcript }) })
  },
  proctorEvent: (body: any) => api("/v1/proctor/events", { method: "POST", body: JSON.stringify(body) }),
  proctorFlags: (session_id: string) => api(`/v1/proctor/flags?session_id=${session_id}`),
  feedbackFinalize: (session_id: string) =>
    api("/v1/feedback/finalize", { method: "POST", body: JSON.stringify({ session_id }) }),
}
