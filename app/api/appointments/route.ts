import { supabase } from "@/lib/supabase";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET ERROR:", error);
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return Response.json(data ?? []);
  } catch (err) {
    console.error("GET EXCEPTION:", err);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("REQUEST BODY:", body);

    const { name, phone, appointment_time } = body;

    if (!name || !phone || !appointment_time) {
      return Response.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    
    
    const appointmentDate = new Date(appointment_time);

    // reminder = 1 hour before appointment
    const reminderTime = new Date(appointmentDate.getTime() - 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("appointments")
      .insert([
        {
          name,
          phone,
          appointment_time: appointmentDate.toISOString(),
          reminder_time: reminderTime.toISOString(),
          reminder_sent: false,
        },
      ])
      .select()
      .single();

    console.log("INSERT DATA:", data);
    console.log("INSERT ERROR:", error);

    if (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

  //The timezone of supabase in UTC and that used is ET hence UTC format is given.It will send notification in UTC if required can change in ET.  
  const readableTime = appointmentDate.toLocaleString("en-US", {
  timeZone: "America/New_York",   
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});


    try {
      await sendWhatsApp(
        phone,
        `Hi ${name}, your appointment is confirmed for ${readableTime} UST`
      );
    } catch (messageError) {
      console.error("WhatsApp send failed:", messageError);
    }

    return Response.json({ success: true, appointment: data });
  } catch (err) {
    console.error("POST EXCEPTION:", err);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}