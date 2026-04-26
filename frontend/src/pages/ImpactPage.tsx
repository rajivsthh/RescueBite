import { useAppStore } from "@/store/AppStore";
import { NGOS } from "@/lib/data";
import {
  CalendarClock,
  PartyPopper,
  Sparkles,
  Trophy,
  Award,
  Sunrise,
  Store,
} from "lucide-react";
import { useMemo } from "react";
import ImpactRescueMap from "@/components/maps/ImpactRescueMap";

const ImpactPage = () => {
  const { totals, requests, deliveries, events } = useAppStore();
  // 1 meal ≈ 0.5 kg food; 1 kg food saved = 2.5 kg CO₂ prevented.
  const foodKg = totals.mealsSaved * 0.5;
  const co2Kg = foodKg * 2.5;

  // "Today" window
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, [requests, deliveries]);

  const mealsSavedToday = useMemo(
    () =>
      deliveries
        .filter((d) => d.status === "delivered" && (d.completedAt ?? 0) >= todayStart)
        .reduce((s, d) => s + d.meals, 0),
    [deliveries, todayStart]
  );

  const totalDonors = useMemo(
    () => new Set(requests.map((r) => r.restaurantName)).size,
    [requests]
  );

  const cards = [
    { label: "Meals saved today", value: mealsSavedToday, icon: Sunrise, live: true as const },
    { label: "Predicted waste prevented", value: `${totals.predictedWastePrevented} meals`, icon: Sparkles },
    { label: "Scheduled pickups", value: totals.scheduledPickups, icon: CalendarClock },
    { label: "Event contributions", value: `${totals.eventContributions} meals`, icon: PartyPopper },
  ];

  // Rankings
  const restaurantRanking = useMemo(() => buildRanking(requests.filter((r) => r.sourceKind === "restaurant")), [requests]);
  const eventRanking = useMemo(() => buildRanking(requests.filter((r) => r.sourceKind === "event")), [requests]);
  const volunteerRanking = useMemo(() => {
    const counts = new Map<string, number>();
    deliveries
      .filter((d) => d.status === "delivered")
      .forEach((d) => {
        counts.set(d.volunteer, (counts.get(d.volunteer) ?? 0) + d.meals);
      });
    return [...counts.entries()]
      .map(([name, meals]) => ({ name, meals }))
      .sort((a, b) => b.meals - a.meals)
      .slice(0, 3);
  }, [deliveries]);

  const topVolunteerToday = useMemo(() => {
    const counts = new Map<string, { meals: number; deliveries: number }>();
    deliveries
      .filter((d) => d.status === "delivered" && (d.completedAt ?? 0) >= todayStart)
      .forEach((d) => {
        const cur = counts.get(d.volunteer) ?? { meals: 0, deliveries: 0 };
        counts.set(d.volunteer, { meals: cur.meals + d.meals, deliveries: cur.deliveries + 1 });
      });
    const arr = [...counts.entries()].sort((a, b) => b[1].meals - a[1].meals);
    return arr[0] ? { name: arr[0][0], ...arr[0][1] } : null;
  }, [deliveries, todayStart]);

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <span className="chip mb-3">Impact</span>
        <h2 className="font-display text-3xl font-semibold">Every meal counts.</h2>
        <p className="text-sm text-muted-foreground mt-1">Live tally across the Kathmandu network.</p>
      </div>

      {/* Summary stat bar */}
      <div className="panel mb-8 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
        <SummaryStat icon={<Store className="h-3.5 w-3.5" />} label="Total Donors" value={totalDonors} />
        <SummaryStat icon={<HeartHandshake className="h-3.5 w-3.5" />} label="Total NGOs" value={NGOS.length} />
        <SummaryStat icon={<Truck className="h-3.5 w-3.5" />} label="Total Deliveries" value={totals.deliveriesCompleted} />
        <SummaryStat icon={<Leaf className="h-3.5 w-3.5" />} label="Total CO₂ Saved" value={`${co2Kg.toFixed(1)} kg`} />
      </div>

      {/* Top volunteer of the day */}
      {topVolunteerToday && (
        <div className="panel mb-8 flex items-center justify-between flex-wrap gap-4 bg-gradient-to-br from-primary-soft to-card">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-primary/80 font-semibold">
                Top volunteer of the day
              </div>
              <div className="font-display text-2xl font-semibold mt-0.5">{topVolunteerToday.name}</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {topVolunteerToday.deliveries} deliveries · {topVolunteerToday.meals} meals delivered
              </div>
            </div>
          </div>
          <span className="chip">
            <Trophy className="h-3 w-3" /> Champion
          </span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          const isAccent = "accent" in c && c.accent;
          const isLive = "live" in c && c.live;
          return (
            <div key={c.label} className="panel">
              <div
                className={`h-9 w-9 rounded-lg grid place-items-center mb-4 ${
                  isAccent ? "bg-success/15 text-success" : "bg-primary-soft text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                {c.label}
                {isLive && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <div className="text-[36px] font-bold leading-tight mt-2 text-[#1a3a2a]">{c.value}</div>
            </div>
          );
        })}
      </div>

      <div className="my-8 border-t border-[#ebebeb]" />

      <ImpactRescueMap />

      <div className="grid lg:grid-cols-3 gap-4 mt-8">
        <Leaderboard title="Top restaurants" entries={restaurantRanking} unit="meals" />
        <Leaderboard title="Top party palaces" entries={eventRanking} unit="meals" />
        <Leaderboard title="Top volunteers" entries={volunteerRanking.map((v) => ({ name: v.name, value: v.meals }))} unit="meals delivered" />
      </div>

      <div className="panel mt-8">
        <h3 className="font-display text-xl font-semibold mb-4">Recent activity</h3>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet — submit a request to see it here.</p>
        ) : (
          <ul className="divide-y divide-border">
            {requests.slice(0, 8).map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                <span className="truncate">
                  <strong>{r.restaurantName}</strong> → {r.ngo.name}
                </span>
                <span className="text-muted-foreground whitespace-nowrap">
                  {r.meals} meals · {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {events.length > 0 && (
        <div className="panel mt-8">
          <h3 className="font-display text-xl font-semibold mb-4">Event predictions log</h3>
          <ul className="divide-y divide-border">
            {events.slice(0, 6).map((e) => (
              <li key={e.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                <span className="truncate">
                  <strong>{e.name}</strong> · {e.eventType} · {e.guests} guests
                </span>
                <span className="text-muted-foreground whitespace-nowrap">
                  ~{e.expectedSurplus} meals · {e.notified ? "notified" : "predicted"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface RankEntry { name: string; value: number; }

const SummaryStat = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="px-4 py-2 flex items-center gap-3">
    <span className="h-8 w-8 rounded-lg bg-primary-soft text-primary grid place-items-center shrink-0">
      {icon}
    </span>
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">
        {label}
      </div>
      <div className="text-[36px] font-bold leading-tight text-[#1a3a2a]">{value}</div>
    </div>
  </div>
);

function buildRanking(items: { restaurantName: string; meals: number; status: string }[]): RankEntry[] {
  const counts = new Map<string, number>();
  items
    .filter((r) => r.status === "accepted" || r.status === "delivered")
    .forEach((r) => counts.set(r.restaurantName, (counts.get(r.restaurantName) ?? 0) + r.meals));
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

const Leaderboard = ({ title, entries, unit }: { title: string; entries: RankEntry[]; unit: string }) => (
  <div className="panel">
    <div className="flex items-center gap-2 mb-3">
      <Trophy className="h-4 w-4 text-accent" />
      <h4 className="font-display text-lg font-semibold">{title}</h4>
    </div>
    {entries.length === 0 ? (
      <p className="text-sm text-muted-foreground">No data yet.</p>
    ) : (
      <ol className="space-y-2">
        {entries.map((e, i) => (
          <li key={e.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className={
                "h-7 w-7 rounded-full grid place-items-center text-xs font-semibold " +
                (i === 0 ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground")
              }>{i + 1}</span>
              <span className="font-medium truncate">{e.name}</span>
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap">{e.value} {unit}</span>
          </li>
        ))}
      </ol>
    )}
  </div>
);

export default ImpactPage;