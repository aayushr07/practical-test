"use client";

import { useState } from "react";

const COUNTRY_CODES = [
  { code: "+91", country: "IN" },
  { code: "+1", country: "US" },
  { code: "+44", country: "GB" },
  { code: "+61", country: "AU" },
  { code: "+971", country: "AE" },
  { code: "+65", country: "SG" },
  { code: "+60", country: "MY" },
  { code: "+92", country: "PK" },
  { code: "+880", country: "BD" },
  { code: "+94", country: "LK" },
  { code: "+977", country: "NP" },
  { code: "+33", country: "FR" },
  { code: "+49", country: "DE" },
  { code: "+81", country: "JP" },
  { code: "+86", country: "CN" },
  { code: "+55", country: "BR" },
  { code: "+27", country: "ZA" },
  { code: "+234", country: "NG" },
  { code: "+20", country: "EG" },
  { code: "+7", country: "RU" },
];

export default function Home() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    appointment_time: "",
  });

  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const fullPhone = `${countryCode}${phoneNumber.replace(/\s+/g, "")}`;

    try {
      setLoading(true);
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: fullPhone }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Failed to create appointment");
        return;
      }
      alert("Appointment created successfully!");
      setForm({ name: "", phone: "", appointment_time: "" });
      setPhoneNumber("");
      setCountryCode("+91");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .booking-root {
          min-height: 100vh;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          padding: 24px;
        }

        .booking-card {
          background: #ffffff;
          border: 1.5px solid #111;
          width: 100%;
          max-width: 460px;
          padding: 48px 44px;
          box-shadow: 6px 6px 0px #111;
        }

        .booking-label {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 6px;
          display: block;
        }

        .booking-title {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          color: #111;
          margin: 0 0 8px 0;
          line-height: 1.1;
        }

        .booking-divider {
          width: 40px;
          height: 2px;
          background: #111;
          margin: 16px 0 36px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .field-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-wrap label {
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #555;
          font-weight: 500;
        }

        .booking-input {
          background: #fafafa;
          border: 1px solid #ccc;
          border-radius: 0;
          padding: 12px 14px;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: #111;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
          width: 100%;
          -webkit-appearance: none;
        }

        .booking-input:focus {
          border-color: #111;
          background: #fff;
        }

        .booking-input::placeholder {
          color: #bbb;
        }

        .booking-input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
          cursor: pointer;
        }

        /* Phone row */
        .phone-row {
          display: flex;
          gap: 0;
          width: 100%;
        }

        .phone-code-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .phone-code-select {
          appearance: none;
          -webkit-appearance: none;
          background: #f0f0f0;
          border: 1px solid #ccc;
          border-right: none;
          padding: 12px 32px 12px 12px;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: #111;
          outline: none;
          cursor: pointer;
          height: 100%;
          min-width: 80px;
          transition: border-color 0.15s, background 0.15s;
          border-radius: 0;
        }

        .phone-code-select:focus {
          border-color: #111;
          background: #e8e8e8;
        }

        .phone-code-arrow {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #777;
          font-size: 9px;
          line-height: 1;
        }

        .phone-number-input {
          flex: 1;
          background: #fafafa;
          border: 1px solid #ccc;
          border-radius: 0;
          padding: 12px 14px;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: #111;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
          width: 100%;
          -webkit-appearance: none;
        }

        .phone-number-input:focus {
          border-color: #111;
          background: #fff;
        }

        .phone-number-input::placeholder {
          color: #bbb;
        }

        /* Focus sync: when number input focused, highlight both borders */
        .phone-row:focus-within .phone-code-select,
        .phone-row:focus-within .phone-number-input {
          border-color: #111;
        }

        .phone-preview {
          font-size: 10px;
          color: #aaa;
          letter-spacing: 0.06em;
          margin-top: 5px;
          min-height: 14px;
          transition: color 0.15s;
        }

        .phone-preview.ready {
          color: #666;
        }

        .booking-btn {
          margin-top: 12px;
          width: 100%;
          padding: 14px;
          background: #111;
          color: #fff;
          border: 1.5px solid #111;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          font-weight: 500;
        }

        .booking-btn:hover:not(:disabled) {
          background: #fff;
          color: #111;
        }

        .booking-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
      `}</style>

      <div className="booking-root">
        <div className="booking-card">
          <span className="booking-label">Schedule</span>
          <h2 className="booking-title">Book Appointment</h2>
          <div className="booking-divider" />

          <div className="field-group">
            <div className="field-wrap">
              <label>Full Name</label>
              <input
                className="booking-input"
                placeholder="Jane Smith"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="field-wrap">
              <label>Phone Number</label>
              <div className="phone-row">
                <div className="phone-code-wrap">
                  <select
                    className="phone-code-select"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    {COUNTRY_CODES.map(({ code, country }) => (
                      <option key={`${code}-${country}`} value={code}>
                        {country} {code}
                      </option>
                    ))}
                  </select>
                  <span className="phone-code-arrow">▾</span>
                </div>
                <input
                  className="phone-number-input"
                  placeholder="9876543210"
                  value={phoneNumber}
                  maxLength={13}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/[^\d]/g, ""))
                  }
                />
              </div>
              <span className={`phone-preview ${phoneNumber ? "ready" : ""}`}>
                {phoneNumber
                  ? `→ will be stored as ${countryCode}${phoneNumber}`
                  : "enter digits only"}
              </span>
            </div>

            <div className="field-wrap">
              <label>Date & Time</label>
              <input
                className="booking-input"
                type="datetime-local"
                value={form.appointment_time}
                onChange={(e) =>
                  setForm({ ...form, appointment_time: e.target.value })
                }
              />
            </div>

            <button className="booking-btn" onClick={submit} disabled={loading}>
              {loading ? "Creating..." : "Confirm Appointment →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}