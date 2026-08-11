import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Privaclick" },
      {
        name: "description",
        content: "Why we built Privaclick and how we think about protecting people's photos.",
      },
      { property: "og:title", content: "About Privaclick" },
      { property: "og:description", content: "Why we built Privaclick." },
    ],
  }),
  component: () => (
    <PageShell title="About Privaclick" lead="A small team building tools that put people back in charge of their own images.">
      <p>
        Privaclick started after too many friends found their photos on pages they'd never heard of,
        with no clear idea of what to do next. Reporting felt complicated and often frightening.
      </p>
      <p>
        We wanted something calmer: a tool that quietly keeps watch, shows you what it found in plain
        language, and helps you file a proper complaint when you decide it's warranted.
      </p>
      <p>
        We collect as little as we possibly can. Identity verification happens once and the number
        behind it is never stored. Nothing is reported without your say-so.
      </p>
    </PageShell>
  ),
});