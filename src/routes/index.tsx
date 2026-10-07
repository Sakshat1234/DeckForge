import { createFileRoute } from '@tanstack/react-router'
// // import { Switch } from '#/components/ui/switch'
// import { Button } from '#/components/ui/button'



export const Route = createFileRoute('/')({ component: Home })

// function Home() {
//   return (
//     <div className="p-8">
//       {/* <Switch /> */}
//       <Button>Click me</Button>
//     </div>
//   )
// }

import { useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ---------- demo data ---------- */

type Slide = {
  kind: "title" | "chart" | "list" | "ask";
  title: string;
  items?: string[];
};

const DECKS: Record<string, { chip: string; prompt: string; slides: Slide[] }> = {
  pitch: {
    chip: "Seed pitch",
    prompt: "A seed pitch for a pet insurance startup",
    slides: [
      { kind: "title", title: "Pets are family. Insurance hasn't caught up." },
      { kind: "chart", title: "Vet bills keep climbing, coverage doesn't" },
      { kind: "list", title: "One plan, priced per pet", items: ["Pick a breed and age", "See the monthly price", "Claim from your phone"] },
      { kind: "ask", title: "We're raising $2M to launch in three cities" },
    ],
  },
  review: {
    chip: "Quarterly review",
    prompt: "Q3 review for the support team, based on my notes",
    slides: [
      { kind: "title", title: "Support, Q3: faster replies, fewer repeats" },
      { kind: "chart", title: "First response time, week by week" },
      { kind: "list", title: "What worked", items: ["Saved replies for billing", "Weekend rota", "Weekly bug triage"] },
      { kind: "ask", title: "Q4: hire two people, fix the top three bugs" },
    ],
  },
  lecture: {
    chip: "Lecture",
    prompt: "A 40-minute lecture on how photosynthesis works",
    slides: [
      { kind: "title", title: "How plants turn light into sugar" },
      { kind: "list", title: "Two stages, one leaf", items: ["Light reactions in the thylakoid", "Calvin cycle in the stroma", "Sugar out, oxygen out"] },
      { kind: "chart", title: "Which wavelengths chlorophyll absorbs" },
      { kind: "ask", title: "Question: why are leaves green?" },
    ],
  },
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
// Stand-in for your real "generate deck" request.
const generateDeck = async (id: string) => {
  await wait(900);
  return DECKS[id].slides;
};

/* ---------- slide face (scales with its container) ---------- */

function Face({ s }: { s: Slide }) {
  const base = "relative aspect-video w-full overflow-hidden rounded-[3px] [container-type:inline-size] ";
  if (s.kind === "title")
    return (
      <div className={base + "bg-[var(--ink)] text-[var(--paper)]"}>
        <p className="absolute inset-x-[7cqw] bottom-[9cqw] text-[7.5cqw] font-bold leading-[1.02] tracking-tight">{s.title}</p>
      </div>
    );
  if (s.kind === "chart")
    return (
      <div className={base + "bg-white text-[var(--ink)]"}>
        <p className="absolute left-[7cqw] top-[7cqw] w-3/5 text-[5cqw] font-bold leading-tight">{s.title}</p>
        <div className="absolute inset-x-[7cqw] bottom-[7cqw] flex h-[42%] items-end gap-[2.5cqw]">
          {[28, 36, 41, 55, 78].map((h, i) => (
            <div key={i} className={"flex-1 " + (i === 4 ? "bg-[var(--cobalt)]" : "bg-[var(--line)]")} style={{ height: h + "%" }} />
          ))}
        </div>
      </div>
    );
  if (s.kind === "list")
    return (
      <div className={base + "bg-white text-[var(--ink)]"}>
        <p className="absolute left-[7cqw] top-[7cqw] text-[5cqw] font-bold leading-tight">{s.title}</p>
        <ul className="absolute inset-x-[7cqw] bottom-[7cqw]">
          {s.items?.map((t) => (
            <li key={t} className="border-t border-[var(--line)] py-[1.6cqw] text-[3.4cqw]">{t}</li>
          ))}
        </ul>
      </div>
    );
  return (
    <div className={base + "bg-[var(--cobalt)] text-white"}>
      <div className="absolute left-[7cqw] top-[7cqw] h-[3cqw] w-[12cqw] bg-[var(--yellow)]" />
      <p className="absolute inset-x-[7cqw] bottom-[9cqw] text-[6.5cqw] font-bold leading-[1.05] tracking-tight">{s.title}</p>
    </div>
  );
}

/* ---------- hero demo ---------- */

function Demo({ deck, idx, setIdx }: { deck: string; idx: number; setIdx: (n: number) => void }) {
  const { data } = useQuery({
    queryKey: ["demo-deck", deck],
    queryFn: () => generateDeck(deck),
    staleTime: Infinity, // revisiting a deck is instant
  });

  if (!data)
    return (
      <div aria-busy="true">
        <div className="aspect-video w-full rounded-[3px] border border-dashed border-[var(--ink)]/40" />
        <div className="mt-3 h-[3px] bg-[var(--line)]">
          <motion.div className="h-full origin-left bg-[var(--ink)]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: "linear" }} />
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">Writing the outline and laying out slides</p>
      </div>
    );

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div key={deck + idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
          <Face s={data[idx]} />
        </motion.div>
      </AnimatePresence>
      <div key={deck} className="mt-4 grid grid-cols-4 gap-3">
        {data.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === idx}
            className="relative rounded-[3px] p-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobalt)]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {i === idx && <motion.span layoutId="sel" className="absolute inset-0 rounded-[4px] border-2 border-[var(--cobalt)]" transition={{ duration: 0.2 }} />}
            <Face s={s} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ---------- page ---------- */

const Line = ({ children, delay }: { children: string; delay: number }) => (
  <span className="block overflow-hidden pb-[0.08em]">
    <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ delay, duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}>
      {children}
    </motion.span>
  </span>
);

const STEPS = [
  { t: "Describe it", d: "Type a topic, paste your notes, or drop in a document. DeckForge reads what you give it." },
  { t: "Check the outline", d: "Reorder, cut or rewrite sections before a single slide is designed, so you fix the story first." },
  { t: "Edit and export", d: "Change anything by typing what you want, then download it as PowerPoint, PDF or Google Slides." },
];

const FEATURES = [
  { t: "Edit by talking", d: "Say “cut slide 6” or “make the tone warmer”. Each change touches only what you named." },
  { t: "Your brand, set once", d: "Add your logo, fonts and colors. Every deck uses them and the layouts work around them." },
  { t: "Charts from your numbers", d: "Paste a table or upload a CSV. DeckForge picks a chart type and labels it. You can override it." },
  { t: "Exports that stay editable", d: "Text stays text and charts stay charts, so your team can keep working in the tools they already use." },
];

const FAQ = [
  { q: "Can I use my own template?", a: "Yes. Upload a PowerPoint template and DeckForge builds new slides from its layouts, fonts and colors." },
  { q: "Will it make things up?", a: "It writes from what you give it. When you attach notes or a document, every claim comes from them, and the outline step lets you check before slides exist." },
  { q: "What can I export to?", a: "PowerPoint, PDF and Google Slides." },
  { q: "Who owns the decks?", a: "You do. Your content is not used to train models." },
];

function Home() {
  const [deck, setDeck] = useState("pitch");
  const [idx, setIdx] = useState(0);
  const [prompt, setPrompt] = useState(DECKS.pitch.prompt);

  const pick = (id: string) => {
    setDeck(id);
    setIdx(0);
    setPrompt(DECKS[id].prompt);
  };

  return (
    <MotionConfig reducedMotion="user">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap');`}</style>
      <div
        className="min-h-screen bg-[var(--paper)] text-[var(--ink)] antialiased"
        style={
          {
            fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
            "--paper": "#EDF0F2",
            "--ink": "#12161C",
            "--cobalt": "#1F3FFF",
            "--yellow": "#FFD23F",
            "--line": "#C5CCD3",
            "--muted": "#4F5964",
          } as React.CSSProperties
        }
      >
        {/* nav */}
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <span className="grid size-7 place-items-center rounded-[3px] bg-[var(--ink)] text-sm text-[var(--paper)]">D</span>
            DeckForge
          </a>
          <nav className="hidden gap-8 text-[15px] md:flex">
            <a href="#how" className="hover:underline underline-offset-4">How it works</a>
            <a href="#features" className="hover:underline underline-offset-4">Features</a>
            <a href="#faq" className="hover:underline underline-offset-4">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/login" className="hidden text-[15px] hover:underline underline-offset-4 sm:block">Sign in</a>
            <Button asChild size="sm" className="rounded-md bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink)]/85">
              <a href="/signup">Start free</a>
            </Button>
          </div>
        </header>

        {/* hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-12 lg:grid-cols-[5fr_7fr] lg:pt-20">
          <div>
            <h1 className="text-[clamp(2.6rem,5.2vw,4.6rem)] font-extrabold leading-[0.98] tracking-[-0.03em]">
              <Line delay={0.05}>Say what the talk</Line>
              <Line delay={0.15}>is about. Get</Line>
              <Line delay={0.25}>the deck.</Line>
            </h1>
            <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-[var(--muted)]">
              DeckForge turns a sentence, your notes or a document into a finished presentation you can edit by typing.
            </p>

            <form
              className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/signup?prompt=${encodeURIComponent(prompt)}`;
              }}
            >
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                aria-label="What is your presentation about?"
                className="h-12 rounded-md border-[var(--ink)]/30 bg-white text-base"
              />
              <Button type="submit" className="h-12 rounded-md bg-[var(--yellow)] px-6 text-base font-semibold text-[var(--ink)] hover:bg-[var(--yellow)]/85">
                Generate deck
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-[var(--muted)]">Try an example</span>
              {Object.entries(DECKS).map(([id, d]) => (
                <button
                  key={id}
                  onClick={() => pick(id)}
                  aria-pressed={deck === id}
                  className={
                    "rounded-md border px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobalt)] " +
                    (deck === id ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]" : "border-[var(--ink)]/30 hover:border-[var(--ink)]")
                  }
                >
                  {d.chip}
                </button>
              ))}
            </div>
          </div>

          <Demo deck={deck} idx={idx} setIdx={setIdx} />
        </section>

        {/* how it works: a real sequence, so numbered */}
        <section id="how" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="max-w-[20ch] text-4xl font-extrabold leading-[1.02] tracking-[-0.025em] md:text-5xl">
            Fix the story first, then the slides
          </h2>
          <div className="relative mt-14">
            <motion.div
              className="absolute inset-x-0 top-0 h-[2px] origin-left bg-[var(--ink)]"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
            />
            <ol className="grid gap-10 pt-8 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.t}>
                  <span className="text-5xl font-bold text-[var(--cobalt)]">{i + 1}</span>
                  <h3 className="mt-4 text-xl font-bold">{s.t}</h3>
                  <p className="mt-2 max-w-[38ch] leading-relaxed text-[var(--muted)]">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* features */}
        <section id="features" className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[4fr_8fr]">
          <h2 className="self-start text-4xl font-extrabold leading-[1.02] tracking-[-0.025em] md:text-5xl lg:sticky lg:top-10">
            Built for decks that get edited
          </h2>
          <dl>
            {FEATURES.map((f) => (
              <div key={f.t} className="grid gap-2 border-t border-[var(--line)] py-8 md:grid-cols-[1fr_1.4fr] md:gap-10">
                <dt className="text-xl font-bold">{f.t}</dt>
                <dd className="max-w-[52ch] leading-relaxed text-[var(--muted)]">{f.d}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* faq */}
        <section id="faq" className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[4fr_8fr]">
          <h2 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.025em] md:text-5xl">Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`} className="border-[var(--line)]">
                <AccordionTrigger className="py-6 text-left text-lg font-semibold hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="max-w-[60ch] pb-6 text-base leading-relaxed text-[var(--muted)]">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* closing */}
        <section className="bg-[var(--cobalt)] text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 py-20 md:flex-row md:items-end">
            <h2 className="max-w-[16ch] text-4xl font-extrabold leading-[1.02] tracking-[-0.025em] md:text-6xl">
              Your next deck is one sentence away
            </h2>
            <Button asChild className="h-12 rounded-md bg-[var(--yellow)] px-8 text-base font-semibold text-[var(--ink)] hover:bg-[var(--yellow)]/85">
              <a href="/signup">Start free</a>
            </Button>
          </div>
        </section>

        <footer className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 py-10 text-sm text-[var(--muted)] sm:flex-row">
          <p>© {new Date().getFullYear()} DeckForge</p>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:underline">Privacy</a>
            <a href="/terms" className="hover:underline">Terms</a>
            <a href="/contact" className="hover:underline">Contact</a>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}