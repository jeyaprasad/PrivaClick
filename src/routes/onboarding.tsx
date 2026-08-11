import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ProgressStepper } from "@/components/ProgressStepper";
import { PhotoUpload, type PendingPhoto } from "@/components/PhotoUpload";
import { usePrivaclick } from "@/lib/store";
import { platforms } from "@/lib/mock-data";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your protection — Privaclick" },
      {
        name: "description",
        content: "Add reference photos and choose which platforms Privaclick should watch for you.",
      },
      { property: "og:title", content: "Set up your protection — Privaclick" },
      {
        property: "og:description",
        content: "Add photos and pick the platforms you want monitored.",
      },
    ],
  }),
  component: Onboarding,
});

const steps = ["Your photos", "Monitoring", "All set"];

function Onboarding() {
  const navigate = useNavigate();
  const { addPhotos, prefs, togglePlatform } = usePrivaclick();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<PendingPhoto[]>([]);

  const next = () => {
    if (step === 0) {
      if (files.length) addPhotos(files);
      setStep(1);
      return;
    }
    if (step === 1) {
      setStep(2);
      toast.success("Monitoring is on. We'll let you know if we find anything.");
    }
  };

  return (
    <div className="surface-gradient min-h-screen">
      <header className="border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <span className="font-display font-semibold">Privaclick</span>
          </Link>
          <span className="text-xs text-muted-foreground">Setup · about 3 minutes</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <ProgressStepper steps={steps} current={step} className="mb-10" />

        <Card className="animate-fade-up glass-card">
          <CardContent className="pt-6">
            {step === 0 && (
              <>
                <h1 className="text-2xl font-semibold">
                  Let's <span className="text-gradient">protect your photos</span>
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Clear photos of your face work best. Three or four is plenty to start.
                </p>
                <div className="mt-6">
                  <PhotoUpload
                    files={files}
                    onChange={setFiles}
                    note="These are private and used only to detect unauthorized copies. Never shared, never sold."
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="text-2xl font-semibold">
                  Where should we <span className="text-gradient">watch?</span>
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pick the platforms you'd like us to keep an eye on.
                </p>
                <div className="mt-6 space-y-3">
                  {platforms.map((p) => (
                    <div
                      key={p}
                      className="flex items-center justify-between rounded-xl border bg-background/40 px-4 py-3"
                    >
                      <Label htmlFor={`sw-${p}`} className="cursor-pointer text-sm font-medium">
                        {p}
                      </Label>
                      <Switch
                        id={`sw-${p}`}
                        checked={prefs[p]}
                        onCheckedChange={() => togglePlatform(p)}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  You can change this anytime in Settings.
                </p>
              </>
            )}

            {step === 2 && (
              <div className="py-8 text-center">
                <ShieldCheck className="animate-shield-pulse mx-auto size-14 text-primary" />
                <h1 className="mt-5 text-2xl font-semibold">
                  You're <span className="text-gradient">protected</span>
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  We'll notify you the moment we detect a match.
                </p>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || step === 2}
              >
                Back
              </Button>
              {step < 2 ? (
                <Button onClick={next}>
                  Continue <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button size="lg" onClick={() => navigate({ to: "/app" })}>
                  Go to Dashboard <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}