"use client";
//The UI is Created using the Claude AI for making it decent.
import { useState } from "react";

const COUNTRY_CODES = [
  { code: "+1",   country: "US" },
  { code: "+44",  country: "GB" },
  { code: "+61",  country: "AU" },
  { code: "+971", country: "AE" },
  { code: "+65",  country: "SG" },
  { code: "+60",  country: "MY" },
  { code: "+91",  country: "IN" },
  { code: "+92",  country: "PK" },
  { code: "+880", country: "BD" },
  { code: "+94",  country: "LK" },
  { code: "+977", country: "NP" },
  { code: "+33",  country: "FR" },
  { code: "+49",  country: "DE" },
  { code: "+81",  country: "JP" },
  { code: "+86",  country: "CN" },
  { code: "+55",  country: "BR" },
  { code: "+27",  country: "ZA" },
  { code: "+234", country: "NG" },
  { code: "+20",  country: "EG" },
  { code: "+7",   country: "RU" },
];


function localInputToET(datetimeLocal: string): Date {
  
  // EST = UTC-5, EDT = UTC-4 (DST). 
  const [datePart, timePart] = datetimeLocal.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  
  const probe = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const etString = probe.toLocaleString("en-US", { timeZone: "America/New_York", hour12: false });
  
  // Currently UTC to ET is UTC-4
 
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });

  // Try UTC directly and measure the ET offset
  const utcCandidate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const parts = formatter.formatToParts(utcCandidate);
  const p: Record<string, number> = {};
  parts.forEach(({ type, value }) => { if (type !== "literal") p[type] = parseInt(value); });
  const etHour = p.hour === 24 ? 0 : p.hour;
  // Difference between what ET shows vs what we want
  const diffMinutes = (hour - etHour) * 60 + (minute - p.minute);
  // Adjust UTC candidate by that diff
  return new Date(utcCandidate.getTime() + diffMinutes * 60_000);
}

function getReminderHint(appointmentTime: string): {
  show: boolean;
  withinHour: boolean;
  minsAway: number;
} {
  if (!appointmentTime) return { show: false, withinHour: false, minsAway: 0 };
  //To treat Local time as ET.
  const appointmentDate = localInputToET(appointmentTime);
  const diffMs = appointmentDate.getTime() - Date.now();
  const minsAway = Math.round(diffMs / 1000 / 60);
  if (diffMs <= 0) return { show: true, withinHour: false, minsAway };
  return { show: true, withinHour: minsAway <= 60, minsAway };
}

export default function Home() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    appointment_time: "",
  });
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<"idle" | "scheduled" | "sent">("idle");
  const [reminderCountdown, setReminderCountdown] = useState<number | null>(null);

  const hint = getReminderHint(form.appointment_time);

  function scheduleReminder(appointmentTime: string, name: string, phone: string) {
    const appointmentDate = localInputToET(appointmentTime);
    const diffMs = appointmentDate.getTime() - Date.now();
    const diffMins = diffMs / 1000 / 60;
    if (diffMins <= 0 || diffMins > 60) return;

    setReminderStatus("scheduled");
    setReminderCountdown(60);

    let seconds = 60;
    const ticker = setInterval(() => {
      seconds -= 1;
      setReminderCountdown(seconds);
      if (seconds <= 0) clearInterval(ticker);
    }, 1000);

    setTimeout(async () => {
      clearInterval(ticker);
      setReminderCountdown(null);
      try {
        await fetch("/api/reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            phone,
            appointment_time: appointmentDate.toISOString(),
          }),
        });
        setReminderStatus("sent");
      } catch (err) {
        console.error("Reminder failed:", err);
        setReminderStatus("idle");
      }
    }, 60_000);
  }

  async function submit() {
    const fullPhone = `${countryCode}${phoneNumber.replace(/\s+/g, "")}`;

    // Convert the local time value(ET) to a proper UTC ISO string to set the time correctly in DB and correct remainder in UTC.
    const appointmentDate = localInputToET(form.appointment_time);
    const utcISO = appointmentDate.toISOString();

    try {
      setLoading(true);
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: fullPhone, appointment_time: utcISO }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Failed to create appointment");
        return;
      }
      alert("Appointment created successfully!");
      scheduleReminder(form.appointment_time, form.name, fullPhone);
      setForm({ name: "", phone: "", appointment_time: "" });
      setPhoneNumber("");
      setCountryCode("+1");
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
        .booking-input::placeholder { color: #bbb; }
        .booking-input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
          cursor: pointer;
        }

        .time-hint {
          font-size: 10px;
          letter-spacing: 0.06em;
          margin-top: 6px;
          min-height: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .time-hint-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .time-hint.past   { color: #999; }
        .time-hint.soon   { color: #333; }
        .time-hint.normal { color: #aaa; }
        .time-hint.past   .time-hint-dot { background: #bbb; }
        .time-hint.soon   .time-hint-dot { background: #111; }
        .time-hint.normal .time-hint-dot { background: #ccc; }

        .reminder-banner {
          margin-top: 16px;
          padding: 12px 16px;
          border: 1px solid #ddd;
          background: #fafafa;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .reminder-banner.scheduled { border-color: #333; background: #f5f5f5; }
        .reminder-banner.sent      { border-color: #111; background: #111;    }

        .reminder-icon {
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .reminder-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .reminder-title {
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .reminder-sub {
          font-size: 11px;
          letter-spacing: 0.04em;
          color: #777;
        }
        .reminder-banner.scheduled .reminder-title { color: #111; }
        .reminder-banner.scheduled .reminder-sub   { color: #666; }
        .reminder-banner.sent      .reminder-title { color: #fff; }
        .reminder-banner.sent      .reminder-sub   { color: #888; }

        .reminder-countdown {
          margin-left: auto;
          font-size: 18px;
          font-weight: 300;
          color: #111;
          letter-spacing: -0.02em;
          flex-shrink: 0;
          align-self: center;
        }

        .phone-row { display: flex; width: 100%; }
        .phone-code-wrap { position: relative; flex-shrink: 0; }
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
          min-width: 88px;
          transition: border-color 0.15s, background 0.15s;
          border-radius: 0;
        }
        .phone-code-select:focus { border-color: #111; background: #e8e8e8; }
        .phone-code-arrow {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #777;
          font-size: 9px;
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
          -webkit-appearance: none;
        }
        .phone-number-input:focus { border-color: #111; background: #fff; }
        .phone-number-input::placeholder { color: #bbb; }
        .phone-row:focus-within .phone-code-select,
        .phone-row:focus-within .phone-number-input { border-color: #111; }
        .phone-preview {
          font-size: 10px;
          color: #aaa;
          letter-spacing: 0.06em;
          margin-top: 5px;
          min-height: 14px;
        }
        .phone-preview.ready { color: #666; }

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
        .booking-btn:hover:not(:disabled) { background: #fff; color: #111; }
        .booking-btn:disabled { opacity: 0.45; cursor: not-allowed; }
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
                  placeholder="2025551234"
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
              <label>Date & Time (ET)</label>
              <input
                className="booking-input"
                type="datetime-local"
                value={form.appointment_time}
                onChange={(e) =>
                  setForm({ ...form, appointment_time: e.target.value })
                }
              />

              {hint.show && (
                <>
                  {hint.minsAway <= 0 && (
                    <span className="time-hint past">
                      <span className="time-hint-dot" />
                      This time has already passed
                    </span>
                  )}
                  {hint.minsAway > 0 && hint.withinHour && (
                    <span className="time-hint soon">
                      <span className="time-hint-dot" />
                      Within 1 hour — a reminder will be sent 1 min after booking
                    </span>
                  )}
                  {hint.minsAway > 60 && (
                    <span className="time-hint normal">
                      <span className="time-hint-dot" />
                      {hint.minsAway >= 1440
                        ? `${Math.round(hint.minsAway / 60 / 24)} day${Math.round(hint.minsAway / 60 / 24) !== 1 ? "s" : ""} away`
                        : hint.minsAway >= 60
                        ? `${Math.round(hint.minsAway / 60)} hr${Math.round(hint.minsAway / 60) !== 1 ? "s" : ""} away`
                        : `${hint.minsAway} min away`}
                      {" "}— reminder will be sent before 1 hour of appointment
                    </span>
                  )}
                </>
              )}

              {reminderStatus === "scheduled" && (
                <div className="reminder-banner scheduled">
                  <span className="reminder-icon">◷</span>
                  <div className="reminder-text">
                    <span className="reminder-title">Reminder Scheduled</span>
                    <span className="reminder-sub">
                      Sending reminder message in {reminderCountdown}s
                    </span>
                  </div>
                  <span className="reminder-countdown">{reminderCountdown}</span>
                </div>
              )}

              {reminderStatus === "sent" && (
                <div className="reminder-banner sent">
                  <span className="reminder-icon">✓</span>
                  <div className="reminder-text">
                    <span className="reminder-title">Reminder Sent</span>
                    <span className="reminder-sub">
                      Message dispatched successfully
                    </span>
                  </div>
                </div>
              )}
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