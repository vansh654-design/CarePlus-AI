import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { DemonstrationCategory } from "../types";

interface StatusBadgeProps {
  category: DemonstrationCategory | string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  category,
  showIcon = true,
}) => {
  if (category === "Higher demonstration review priority") {
    return (
      <span className="badge badge-danger" role="status">
        {showIcon && <AlertCircle size={14} aria-hidden="true" />}
        <span>Higher Priority</span>
      </span>
    );
  }

  if (category === "Review suggested by demonstration model") {
    return (
      <span className="badge badge-warning" role="status">
        {showIcon && <AlertTriangle size={14} aria-hidden="true" />}
        <span>Review Suggested</span>
      </span>
    );
  }

  return (
    <span className="badge badge-success" role="status">
      {showIcon && <CheckCircle size={14} aria-hidden="true" />}
      <span>Routine Review</span>
    </span>
  );
};
