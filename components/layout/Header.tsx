"use client";

import Link from "next/link";
import { HeartPulse, Shield, BookOpen } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-green-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="HealthBuddy home">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-700 shadow-md group-hover:shadow-green-300 transition-shadow duration-200">
            <HeartPulse className="w-5 h-5 text-white" strokeWidth={2.5} />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <span className="font-display font-700 text-xl text-green-900 tracking-tight">
            Health<span className="text-green-600">Buddy</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
          <a
            href="#how-it-works"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            How it works
          </a>
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            <span className="text-green-600">Private &amp; secure</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
