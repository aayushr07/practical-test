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
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return Response.json(data ?? []);
  } catch (err) {
    console.error("GET EXCEPTION:", err);

    return Response.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("REQUEST BODY:", body);

    const {
      name,
      phone,
      appointment_time,
    } = body;

    if (!name || !phone || !appointment_time) {
      return Response.json(
        {
          success: false,
          error: "All fields are required",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert([
        {
          name,
          phone,
          appointment_time,
        },
      ])
      .select()
      .single();

    console.log("INSERT DATA:", data);
    console.log("INSERT ERROR:", error);

    if (error) {
      return Response.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    try {
      await sendWhatsApp(
        phone,
        `Hi ${name}, your appointment is confirmed for ${appointment_time}`
      );
    } catch (messageError) {
      console.error(
        "WhatsApp send failed:",
        messageError
      );
    }

    return Response.json({
      success: true,
      appointment: data,
    });
  } catch (err) {
    console.error("POST EXCEPTION:", err);

    return Response.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}