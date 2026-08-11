import { cn } from "@/lib/utils";

export function ProgressStepper({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex w-full items-center", className)}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={step}
            className={cn("flex items-center", i < steps.length - 1 && "flex-1")}
          >
            <div className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  "size-3.5 rounded-full transition-all",
                  done && "bg-gradient-brand opacity-70",
                  active && "bg-gradient-brand ring-4 ring-primary/20",
                  !done && !active && "border border-border bg-muted",
                )}
              />
              <span
                className={cn(
                  "whitespace-nowrap text-[11px] sm:text-xs",
                  active ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "mx-2 -mt-6 h-px flex-1 rounded-full",
                  done ? "bg-gradient-brand" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}