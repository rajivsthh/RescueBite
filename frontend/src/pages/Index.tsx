import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import RescueMap from "@/components/RescueMap";

const Index = () => {
  return (
    <section className="space-y-10 md:space-y-12">
      <div className="min-h-[36vh] grid place-items-center">
        <div className="panel w-full max-w-2xl p-7 md:p-10 text-center">
          <span className="chip mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            RescueBite
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.98] tracking-[-0.035em]">
            Food shared,
            <span className="italic text-primary"> dignity restored.</span>
          </h1>
          <blockquote className="mt-6 font-display text-xl md:text-2xl italic text-foreground/90">
            "Every rescued meal saves effort, money, and hope."
          </blockquote>

          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Kathmandu's one space for restaurants, events, NGOs, and volunteers.
          </p>

          <div className="mt-8 flex justify-center">
            <Link to="/restaurant" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
              Start Rescue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full">
        <RescueMap />
      </div>
    </section>
  );
};

export default Index;
