import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, Lock, ShieldCheck, Loader2 } from "lucide-react";
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
      await sendOtp({ data: { email } });
      setStage("otp");
      setCooldown(30);
      toast.success(`> OTP_SENT: A 6-digit code has been sent to ${email}`);
    } catch (err: any) {
      console.error(err);
      toast.error(`> ERROR: FAILED_TO_SEND_OTP. Please check your credentials.`);
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
        localStorage.setItem("privaclick_email", email);
        await loadUserData(email);
        toast.success(mode === "login" ? "Welcome back." : "> VERIFIED: ACCOUNT_ACTIVATED");
        navigate({ to: mode === "login" ? "/app" : "/onboarding" });
      } else {
        toast.error(`> ERROR: ${res.error || "VERIFICATION_FAILED"}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`> ERROR: VERIFICATION_FAILED. ${err.message || ""}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="surface-gradient hidden flex-col justify-between border-r p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <span className="font-display text-lg font-semibold">Privaclick</span>
        </Link>
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold">Verification that respects you</h2>
          <p className="mt-4 text-muted-foreground">
            We check that you are who you say you are so nobody can claim your photos but you. The
            check happens once, and the ID number is never stored or shown again.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            {[
              ["One-time verification", "Your ID is used for the check and then discarded."],
              ["Encrypted by default", "Everything you upload is encrypted in transit and at rest."],
              ["You stay in charge", "No report is ever filed without your confirmation."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">{t}</p>
                  <p className="text-muted-foreground">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">Trusted by people protecting 1.2M photos.</p>
      </div>

      <div className="flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm animate-fade-up">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Back home
          </Link>

          {stage === "credentials" ? (
            <>
              <h1 className="text-2xl font-semibold">
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signup"
                  ? "A couple of details and a quick verification, that's it."
                  : "Log in to see what's new on your account."}
              </p>

              <Tabs value={mode} onValueChange={setMode} className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signup" disabled={loading}>Sign up</TabsTrigger>
                  <TabsTrigger value="login" disabled={loading}>Log in</TabsTrigger>
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
                    />
                    <p className="text-xs text-muted-foreground">
                      {masked
                        ? `We'll show it only as ${masked}. The full number is never stored.`
                        : "We use this once to send your verification code, then discard it."}
                    </p>
                  </div>
                )}
                <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  {mode === "signup" ? "Continue to verification" : "Log in"}
                </Button>
              </form>
            </>
          ) : (
            <form onSubmit={submitOtp} className="space-y-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <KeyRound className="size-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Enter your code</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We sent a 6-digit verification code to the email address **{email}**. This is a one-time check.
                </p>
              </div>

              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={loading}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <div className="space-y-2">
                <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  Verify and continue
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStage("credentials")}
                  disabled={loading}
                >
                  Go back
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-xs text-muted-foreground hover:text-primary"
                  onClick={async () => {
                    if (cooldown > 0) return;
                    setLoading(true);
                    try {
                      await sendOtp({ data: { email } });
                      setCooldown(30);
                      toast.success(`> OTP_RESENT: A new code was sent to ${email}`);
                    } catch (err) {
                      toast.error("> ERROR: FAILED_TO_RESEND_OTP");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading || cooldown > 0}
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Once verified, we keep only the masked reference. The full number is discarded.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}