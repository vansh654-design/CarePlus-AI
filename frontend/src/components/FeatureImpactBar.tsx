import React from "react";
import { FeatureContribution } from "../types";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

interface FeatureImpactBarProps {
  contributions: FeatureContribution[];
}

export const FeatureImpactBar: React.FC<FeatureImpactBarProps> = ({ contributions }) => {
  // Find max absolute contribution to scale bar lengths proportionally
  const maxAbs = Math.max(...contributions.map((c) => Math.abs(c.contribution_score)), 0.5);

  return (
    <div className="feature-impact-container" role="region" aria-label="Feature Contributions Chart">
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {contributions.map((item) => {
          const pct = Math.min(100, Math.round((Math.abs(item.contribution_score) / maxAbs) * 100));
          const isPositive = item.contribution_score > 0;
          const isNeutral = item.direction === "neutral";

          return (
            <div
              key={item.feature_name}
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.35rem",
                  fontSize: "0.875rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>
                    {item.display_name}
                  </span>
                  <span style={{ color: "#64748b", fontSize: "0.8125rem" }}>
                    ({item.raw_value} {item.unit})
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: 700 }}>
                  {isNeutral ? (
                    <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                      <Minus size={14} /> {item.contribution_score.toFixed(2)}
                    </span>
                  ) : isPositive ? (
                    <span style={{ color: "#dc2626", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                      <ArrowUpRight size={14} /> +{item.contribution_score.toFixed(2)}
                    </span>
                  ) : (
                    <span style={{ color: "#059669", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                      <ArrowDownRight size={14} /> {item.contribution_score.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress track */}
              <div
                style={{
                  height: "8px",
                  backgroundColor: "#e2e8f0",
                  borderRadius: "4px",
                  overflow: "hidden",
                  marginBottom: "0.4rem",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    backgroundColor: isNeutral ? "#94a3b8" : isPositive ? "#ef4444" : "#10b981",
                    borderRadius: "4px",
                    transition: "width 0.3s ease",
                  }}
                  aria-hidden="true"
                />
              </div>

              <p style={{ fontSize: "0.785rem", color: "#475569", margin: 0 }}>
                {item.human_explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
