import { ClipboardList, Bike, Package, CheckCircle2 } from "lucide-react";
import { TrackerStage } from "@/store/AppStore";
import { cn } from "@/lib/utils";

const STAGES: { id: TrackerStage; label: string; Icon: typeof ClipboardList }[] = [
  { id: "matched", label: "Matched", Icon: ClipboardList },
  { id: "assigned", label: "Volunteer Assigned", Icon: Bike },
  { id: "picked_up", label: "Picked Up", Icon: Package },
  { id: "delivered", label: "Delivered", Icon: CheckCircle2 },
];

const order = (s: TrackerStage) => STAGES.findIndex((x) => x.id === s);

interface Props {
  stage: TrackerStage;
  volunteer?: string;
  etaMin?: number;
  onAdvance?: (next: TrackerStage) => void;
}

const PickupTracker = ({ stage, volunteer, etaMin, onAdvance }: Props) => {
  const current = order(stage);
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Live pickup tracker
        </div>
        {volunteer && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{volunteer}</span>
            {typeof etaMin === "number" && stage !== "delivered" && (
              <> · ETA {etaMin} min</>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {STAGES.map((s, i) => {
          const reached = i <= current;
          const isCurrent = i === current;
          const next = STAGES[i]?.id;
          return (
            <div key={s.id} className="flex items-center flex-1 min-w-0">
              <button
                type="button"
                onClick={() => onAdvance && next && onAdvance(next)}
                disabled={!onAdvance}
                className={cn(
                  "flex flex-col items-center gap-1 flex-1 min-w-0 group",
                  onAdvance && "cursor-pointer",
                )}
                title={onAdvance ? `Set to ${s.label}` : s.label}
              >
                <span
                  className={cn(
                    "h-8 w-8 rounded-full grid place-items-center transition-colors shrink-0",
                    reached
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                    isCurrent && "ring-2 ring-primary/40 ring-offset-2 ring-offset-card",
                  )}
                >
                  <s.Icon className="h-4 w-4" />
                </span>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wide font-medium text-center leading-tight",
                    reached ? "text-foreground" : "text-muted-foreground",
                    isCurrent && "text-primary",
                  )}
                >
                  {s.label}
                </span>
              </button>
              {i < STAGES.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 -mt-5 mx-1 rounded-full transition-colors",
                    i < current ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PickupTracker;