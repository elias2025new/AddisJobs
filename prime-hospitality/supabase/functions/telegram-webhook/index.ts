import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  try {
    const update = await req.json();

    // Check if the update contains a message with a contact
    if (update.message?.contact) {
      const contact = update.message.contact;
      const telegramId = contact.user_id || update.message.from?.id;
      let phone = contact.phone_number;
      
      if (phone && !phone.startsWith("+")) {
        phone = "+" + phone;
      }

      if (telegramId && phone) {
        console.log(`Received contact for user ${telegramId}`);
        // Save to telegram_contacts
        const { error: upsertError } = await supabase.from("telegram_contacts").upsert({
          telegram_id: telegramId,
          phone_number: phone
        });

        if (upsertError) {
          console.error("Error upserting into telegram_contacts:", upsertError);
        }

        // Try to update profile if it exists (in case the webhook arrives after the profile was created)
        const { error: updateError } = await supabase.from("profiles")
          .update({ phone_number: phone })
          .eq("telegram_id", telegramId);

        if (updateError) {
          console.error("Error updating profile:", updateError);
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error("Webhook error:", e);
    // Return 200 so Telegram doesn't retry infinitely on malformed payloads
    return new Response("Error", { status: 200 });
  }
});
