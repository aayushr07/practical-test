import { NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { phone, message } = body;

    // basic validation
    if (!phone || !message) {
      return NextResponse.json(
        { error: "phone and message are required" },
        { status: 400 }
      );
    }

    // send message (Twilio or fallback mock inside lib)
    const result = await sendWhatsApp(phone, message);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error("Send-message error:", err);

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}