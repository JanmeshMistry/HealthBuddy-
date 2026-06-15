import { Info } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <aside
      role="note"
      aria-label="Medical disclaimer"
      className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800"
    >
      <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" aria-hidden="true" />
      <p className="leading-relaxed">
        <strong>For educational purposes only.</strong> HealthBuddy helps you
        understand your report — it does not provide medical diagnosis, treatment
        advice, or replace professional healthcare. Always discuss your results
        with a qualified clinician.
      </p>
    </aside>
  );
}
