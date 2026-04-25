import { Allocation } from "@/lib/optimizer";
import { computeMatchScore, scoreBarColor, scoreColor, scoreTier } from "@/lib/matchScore";
import { areaName } from "@/lib/data";
import { Gauge, MapPin } from "lucide-react";

interface Props {
  allocations: Allocation[];
  expiryHours: number;
  totalMeals: number;
}

const MatchScoreCard = ({ allocations, expiryHours, totalMeals }: Props) => {
  if (!allocations.length) return null;

  return (
    <div className="panel p-6 lg:p-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-lg bg-primary-soft text-primary grid place-items-center">
            <Gauge className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Match score breakdown
            </div>
            <h3 className="font-display text-xl font-semibold">How we picked these NGOs</h3>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          weights: distance 30% · urgency 40% · capacity 30%
        </span>
      </div>

      <div className="space-y-4">
        {allocations.map((a) => {
          const s = computeMatchScore({
            distanceKm: a.distanceKm,
            expiryHours,
            mealsAssigned: a.meals,
            ngoCapacity: a.ngo.capacity,
          });
          const tier = scoreTier(s.final);
          return (
            <div key={a.ngo.id} className="rounded-xl border border-border bg-secondary/40 p-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <div className="font-medium truncate">{a.ngo.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <MapPin className="h-3 w-3" /> {areaName(a.ngo.area)} · {a.distanceKm.toFixed(1)} km · {a.meals} meals
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-display text-3xl font-semibold leading-none ${scoreColor(tier)}`}>
                    {s.final.toFixed(1)}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    final score
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <ScoreRow label="Distance" value={s.distance} />
                <ScoreRow label="Urgency" value={s.urgency} />
                <ScoreRow label="Capacity" value={s.capacity} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-muted-foreground mt-4">
        Based on {totalMeals} meals · {expiryHours}h expiry
      </div>
    </div>
  );
};

const ScoreRow = ({ label, value }: { label: string; value: number }) => {
  const tier = scoreTier(value);
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-semibold ${scoreColor(tier)}`}>{value.toFixed(1)} / 10</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${scoreBarColor(tier)} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default MatchScoreCard;