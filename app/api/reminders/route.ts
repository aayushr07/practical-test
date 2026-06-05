import { supabase } from "@/lib/supabase";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function GET() {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .lte("appointment_time", oneHourLater.toISOString())
    .eq("reminder_sent", false);

  if (!appointments) return Response.json({ ok: true });

  for (const appt of appointments) {
    await sendWhatsApp(
      appt.phone,
      `Reminder: Your appointment is at ${appt.appointment_time}`
    );

    await supabase
      .from("appointments")
      .update({ reminder_sent: true })
      .eq("id", appt.id);
  }

  return Response.json({ sent: appointments.length });
}