import { Link } from "react-router-dom";
import { ArrowRight, Bike, HeartHandshake, PartyPopper, Store } from "lucide-react";

const quickLinks = [
  {
    to: "/restaurant",
    title: "Restaurant Dashboard",
    description: "Log surplus meals and dispatch pickup requests in real time.",
    icon: Store,
  },
  {
    to: "/event",
    title: "Event Planner",
    description: "Predict post-event surplus and schedule rescue before disposal.",
    icon: PartyPopper,
  },
  {
    to: "/ngo",
    title: "NGO Matching",
    description: "View incoming food offers and capacity-aware match scores.",
    icon: HeartHandshake,
  },
  {
    to: "/volunteer",
    title: "Volunteer Routing",
    description: "Optimize pickup routes and keep delivery windows on track.",
    icon: Bike,
  },
];

const Index = () => {
  return (
    <section className="space-y-10 md:space-y-12">
      <div className="panel p-7 md:p-10">
        <span className="chip mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          RescueBite Platform Home
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight max-w-4xl">
          Turn surplus food into
          <span className="italic text-primary"> same-day impact.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground text-base md:text-lg">
          This dashboard connects restaurants, event venues, NGOs, and volunteers across Kathmandu to reduce edible food waste.
          Choose a workspace below to begin.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link to="/restaurant" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
            Open Restaurant Mode
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/analytics" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground">
            View Analytics
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {quickLinks.map(({ to, title, description, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="panel p-5 md:p-6 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </div>
              <span className="mt-1 h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <Icon className="h-4.5 w-4.5" />
              </span>
            </div>
            <div className="mt-4 text-sm font-medium text-primary inline-flex items-center gap-1.5">
              Open
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Index;
