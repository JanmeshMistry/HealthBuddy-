import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "HealthBuddy — Your Personal Health Report Assistant",
    template: "%s | HealthBuddy",
  },
  description:
    "Upload your medical report and get a clear, plain-English explanation of your results. Ask follow-up questions and understand your health — all privately and securely.",
  keywords: ["medical report", "health", "lab results", "medical AI", "report analyzer"],
  openGraph: {
    title: "HealthBuddy — Your Personal Health Report Assistant",
    description:
      "Upload your medical report and get clear, actionable insights. Ask questions about your results in plain English.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className={inter.className}>
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
