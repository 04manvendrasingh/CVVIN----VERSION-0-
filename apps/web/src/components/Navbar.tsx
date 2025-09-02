"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@state/auth"
import { Avatar } from "./ui/Avatar"

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/analyze", label: "Analyze" },
  { to: "/tech", label: "Technical" },
  { to: "/hr", label: "HR" },
  { to: "/feedback", label: "Feedback" },
]

export function Navbar() {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const nav = useNavigate()

  return (
    <header className="navbar">
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", height: 64, justifyContent: "space-between" }}
      >
        <div className="row">
          <Link to="/dashboard" className="row" style={{ fontWeight: 700, color: "var(--primary)" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary)" }} />
            <span>CVVIN</span>
          </Link>
          <nav className="row" style={{ marginLeft: 8 }}>
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: loc.pathname.startsWith(l.to) ? "white" : "transparent",
                  color: loc.pathname.startsWith(l.to) ? "var(--primary)" : "inherit",
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="row">
          {user ? (
            <div className="dropdown" style={{ position: "relative" }}>
              <button className="btn btn-ghost" aria-haspopup="menu" aria-expanded="false">
                <Avatar name={user.name || user.email} url={user.photoUrl} />
              </button>
              <div
                className="menu card"
                role="menu"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: 8,
                  padding: 8,
                  minWidth: 200,
                  display: "none",
                }}
              />
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary">
              Sign in
            </Link>
          )}
        </div>
      </div>
      {/* Simple dropdown via scriptless CSS toggle */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
        document.addEventListener('click', (e) => {
          const btn = (e.target as HTMLElement).closest('.dropdown > button');
          const drop = (e.target as HTMLElement).closest('.dropdown');
          document.querySelectorAll('.dropdown .menu').forEach(m => (m as HTMLElement).style.display = 'none');
          if (btn) {
            const menu = (btn.parentElement as HTMLElement).querySelector('.menu') as HTMLElement;
            if (menu) {
              menu.style.display = 'block';
              menu.innerHTML = \`
                <a class="row" style="padding:8px 10px;border-radius:8px" href="/profile">Profile</a>
                <a class="row" style="padding:8px 10px;border-radius:8px" href="/settings">Settings</a>
                <button class="row" id="cvvin-logout" style="padding:8px 10px;border-radius:8px;background:transparent;border:0;text-align:left;width:100%">Logout</button>
              \`;
              setTimeout(()=> {
                const b = document.getElementById('cvvin-logout');
                if (b) b.addEventListener('click', () => {
                  window.dispatchEvent(new CustomEvent('cvvin-logout'));
                })
              }, 0)
            }
          } else if (!drop) {
            // clicking outside
            // already closed above
          }
        })
        `,
        }}
      />
      <LogoutBridge />
    </header>
  )
}

function LogoutBridge() {
  const { logout } = useAuth()
  const nav = useNavigate()
  // wire native event to React action
  window.addEventListener("cvvin-logout", () => {
    logout()
    nav("/auth")
  })
  return null
}
