import { cn } from "@/lib/utils";

type Tone = "new" | "reviewed" | "filed" | "dismissed" | "neutral" | "success";

const tones: Record<Tone, string> = {
  new: "text-destructive animate-pulse ",
  reviewed: "text-secondary",
  filed: "text-primary ",
  dismissed: "text-muted-foreground opacity-50",
  neutral: "text-muted-foreground",
  success: "text-primary ",
};

export function StatusPill({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-bold uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      [{label}]
    </span>
  );
}

export function toneForStatus(status: string): Tone {
  if (status === "New" || status === "Submitted" || status === "Needs Review") return "new";
  if (status === "Reviewed" || status === "Under Review" || status === "Confirmed Unauthorized") return "reviewed";
  if (status === "Complaint Filed" || status === "Action Taken") return "filed";
  return "dismissed";
}