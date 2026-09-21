import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { logError } from "./logger";
import { setCookie } from "@tanstack/react-start/server";
import { SignJWT } from "jose";
import { supabase } from "./supabase.server";
import { getCookie } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev";
const SESSION_SECRET = new TextEncoder().encode(JWT_SECRET);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

async function getAuthSupabase() {
  const token = getCookie("privaclick_session");
  if (token) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
  }
  return supabase;
}

export const startPhoneVerification = createServerFn({ method: "POST" })
  .validator(z.object({ phoneNumber: z.string() }))
  .handler(async ({ data }) => {
    const { phoneNumber } = data;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !serviceSid) {
      logError("Twilio environment variables are missing.");
      return { success: false, reason: "twilio_not_configured" };
    }

    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const params = new URLSearchParams();
      params.append("To", phoneNumber);
      params.append("Channel", "sms");

      const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        logError("Twilio Verify send failed:", errorText);
        return { success: false, reason: "twilio_send_failed" };
      }
      return { success: true };
    } catch (err: any) {
      logError("startPhoneVerification internal error:", err);
      return { success: false, reason: "internal_error" };
    }
  });

export const checkPhoneVerification = createServerFn({ method: "POST" })
  .validator(z.object({ phoneNumber: z.string(), code: z.string() }))
  .handler(async ({ data }) => {
    const { phoneNumber, code } = data;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !serviceSid) {
      logError("Twilio environment variables are missing.");
      return { success: false, error: "Twilio not configured on the server." };
    }

    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const params = new URLSearchParams();
      params.append("To", phoneNumber);
      params.append("Code", code);

      const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        logError("Twilio VerificationCheck failed:", errorText);
        return { success: false, error: "Failed to verify phone code." };
      }

      const result = await response.json();
      if (result.status !== "approved") {
        return { success: false, error: "Incorrect or expired verification code." };
      }

      let finalUserId = "u1";
      try {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", phoneNumber)
          .maybeSingle();

        if (!existingUser) {
          finalUserId = `u-${Date.now()}`;
          await (await getAuthSupabase()).from("users").insert({
            id: finalUserId,
            name: "USER",
            email: phoneNumber,
            phone: phoneNumber,
            masked_id: "XXXX XXXX 4821",
            verified_on: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            known_domains: "example.com"
          });
        } else {
          finalUserId = existingUser.id;
        }
      } catch (err) {
        logError("Failed to register user to database, proceeding locally.", err);
      }

      const jwt = await new SignJWT({ userId: finalUserId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(SESSION_SECRET);

      setCookie("privaclick_session", jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax"
      });

      return { success: true };

    } catch (err: any) {
      logError("checkPhoneVerification internal error:", err);
      return { success: false, error: "Internal server error during verification." };
    }
  });
