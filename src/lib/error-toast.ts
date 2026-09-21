import { toast } from "sonner";

export function handleFormError(err: any, customFallback = "Something went wrong. Please try again.") {
  console.error("Intercepted Error:", err);

  // If the server explicitly returned our normalized { success: false, error: string } schema
  if (err && typeof err === "object") {
    if (err.success === false && err.error) {
      toast.error(err.error);
      return;
    }
    if (err.success === false && err.reason) {
      // Handle legacy specific reasons if any still bubble up
      if (err.reason === "email_not_configured" || err.reason === "twilio_not_configured") {
        toast.error("Service is currently unconfigured. Please contact support.");
        return;
      }
      toast.error(customFallback);
      return;
    }
    
    // In case err.message somehow bubbles up from an uncaught client-side exception
    if (typeof err.message === "string") {
      // Prevent internal raw stack traces/messages (like "transporter is not defined")
      const lowerMsg = err.message.toLowerCase();
      if (
        lowerMsg.includes("transporter") ||
        lowerMsg.includes("is not defined") ||
        lowerMsg.includes("null reading") ||
        lowerMsg.includes("network error") ||
        lowerMsg.includes("fetch failed") ||
        lowerMsg.includes("internal server error")
      ) {
        toast.error("An unexpected service error occurred. Please try again later.");
      } else {
        // If it's a known friendly message, show it, else fallback
        toast.error(customFallback);
      }
      return;
    }
  }

  // Final fallback
  toast.error(customFallback);
}
