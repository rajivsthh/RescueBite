import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Leaf, House, Store, HeartHandshake, Bike, BarChart3, PartyPopper, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home", icon: House },
  { to: "/restaurant", label: "Restaurant", icon: Store },
  { to: "/event", label: "Event", icon: PartyPopper },
  { to: "/ngo", label: "NGO", icon: HeartHandshake },
  { to: "/volunteer", label: "Volunteer", icon: Bike },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/impact", label: "Impact", icon: BarChart3 },
];

const Layout = () => {
  const { pathname } = useLocation();
  const showHero = pathname === "/restaurant" || pathname === "/event";
  const isEvent = pathname === "/event";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/70 bg-background/70 backdrop-blur-md sticky top-0 z-30">
        <div className="container flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
              <Leaf className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold">Food Waste Optimizer</div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Kathmandu</div>
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full border border-border bg-card/60">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <button className="text-sm text-muted-foreground hover:text-foreground">
            Sign in
          </button>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden border-t border-border/70 overflow-x-auto">
          <div className="container flex gap-1 py-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      {showHero && (
        <section className="container pt-14 pb-6">
          <div className="max-w-3xl">
            <span className="chip mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Live in Kathmandu Valley
            </span>
            {isEvent ? (
              <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
                Plan rescue —<br />
                <span className="italic text-primary">before the waste happens.</span>
              </h1>
            ) : (
              <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
                No food is waste —<br />
                <span className="italic text-primary">it's just a misplaced resource.</span>
              </h1>
            )}
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl">
              {isEvent
                ? "Party palaces and event organisers predict surplus from guest count, then notify NGOs in advance."
                : "Restaurants log surplus meals. We instantly route them to the nearest NGOs with capacity, prioritising urgency."}
            </p>

            {/* Mode toggle */}
            <div className="mt-6 inline-flex p-1 rounded-full border border-border bg-card/60">
              <NavLink
                to="/restaurant"
                className={({ isActive }) =>
                  cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                Restaurant Mode
              </NavLink>
              <NavLink
                to="/event"
                className={({ isActive }) =>
                  cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                Event Mode
              </NavLink>
            </div>
          </div>
        </section>
      )}

      <main className="container flex-1 py-12">
        <Outlet />
      </main>

      <footer className="border-t border-border/70 mt-12">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Food Waste Optimizer · Kathmandu</span>
          <span>Demo build · hardcoded NGO directory</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;