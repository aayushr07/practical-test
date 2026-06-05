"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true);
        const res = await fetch("/api/appointments");
        const json = await res.json();
        const appointments = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : [];
        setData(appointments);
      } catch (err: any) {
        setError("Failed to load appointments");
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    loadAppointments();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@300;400;500&display=swap');

        .dash-root {
          min-height: 100vh;
          background: #111;
          font-family: 'DM Mono', monospace;
          padding: 56px 24px;
          box-sizing: border-box;
        }

        .dash-inner {
          max-width: 640px;
          margin: 0 auto;
        }

        .dash-eyebrow {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 8px;
        }

        .dash-title {
          font-family: 'DM Serif Display', serif;
          font-size: 38px;
          color: #f0f0f0;
          margin: 0 0 4px;
          line-height: 1.1;
        }

        .dash-count {
          font-size: 11px;
          color: #555;
          letter-spacing: 0.1em;
          margin-bottom: 36px;
        }

        .dash-divider {
          width: 100%;
          height: 1px;
          background: #2a2a2a;
          margin-bottom: 28px;
        }

        .dash-state {
          color: #555;
          font-size: 13px;
          letter-spacing: 0.06em;
        }

        .dash-state.error {
          color: #aaa;
        }

        .appt-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .appt-card {
          background: #1a1a1a;
          border-left: 2px solid #333;
          padding: 20px 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 24px;
          transition: border-color 0.15s, background 0.15s;
        }

        .appt-card:hover {
          border-left-color: #f0f0f0;
          background: #1f1f1f;
        }

        .appt-field {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .appt-field-label {
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #444;
          font-weight: 500;
        }

        .appt-field-value {
          font-size: 13px;
          color: #d0d0d0;
          font-weight: 400;
        }

        .appt-field.full-width {
          grid-column: 1 / -1;
        }

        .appt-index {
          font-size: 9px;
          color: #333;
          letter-spacing: 0.12em;
          text-align: right;
          align-self: center;
        }

        .loading-dots::after {
          content: '';
          animation: dots 1.2s steps(3, end) infinite;
        }

        @keyframes dots {
          0%   { content: '.'; }
          33%  { content: '..'; }
          66%  { content: '...'; }
        }
      `}</style>

      <div className="dash-root">
        <div className="dash-inner">
          <p className="dash-eyebrow">Overview</p>
          <h2 className="dash-title">Appointments</h2>

          {!loading && !error && (
            <p className="dash-count">
              {data.length} {data.length === 1 ? "record" : "records"} found
            </p>
          )}

          <div className="dash-divider" />

          {loading && (
            <p className="dash-state">
              <span className="loading-dots">Loading</span>
            </p>
          )}

          {error && <p className="dash-state error">{error}</p>}

          {!loading && !error && data.length === 0 && (
            <p className="dash-state">No appointments scheduled yet.</p>
          )}

          {!loading && !error && data.length > 0 && (
            <div className="appt-list">
              {data.map((a: any, i: number) => (
                <div key={a.id} className="appt-card">
                  <div className="appt-field">
                    <span className="appt-field-label">Name</span>
                    <span className="appt-field-value">{a.name}</span>
                  </div>
                  <div className="appt-field">
                    <span className="appt-field-label">Phone</span>
                    <span className="appt-field-value">{a.phone}</span>
                  </div>
                  <div className="appt-field full-width">
                    <span className="appt-field-label">Scheduled For</span>
                    <span className="appt-field-value">{a.appointment_time}</span>
                  </div>
                  <span className="appt-index">#{String(i + 1).padStart(2, "0")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}