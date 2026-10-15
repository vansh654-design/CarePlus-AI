import React from "react";
import { AlertTriangle } from "lucide-react";

export const DisclaimerBanner: React.FC = () => {
  return (
    <div
      className="safety-banner"
      role="region"
      aria-label="Educational Demonstration Disclaimer"
    >
      <AlertTriangle size={16} aria-hidden="true" />
      <span>
        <strong>EDUCATIONAL DEMONSTRATION ONLY:</strong> Powered by 100% synthetic
        data. Not validated for clinical decision-making, medical diagnosis, or
        treatment.
      </span>
    </div>
  );
};
