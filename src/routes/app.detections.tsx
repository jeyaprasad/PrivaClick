import { createFileRoute } from "@tanstack/react-router";
import { DetectionsTable } from "@/components/DetectionsTable";

export const Route = createFileRoute("/app/detections")({
  head: () => ({
    meta: [
      { title: "Detections — Privaclick" },
      {
        name: "description",
        content: "Review the photo matches we found and decide what happens with each one.",
      },
      { property: "og:title", content: "Detections — Privaclick" },
      { property: "og:description", content: "Review possible matches of your photos." },
    ],
  }),
  component: DetectionsPage,
});

function DetectionsPage() {
  return (
    <div className="space-y-6 font-mono">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-primary">&gt; DETECTIONS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          // Each item is a possible match. Take a look and tell us whether it's really you.
        </p>
      </div>
      <DetectionsTable />
    </div>
  );
}