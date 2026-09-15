import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, FileText, ScanFace, ShieldCheck, Loader2, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useMemo } from "react";
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
  const { user, photos, detections, complaints, riskScore, scanPhotoForMatches, lastScanned, triggerJuryDemo, isScanning, scanHistory } = usePrivaclick();
  const [scanning, setScanning] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const needsReviewMatches = detections.filter((d) => d.status === "Needs Review").length;
  const resolvedMatches = detections.filter((d) => d.status === "Dismissed" || d.status === "Action Taken").length;
  const activeComplaints = complaints.filter((c) => c.status !== "Action Taken").length;

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        detections: 0,
        rawDate: d.toISOString().split("T")[0]
      });
    }

    if (scanHistory) {
      scanHistory.forEach((sh) => {
        const dateObj = new Date(sh.scanned_at);
        if (!isNaN(dateObj.getTime())) {
          const dStr = dateObj.toISOString().split("T")[0];
          const day = days.find((x) => x.rawDate === dStr);
          if (day) {
            day.detections += (sh.new_detections_count || 0);
          }
        }
      });
    }
    return days;
  }, [scanHistory]);

  const stats = [
    { label: "Photos Protected", value: photos.length, icon: Camera, colorClass: "text-primary" },
    { label: "Needs Review", value: needsReviewMatches, icon: ScanFace, colorClass: "text-destructive" },
    { label: "Resolved Issues", value: resolvedMatches, icon: ShieldCheck, colorClass: "text-accent" },
    { label: "Active Complaints", value: activeComplaints, icon: FileText, colorClass: "text-destructive" },
  ];

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



  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Hello, {user?.name?.split(" ")[0].toUpperCase() ?? "USER"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is what is happening with your protected identity.
            {isScanning ? (
              <span className="ml-2 text-primary animate-pulse font-bold flex items-center inline-flex gap-1">
                <Loader2 className="size-3 animate-spin" /> SCANNING_NOW...
              </span>
            ) : (
              lastScanned && ` · LAST SCANNED: ${formatLastScanned(lastScanned).toUpperCase()}`
            )}
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
        {stats.map((c) => (
          <Card key={c.label} className="border border-border bg-card rounded-xl shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{c.label}</p>
                <div className={`p-2 rounded-lg bg-muted/50 ${c.colorClass}`}>
                  <c.icon className="size-4" />
                </div>
              </div>
              <p className={`mt-4 text-3xl font-display font-bold ${c.colorClass}`}>
                {c.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border bg-card rounded-xl shadow-sm">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              Detections Found (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => Math.floor(v) === v ? v : ''} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "var(--color-primary)" }}
                />
                <Area type="monotone" dataKey="detections" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorDetections)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card rounded-xl shadow-sm">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Protection Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-xs mt-4">
              <RiskScoreChart score={riskScore} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Primary Action Block: Report Stolen Photo */}
        <div className="md:col-span-2 flex flex-col justify-between border border-primary bg-card p-6 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 size-24 bg-primary/10 rounded-full blur-2xl" />
          
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <h2 className="text-sm font-bold text-primary tracking-wider uppercase">Take Action: Report Unauthorized Use</h2>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed max-w-xl">
              Found your photo being used without permission or spotted an impersonation profile? 
              Paste the source URL and upload screenshots to generate platform-compliant takedown requests 
              and lock in secure cryptographic SHA-256 evidence.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="sm" asChild className="bg-primary text-black hover:bg-primary/80 font-bold rounded-lg">
              <Link to="/app/complaints/new">
                &gt; START_MANUAL_REPORT
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="rounded-lg border-primary text-primary hover:bg-primary hover:text-black">
              <Link to="/app/complaints">
                &gt; TRACK_FILED_REPORTS
              </Link>
            </Button>
          </div>
        </div>

        {/* Secondary Action Block: AI scanner */}
        <div className="flex flex-col justify-between border border-border bg-card p-6">
          <div>
            <h2 className="text-sm font-bold text-muted-foreground tracking-wider uppercase">Automated Web Scanner</h2>
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
              className="flex items-center gap-2 rounded-lg w-full border-border hover:border-primary hover:text-primary"
            >
              {scanning ? (
                <>
                  <Loader2 className="size-3 animate-spin text-primary" /> SCANNING...
                </>
              ) : (
                "> RUN_AUTOMATED_SCAN"
              )}
            </Button>
            <Button size="sm" variant="ghost" asChild className="rounded-lg w-full text-left justify-start px-2">
              <Link to="/app/photos">&gt; MANAGE_PROTECTED_PHOTOS</Link>
            </Button>
          </div>
        </div>
      </div>

      <Card className="border border-border bg-card rounded-lg">
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