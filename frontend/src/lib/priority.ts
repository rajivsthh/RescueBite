export type Priority = "urgent" | "medium" | "low";

export const priorityFromExpiry = (hours: number): Priority => {
  if (hours <= 2) return "urgent";
  if (hours <= 5) return "medium";
  return "low";
};

export const priorityMeta: Record<Priority, { label: string; dot: string; chipClass: string }> = {
  urgent: {
    label: "Urgent",
    dot: "bg-warning",
    chipClass: "bg-warning/15 text-warning border border-warning/30",
  },
  medium: {
    label: "Medium",
    dot: "bg-accent",
    chipClass: "bg-accent/15 text-accent-foreground border border-accent/30",
  },
  low: {
    label: "Low",
    dot: "bg-success",
    chipClass: "bg-success/15 text-success border border-success/30",
  },
};

/** Border color class for urgency-coded cards (heatmap). */
export const priorityBorderClass = (hours: number) => {
  const p = priorityFromExpiry(hours);
  if (p === "urgent") return "border-warning border-2";
  if (p === "medium") return "border-accent border-2";
  return "border-success/60 border-2";
};