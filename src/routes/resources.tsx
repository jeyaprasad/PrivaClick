import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Cyber Crime Resources — Privaclick" },
      {
        name: "description",
        content: "Helpful steps and official channels if your photos are being misused online.",
      },
      { property: "og:title", content: "Cyber Crime Resources — Privaclick" },
      { property: "og:description", content: "Steps to take if your photos are misused online." },
    ],
  }),
  component: () => (
    <PageShell
      title="Cyber Crime Resources"
      lead="If something has happened, here's a calm order to work through."
    >
      <ol className="list-decimal space-y-3 pl-5">
        <li>Save the evidence: screenshots, the page link, and the date you saw it.</li>
        <li>Report the post inside the platform itself — most have a dedicated impersonation form.</li>
        <li>File a formal complaint with your national cyber crime portal or local police.</li>
        <li>Keep a record of every reference number you receive.</li>
      </ol>
      <p>
        Privaclick handles the first and fourth steps for you automatically, and prepares an evidence
        report you can attach to any official complaint.
      </p>
    </PageShell>
  ),
});