import { useAppStore, Delivery } from "@/store/AppStore";
import { Button } from "@/components/ui/button";
import { areaName } from "@/lib/data";
import { Bike, MapPin, ArrowRight, CheckCircle2, CalendarClock, Route, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { optimizeRoute } from "@/lib/route";
import VolunteerRouteMap, { VolunteerRouteStop } from "@/components/maps/VolunteerRouteMap";

const statusStyles: Record<string, string> = {
  available: "bg-primary-soft text-primary",
  in_transit: "bg-warning/15 text-warning",
  delivered: "bg-success/15 text-success",
};

const formatSchedule = (ts?: number) => {
  if (!ts) return null;
  const d = new Date(ts);
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

const VolunteerPage = () => {
  const { deliveries, acceptDelivery, completeDelivery } = useAppStore();
  const [completedStops, setCompletedStops] = useState<Record<number, boolean>>({});

  // Group active deliveries by volunteer to support multi-pickup route optimization.
  const byVolunteer = useMemo(() => {
    const map = new Map<string, Delivery[]>();
    deliveries
      .filter((d) => d.status !== "delivered")
      .forEach((d) => {
        const arr = map.get(d.volunteer) ?? [];
        arr.push(d);
        map.set(d.volunteer, arr);
      });
    return map;
  }, [deliveries]);

  const leaderboard = useMemo(() => {
    const counts = new Map<string, { deliveries: number; meals: number }>();
    // Include deliveries volunteer is currently assigned to (active + completed) so the board is populated.
    deliveries.forEach((d) => {
      const cur = counts.get(d.volunteer) ?? { deliveries: 0, meals: 0 };
      if (d.status === "delivered") {
        counts.set(d.volunteer, {
          deliveries: cur.deliveries + 1,
          meals: cur.meals + d.meals,
        });
      } else if (!counts.has(d.volunteer)) {
        counts.set(d.volunteer, cur);
      }
    });
    return [...counts.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.meals - a.meals || b.deliveries - a.deliveries)
      .slice(0, 5);
  }, [deliveries]);

  const selectedRoute = useMemo(() => {
    const first = [...byVolunteer.entries()].find(([, ds]) => ds.length > 0);
    if (!first) return null;

    const [volunteer, ds] = first;
    const pickups = ds.flatMap((d) =>
      d.pickups.map((p) => ({ area: p.area, name: p.sourceName, meals: p.meals })),
    );
    const dropMeals = ds.reduce((s, d) => s + d.meals, 0);
    const drop = { area: ds[0].dropArea, name: ds[0].ngoName };
    const route = optimizeRoute(pickups, drop);

    const stopMeals = new Map<string, number>();
    pickups.forEach((p) => stopMeals.set(`${p.name}-${p.area}`, p.meals));

    const stops: VolunteerRouteStop[] = route.stops.map((s) => ({
      name: s.name,
      area: s.area,
      kind: s.kind,
      meals: s.kind === "drop" ? dropMeals : stopMeals.get(`${s.name}-${s.area}`) ?? 0,
    }));

    return {
      volunteer,
      route,
      stops,
    };
  }, [byVolunteer]);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <span className="chip mb-3"><Bike className="h-3 w-3" />Volunteer Panel</span>
        <h2 className="font-display text-3xl font-semibold">Available deliveries</h2>
        <p className="text-sm text-muted-foreground mt-1">Multi-stop routes are auto-batched when heading to the same NGO.</p>
      </div>

      {deliveries.length === 0 && (
        <div className="panel p-12 text-center">
          <h3 className="font-display text-xl font-semibold">No deliveries yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Once an NGO accepts a request, it shows up here.</p>
        </div>
      )}

      {selectedRoute && (
        <div className="mb-5 space-y-4">
          <VolunteerRouteMap
            volunteerName={selectedRoute.volunteer}
            stops={selectedRoute.stops}
            completedStops={completedStops}
          />

          <div className="panel p-5">
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <RouteStat label="Total distance" value={`${selectedRoute.route.totalKm.toFixed(1)} km`} />
              <RouteStat label="Est. travel time" value={`${selectedRoute.route.totalMinutes} min`} icon={<Clock className="h-3.5 w-3.5" />} />
              <RouteStat label="Stops" value={`${selectedRoute.route.stops.length}`} />
            </div>

            <ol className="space-y-2">
              {selectedRoute.stops.map((s, i) => {
                const done = !!completedStops[i];
                const leg = i > 0 ? selectedRoute.route.legDistances[i - 1] : null;
                return (
                  <li
                    key={`${selectedRoute.volunteer}-${i}`}
                    className={
                      "flex items-start gap-3 p-3 rounded-lg border " +
                      (s.kind === "drop"
                        ? "bg-primary-soft border-primary/20"
                        : "bg-secondary/60 border-border")
                    }
                  >
                    <div
                      className={
                        "h-7 w-7 shrink-0 rounded-full grid place-items-center text-xs font-semibold " +
                        (done
                          ? "bg-muted text-muted-foreground"
                          : s.kind === "drop"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border text-foreground")
                      }
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                        {s.kind === "drop" ? "Dropoff" : "Pickup"}
                        {leg !== null && <> · {leg.toFixed(1)} km from previous</>}
                      </div>
                      <div className={"font-medium truncate " + (done ? "line-through opacity-60" : "")}>
                        {s.name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {areaName(s.area)}, Kathmandu · {s.meals} meals
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={done ? "outline" : "ghost"}
                      onClick={() =>
                        setCompletedStops((c) => ({ ...c, [i]: !c[i] }))
                      }
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {done ? "Done" : "Mark"}
                    </Button>
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 text-[11px] text-muted-foreground italic">
              Step list is synced with map marker numbers and route segments.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {deliveries.map((d) => <DeliveryCard key={d.id} d={d} onAccept={acceptDelivery} onComplete={completeDelivery} />)}
      </div>

      <section className="mt-10">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-accent" />
          <h3 className="font-display text-2xl font-semibold">Volunteer leaderboard</h3>
          <span className="text-xs text-muted-foreground">updates as deliveries complete</span>
        </div>
        <div className="panel p-2">
          {leaderboard.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground text-center">
              No deliveries yet — leaderboard will appear here.
            </p>
          ) : (
            <ol className="divide-y divide-border">
              {leaderboard.map((v, i) => (
                <li
                  key={v.name}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <RankMedal rank={i + 1} />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{v.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {v.deliveries} {v.deliveries === 1 ? "delivery" : "deliveries"} completed
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-xl font-semibold leading-none">
                      {(v.meals * 0.5).toFixed(1)}
                    </div>
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1">
                      kg delivered
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
};

const RouteStat = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <div className="rounded-lg bg-secondary/60 border border-border p-3">
    <div className="text-[11px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
      {icon}
      {label}
    </div>
    <div className="font-display text-lg font-semibold mt-0.5">{value}</div>
  </div>
);

const RankMedal = ({ rank }: { rank: number }) => {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  if (medal) {
    return (
      <span className="h-9 w-9 rounded-full bg-secondary grid place-items-center text-lg shrink-0">
        {medal}
      </span>
    );
  }
  return (
    <span className="h-9 w-9 rounded-full bg-secondary text-secondary-foreground grid place-items-center text-sm font-semibold shrink-0">
      {rank}
    </span>
  );
};

interface CardProps {
  d: Delivery;
  onAccept: (id: string) => void;
  onComplete: (id: string) => void;
}

const DeliveryCard = ({ d, onAccept, onComplete }: CardProps) => {
  const multi = d.pickups.length > 1;
  const sched = formatSchedule(d.scheduledFor);
  const sourceSummary = d.pickups.map((p) => p.sourceName).join(" + ");
  const totalSteps = d.pickups.length + 1;

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium ${statusStyles[d.status]}`}>
            {d.status.replace("_", " ")}
          </span>
          {multi && (
            <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full font-semibold bg-accent/15 text-accent-foreground border border-accent/30">
              <Route className="h-3 w-3" /> Multi-stop · {d.pickups.length}
            </span>
          )}
          {sched && (
            <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium bg-secondary text-secondary-foreground">
              <CalendarClock className="h-3 w-3" /> {sched}
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">{d.meals} meals · {sourceSummary}</div>
      </div>

      <ol className="space-y-2">
        {d.pickups.map((p, i) => (
          <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/60 border border-border">
            <StepDot index={i + 1} total={totalSteps} />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Step {i + 1} · Pickup</div>
              <div className="font-medium truncate">{p.sourceName}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" /> {areaName(p.area)} · {p.meals} meals
              </div>
            </div>
          </li>
        ))}
        <li className="flex items-start gap-3 p-3 rounded-lg bg-primary-soft border border-primary/20">
          <StepDot index={totalSteps} total={totalSteps} variant="drop" />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-widest text-primary/80">Step {totalSteps} · Deliver</div>
            <div className="font-medium truncate">{d.ngoName}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {areaName(d.dropArea)}
            </div>
          </div>
        </li>
      </ol>

      <div className="mt-4 flex gap-2">
        {d.status === "available" && (
          <Button size="sm" onClick={() => onAccept(d.id)}>
            Accept delivery <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        {d.status === "in_transit" && (
          <Button size="sm" onClick={() => onComplete(d.id)}>
            <CheckCircle2 className="h-4 w-4" /> Mark delivered
          </Button>
        )}
      </div>
    </div>
  );
};

const StepDot = ({ index, total, variant }: { index: number; total: number; variant?: "drop" }) => (
  <div
    className={
      "h-7 w-7 shrink-0 rounded-full grid place-items-center text-xs font-semibold mt-0.5 " +
      (variant === "drop"
        ? "bg-primary text-primary-foreground"
        : "bg-card border border-border text-foreground")
    }
  >
    {index}
  </div>
);

export default VolunteerPage;