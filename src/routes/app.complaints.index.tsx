import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusPill, toneForStatus } from "@/components/StatusPill";
import { ProgressStepper } from "@/components/ProgressStepper";
import { usePrivaclick } from "@/lib/store";
import { toast } from "sonner";

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
  const { complaints, updateComplaintRef } = usePrivaclick();
  const [refInputs, setRefInputs] = useState<Record<string, string>>({});
  const [editModes, setEditModes] = useState<Record<string, boolean>>({});

  const handleSaveRef = async (complaintId: string) => {
    const val = refInputs[complaintId]?.trim() || "";
    if (!val) {
      toast.error("Please enter a valid reference number.");
      return;
    }

    try {
      await updateComplaintRef(complaintId, val);
      toast.success("> REFERENCE_ID_SYNCHRONIZED");
      setEditModes((prev) => ({ ...prev, [complaintId]: false }));
    } catch (e) {
      toast.error("> ERROR: FAILED_TO_UPDATE_REFERENCE_ID");
    }
  };

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
        {complaints.map((c) => {
          // Check if there is a real reference number saved (which isn't our default mock generated PVC- ID)
          const hasPortalRef = c.referenceId && c.referenceId !== c.id && c.referenceId.trim() !== "";
          const isEditing = editModes[c.id] || !hasPortalRef;

          return (
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
                
                <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3">
                  "{c.description}"
                </p>

                <ProgressStepper steps={stages} current={stages.indexOf(c.status)} />

                {/* Cybercrime portal Reference Tracker Field */}
                {!isEditing ? (
                  <div className="pt-3 text-[11px] border-t border-border/50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-primary">&gt; PORTAL_REF_ID: </span>
                      <span className="font-mono text-muted-foreground select-all">{c.referenceId}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[9px] text-primary hover:bg-primary/10 rounded-none border border-primary/20"
                      onClick={() => {
                        setRefInputs((prev) => ({ ...prev, [c.id]: c.referenceId || "" }));
                        setEditModes((prev) => ({ ...prev, [c.id]: true }));
                      }}
                    >
                      EDIT_REF
                    </Button>
                  </div>
                ) : (
                  <div className="pt-3 text-[11px] border-t border-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">&gt; CYBERCRIME_REF_ID:</span>
                      {hasPortalRef && (
                        <Button
                          variant="ghost"
                          className="h-5 text-[9px] text-muted-foreground px-1"
                          onClick={() => setEditModes((prev) => ({ ...prev, [c.id]: false }))}
                        >
                          CANCEL
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 max-w-md">
                      <Input
                        size="sm"
                        placeholder="Paste cybercrime.gov.in Reference #"
                        value={refInputs[c.id] ?? ""}
                        onChange={(e) => setRefInputs((prev) => ({ ...prev, [c.id]: e.target.value }))}
                        className="h-8 font-mono text-xs bg-black text-primary border-primary/20 rounded-none"
                      />
                      <Button
                        size="sm"
                        className="h-8 text-[9px] rounded-none px-4"
                        onClick={() => handleSaveRef(c.id)}
                      >
                        SAVE
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
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