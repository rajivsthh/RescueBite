import { AlertTriangle } from "lucide-react";

const UrgentBadge = ({ hours }: { hours: number }) => {
  if (hours > 2) return null;
  return (
    <span className="chip-warning">
      <AlertTriangle className="h-3 w-3" />
      Urgent · {hours}h
    </span>
  );
};

export default UrgentBadge;