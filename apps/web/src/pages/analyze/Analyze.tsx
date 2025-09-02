"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@state/auth"
import { getProfile } from "@state/profile"
import { API } from "@lib/api" // added API import

type MatchResult = {
  score: number
  skills: { name: string; level: string }[]
  gaps: string[]
}

export default function Analyze() {
  const { user } = useAuth()
  const [useProfileResume, setUseProfileResume] = useState(true)
  const [uploadedResume, setUploadedResume] = useState<File | null>(null)
  const [jdUpload, setJdUpload] = useState<File | null>(null)
  const [jdPaste, setJdPaste] = useState("")
  const [loading, setLoading] = useState(false) // loading state
  const [result, setResult] = useState<MatchResult | null>(null) // match result

  const profile = useMemo(() => (user ? getProfile(user.id) : null), [user])

  const hasResume = useProfileResume ? !!profile?.resume : !!uploadedResume
  const hasJD = !!jdPaste || !!jdUpload
  const disabled = !(hasResume && hasJD) || loading

  async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
    const arr = dataUrl.split(",")
    const mime = arr[0].match(/:(.*?);/)?.[1] || "application/octet-stream"
    const bstr = atob(arr[1] || "")
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) u8arr[n] = bstr.charCodeAt(n)
    return new File([u8arr], filename, { type: mime })
  }

  async function fileToText(file: File): Promise<string> {
    return await file.text()
  }

  async function onAnalyze() {
    if (disabled) return
    setLoading(true)
    setResult(null)
    try {
      // Prepare resume_id
      let resumeId = ""
      if (useProfileResume) {
        if (!profile?.resume) throw new Error("No Profile Resume found")
        const f = await dataUrlToFile(profile.resume.dataUrl, profile.resume.name || "resume.txt")
        const r = await API.uploadResume(f)
        resumeId = r.resume_id
      } else {
        if (!uploadedResume) throw new Error("No resume uploaded")
        const r = await API.uploadResume(uploadedResume)
        resumeId = r.resume_id
      }

      // Prepare jd_id (paste takes precedence)
      let jdId = ""
      if (jdPaste.trim().length > 0) {
        const j = await API.uploadJD(jdPaste.trim())
        jdId = j.jd_id
      } else if (jdUpload) {
        const text = await fileToText(jdUpload)
        const j = await API.uploadJD(text)
        jdId = j.jd_id
      } else {
        throw new Error("No JD provided")
      }

      // Call match
      const m = await API.match(resumeId, jdId)
      setResult(m)
    } catch (e) {
      console.error("[Analyze] error:", e)
      alert("Analyze failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <h2>Analyze Resume ↔ JD</h2>

      <section className="card" style={{ padding: 16 }}>
        <h3>Resume Source</h3>
        <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
          <label className="row" style={{ gap: 8 }}>
            <input type="radio" checked={useProfileResume} onChange={() => setUseProfileResume(true)} />
            <span>
              <b>Use Profile Resume</b>
            </span>
          </label>
          <label className="row" style={{ gap: 8 }}>
            <input type="radio" checked={!useProfileResume} onChange={() => setUseProfileResume(false)} />
            <span>
              <b>Upload Another Resume</b>
            </span>
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          {useProfileResume ? (
            profile?.resume ? (
              <div className="row">
                <span className="badge">{profile.resume.name}</span>
                <a className="btn btn-ghost" href="/profile">
                  Preview/Replace in Profile
                </a>
              </div>
            ) : (
              <div className="text-muted">
                No Profile Resume found. <a href="/profile">Go to Profile</a>
              </div>
            )
          ) : (
            <input
              className="input"
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={(e) => setUploadedResume(e.target.files?.[0] || null)}
            />
          )}
        </div>
      </section>

      <section className="card" style={{ padding: 16 }}>
        <h3>Job Description</h3>
        <div className="row" style={{ gap: 16, flexWrap: "wrap" }}>
          <label style={{ flex: "1 1 280px" }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Upload JD (PDF/TXT)</div>
            <input
              className="input"
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setJdUpload(e.target.files?.[0] || null)}
            />
          </label>
          <label style={{ flex: "2 1 380px" }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Or paste JD</div>
            <textarea
              className="textarea"
              value={jdPaste}
              onChange={(e) => setJdPaste(e.target.value)}
              placeholder="Paste job description here..."
            />
          </label>
        </div>
      </section>

      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn-primary" disabled={disabled} onClick={onAnalyze}>
          {loading ? "Analyzing..." : "Analyze Resume Match"}
        </button>
      </div>

      {result && (
        <section className="card" style={{ padding: 16 }}>
          <h3>Match Results</h3>
          <div className="stack" style={{ gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Score</div>
              <div className="progress">
                <span style={{ width: `${Math.round(result.score * 100)}%` }} />
              </div>
              <div className="text-muted" style={{ marginTop: 6 }}>
                {Math.round(result.score * 100)}%
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Matched Skills</div>
              <div className="row" style={{ flexWrap: "wrap" }}>
                {result.skills.map((s) => (
                  <span key={s.name} className="badge" style={{ marginRight: 8 }}>
                    {s.name} · {s.level}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Gaps</div>
              <div className="row" style={{ flexWrap: "wrap" }}>
                {result.gaps.map((g) => (
                  <span
                    key={g}
                    className="badge"
                    style={{ background: "var(--muted)", color: "white", marginRight: 8 }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
