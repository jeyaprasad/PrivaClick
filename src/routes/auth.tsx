import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { handleFormError } from "../lib/error-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { sendOtp, verifyOtp } from "../lib/supabase-fns";
import { startPhoneVerification, checkPhoneVerification } from "../lib/twilio-fns";

import { verifyIdSandbox } from "../lib/ekyc-fns";
import { validateAadhaarChecksum, validatePAN, validatePassport, validateVoterId } from "../lib/id-verification";
import { usePrivaclick } from "../lib/store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Privaclick" },
      {
        name: "description",
        content: "Create your Privaclick account or log in to review matches and file complaints.",
      },
      { property: "og:title", content: "Sign in to Privaclick" },
      { property: "og:description", content: "Create an account or log in to Privaclick." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signup");
  const [stage, setStage] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idType, setIdType] = useState<"aadhaar" | "pan" | "passport" | "voter">("aadhaar");
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email");
  const [idNumber, setIdNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { loadUserData } = usePrivaclick();

  const masked =
    idNumber.length > 4 ? `XXXX XXXX ${idNumber.slice(-4)}` : idNumber ? "XXXX XXXX ····" : "";

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error("Please enter your email and a password of at least 6 characters.");
      return;
    }

    if (mode === "signup") {
      if (!idNumber) {
        toast.error(`Please enter your ${idType.toUpperCase()} number.`);
        return;
      }
      
      let isValid = false;
      let errorMsg = "";
      
      if (idType === "aadhaar") {
        const result = validateAadhaarChecksum(idNumber);
        isValid = result.valid;
        errorMsg = result.reason || "Invalid Aadhaar number.";
      } else if (idType === "pan") {
        const result = validatePAN(idNumber);
        isValid = result.valid;
        errorMsg = result.reason || "Invalid PAN number.";
      } else if (idType === "passport") {
        const result = validatePassport(idNumber);
        isValid = result.valid;
        errorMsg = result.reason || "Invalid Passport number.";
      } else if (idType === "voter") {
        const result = validateVoterId(idNumber);
        isValid = result.valid;
        errorMsg = result.reason || "Invalid Voter ID.";
      }

      if (!isValid) {
        toast.error(errorMsg);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await sendOtp({ data: { email, method: contactMethod } });
      if (res && res.success === false) {
        if (res.reason === "email_not_configured") {
          handleFormError(res);
        } else {
          handleFormError(res);
        }
        return;
      }
      setStage("otp");
      setCooldown(30);
      toast.success(`OTP sent to ${email}`);
    } catch (err: any) {
        handleFormError(err);
      } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp({ data: { email, code: otp, method: contactMethod } });
      if (res.success) {
        await loadUserData();
        toast.success(mode === "login" ? "Welcome back." : "Account activated successfully.");
        navigate({ to: mode === "login" ? "/app" : "/onboarding" });
      } else {
        toast.error(res.error || "Verification failed.");
      }
    } catch (err: any) {
        handleFormError(err);
      } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6">
      <Link to="/" className="mb-8 flex items-center gap-2 group">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
          <ShieldCheck className="size-5" />
        </div>
        <span className="text-2xl font-bold font-display tracking-tight text-foreground">Privaclick</span>
      </Link>

      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8 animate-fade-up">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Back home
        </Link>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${stage === "credentials" || stage === "otp" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>1</div>
            <div className={`h-0.5 w-8 ${stage === "otp" ? "bg-primary" : "bg-muted"}`} />
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${stage === "otp" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</div>
            <div className="h-0.5 w-8 bg-muted" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">3</div>
          </div>
        </div>

        {stage === "credentials" ? (
          <>
            <h1 className="text-2xl font-display font-semibold text-foreground text-center">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              {mode === "signup"
                ? "A couple of details and a quick verification, that's it."
                : "Log in to see what's new on your account."}
            </p>

            <Tabs value={mode} onValueChange={setMode} className="mt-6">
              <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted/50 p-1">
                <TabsTrigger value="signup" disabled={loading} className="rounded-md">Sign up</TabsTrigger>
                <TabsTrigger value="login" disabled={loading} className="rounded-md">Log in</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={submitCredentials} className="mt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="contact">{contactMethod === "email" ? "Email" : "Phone Number"}</Label>
                  <button type="button" onClick={() => setContactMethod(m => m === "email" ? "phone" : "email")} className="text-xs text-primary hover:underline">
                    Verify with {contactMethod === "email" ? "phone number" : "email"} instead
                  </button>
                </div>
                <Input
                  id="contact"
                  type={contactMethod === "email" ? "email" : "tel"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={contactMethod === "email" ? "you@example.com" : "+91 9876543210"}
                  maxLength={255}
                  disabled={loading}
                  className="rounded-lg border-border focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  maxLength={72}
                  disabled={loading}
                  className="rounded-lg border-border focus-visible:ring-primary"
                  required
                />
              </div>
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="idnum">ID Type for one-time verification</Label>
                  <div className="flex gap-2">
                    <select
                      className="flex h-10 w-1/3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                      value={idType}
                      onChange={(e) => {
                        setIdType(e.target.value as any);
                        setIdNumber("");
                      }}
                      disabled={loading}
                    >
                      <option value="aadhaar">Aadhaar</option>
                      <option value="pan">PAN</option>
                      <option value="passport">Passport</option>
                      <option value="voter">Voter ID</option>
                    </select>
                    <Input
                      id="idnum"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, idType === "aadhaar" ? 12 : 10))}
                      placeholder={
                        idType === "aadhaar" ? "0000 0000 0000" :
                        idType === "pan" ? "ABCDE1234F" :
                        idType === "passport" ? "A1234567" : "ABC1234567"
                      }
                      disabled={loading}
                      className="rounded-lg border-border focus-visible:ring-primary w-2/3"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {masked
                      ? `We'll show it only as ${masked}. The full number is never stored.`
                      : "We use this once to securely verify your identity, then discard it."}
                  </p>
                  <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-1 uppercase tracking-wider">
                    Sandbox mode — production uses licensed eKYC provider.
                  </p>
                </div>
              )}
              <Button type="submit" className="w-full rounded-lg h-11 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 mt-2" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                {mode === "signup" ? "Continue to verification" : "Log in"}
              </Button>
            </form>
          </>
        ) : (
          <form onSubmit={submitOtp} className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <KeyRound className="size-6" />
              </div>
              <h1 className="text-2xl font-display font-semibold text-foreground">Enter your code</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a 6-digit verification code to the email address <strong className="text-foreground">{email}</strong>. This is a one-time check.
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={loading}>
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} className="rounded-md border-border h-12 w-10 sm:w-12 text-lg font-semibold focus-visible:ring-primary focus-visible:ring-offset-0 focus:border-primary" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <div className="space-y-3 pt-2">
              <Button type="submit" className="w-full rounded-lg h-11 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                Verify and continue
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-lg h-11 border-border"
                onClick={() => setStage("credentials")}
                disabled={loading}
              >
                Go back
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full text-sm text-muted-foreground hover:text-primary"
                onClick={async () => {
                  if (cooldown > 0) return;
                  setLoading(true);
                  try {
                    const res = await sendOtp({ data: { email, method: contactMethod } });
                    if (res && res.success === false) {
        if (res.reason === "email_not_configured") {
          handleFormError(res);
        } else {
          handleFormError(res);
        }
        return;
      }
                    setCooldown(30);
                    toast.success(`A new code was sent to ${email}`);
                  } catch (err: any) {
        handleFormError(err);
      } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || cooldown > 0}
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Once verified, we keep only the masked reference. The full number is discarded.
            </p>
          </form>
        )}
      </div>
      <p className="mt-8 text-xs text-muted-foreground">Trusted by people protecting 1.2M photos.</p>
    </div>
  );
}
