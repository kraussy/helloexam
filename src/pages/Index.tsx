import { useEffect } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  FileText,
  Flame,
  Newspaper,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";

import { RevealSection } from "@/components/RevealSection";
import { RevisionOrderSection } from "@/components/RevisionOrderSection";
import { Button } from "@/components/ui/button";

const aiSignals = [
  "Inspired by viral AI question-analysis stories students keep talking about.",
  "Built from pattern review of the past 8 years of Nepal SEE questions.",
  "Made to help you revise smarter, not to promise exact predictions.",
];

const painPoints = [
  "Too much syllabus, too little time.",
  "You don’t know which chapter deserves your final energy.",
  "The fear of missing one important question keeps growing every night.",
];

const kitFeatures = [
  {
    icon: Brain,
    title: "AI-analyzed question patterns",
    description: "A focused shortlist of recurring question types from the past 8 years, so you revise the topics most likely to matter.",
  },
  {
    icon: FileText,
    title: "Smart notes for final days prep",
    description: "Compressed notes and memory cues designed for fast reading when there’s no time left for big textbooks.",
  },
  {
    icon: Target,
    title: "Exam strategy built in",
    description: "Priority order, scoring hints, and quick revision flow so you walk into the Class 10 exam calmer and sharper.",
  },
];

const previews = [
  {
    page: "Preview 01",
    title: "Important question clusters",
    bullets: ["High-repeat long questions", "Fast-mark short answers", "Priority chapters first"],
  },
  {
    page: "Preview 02",
    title: "AI pattern summary",
    bullets: ["Past 8 years compared", "Frequently repeated structures", "Likely focus zones"],
  },
  {
    page: "Preview 03",
    title: "Last-night revision sheet",
    bullets: ["Smart notes only", "Memory triggers", "Surprise question slot"],
  },
];

const trustPoints = [
  "Designed for final days before SEE",
  "Hundreds of students used this kit last year",
  "Made for Nepal SEE / Class 10 exam revision",
];

const Index = () => {
  useEffect(() => {
    document.title = "Nepal SEE Last-Minute Revision PDF Kit";

    const ensureMeta = (selector: string, create: () => HTMLMetaElement | HTMLLinkElement) => {
      let node = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
      if (!node) {
        node = create();
        document.head.appendChild(node);
      }
      return node;
    };

    const description = ensureMeta('meta[name="description"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      return meta;
    }) as HTMLMetaElement;

    description.setAttribute(
      "content",
      "SEE exam last-minute revision kit for Nepal SEE students. AI-analyzed important questions, smart notes, and final days prep with personalized PDF watermark delivery.",
    );

    const canonical = ensureMeta('link[rel="canonical"]', () => {
      const link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      return link;
    }) as HTMLLinkElement;

    canonical.setAttribute("href", window.location.href);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="hero-shell overflow-hidden">
        <div className="container relative z-10 py-6 md:py-10">
          <div className="mb-10 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Nepal SEE · Last-minute revision</p>
              <p className="mt-2 text-sm text-muted-foreground">For students who need the most important questions fast.</p>
            </div>
            <a className="text-sm font-semibold text-foreground transition-opacity hover:opacity-70" href="#buy">
              Get the PDF
            </a>
          </div>

          <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-sm">
                <Flame className="h-4 w-4 text-primary" />
                Final days prep for SEE exam
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl font-display text-[clamp(2.8rem,7vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-balance">
                  SEE is near! Focus on the most important questions before time runs out.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                  A last-minute revision PDF kit for Nepal SEE students, compiled using AI trained on patterns from the past 8 years of SEE questions.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" variant="hero">
                  <a href="#buy">
                    Buy This Now and Get Surprise Question!
                    <ArrowRight />
                  </a>
                </Button>
                <Button asChild size="lg" variant="soft">
                  <a href="#preview">See PDF preview</a>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="stat-chip">
                  <Clock3 className="h-4 w-4 text-primary" />
                  <span>Built for final days before SEE</span>
                </div>
                <div className="stat-chip">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>AI-analyzed important questions</span>
                </div>
                <div className="stat-chip">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Direct download with watermark</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card-main">
                <div className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <p className="eyebrow">Today’s offer</p>
                    <h2 className="mt-3 font-display text-3xl leading-[1] text-foreground">NPR 49</h2>
                  </div>
                  <div className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground line-through">
                    NPR 100
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.5rem] bg-secondary/60 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">What students want right now</p>
                    <p className="mt-3 text-lg leading-8 text-foreground">
                      “Just show me the important questions, not the whole syllabus.”
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {aiSignals.map((signal) => (
                      <div key={signal} className="inline-flex items-start gap-3 rounded-[1.25rem] bg-card px-4 py-4 shadow-soft">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                        <p className="text-sm leading-7 text-muted-foreground">{signal}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[1.5rem] border border-primary/15 bg-primary/10 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Hope hook</p>
                    <p className="mt-2 text-base leading-7 text-foreground">
                      Buy this now and be ready for a surprise question before every exam.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container space-y-5 py-8 md:space-y-7 md:py-10">
        {trustPoints.map((point, index) => (
          <RevealSection key={point} className="ticker-row" direction={index === 1 ? "up" : index === 2 ? "right" : "left"}>
            <Sparkles className="h-4 w-4 text-primary" />
            <span>{point}</span>
          </RevealSection>
        ))}
      </div>

      <div className="container space-y-24 pb-20 md:space-y-32 md:pb-28">
        <RevealSection className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            <span className="eyebrow">AI hype section</span>
            <h2 className="font-display text-4xl leading-[1.02] tracking-[-0.04em] text-balance md:text-5xl">
              Recently, AI exam-question analysis stories went viral. Students noticed.
            </h2>
          </div>

          <div className="surface-panel rounded-[2rem] p-6 shadow-soft md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Newspaper className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Authority + social proof</p>
            </div>
            <p className="text-lg leading-8 text-foreground">
              News about AI spotting likely exam questions at universities spread fast online, with some reports mentioning around 80% accuracy. We are <strong>not</strong> claiming guaranteed predictions — but the viral excitement proved one thing: pattern analysis can help students focus revision more efficiently.
            </p>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              This SEE revision kit uses a similar idea: AI-assisted review of the past 8 years of Nepal SEE questions to surface repeated themes, important questions, and high-priority areas for the final days prep window.
            </p>
          </div>
        </RevealSection>

        <RevealSection className="grid gap-8 lg:grid-cols-[1fr_1fr]" direction="left">
          <div className="surface-panel rounded-[2rem] p-6 shadow-soft md:p-8">
            <span className="eyebrow">Pain section</span>
            <h2 className="mt-4 font-display text-4xl leading-[1.02] tracking-[-0.04em] text-balance md:text-5xl">
              Too much syllabus, not enough time? Don’t panic.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-muted-foreground">
              In the final week, most students are not lazy — they are overloaded. The fear is simple: what if you study all night and still miss the questions that matter most?
            </p>
          </div>

          <div className="grid gap-4">
            {painPoints.map((item) => (
              <article key={item} className="surface-panel rounded-[1.8rem] p-5 shadow-soft">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-base leading-8 text-foreground">{item}</p>
                </div>
              </article>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="space-y-8" direction="right">
          <div className="max-w-3xl space-y-4">
            <span className="eyebrow">Solution section</span>
            <h2 className="font-display text-4xl leading-[1.02] tracking-[-0.04em] text-balance md:text-5xl">
              This PDF kit helps you revise the smart way, not the exhausting way.
            </h2>
            <p className="text-base leading-8 text-muted-foreground md:text-lg">
              Inside the kit: repeated questions, smart notes, and exam strategy — all shaped by AI analysis of patterns from the past 8 years. It’s a focused revision tool for Nepal SEE, not a promise of exact questions.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {kitFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="surface-panel rounded-[2rem] p-6 shadow-soft">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-2xl leading-tight text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </RevealSection>

        <RevealSection as="section" className="space-y-8" direction="up">
          <div id="preview" className="max-w-3xl space-y-4">
            <span className="eyebrow">Preview section</span>
            <h2 className="font-display text-4xl leading-[1.02] tracking-[-0.04em] text-balance md:text-5xl">
              Preview 2–3 pages before you decide.
            </h2>
            <p className="text-base leading-8 text-muted-foreground md:text-lg">
              These sample layouts show the style of the PDF: compact, fast to scan, and built for high-pressure revision in the final days before the Class 10 exam.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {previews.map((preview, index) => (
              <article key={preview.page} className="preview-sheet">
                <div className="preview-accent" />
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{preview.page}</p>
                <h3 className="mt-5 font-display text-3xl leading-tight text-foreground">{preview.title}</h3>
                <div className="mt-8 space-y-4">
                  {preview.bullets.map((bullet) => (
                    <div key={bullet} className="rounded-[1rem] bg-secondary/60 px-4 py-4 text-sm leading-7 text-secondary-foreground">
                      {bullet}
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
                  <span>{index + 1} / 3</span>
                  <span>SEE exam revision</span>
                </div>
              </article>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-stretch" direction="left">
          <div className="surface-panel rounded-[2rem] p-6 shadow-soft md:p-8">
            <span className="eyebrow">Pricing section</span>
            <h2 className="mt-4 font-display text-4xl leading-[1.02] tracking-[-0.04em] text-balance md:text-5xl">
              100 pages of focused revision — now only NPR 49.
            </h2>
            <div className="mt-8 flex flex-wrap items-end gap-4">
              <div className="text-5xl font-semibold tracking-[-0.05em] text-primary md:text-6xl">Rs 49</div>
              <div className="pb-2 text-lg text-muted-foreground line-through">Rs 100</div>
            </div>
            <p className="mt-5 max-w-xl text-base leading-8 text-foreground">
              100 pages → only Rs 49 per page.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              A low-cost final days prep kit for Nepal SEE students who need the highest-value important questions now.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" variant="hero">
                <a href="#buy">Buy This Now</a>
              </Button>
            </div>
          </div>

          <div className="surface-panel flex flex-col justify-between rounded-[2rem] p-6 shadow-soft md:p-8">
            <div>
              <span className="eyebrow">Hope-driven incentive</span>
              <h2 className="mt-4 font-display text-4xl leading-[1.02] tracking-[-0.04em] text-balance md:text-5xl">
                Buy this now and be ready for a surprise question before every exam.
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground md:text-lg">
                That extra push matters when confidence is low. The surprise-question hook gives students one more reason to open the kit before each paper and stay motivated.
              </p>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-primary/15 bg-primary/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Why it converts</p>
              <p className="mt-2 text-base leading-8 text-foreground">
                Urgent. AI-powered. Affordable. Personalized. Timed exactly for the final week of SEE.
              </p>
            </div>
          </div>
        </RevealSection>

        <RevealSection className="space-y-8" direction="up">
          <div className="max-w-3xl space-y-4">
            <span className="eyebrow">Watermarked PDF delivery</span>
            <h2 className="font-display text-4xl leading-[1.02] tracking-[-0.04em] text-balance md:text-5xl">
              Download directly from the site with your own name and student number on the PDF.
            </h2>
            <p className="text-base leading-8 text-muted-foreground md:text-lg">
              The current setup uses a placeholder source PDF. When you upload the real file later, the same backend flow will generate a personalized version for each approved student.
            </p>
          </div>

          <RevisionOrderSection />
        </RevealSection>
      </div>
    </main>
  );
};

export default Index;
