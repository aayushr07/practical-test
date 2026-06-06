import { supabase } from "@/lib/supabase";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function GET() {
  try {
    const now = new Date().toISOString();

    //ONLY exact reminder time due now
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("*")
      .lte("reminder_time", now)
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

    for (const appt of appointments) {
      try {
        
        await sendWhatsApp(
          appt.phone,
          `Reminder: Your appointment is at ${appt.appointment_time}UTC`
        );

        // mark sent ONLY after success
        await supabase
          .from("appointments")
          .update({ reminder_sent: true })
          .eq("id", appt.id);

        sentCount++;
      } catch (err) {
        console.error("Reminder failed:", appt.id, err);
      }
    }

    return Response.json({
      success: true,
      sent: sentCount,
    });
  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
