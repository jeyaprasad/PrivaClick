import { createFileRoute, Link } from "@tanstack/react-router";
import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill, toneForStatus } from "@/components/StatusPill";
import { ProgressStepper } from "@/components/ProgressStepper";
import { usePrivaclick } from "@/lib/store";

export const Route = createFileRoute("/app/complaints/")({
  head: () => ({
    meta: [
      { title: "Complaints — Privaclick" },
      {
        name: "description",
        content: "Track the complaints you've filed and where each one has reached.",
      },
      { property: "og:title", content: "Complaints — Privaclick" },
      { property: "og:description", content: "Track your filed complaints and their status." },
    ],
  }),
  component: ComplaintsPage,
});

const stages = ["Submitted", "Under Review", "Action Taken"];

function ComplaintsPage() {
  const { complaints } = usePrivaclick();

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">&gt; COMPLAINTS_REGISTRY</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            // Everything you've reported, and how far along it is.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/app/detections">
            &gt; FILE_FROM_DETECTION
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {complaints.map((c) => (
          <Card key={c.id} className="border border-border bg-black rounded-none">
            <CardContent className="space-y-5 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-primary uppercase">&gt; COMPLAINT_ID: {c.id}</p>
                  <p className="text-[10px] text-muted-foreground uppercase mt-1">
                    TARGET: {c.platform} · TIMESTAMP: {c.filedOn}
                  </p>
                </div>
                <StatusPill label={c.status} tone={toneForStatus(c.status)} />
              </div>
              <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3">"{c.description}"</p>
              <ProgressStepper steps={stages} current={stages.indexOf(c.status)} />
            </CardContent>
          </Card>
        ))}
        {complaints.length === 0 && (
          <Card className="border border-border bg-black rounded-none">
            <CardContent className="py-12 text-center text-sm font-bold text-muted-foreground">
              &gt; NO_ACTIVE_COMPLAINTS
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}