import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import RescueMap from "@/components/RescueMap";

const Index = () => {
  return (
    <section className="space-y-6">
      <div className="min-h-[40vh] grid place-items-center">
        <div className="panel w-full max-w-3xl p-7 md:p-10 text-center">
          <span className="chip mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            RescueBite
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-[1.08] tracking-tight">
            Food shared,
            <span className="italic text-primary"> dignity restored.</span>
          </h1>
          <blockquote className="mt-6 font-display text-xl md:text-2xl italic text-foreground/90">
            "Every rescued meal saves effort, money, and hope."
          </blockquote>

          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Kathmandu's one space for restaurants, events, NGOs, and volunteers.
          </p>

          <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
            <Link to="/restaurant" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
              Start Rescue
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/ngo" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground">
              NGO Dashboard
            </Link>
          </div>
        </div>
      </div>

      <RescueMap />
    </section>
  );
};

export default Index;
