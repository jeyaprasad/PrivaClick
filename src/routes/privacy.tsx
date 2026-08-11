import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Privaclick" },
      {
        name: "description",
        content: "What Privaclick stores, what it never stores, and how to delete your data.",
      },
      { property: "og:title", content: "Privacy Policy — Privaclick" },
      { property: "og:description", content: "How Privaclick handles your data." },
    ],
  }),
  component: () => (
    <PageShell
      title="Privacy Policy"
      lead="Plain-language version first: we keep the least we can, and you can delete it whenever you want."
    >
      <h2 className="pt-2 text-lg font-semibold text-foreground">What we store</h2>
      <p>
        Your account details, the reference photos you upload, the matches we find, and any
        complaints you file.
      </p>
      <h2 className="pt-2 text-lg font-semibold text-foreground">What we never store</h2>
      <p>
        Government ID numbers. Verification is a one-time check and only a masked reference such as
        XXXX XXXX 4821 remains afterwards.
      </p>
      <h2 className="pt-2 text-lg font-semibold text-foreground">Security</h2>
      <p>Everything is encrypted in transit and at rest, and access is limited and logged.</p>
      <h2 className="pt-2 text-lg font-semibold text-foreground">Your rights</h2>
      <p>
        You can export your data, remove individual photos, or delete your account entirely from
        Settings. Deletion is complete within 24 hours.
      </p>
    </PageShell>
  ),
});