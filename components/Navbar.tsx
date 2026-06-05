"use client";

import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === "/";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@300;400;500&display=swap');

        .navbar {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 32px;
          font-family: 'DM Mono', monospace;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .navbar.light {
          background: #ffffff;
          border-bottom: 1px solid #e0e0e0;
        }

        .navbar.dark {
          background: #0a0a0a;
          border-bottom: 1px solid #1f1f1f;
        }

        .nav-brand {
          font-family: 'DM Serif Display', serif;
          font-size: 16px;
          letter-spacing: 0.02em;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          transition: opacity 0.15s;
        }
        .nav-brand:hover { opacity: 0.6; }
        .nav-brand.light { color: #111; }
        .nav-brand.dark  { color: #666; }

        .nav-btn {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          background: none;
          padding: 8px 16px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }

        .nav-btn.light {
          color: #111;
          border: 1px solid #bbb;
        }
        .nav-btn.light:hover {
          background: #111;
          color: #fff;
          border-color: #111;
        }

        .nav-btn.dark {
          color: #888;
          border: 1px solid #333;
        }
        .nav-btn.dark:hover {
          background: #f0f0f0;
          color: #111;
          border-color: #f0f0f0;
        }
      `}</style>

      <nav className={`navbar ${isHome ? "light" : "dark"}`}>
        <button
          className={`nav-brand ${isHome ? "light" : "dark"}`}
          onClick={() => router.push("/")}
        >
          EPWQ
        </button>

        {isHome ? (
          <button
            className="nav-btn light"
            onClick={() => router.push("/dashboard")}
          >
            View Dashboard →
          </button>
        ) : (
          <button
            className="nav-btn dark"
            onClick={() => router.push("/")}
          >
            ← Book Appointment
          </button>
        )}
      </nav>
    </>
  );
}