import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendWhatsApp(to: string, message: string) {
  try {
    console.log("📤 Sending WhatsApp to:", to);

    const res = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER!, 
      to: `whatsapp:${to}`,   // MUST include whatsapp:
      body: message,
    });

    console.log("✅ WhatsApp sent:", res.sid);

    return res;
  } catch (err: any) {
    console.error("❌ Twilio Error FULL:", err);

    throw err; // IMPORTANT: don't hide errors anymore
  }
}