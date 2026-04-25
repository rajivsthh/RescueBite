import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AREAS, AreaId, areaName } from "@/lib/data";
import { optimize, OptimizationResult } from "@/lib/optimizer";
import { useAppStore } from "@/store/AppStore";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, MapPin, Soup, CheckCircle2, Sparkles, CalendarClock, Bell } from "lucide-react";
import PriorityBadge from "@/components/PriorityBadge";
import { restaurantSuggestion } from "@/lib/predict";
import { priorityBorderClass } from "@/lib/priority";
import UrgencyLegend from "@/components/UrgencyLegend";
import MatchScoreCard from "@/components/MatchScoreCard";
import DonationCertificate from "@/components/DonationCertificate";
import FoodQualityChecker from "@/components/FoodQualityChecker";
import PickupTracker from "@/components/PickupTracker";
import { QualityResult, qualityChipClass } from "@/lib/quality";
import {
  buildUrgentNgoMsg,
  buildVolunteerMsg,
  SimNotification,
} from "@/lib/notifications";

const FOOD_TYPES = ["Cooked Dal-Bhat", "Momos", "Bread & Pastries", "Curry & Rice", "Mixed Buffet"];

const RestaurantPage = () => {
  const { addRequests, requests, setRequestStage } = useAppStore();
  const [name, setName] = useState("Hotel Yala");
  const [area, setArea] = useState<AreaId>("thamel");
  const [foodType, setFoodType] = useState(FOOD_TYPES[0]);
  const [quantity, setQuantity] = useState(30);
  const [expiry, setExpiry] = useState(2);
  const [schedule, setSchedule] = useState(false);
  const [scheduleAt, setScheduleAt] = useState<string>(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    d.setSeconds(0, 0);
    // local datetime-input format
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [quality, setQuality] = useState<QualityResult | null>(null);

  const suggestion = restaurantSuggestion(quantity, expiry);

  const handleOptimize = () => {
    if (!name || quantity <= 0 || expiry <= 0) {
      toast({ title: "Fill all fields", description: "Restaurant name, meals and expiry are required." });
      return;
    }
    const r = optimize({ fromArea: area, quantity, expiryHours: expiry });
    setResult(r);
    setSubmitted(false);
  };

  const handleConfirm = () => {
    if (!result) return;
    const scheduledFor = schedule ? new Date(scheduleAt).getTime() : undefined;
    const items = result.allocations.map((a) => ({
        restaurantName: name,
        sourceKind: "restaurant" as const,
        fromArea: area,
        foodType,
        meals: a.meals,
        totalMeals: quantity,
        expiryHours: expiry,
        distanceKm: a.distanceKm,
        ngo: a.ngo,
        scheduledFor,
        quality: quality?.verdict,
    }));
    addRequests(items);
    setSubmitted(true);
    setSubmittedAt(Date.now());

    // Fire simulated WhatsApp notifications for urgent matches.
    if (expiry <= 2 && !schedule) {
      const now = Date.now();
      const notes: SimNotification[] = [];
      result.allocations.forEach((a, i) => {
        notes.push({
          id: `n-${now}-${i}-ngo`,
          to: "ngo",
          recipientName: a.ngo.name,
          text: buildUrgentNgoMsg(name, areaName(area), a.meals, expiry, `${now}${i}`),
          timestamp: now,
          read: false,
        });
        notes.push({
          id: `n-${now}-${i}-vol`,
          to: "volunteer",
          recipientName: "Volunteer on duty",
          text: buildVolunteerMsg(name, a.ngo.name),
          timestamp: now + 200,
          read: false,
        });
      });
      window.dispatchEvent(new CustomEvent("fwo:notify", { detail: notes }));
    }

    toast({
      title: schedule ? "Pickup scheduled" : "Sent to NGOs",
      description: `${result.allocations.length} NGO(s) ${schedule ? "queued for upcoming pickup." : "notified."}`,
    });
  };

  const triggerDemoNotification = () => {
    const now = Date.now();
    const ngo = result?.allocations[0]?.ngo;
    const ngoName = ngo?.name ?? "NGO A — Sahayog Kitchen";
    const notes: SimNotification[] = [
      {
        id: `demo-${now}-ngo`,
        to: "ngo",
        recipientName: ngoName,
        text: buildUrgentNgoMsg(name || "Hotel Yala", areaName(area), quantity || 30, Math.min(expiry, 2), `${now}`),
        timestamp: now,
        read: false,
      },
      {
        id: `demo-${now}-vol`,
        to: "volunteer",
        recipientName: "Aarav Shrestha",
        text: buildVolunteerMsg(name || "Hotel Yala", ngoName),
        timestamp: now + 200,
        read: false,
      },
    ];
    window.dispatchEvent(new CustomEvent("fwo:notify", { detail: notes }));
  };

  // Find delivered batch matching this submission for certificate generation.
  const deliveredForCert = useMemo(() => {
    if (!submittedAt) return null;
    const mine = requests.filter(
      (r) => r.restaurantName === name && r.createdAt >= submittedAt && r.status === "delivered"
    );
    if (mine.length === 0) return null;
    const totalMeals = mine.reduce((s, r) => s + r.meals, 0);
    const ngoNames = Array.from(new Set(mine.map((r) => r.ngo.name))).join(", ");
    return {
      restaurantName: name,
      meals: totalMeals,
      ngoName: ngoNames,
      date: new Date(),
      co2Kg: +(totalMeals * 0.5 * 2.5).toFixed(1), // 0.5 kg/meal × 2.5 CO₂ factor
    };
  }, [requests, submittedAt, name]);

  // Active in-flight requests for this donor (for the live tracker view).
  const myActive = useMemo(() => {
    if (!submittedAt) return [];
    return requests
      .filter((r) => r.restaurantName === name && r.createdAt >= submittedAt && r.status !== "rejected")
      .slice(0, 4);
  }, [requests, submittedAt, name]);

  return (
    <div className="grid lg:grid-cols-5 gap-6 items-start">
      {/* Form */}
      <div className="panel p-6 lg:p-8 lg:col-span-2">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-2xl font-semibold">Log surplus food</h2>
          <span className="chip"><Soup className="h-3 w-3" />Restaurant</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          We'll match you to the best NGOs in seconds.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Restaurant name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
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
            <Label>Food type</Label>
            <Select value={foodType} onValueChange={setFoodType}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FOOD_TYPES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="qty">Meals</Label>
              <Input id="qty" type="number" min={1} value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value || "0", 10))} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="exp">Expiry (hours)</Label>
              <Input id="exp" type="number" min={1} value={expiry}
                onChange={(e) => setExpiry(parseInt(e.target.value || "0", 10))} className="mt-1.5" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <CalendarClock className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">Schedule pickup</div>
                  <div className="text-xs text-muted-foreground">Plan ahead instead of instant match</div>
                </div>
              </div>
              <Switch checked={schedule} onCheckedChange={setSchedule} />
            </div>
            {schedule && (
              <Input
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                className="mt-3"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge hours={expiry} />
            <span className="text-xs text-muted-foreground">auto-set from expiry</span>
          </div>

          <FoodQualityChecker result={quality} onResult={setQuality} />

          {suggestion && (
            <div className="flex gap-2 p-3 rounded-lg border border-primary/20 bg-primary-soft text-primary text-sm">
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{suggestion}</span>
            </div>
          )}

          <Button onClick={handleOptimize} size="lg" className="w-full mt-2">
            Find best match <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={triggerDemoNotification}
          >
            <Bell className="h-4 w-4" /> Simulate notification
          </Button>
        </div>
      </div>

      {/* Result */}
      <div className="lg:col-span-3 space-y-4">
        <div className="panel p-4">
          <UrgencyLegend />
        </div>

        {!result && (
          <div className="panel p-10 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary-soft text-primary grid place-items-center mb-4">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-1">Your distribution plan appears here</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Submit the form to see how meals are split across nearby NGOs in Kathmandu.
            </p>
          </div>
        )}

        {result && (
          <div className="panel p-6 lg:p-8">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Optimized distribution plan</div>
                <h3 className="font-display text-2xl font-semibold mt-1">
                  {quantity} meals from {areaName(area)}
                </h3>
              </div>
              <PriorityBadge hours={expiry} />
            </div>

            <div className="space-y-3">
              {result.allocations.map((a, i) => (
                <div key={a.ngo.id}
                  className={`flex items-center justify-between gap-4 p-4 rounded-xl bg-secondary/60 ${priorityBorderClass(expiry)}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-semibold text-sm">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{a.ngo.name}</span>
                        {expiry <= 2 && (
                          <span className="chip-warning">URGENT</span>
                        )}
                        {quality && (
                          <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold " + qualityChipClass(quality.verdict)}>
                            {quality.emoji} {quality.label}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{areaName(a.ngo.area)}</span>
                        <span>{a.distanceKm.toFixed(1)} km</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-semibold leading-none">{a.meals}</div>
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1">meals</div>
                  </div>
                </div>
              ))}

              {result.unallocated > 0 && (
                <div className="p-3 rounded-lg border border-warning/40 bg-warning/10 text-sm">
                  <strong>{result.unallocated}</strong> meals couldn't be allocated — capacity exceeded across NGOs.
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
              <Stat label="NGOs" value={result.allocations.length.toString()} />
              <Stat label="Total distance" value={`${result.totalDistanceKm.toFixed(1)} km`} />
              <Stat label="Expiry" value={`${expiry}h`} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleConfirm} size="lg" disabled={submitted}>
                {submitted ? (
                  <><CheckCircle2 className="h-4 w-4" /> {schedule ? "Pickup scheduled" : "Sent to NGOs"}</>
                ) : (
                  <>{schedule ? "Schedule pickup" : "Confirm & notify NGOs"} <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
              <Button variant="outline" size="lg" onClick={() => { setResult(null); setSubmitted(false); setSubmittedAt(null); }}>
                Reset
              </Button>
            </div>
          </div>
        )}

        {submitted && myActive.length > 0 && (
          <div className="panel p-6 lg:p-8">
            <div className="mb-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Live status
              </div>
              <h3 className="font-display text-xl font-semibold mt-1">
                Track each pickup in real time
              </h3>
            </div>
            <div className="space-y-4">
              {myActive.map((r) => (
                <div key={r.id} className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="text-sm font-medium">{r.ngo.name}</div>
                    <div className="text-xs text-muted-foreground">{r.meals} meals · {r.distanceKm.toFixed(1)} km</div>
                  </div>
                  <PickupTracker
                    stage={r.trackerStage}
                    volunteer="Aarav Shrestha"
                    etaMin={Math.max(8, Math.round(r.distanceKm * 4))}
                    onAdvance={(s) => setRequestStage(r.id, s)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {result && submitted && (
          <MatchScoreCard
            allocations={result.allocations}
            expiryHours={expiry}
            totalMeals={quantity}
          />
        )}

        {deliveredForCert && (
          <div className="panel p-6 lg:p-8">
            <div className="mb-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Donation complete
              </div>
              <h3 className="font-display text-xl font-semibold mt-1">
                Your contribution certificate is ready
              </h3>
            </div>
            <DonationCertificate data={deliveredForCert} />
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="font-display text-xl font-semibold mt-1">{value}</div>
  </div>
);

export default RestaurantPage;