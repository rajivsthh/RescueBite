import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AREAS, AreaId, areaName, nearestNGO } from "@/lib/data";
import {
  EventType,
  MealType,
  estimateSurplusKg,
  kgToMeals,
  predictEventSurplus,
  restaurantSuggestion,
} from "@/lib/predict";
import { optimize } from "@/lib/optimizer";
import { useAppStore } from "@/store/AppStore";
import { toast } from "@/hooks/use-toast";
import PriorityBadge from "@/components/PriorityBadge";
import {
  CalendarClock,
  PartyPopper,
  Sparkles,
  Send,
  ArrowRight,
  Users,
  Scale,
  HeartHandshake,
  MapPin,
} from "lucide-react";

const EVENT_TYPES: EventType[] = ["Wedding", "Corporate", "Party", "Bratabandha", "Conference"];
const MEAL_TYPES: MealType[] = ["Veg", "Non-Veg", "Mixed"];

const localISO = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EventPage = () => {
  const { addEvent, notifyEventNGOs, addRequests, events } = useAppStore();
  const [name, setName] = useState("Annapurna Banquet");
  const [area, setArea] = useState<AreaId>("lalitpur");
  const [guests, setGuests] = useState(250);
  const [eventType, setEventType] = useState<EventType>("Wedding");
  const [mealType, setMealType] = useState<MealType>("Mixed");
  const [endTime, setEndTime] = useState(() => {
    const d = new Date(Date.now() + 3 * 60 * 60 * 1000);
    d.setSeconds(0, 0);
    return localISO(d);
  });
  const [submittedEventId, setSubmittedEventId] = useState<string | null>(null);

  const prediction = useMemo(
    () => predictEventSurplus(guests, eventType, endTime),
    [guests, eventType, endTime]
  );

  const surplusKg = useMemo(
    () => estimateSurplusKg(guests, eventType, mealType),
    [guests, eventType, mealType]
  );
  const surplusMeals = kgToMeals(surplusKg);
  const suggestedNGO = useMemo(() => nearestNGO(area), [area]);

  // hours until pickup, used for priority
  const pickupExpiryHours = useMemo(() => {
    const ms = prediction.pickupDate.getTime() - Date.now();
    return Math.max(1, Math.round(ms / (60 * 60 * 1000)));
  }, [prediction.pickupDate]);

  const suggestion = restaurantSuggestion(surplusMeals, pickupExpiryHours);

  const handlePredict = () => {
    if (!name || guests <= 0) {
      toast({ title: "Fill all fields", description: "Event name and guests are required." });
      return;
    }
    const entry = addEvent({
      name,
      area,
      guests,
      eventType,
      endTime,
      expectedSurplus: surplusMeals,
    });
    setSubmittedEventId(entry.id);
    toast({ title: "Surplus predicted", description: `~${surplusKg} kg (${surplusMeals} meals) expected.` });
  };

  const handleNotify = () => {
    if (!submittedEventId) return;
    const r = optimize({ fromArea: area, quantity: surplusMeals, expiryHours: pickupExpiryHours });
    if (r.allocations.length === 0) {
      toast({ title: "No NGOs available", description: "Try a different area or smaller batch." });
      return;
    }
    addRequests(
      r.allocations.map((a) => ({
        restaurantName: name,
        sourceKind: "event" as const,
        fromArea: area,
        foodType: `${eventType} surplus`,
        meals: a.meals,
        totalMeals: surplusMeals,
        expiryHours: pickupExpiryHours,
        distanceKm: a.distanceKm,
        ngo: a.ngo,
        scheduledFor: prediction.pickupDate.getTime(),
      }))
    );
    notifyEventNGOs(submittedEventId);
    toast({
      title: "NGOs notified in advance",
      description: `${r.allocations.length} NGO(s) queued for ${prediction.pickupTime} pickup.`,
    });
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6 items-start">
      {/* Form */}
      <div className="panel p-6 lg:p-8 lg:col-span-2">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-2xl font-semibold">Plan an event</h2>
          <span className="chip"><PartyPopper className="h-3 w-3" />Event Mode</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Predict surplus before it happens. Notify NGOs in advance.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="ename">Event name</Label>
            <Input id="ename" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
          </div>

          <div>
            <Label>Location</Label>
            <Select value={area} onValueChange={(v) => setArea(v as AreaId)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {AREAS.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Event type</Label>
            <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Meal type</Label>
            <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="text-[11px] text-muted-foreground mt-1">
              Mixed meals add +10% to the estimate.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guests">Guests</Label>
              <Input id="guests" type="number" min={1} value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value || "0", 10))} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="end">Ends at</Label>
              <Input id="end" type="datetime-local" value={endTime}
                onChange={(e) => setEndTime(e.target.value)} className="mt-1.5" />
            </div>
          </div>

          {suggestion && (
            <div className="flex gap-2 p-3 rounded-lg border border-primary/20 bg-primary-soft text-primary text-sm">
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{suggestion}</span>
            </div>
          )}

          <Button onClick={handlePredict} size="lg" className="w-full mt-2">
            Predict surplus <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Result */}
      <div className="lg:col-span-3 space-y-4">
        <div className="panel p-6 lg:p-8">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Surplus prediction</div>
              <h3 className="font-display text-2xl font-semibold mt-1">
                {name || "Untitled event"} · {areaName(area)}
              </h3>
              <div className="text-xs text-muted-foreground mt-1">
                {eventType} · {mealType} · {guests} guests
              </div>
            </div>
            <PriorityBadge hours={pickupExpiryHours} />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <PredictCard
              label="Expected surplus"
              value={`${surplusKg} kg`}
              sub={`≈ ${surplusMeals} meals`}
              icon={<Scale className="h-4 w-4" />}
            />
            <PredictCard
              label="Recommended pickup"
              value={prediction.pickupTime}
              sub="≈30 min after event ends"
              icon={<CalendarClock className="h-4 w-4" />}
            />
            <PredictCard
              label="Suggested NGO"
              value={suggestedNGO.name.replace(/^NGO\s+[A-Z]\s—\s/, "")}
              sub={`${areaName(suggestedNGO.area)} · cap ${suggestedNGO.capacity}`}
              icon={<HeartHandshake className="h-4 w-4" />}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleNotify} size="lg" disabled={!submittedEventId || events.find((e) => e.id === submittedEventId)?.notified}>
              <Send className="h-4 w-4" />
              {events.find((e) => e.id === submittedEventId)?.notified ? "NGOs notified" : "Notify NGOs in advance"}
            </Button>
            <Button variant="outline" size="lg" onClick={() => setSubmittedEventId(null)}>
              New prediction
            </Button>
          </div>
        </div>

        {events.length > 0 && (
          <div className="panel p-6">
            <h4 className="font-display text-lg font-semibold mb-3">Recent events</h4>
            <ul className="divide-y divide-border">
              {events.slice(0, 5).map((e) => (
                <li key={e.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{e.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {e.eventType} · {e.guests} guests · {areaName(e.area)}
                    </div>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <div className="font-display text-lg font-semibold">{e.expectedSurplus}</div>
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {e.notified ? "notified" : "predicted"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const PredictCard = ({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) => (
  <div className="p-4 rounded-xl bg-secondary/60 border border-border">
    <div className="h-8 w-8 rounded-lg bg-primary-soft text-primary grid place-items-center mb-3">{icon}</div>
    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="font-display text-2xl font-semibold mt-1">{value}</div>
    <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
  </div>
);

export default EventPage;