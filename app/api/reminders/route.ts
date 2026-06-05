import { supabase } from "@/lib/supabase";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function GET() {
  try {
    const now = new Date();
    const oneHourLater = new Date(
      now.getTime() + 60 * 60 * 1000
    );

    // STEP 1: fetch candidates
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("*")
      .lte("appointment_time", oneHourLater.toISOString())
      .eq("reminder_sent", false);

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!appointments || appointments.length === 0) {
      return Response.json({ sent: 0 });
    }

    let sentCount = 0;

    // STEP 2: process one by one safely
    for (const appt of appointments) {
      try {
        // 🔒 IMPORTANT: mark FIRST to prevent duplicate cron sends
        const { error: updateError } = await supabase
          .from("appointments")
          .update({ reminder_sent: true })
          .eq("id", appt.id);

        if (updateError) {
          console.error(
            "Update failed:",
            updateError
          );
          continue;
        }

        // STEP 3: send WhatsApp
        await sendWhatsApp(
          appt.phone,
          `Reminder: Your appointment is at ${appt.appointment_time}`
        );

        sentCount++;
      } catch (err) {
        console.error(
          "Reminder send failed:",
          appt.id,
          err
        );

        // optional rollback (so it can retry later)
        await supabase
          .from("appointments")
          .update({ reminder_sent: false })
          .eq("id", appt.id);
      }
    }

    return Response.json({
      success: true,
      sent: sentCount,
    });
  } catch (err: any) {
    console.error("Reminder CRON error:", err);

    return Response.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}