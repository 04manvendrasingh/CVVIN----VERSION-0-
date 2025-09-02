import { Link } from "react-router-dom"

export default function Dashboard() {
  return (
    <div className="stack" style={{ gap: 16 }}>
      <h2>Dashboard</h2>

      <section className="row" style={{ gap: 16, flexWrap: "wrap" }}>
        <StatCard label="Average Score" value="— %" />
        <StatCard label="Total Sessions" value="0" />
        <StatCard label="Last Session" value="—" />
        <StatCard label="Skill Level" value="—" />
      </section>

      <section className="card" style={{ padding: 16 }}>
        <h3>Quick Actions</h3>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <Link to="/analyze" className="btn btn-secondary">
            Resume Analysis
          </Link>
          <Link to="/tech" className="btn btn-secondary">
            Technical Interview
          </Link>
          <Link to="/hr" className="btn btn-secondary">
            HR Interview
          </Link>
          <Link to="/feedback" className="btn btn-secondary">
            View Feedback
          </Link>
        </div>
      </section>

      <section className="card" style={{ padding: 24, borderLeft: "6px solid var(--primary)" }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div className="stack" style={{ flex: "1 1 340px" }}>
            <h2 style={{ margin: 0 }}>Start End-to-End Mock Interview</h2>
            <p className="text-muted">A realistic resume-to-HR experience to prepare you for the real thing.</p>
            <span className="badge">Estimated time: 2–2.5 hours</span>
          </div>
          <div className="tooltip" style={{ alignSelf: "center" }}>
            <Link to="/mock/full" className="btn btn-primary" style={{ boxShadow: "0 0 0 6px rgba(39,76,119,0.12)" }}>
              Begin Full Mock
            </Link>
            <div className="tooltip-content">
              A full 2–2.5 hour interview simulation (Resume→Tech MCQs→Coding→HR) with detailed proctoring & feedback.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: 16, minWidth: 220 }}>
      <div className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  )
}
