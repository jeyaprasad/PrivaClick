import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DetectionsTable } from "@/components/DetectionsTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState<string>("Needs Review");

  return (
    <div className="space-y-6 font-mono">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-primary">&gt; DETECTIONS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          // Review web matches and whitelist safe URLs or initiate cybercrime reports.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black border border-border rounded-none p-1 mb-6">
          <TabsTrigger
            value="Needs Review"
            className="rounded-none text-xs font-bold uppercase data-[state=active]:bg-primary/20 data-[state=active]:text-primary border-r border-border/50"
          >
            Needs Review
          </TabsTrigger>
          <TabsTrigger
            value="Confirmed Unauthorized"
            className="rounded-none text-xs font-bold uppercase data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive border-r border-border/50"
          >
            Confirmed
          </TabsTrigger>
          <TabsTrigger
            value="Complaint Filed"
            className="rounded-none text-xs font-bold uppercase data-[state=active]:bg-primary/20 data-[state=active]:text-primary border-r border-border/50"
          >
            Filed
          </TabsTrigger>
          <TabsTrigger
            value="Dismissed"
            className="rounded-none text-xs font-bold uppercase data-[state=active]:bg-muted/10 data-[state=active]:text-muted-foreground"
          >
            Dismissed
          </TabsTrigger>
        </TabsList>

        <DetectionsTable statusFilter={activeTab} />
      </Tabs>
    </div>
  );
}