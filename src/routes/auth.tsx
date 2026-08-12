import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

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

  const masked =
    idNumber.length > 4 ? `XXXX XXXX ${idNumber.slice(-4)}` : idNumber ? "XXXX XXXX ····" : "";

  const submitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error("Please enter your email and a password of at least 6 characters.");
      return;
    }
    if (mode === "login") {
      toast.success("Welcome back.");
      navigate({ to: "/app" });
      return;
    }
    setStage("otp");
    toast.success("We've sent a 6-digit code to your registered mobile number.");
  };

  const submitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code to continue.");
      return;
    }
    toast.success("Verified. Your ID number was not saved.");
    navigate({ to: "/onboarding" });
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
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                  <TabsTrigger value="login">Log in</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Demo Credentials Box */}
              <div className="mt-4 rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm font-mono text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <p className="font-bold mb-1 flex items-center gap-2"><Lock className="size-4" /> [DEMO ACCESS]</p>
                <p className="opacity-80">EMAIL: demo@privaclick.com</p>
                <p className="opacity-80">PASS : password123</p>
                {mode === "signup" && <p className="opacity-80 mt-2 pt-2 border-t border-green-500/20">ID_NUM: [ANY NUMBER]</p>}
              </div>

              <form onSubmit={submitCredentials} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    maxLength={255}
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
                    />
                    <p className="text-xs text-muted-foreground">
                      {masked
                        ? `We'll show it only as ${masked}. The full number is never stored.`
                        : "We use this once to send your verification code, then discard it."}
                    </p>
                  </div>
                )}
                <Button type="submit" className="w-full">
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
                  We sent a 6-digit code to the mobile number linked to {masked || "your ID"}. This
                  is a one-time check.
                </p>
              </div>

              {/* Demo OTP Box */}
              <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm font-mono text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <p className="font-bold mb-1 flex items-center gap-2"><KeyRound className="size-4" /> [DEMO ACCESS]</p>
                <p className="opacity-80">CODE: 123456</p>
              </div>

              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <div className="space-y-2">
                <Button type="submit" className="w-full">
                  Verify and continue
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStage("credentials")}
                >
                  Go back
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