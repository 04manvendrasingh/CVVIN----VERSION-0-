"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@state/auth"
import { getProfile, setProfile, type Profile } from "@state/profile"
import { useNavigate } from "react-router-dom"

export default function ProfileSetup() {
  const { user, markHasProfile } = useAuth()
  const nav = useNavigate()
  const [p, setP] = useState<Profile | null>(null)

  useEffect(() => {
    if (!user) return
    const existing =
      getProfile(user.id) ||
      ({
        userId: user.id,
        fullName: user.name || "",
        email: user.email,
        skills: [],
        interestedRoles: [],
      } as Profile)
    setP(existing)
  }, [user])

  if (!user || !p) return null

  function onFileToDataUrl(file: File, cb: (r: { name: string; dataUrl: string }) => void) {
    const fr = new FileReader()
    fr.onload = () => cb({ name: file.name, dataUrl: String(fr.result) })
    fr.readAsDataURL(file)
  }

  const setField = <K extends keyof Profile>(k: K, v: Profile[K]) => setP({ ...p, [k]: v })

  return (
    <div className="stack" style={{ gap: 16 }}>
      <h2>Set up your profile</h2>
      <div className="card" style={{ padding: 16 }}>
        <div className="stack" style={{ gap: 16 }}>
          <section className="stack">
            <h3>Basic Info</h3>
            <div className="row" style={{ gap: 16, flexWrap: "wrap" }}>
              <label style={{ flex: "1 1 260px" }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Profile Picture</div>
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    onFileToDataUrl(f, (r) => setField("photo", r))
                  }}
                />
                <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
                  Used for proctoring.
                </div>
              </label>
              <label style={{ flex: "1 1 260px" }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Full Name</div>
                <input className="input" value={p.fullName} onChange={(e) => setField("fullName", e.target.value)} />
              </label>
              <label style={{ flex: "1 1 260px" }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Email</div>
                <input className="input" value={p.email} onChange={(e) => setField("email", e.target.value)} />
              </label>
              <label style={{ flex: "1 1 260px" }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Phone</div>
                <input className="input" value={p.phone || ""} onChange={(e) => setField("phone", e.target.value)} />
              </label>
            </div>
          </section>

          <section className="stack">
            <h3>Education</h3>
            <div className="row" style={{ gap: 16, flexWrap: "wrap" }}>
              <label style={{ flex: "1 1 260px" }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Qualification</div>
                <select
                  className="select"
                  value={p.qualification || ""}
                  onChange={(e) => setField("qualification", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Bachelor's</option>
                  <option>Master's</option>
                  <option>Diploma</option>
                  <option>PhD</option>
                  <option>Other</option>
                </select>
              </label>
              <label style={{ flex: "1 1 260px" }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>College / University</div>
                <input
                  className="input"
                  value={p.college || ""}
                  onChange={(e) => setField("college", e.target.value)}
                />
              </label>
              <label style={{ flex: "1 1 260px" }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Current Semester / Year</div>
                <input
                  className="input"
                  value={p.currentYear || ""}
                  onChange={(e) => setField("currentYear", e.target.value)}
                />
              </label>
              <label style={{ flex: "1 1 260px" }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Year of Passing (or expected)</div>
                <input
                  className="input"
                  value={p.passingYear || ""}
                  onChange={(e) => setField("passingYear", e.target.value)}
                />
              </label>
              <label style={{ flex: "1 1 260px" }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Currently pursuing</div>
                <input
                  className="input"
                  value={p.pursuing || ""}
                  onChange={(e) => setField("pursuing", e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="stack">
            <h3>Skills</h3>
            <TagInput
              value={p.skills}
              onChange={(skills) => setField("skills", skills)}
              suggestions={["Python", "SQL", "React", "Docker", "Node.js", "Git"]}
            />
          </section>

          <section className="stack">
            <h3>Interested Roles</h3>
            <TagInput
              value={p.interestedRoles}
              onChange={(v) => setField("interestedRoles", v)}
              suggestions={["Backend", "Frontend", "Data", "DevOps", "Mobile"]}
            />
          </section>

          <section className="stack">
            <h3>Resume (Profile Resume)</h3>
            <input
              className="input"
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                onFileToDataUrl(f, (r) => setField("resume", r))
              }}
            />
          </section>

          <div className="row" style={{ justifyContent: "flex-end", gap: 12 }}>
            <button
              className="btn btn-ghost"
              onClick={() => {
                markHasProfile(false)
                nav("/dashboard")
              }}
            >
              Skip for now
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setProfile(p)
                markHasProfile(true)
                nav("/dashboard")
              }}
            >
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TagInput({
  value,
  onChange,
  suggestions,
}: { value: string[]; onChange: (v: string[]) => void; suggestions: string[] }) {
  const [input, setInput] = useState("")
  function add(tag: string) {
    if (!tag) return
    if (value.includes(tag)) return
    onChange([...value, tag])
    setInput("")
  }
  return (
    <div className="stack">
      <div className="row" style={{ flexWrap: "wrap" }}>
        {value.map((v) => (
          <span key={v} className="badge" style={{ marginRight: 8 }}>
            {v}
            <button
              onClick={() => onChange(value.filter((x) => x !== v))}
              style={{ marginLeft: 6, background: "transparent", border: 0, cursor: "pointer" }}
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="row">
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a skill and press Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              add(input.trim())
            }
          }}
        />
        <button className="btn btn-secondary" type="button" onClick={() => add(input.trim())}>
          Add
        </button>
      </div>
      <div className="row" style={{ flexWrap: "wrap" }}>
        {suggestions.map((s) => (
          <button key={s} type="button" className="btn btn-ghost" onClick={() => add(s)}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
