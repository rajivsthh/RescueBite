import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import RescueMap from "@/components/RescueMap";

const Index = () => {
  return (
    <section className="space-y-10 md:space-y-12">
      <div className="min-h-[48vh] grid place-items-center">
        <div className="hero-wrap w-full max-w-5xl">
          <div className="hero-gradient" />

          {/* decorative leaves */}
          <svg className="leaf s1" viewBox="0 0 24 24" aria-hidden>
            <path fill="var(--marker-ngo)" d="M12 2c3 0 6 3 6 6s-3 6-6 10c-3-4-6-7-6-10s3-6 6-6z" />
          </svg>
          <svg className="leaf s2" viewBox="0 0 24 24" aria-hidden>
            <path fill="var(--marker-restaurant)" d="M12 2c3 0 6 3 6 6s-3 6-6 10c-3-4-6-7-6-10s3-6 6-6z" />
          </svg>
          <svg className="leaf s3" viewBox="0 0 24 24" aria-hidden>
            <path fill="var(--marker-event)" d="M12 2c3 0 6 3 6 6s-3 6-6 10c-3-4-6-7-6-10s3-6 6-6z" />
          </svg>

          <div className="panel p-7 md:p-12 text-center hero-content">
            <span className="chip mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              RescueBite
            </span>

            <h1 className="font-display hero-title text-5xl md:text-[4rem] leading-[0.95] tracking-[-0.02em]">
              Food rescued,
              <span className="text-[var(--primary)]"> dignity restored.</span>
            </h1>

            <blockquote className="mt-6 text-[20px] md:text-[24px] font-medium hero-sub">
              "Every rescued meal saves effort, money, and hope."
            </blockquote>

            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Kathmandu's one trusted network connecting restaurants, events, NGOs, and volunteers to redirect surplus food fast.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Link to="/restaurant" className="btn-cta">
                Start Rescue
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/ngo" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[var(--primary)] bg-white/60 border border-border">
                Learn More
              </Link>
            </div>

            <div className="impact-stats mt-6">
              <div className="stat">1,200+ Meals Rescued</div>
              <div className="text-muted-foreground">·</div>
              <div className="stat">34 NGOs</div>
              <div className="text-muted-foreground">·</div>
              <div className="stat">200 Volunteers</div>
            </div>
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
