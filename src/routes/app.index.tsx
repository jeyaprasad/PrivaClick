import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, FileText, ScanFace, ShieldCheck, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskScoreChart } from "@/components/RiskScore";
import { DetectionsTable } from "@/components/DetectionsTable";
import { usePrivaclick } from "@/lib/store";
import { toast } from "sonner";

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
  const { user, photos, detections, complaints, riskScore, scanPhotoForMatches, lastScanned, triggerJuryDemo } = usePrivaclick();
  const [scanning, setScanning] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const matches = detections.filter((d) => d.status !== "Dismissed").length;
  const activeComplaints = complaints.filter((c) => c.status !== "Action Taken").length;

  const handleScanAll = async () => {
    if (photos.length === 0) {
      toast.error("> ERROR: NO_PHOTOS_REGISTERED_FOR_SCANNING");
      return;
    }

    setScanning(true);
    toast.info("> INITIALIZING_GLOBAL_SCAN...");
    try {
      let totalNewMatches = 0;
      // Scan each photo sequentially
      for (const photo of photos) {
        const newDets = await scanPhotoForMatches(photo.id);
        totalNewMatches += newDets.length;
      }

      if (totalNewMatches > 0) {
        toast.success(`> GLOBAL_SCAN_COMPLETE: FOUND ${totalNewMatches} NEW MATCH(ES)`);
      } else {
        toast.success("> GLOBAL_SCAN_COMPLETE: SYSTEM IS SECURE. NO NEW MATCHES FOUND");
      }
    } catch (err) {
      console.error(err);
      toast.error("> ERROR: GLOBAL_SCAN_FAILED");
    } finally {
      setScanning(false);
    }
  };

  const formatLastScanned = (isoStr: string | null) => {
    if (!isoStr) return "Never";
    const date = new Date(isoStr);
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins === 0) return "Just now";
      return `${diffMins}m ago`;
    }
    if (diffHours >= 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
    return `${diffHours}h ago`;
  };

  const cards = [
    { label: "PHOTOS_PROTECTED", value: photos.length, icon: Camera, accent: false },
    { label: "MATCHES_FOUND", value: matches, icon: ScanFace, accent: matches > 0 },
    { label: "ACTIVE_COMPLAINTS", value: activeComplaints, icon: FileText, accent: false },
  ];

  return (
    <div className="space-y-8 font-mono">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">&gt; HELLO, {user?.name?.split(" ")[0].toUpperCase() ?? "USER"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            // Here's what's happening with your photos.
            {lastScanned && ` · LAST_SCANNED: ${formatLastScanned(lastScanned).toUpperCase()}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setDemoLoading(true);
              await triggerJuryDemo();
              setDemoLoading(false);
            }}
            disabled={demoLoading}
            className="border-dashed border-primary hover:border-solid hover:bg-primary hover:text-black flex items-center gap-2"
          >
            {demoLoading ? (
              <>
                <Loader2 className="size-3 animate-spin text-primary" /> LOADING...
              </>
            ) : (
              "> LAUNCH_JURY_DEMO"
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleScanAll}
            disabled={scanning || photos.length === 0}
            className="flex items-center gap-2"
          >
            {scanning ? (
              <>
                <Loader2 className="size-3 animate-spin text-primary" /> SCANNING...
              </>
            ) : (
              "> SCAN_ALL"
            )}
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/photos">
              &gt; ADD_PHOTOS
            </Link>
          </Button>
        </div>
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Primary Action Block: Report Stolen Photo */}
        <div className="md:col-span-2 flex flex-col justify-between border border-primary bg-black p-6 font-mono relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 size-24 bg-primary/10 rounded-full blur-2xl" />
          
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <h2 className="text-sm font-bold text-primary tracking-wider uppercase">&gt; PRIMARY_ACTION: REPORT_UNAUTHORIZED_USE</h2>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed max-w-xl">
              Found your photo being used without permission or spotted an impersonation profile? 
              Paste the source URL and upload screenshots to generate platform-compliant takedown requests 
              and lock in secure cryptographic SHA-256 evidence.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="sm" asChild className="bg-primary text-black hover:bg-primary/80 font-bold rounded-none">
              <Link to="/app/complaints/new">
                &gt; START_MANUAL_REPORT
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="rounded-none border-primary text-primary hover:bg-primary hover:text-black">
              <Link to="/app/complaints">
                &gt; TRACK_FILED_REPORTS
              </Link>
            </Button>
          </div>
        </div>

        {/* Secondary Action Block: AI scanner */}
        <div className="flex flex-col justify-between border border-border bg-black p-6 font-mono">
          <div>
            <h2 className="text-sm font-bold text-muted-foreground tracking-wider uppercase">&gt; SECONDARY: AI_WEB_SCANNER</h2>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Run automated reverse-image scans across indexable public sites to detect matching portrait copies and metadata structures.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleScanAll}
              disabled={scanning || photos.length === 0}
              className="flex items-center gap-2 rounded-none w-full border-border hover:border-primary hover:text-primary"
            >
              {scanning ? (
                <>
                  <Loader2 className="size-3 animate-spin text-primary" /> SCANNING...
                </>
              ) : (
                "> RUN_AUTOMATED_SCAN"
              )}
            </Button>
            <Button size="sm" variant="ghost" asChild className="rounded-none w-full text-left justify-start px-2">
              <Link to="/app/photos">&gt; MANAGE_PROTECTED_PHOTOS</Link>
            </Button>
          </div>
        </div>
      </div>

      <Card className="border border-border bg-black rounded-none">
        <CardHeader className="flex-row items-center justify-between border-b border-border/50 pb-4">
          <CardTitle className="text-sm font-bold text-primary">&gt; AI-ASSISTED MATCHES (WE ALSO FOUND SIMILAR MATCHES)</CardTitle>
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