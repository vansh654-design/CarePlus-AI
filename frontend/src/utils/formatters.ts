export function formatScorePercent(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case "Higher demonstration review priority":
      return "badge-danger";
    case "Review suggested by demonstration model":
      return "badge-warning";
    case "Routine demonstration review":
    default:
      return "badge-success";
  }
}

export function downloadJson(data: unknown, filename: string): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", jsonString);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
