import { priorityFromExpiry, priorityMeta, Priority } from "@/lib/priority";
import { cn } from "@/lib/utils";

interface Props {
  hours?: number;
  priority?: Priority;
  className?: string;
}

const PriorityBadge = ({ hours, priority, className }: Props) => {
  const p = priority ?? (hours !== undefined ? priorityFromExpiry(hours) : "low");
  const meta = priorityMeta[p];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide",
        meta.chipClass,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
};

export default PriorityBadge;