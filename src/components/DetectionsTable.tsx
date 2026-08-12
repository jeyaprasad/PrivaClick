import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusPill, toneForStatus } from "@/components/StatusPill";
import { usePrivaclick } from "@/lib/store";
import type { Detection } from "@/lib/mock-data";

export function DetectionsTable({ limit, statusFilter }: { limit?: number; statusFilter?: string }) {
  const navigate = useNavigate();
  const { detections, photos, setDetectionStatus, dismissDetectionAndSaveSafeUrl } = usePrivaclick();
  const [active, setActive] = useState<Detection | null>(null);

  // Filter detections by status if requested
  const filtered = statusFilter 
    ? detections.filter((d) => d.status === statusFilter)
    : detections;

  const rows = limit ? filtered.slice(0, limit) : filtered;
  const original = active ? photos.find((p) => p.id === active.photoId) : undefined;

  return (
    <>
      {rows.length === 0 ? (
        <div className="border border-border bg-black px-6 py-14 text-center font-mono text-primary">
          <ShieldCheck className="animate-shield-pulse mx-auto size-10 text-primary" />
          <p className="mt-4 text-sm font-bold">&gt; NO_MATCHES_FOUND</p>
          <p className="mt-1 text-xs text-muted-foreground">
            // We're actively watching. You'll hear from us the moment something turns up.
          </p>
        </div>
      ) : (
      <div className="border border-border bg-black overflow-x-auto font-mono">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="w-20 text-primary font-bold">PHOTO</TableHead>
              <TableHead className="text-primary font-bold">FOUND_ON</TableHead>
              <TableHead className="text-primary font-bold">MATCH</TableHead>
              <TableHead className="text-primary font-bold">DATE</TableHead>
              <TableHead className="text-primary font-bold">STATUS</TableHead>
              <TableHead className="text-right text-primary font-bold">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((d) => (
              <TableRow key={d.id} className="border-b border-border/50 hover:bg-primary/5">
                <TableCell>
                  <img
                    src={d.src}
                    alt="Detected match thumbnail"
                    loading="lazy"
                    className="size-12 rounded-none object-cover border border-border"
                  />
                </TableCell>
                <TableCell>
                  <p className="font-bold text-primary uppercase">{d.platform}</p>
                  <p className="max-w-52 truncate text-[10px] text-muted-foreground">{d.sourceUrl}</p>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-bold text-primary">{d.confidence}%</span>
                  <div className="mt-1.5 h-1.5 w-24 overflow-hidden bg-black border border-border/50">
                    <div
                      className="bg-primary h-full"
                      style={{ width: `${d.confidence}%` }}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{d.foundOn}</TableCell>
                <TableCell>
                  <StatusPill label={d.status} tone={toneForStatus(d.status)} />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => setActive(d)}>
                    &gt; REVIEW
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="border border-primary bg-black rounded-none p-0 max-w-2xl font-mono text-primary">
          <div className="border-b border-primary bg-primary/10 px-3 py-1 flex items-center text-[10px] text-primary">
            <span>&gt;_ review_match.sh</span>
          </div>
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-lg font-bold uppercase">&gt; DOES_THIS_LOOK_LIKE_YOU?</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                // Compare your registered photo with what we found. Only you decide what happens next.
              </DialogDescription>
            </DialogHeader>

            {active && (
              <div className="grid gap-4 sm:grid-cols-2">
                <figure className="overflow-hidden border border-border bg-black">
                  <img
                    src={original?.src ?? active.src}
                    alt="Your registered photo"
                    loading="lazy"
                    className="aspect-square w-full object-cover grayscale opacity-80"
                  />
                  <figcaption className="border-t border-border bg-primary/5 px-3 py-2 text-[10px] text-primary font-bold">
                    &gt; SOURCE_IMAGE
                  </figcaption>
                </figure>
                <figure className="overflow-hidden border border-border bg-black">
                  <img
                    src={active.src}
                    alt={`Image found on ${active.platform}`}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                  <figcaption className="space-y-1 border-t border-border bg-primary/5 px-3 py-2 text-[10px] text-primary">
                    <p className="font-bold">
                      &gt; TARGET: {active.platform.toUpperCase()} · CONFIDENCE: {active.confidence}% · DATE: {active.foundOn.toUpperCase()}
                    </p>
                    <p className="flex items-center gap-1 truncate opacity-70">
                      <ExternalLink className="size-3" /> {active.sourceUrl}
                    </p>
                  </figcaption>
                </figure>
              </div>
            )}

            {active && (
              <div className="mt-4 flex items-center gap-3 border border-border bg-primary/5 px-4 py-3">
                <span className="text-2xl font-bold text-glow">{active.confidence}%</span>
                <p className="text-xs text-muted-foreground uppercase">// MATCH_PROBABILITY</p>
              </div>
            )}

            {/* AI Confirmation Steps Prompt */}
            {active && (
              <div className="mt-6 border border-primary/30 bg-primary/5 p-4 rounded-none space-y-3">
                <p className="text-xs font-bold text-primary uppercase">&gt; SECURITY_CHECK: IS_THIS_YOU_AND_DID_YOU_AUTHORIZE_THIS_USE?</p>
                <p className="text-[11px] text-muted-foreground">
                  Confirming this is you will dismiss the match alert and whitelist this URL so it won't be flagged in future scans.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="text-[10px] h-8 bg-primary/20 hover:bg-primary/30 border border-primary text-primary"
                    onClick={async () => {
                      if (!active) return;
                      await dismissDetectionAndSaveSafeUrl(active.id, active.sourceUrl);
                      setActive(null);
                      toast.success("> MATCH_DISMISSED: URL_WHITELISTED");
                    }}
                  >
                    Yes, this is fine
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-[10px] h-8"
                    onClick={async () => {
                      if (!active) return;
                      const id = active.id;
                      await setDetectionStatus(id, "Confirmed Unauthorized");
                      setActive(null);
                      navigate({ to: "/app/complaints/new", search: { detection: id } });
                      toast.success("> MATCH_CONFIRMED_UNAUTHORIZED: INITIATING_TAKEDOWN");
                    }}
                  >
                    No, I didn't authorize this
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button variant="ghost" onClick={() => setActive(null)}>
                &gt; CLOSE
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
