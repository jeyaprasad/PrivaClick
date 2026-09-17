import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePrivaclick } from "@/lib/store";

export function DetectionsTable({ limit, statusFilter }: { limit?: number; statusFilter?: string }) {
  const navigate = useNavigate();
  const { detections, setDetectionStatus, dismissDetectionAndSaveSafeUrl } = usePrivaclick();

  // Filter detections by status if requested
  const filtered = statusFilter 
    ? detections.filter((d) => d.status === statusFilter)
    : detections;

  const rows = limit ? filtered.slice(0, limit) : filtered;

  return (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <div className="border border-border bg-card px-6 py-14 text-center rounded-xl shadow-sm">
          <ShieldCheck className="mx-auto size-10 text-muted-foreground opacity-50" />
          <p className="mt-4 text-sm font-semibold text-foreground">No matches found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            We are actively monitoring. You will be notified the moment something turns up.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((d) => (
            <div key={d.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-border bg-card rounded-xl shadow-sm items-start sm:items-center transition-all hover:shadow-md">
              
              {/* Photo Thumbnail */}
              <div className="shrink-0">
                <img
                  src={d.src}
                  alt="Detected match"
                  loading="lazy"
                  className="size-16 rounded-md object-cover border border-border"
                />
              </div>
              
              {/* Info Block */}
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm text-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                    {d.platform}
                  </span>
                  
                  {d.matchType && (
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 border border-border px-2 py-0.5 rounded-md">
                      {d.matchType} match
                    </span>
                  )}
                  
                  <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md border border-border">
                    {d.confidence}% Confidence
                  </span>
                </div>
                
                <a 
                  href={d.sourceUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-sm font-mono text-primary hover:underline flex items-center gap-1.5 truncate w-fit max-w-[240px] sm:max-w-sm"
                >
                  <ExternalLink className="size-3.5 shrink-0" />
                  <span className="truncate">{d.sourceUrl}</span>
                </a>
              </div>
              
              {/* Status & Actions Block */}
              <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
                
                {/* Colored Status Pill */}
                {d.status === "Needs Review" && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                    {d.status}
                  </span>
                )}
                {(d.status === "Complaint Filed" || d.status === "Confirmed Unauthorized") && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                    {d.status}
                  </span>
                )}
                {(d.status === "Dismissed" || d.status === "Action Taken") && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-accent/10 text-accent border border-accent/20">
                    {d.status}
                  </span>
                )}

                {/* Confirm / Dismiss Buttons inline */}
                {d.status === "Needs Review" ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-border text-foreground hover:bg-muted"
                      onClick={async () => {
                        await dismissDetectionAndSaveSafeUrl(d.id, d.sourceUrl);
                        toast.success("Match dismissed and URL whitelisted.");
                      }}
                    >
                      This is fine
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm"
                      onClick={async () => {
                        await setDetectionStatus(d.id, "Confirmed Unauthorized");
                        navigate({ to: "/app/complaints/new", search: { detection: d.id } });
                        toast.success("Initiating takedown process...");
                      }}
                    >
                      Not authorized
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Found on {d.foundOn}</span>
                )}
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
