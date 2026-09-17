import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { sendOtp, verifyOtp } from "../lib/supabase-fns";
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

    setLoading(true);
    try {
      const res = await sendOtp({ data: { email } });
      if (res && res.success === false) {
        if (res.reason === "email_not_configured") {
          toast.error("Server Error: Email is not configured. Cannot send OTP.");
        } else {
          toast.error("Failed to send verification email. Please try again later.");
        }
        return;
      }
      setStage("otp");
      setCooldown(30);
      toast.success(`OTP sent to ${email}`);
    } catch (err: any) {
      console.error(err);
      toast.error(`ERROR: ${err.message || "Failed to send OTP"}`);
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
      const res = await verifyOtp({ data: { email, code: otp } });
      if (res.success) {
        await loadUserData();
        toast.success(mode === "login" ? "Welcome back." : "Account activated successfully.");
        navigate({ to: mode === "login" ? "/app" : "/onboarding" });
      } else {
        toast.error(`ERROR: ${res.error || "Verification failed"}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`ERROR: Verification failed. ${err.message || ""}`);
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                  <Label htmlFor="idnum">ID number for one-time verification</Label>
                  <Input
                    id="idnum"
                    inputMode="numeric"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                    placeholder="Used once, never saved"
                    disabled={loading}
                    className="rounded-lg border-border focus-visible:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    {masked
                      ? `We'll show it only as ${masked}. The full number is never stored.`
                      : "We use this once to send your verification code, then discard it."}
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
                    const res = await sendOtp({ data: { email } });
                    if (res && res.success === false) {
                      if (res.reason === "email_not_configured") {
                        toast.error("Server Error: Email is not configured.");
                      } else {
                        toast.error("Failed to resend verification email.");
                      }
                      return;
                    }
                    setCooldown(30);
                    toast.success(`A new code was sent to ${email}`);
                  } catch (err: any) {
                      toast.error(`ERROR: ${err.message || "Failed to resend OTP"}`);
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
