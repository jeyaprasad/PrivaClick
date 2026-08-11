import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Download, FileText, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProgressStepper } from "@/components/ProgressStepper";
import { usePrivaclick } from "@/lib/store";

export const Route = createFileRoute("/app/complaints/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    detection: typeof search["detection"] === "string" ? (search["detection"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "File a complaint — Privaclick" },
      {
        name: "description",
        content: "Turn a confirmed match into a complaint, with the evidence attached for you.",
      },
      { property: "og:title", content: "File a complaint — Privaclick" },
      { property: "og:description", content: "File a complaint with the evidence pre-filled." },
    ],
  }),
  component: NewComplaint,
});

const schema = z.object({
  description: z
    .string()
    .trim()
    .min(10, "Please add a little more detail (at least 10 characters).")
    .max(1000, "Please keep this under 1000 characters."),
  contact: z.string().trim().email("Enter a valid email address.").max(255),
});

const stages = ["Submitted", "Under Review", "Action Taken"];

function NewComplaint() {
  const { detection: detectionId } = Route.useSearch();
  const navigate = useNavigate();
  const { detections, user, fileComplaint } = usePrivaclick();
  const detection = detections.find((d) => d.id === detectionId) ?? detections[0];

  const [description, setDescription] = useState(
    "This photo of me was posted without my permission and I would like it removed.",
  );
  const [contact, setContact] = useState(user.email);
  const [reference, setReference] = useState<string | null>(null);

  if (!detection) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Pick a detection first, then we'll fill this form in for you.
          <div className="mt-4">
            <Button asChild size="sm">
              <Link to="/app/detections">Go to detections</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reference) {
    return (
      <div className="animate-fade-up mx-auto max-w-2xl space-y-6">
        <Card className="glass-card">
          <CardContent className="space-y-6 py-10 text-center">
            <ShieldCheck className="animate-shield-pulse mx-auto size-14 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold">
                Your complaint is <span className="text-gradient">on its way</span>
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                We've passed your report and evidence on. You'll get an update here and by email as
                it moves along.
              </p>
            </div>
            <div className="rounded-xl border bg-background/40 p-4">
              <p className="text-xs text-muted-foreground">Reference ID</p>
              <p className="font-display text-lg font-semibold">{reference}</p>
            </div>
            <ProgressStepper steps={stages} current={0} />
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => navigate({ to: "/app/complaints" })}>
                Track this complaint
              </Button>
              <Button onClick={() => navigate({ to: "/app" })}>Back to dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ description, contact });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    const complaint = fileComplaint({
      detectionId: detection.id,
      description: parsed.data.description,
    });
    setReference(complaint.id);
  };

  return (
    <form onSubmit={submit} className="animate-fade-up mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          File a <span className="text-gradient">complaint</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We've filled in the evidence for you. Check it over and add anything you'd like to say.
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Evidence collected</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-[160px_1fr]">
          <img
            src={detection.src}
            alt={`Image found on ${detection.platform}`}
            loading="lazy"
            className="aspect-square w-full rounded-xl border object-cover"
          />
          <dl className="space-y-3 text-sm">
            <Row label="Platform" value={detection.platform} />
            <Row label="Source URL" value={detection.sourceUrl} />
            <Row label="Detected on" value={detection.foundOn} />
            <Row label="Match confidence" value={`${detection.confidence}%`} />
            <Row label="Verified account" value={`${user.name} · ${user.maskedId}`} />
          </dl>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Your statement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">What happened?</Label>
            <Textarea
              id="description"
              rows={5}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{description.length}/1000 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Contact email</Label>
            <Input
              id="contact"
              type="email"
              maxLength={255}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="border-primary/50 text-primary hover:bg-primary/10"
          onClick={() => {
            const lines = [
              "PRIVACLICK EVIDENCE REPORT",
              `Prepared for: ${user.name} (${user.maskedId})`,
              `Platform: ${detection.platform}`,
              `Source URL: ${detection.sourceUrl}`,
              `Detected on: ${detection.foundOn}`,
              `Match confidence: ${detection.confidence}%`,
              "",
              "Statement:",
              description,
            ].join("\n");
            const blob = new Blob([lines], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `privaclick-evidence-${detection.id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Evidence report downloaded.");
          }}
        >
          <Download className="size-4" /> Generate Evidence Report
        </Button>
        <Button type="submit">
          <FileText className="size-4" /> Submit Complaint
        </Button>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="w-36 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all font-medium">{value}</dd>
    </div>
  );
}