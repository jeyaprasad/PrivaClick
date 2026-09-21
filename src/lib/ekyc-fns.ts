import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const verifyIdSandbox = createServerFn({ method: "POST" })
  .validator(z.object({
    idType: z.enum(["aadhaar", "pan", "passport", "voter"]),
    idNumber: z.string()
  }))
  .handler(async ({ data }) => {
    const { idType, idNumber } = data;

    // Simulate network latency to an eKYC provider (e.g., Setu, SurePass)
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Sandbox test logic:
    // For demo purposes, we treat any ID ending with the digit '0' as a failed verification.
    if (idNumber.endsWith("0")) {
      return {
        success: true,
        verified: false,
        reason: `${idType.toUpperCase()} not found in database (Sandbox).`
      };
    }

    // All other properly formatted IDs pass the sandbox check
    return {
      success: true,
      verified: true,
      reason: "Verified successfully."
    };
  });
