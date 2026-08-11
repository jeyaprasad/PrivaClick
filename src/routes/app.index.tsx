import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, FileText, ScanFace, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskScoreChart } from "@/components/RiskScore";
import { DetectionsTable } from "@/components/DetectionsTable";
import { usePrivaclick } from "@/lib/store";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Privaclick" },
      {
        name: "description",
        content: "See your protected photos, new matches and active complaints at a glance.",
      },
      { property: "og:title", content: "Dashboard — Privaclick" },
      { property: "og:description", content: "Your photo protection overview." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, photos, detections, complaints, riskScore } = usePrivaclick();
  const matches = detections.filter((d) => d.status !== "Dismissed").length;
  const activeComplaints = complaints.filter((c) => c.status !== "Action Taken").length;

  const cards = [
    { label: "PHOTOS_PROTECTED", value: photos.length, icon: Camera, accent: false },
    { label: "MATCHES_FOUND", value: matches, icon: ScanFace, accent: matches > 0 },
    { label: "ACTIVE_COMPLAINTS", value: activeComplaints, icon: FileText, accent: false },
  ];

  return (
    <div className="space-y-8 font-mono">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">> HELLO, {user.name.split(" ")[0].toUpperCase()}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            // Here's what's happening with your photos.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/app/photos">
            > ADD_PHOTOS
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="border border-border bg-black rounded-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted-foreground">{c.label}</p>
                <c.icon className="size-4 text-primary" />
              </div>
              <p
                className={
                  c.accent
                    ? "mt-3 text-3xl font-bold text-destructive text-glow"
                    : "mt-3 text-3xl font-bold text-primary text-glow"
                }
              >
                {c.value}
              </p>
            </CardContent>
          </Card>
        ))}
        <Card className="border border-border bg-black rounded-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground">RISK_SCORE</p>
              <ShieldCheck className="size-4 text-primary" />
            </div>
            <div className="mt-3">
              <RiskScoreChart score={riskScore} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border bg-black rounded-none">
        <CardHeader className="flex-row items-center justify-between border-b border-border/50 pb-4">
          <CardTitle className="text-sm font-bold text-primary">> RECENT_DETECTIONS</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/app/detections">VIEW_ALL</Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <DetectionsTable limit={3} />
        </CardContent>
      </Card>
    </div>
  );
}