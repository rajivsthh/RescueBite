import { useAppStore } from "@/store/AppStore";
import { Button } from "@/components/ui/button";
import { areaName } from "@/lib/data";
import { Check, X, CalendarClock } from "lucide-react";
import PriorityBadge from "@/components/PriorityBadge";
import { toast } from "@/hooks/use-toast";
import { useMemo } from "react";
import PickupTracker from "@/components/PickupTracker";
import { qualityChipClass } from "@/lib/quality";

const statusStyles: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  accepted: "bg-primary-soft text-primary",
  rejected: "bg-muted text-muted-foreground line-through",
  delivered: "bg-success/15 text-success",
};

const formatSchedule = (ts: number) =>
  new Date(ts).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const NGOPage = () => {
  const { requests, setRequestStatus, setRequestStage } = useAppStore();

  const { upcoming, instant } = useMemo(() => {
    const upcoming = requests.filter((r) => r.scheduledFor && r.status !== "delivered" && r.status !== "rejected");
    const instant = requests.filter((r) => !r.scheduledFor);
    return { upcoming, instant };
  }, [requests]);

  return (
    <div className="max-w-4xl">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
        <div>
          <span className="chip mb-3">NGO Dashboard</span>
          <h2 className="font-display text-3xl font-semibold">Incoming food requests</h2>
          <p className="text-sm text-muted-foreground mt-1">Accept to dispatch a volunteer for pickup.</p>
        </div>
      </div>

      {requests.length === 0 && (
        <div className="panel text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-[hsl(38_60%_92%)] grid place-items-center mb-3 border border-[#ebebeb]">
            <span className="text-2xl" role="img" aria-label="warm meal">🍲</span>
          </div>
          <h3 className="font-display text-xl font-semibold">No requests yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Submit one from the Restaurant tab.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock className="h-4 w-4 text-primary" />
            <h3 className="font-display text-lg font-semibold">Upcoming pickups</h3>
            <span className="text-xs text-muted-foreground">scheduled in advance</span>
          </div>
          <div className="space-y-3">
            {upcoming.map((r) => (
              <RequestRow key={r.id} r={r} setRequestStatus={setRequestStatus} setRequestStage={setRequestStage} schedule />
            ))}
          </div>
        </section>
      )}

      {instant.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-display text-lg font-semibold">Instant requests</h3>
        </div>
      )}

      <div className="space-y-3">
        {instant.map((r) => (
          <RequestRow key={r.id} r={r} setRequestStatus={setRequestStatus} setRequestStage={setRequestStage} />
        ))}
      </div>
    </div>
  );
};

interface RowProps {
  r: ReturnType<typeof useAppStore>["requests"][number];
  setRequestStatus: ReturnType<typeof useAppStore>["setRequestStatus"];
  setRequestStage: ReturnType<typeof useAppStore>["setRequestStage"];
  schedule?: boolean;
}

const RequestRow = ({ r, setRequestStatus, setRequestStage, schedule }: RowProps) => (
  <div className="panel space-y-4">
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h4 className="font-display text-lg font-semibold truncate">{r.restaurantName}</h4>
          {r.sourceKind === "event" && (
            <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium bg-accent/15 text-accent-foreground border border-accent/30">
              Event
            </span>
          )}
          <span className={`text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium ${statusStyles[r.status]}`}>
            {r.status}
          </span>
          <PriorityBadge hours={r.expiryHours} />
          {r.quality && (
            <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold " + qualityChipClass(r.quality)}>
              {r.quality === "safe" ? "✅ Safe" : r.quality === "soon" ? "⚠️ Donate Soon" : "❌ Not Suitable"}
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {r.foodType} · from <strong className="text-foreground">{areaName(r.fromArea)}</strong> → <strong className="text-foreground">{r.ngo.name}</strong>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {r.distanceKm.toFixed(1)} km away · expires in {r.expiryHours}h
          {schedule && r.scheduledFor && (
            <> · pickup {formatSchedule(r.scheduledFor)}</>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="font-display text-2xl font-semibold leading-none">{r.meals}</div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">meals</div>
        </div>
        {r.status === "pending" ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { setRequestStatus(r.id, "accepted"); toast({ title: "Accepted", description: "Volunteer task created." }); }}>
              <Check className="h-4 w-4" /> Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => setRequestStatus(r.id, "rejected")}>
              <X className="h-4 w-4" /> Reject
            </Button>
          </div>
        ) : null}
      </div>
    </div>

    {r.status !== "rejected" && (
      <PickupTracker
        stage={r.trackerStage}
        volunteer="Aarav Shrestha"
        etaMin={Math.max(8, Math.round(r.distanceKm * 4))}
        onAdvance={(s) => setRequestStage(r.id, s)}
      />
    )}
  </div>
);

export default NGOPage;