import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Privaclick" },
      { name: "description", content: "Get in touch with the Privaclick support team." },
      { property: "og:title", content: "Contact Privaclick" },
      { property: "og:description", content: "Reach the Privaclick support team." },
    ],
  }),
  component: () => (
    <PageShell title="Contact us" lead="We usually reply within one working day.">
      <p>
        Support: <span className="text-foreground">help@privaclick.example</span>
      </p>
      <p>
        Urgent takedown help: <span className="text-foreground">urgent@privaclick.example</span>
      </p>
      <p>
        If you're in immediate danger, please contact your local police or the national cyber crime
        helpline first.
      </p>
    </PageShell>
  ),
});