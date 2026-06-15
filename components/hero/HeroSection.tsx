"use client";

import { Upload, Sparkles, MessageSquare, ShieldCheck } from "lucide-react";

const STEPS = [
  {
    icon: Upload,
    title: "Upload your report",
    description: "Drop any PDF medical report — blood work, lab panel, imaging summary.",
    color: "bg-green-100 text-green-700",
  },
  {
    icon: Sparkles,
    title: "AI analysis",
    description: "We summarize findings, highlight notable values, and explain medical terms.",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: MessageSquare,
    title: "Ask questions",
    description: "Chat with your report. Ask anything — answers are grounded in your document.",
    color: "bg-teal-100 text-teal-700",
  },
  {
    icon: ShieldCheck,
    title: "Stay informed",
    description: "Know what to discuss with your doctor. We flag what needs attention.",
    color: "bg-green-100 text-green-700",
  },
];

const TRUST_BADGES = [
  "No data stored after session",
  "Educational use only",
  "AI-grounded in your document",
];

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="bg-hero py-16 sm:py-24 px-4" aria-label="Hero section">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 border border-green-200 text-green-700 text-sm font-medium mb-6 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          AI-Powered Report Assistant
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-800 text-green-900 mb-5 animate-fade-in-up">
          Understand your{" "}
          <span className="text-gradient-green">health report</span>
          <br className="hidden sm:block" /> in plain English
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in-up delay-75">
          Upload your medical report and get a clear, calm explanation of every
          result — with a chat assistant that answers your questions directly
          from your document.
        </p>

        {/* CTA */}
        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold text-base rounded-xl shadow-lg shadow-green-200 hover:shadow-green-300 transition-all duration-200 animate-fade-in-up delay-150"
          aria-label="Upload your medical report"
        >
          <Upload className="w-4.5 h-4.5" />
          Upload your report
        </button>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 animate-fade-in-up delay-225">
          {TRUST_BADGES.map((badge) => (
            <span key={badge} className="flex items-center gap-1.5 text-sm text-neutral-500">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div
        id="how-it-works"
        className="max-w-5xl mx-auto mt-20 scroll-mt-20"
        aria-label="How HealthBuddy works"
      >
        <h2 className="font-display text-center text-2xl font-700 text-green-900 mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className={`card-elevated rounded-2xl p-6 animate-fade-in-up`}
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${step.color} mb-4`}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-1">
                Step {i + 1}
              </div>
              <h3 className="font-display text-base font-600 text-green-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
