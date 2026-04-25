import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LineChart as LineIcon } from "lucide-react";

const FOREST = "hsl(152 45% 20%)";
const SAGE = "hsl(152 30% 55%)";
const OCHRE = "hsl(38 60% 55%)";
const CLAY = "hsl(20 45% 55%)";
const SAND = "hsl(40 25% 80%)";

const dayData = [
  { day: "Mon", kg: 42 },
  { day: "Tue", kg: 38 },
  { day: "Wed", kg: 51 },
  { day: "Thu", kg: 47 },
  { day: "Fri", kg: 78 },
  { day: "Sat", kg: 96 },
  { day: "Sun", kg: 84 },
];

const trendData = [
  { day: "Day 1", rescued: 32, wasted: 18 },
  { day: "Day 2", rescued: 41, wasted: 15 },
  { day: "Day 3", rescued: 38, wasted: 22 },
  { day: "Day 4", rescued: 55, wasted: 12 },
  { day: "Day 5", rescued: 49, wasted: 16 },
  { day: "Day 6", rescued: 72, wasted: 9 },
  { day: "Day 7", rescued: 81, wasted: 11 },
];

const typeData = [
  { name: "Veg", value: 48 },
  { name: "Non-Veg", value: 27 },
  { name: "Mixed", value: 25 },
];
const typeColors = [FOREST, OCHRE, SAGE];

const SLOTS = ["Morning", "Afternoon", "Evening", "Night"];
const heatmap: { area: string; values: number[] }[] = [
  { area: "Thamel", values: [12, 18, 64, 42] },
  { area: "Baneshwor", values: [8, 22, 38, 28] },
  { area: "Lalitpur", values: [10, 14, 52, 36] },
  { area: "Kirtipur", values: [6, 9, 24, 16] },
  { area: "Bhaktapur", values: [14, 11, 46, 32] },
];

const heatColor = (v: number) => {
  // v in 0..70 → opacity 0.08..0.85
  const max = 70;
  const o = Math.min(0.85, 0.08 + (v / max) * 0.77);
  return `hsl(152 45% 28% / ${o.toFixed(2)})`;
};

const tooltipStyle = {
  background: "hsl(0 0% 100%)",
  border: "1px solid hsl(40 15% 88%)",
  borderRadius: 12,
  fontSize: 12,
};

const AnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <span className="chip mb-3"><LineIcon className="h-3 w-3" /> Analytics</span>
        <h2 className="font-display text-3xl md:text-4xl font-semibold">
          Insights to help cities plan smarter food rescue.
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Patterns derived from sample data — peak surplus days, weekly trends and area-by-time hotspots.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="panel p-5 lg:p-6">
          <h3 className="font-display text-lg font-semibold mb-1">Surplus by day of week</h3>
          <p className="text-xs text-muted-foreground mb-4">Average kilograms across last 4 weeks</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayData} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 88%)" />
                <XAxis dataKey="day" stroke="hsl(150 10% 38%)" fontSize={12} />
                <YAxis stroke="hsl(150 10% 38%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(152 30% 92% / 0.5)" }} />
                <Bar dataKey="kg" fill={FOREST} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5 lg:p-6">
          <h3 className="font-display text-lg font-semibold mb-1">Rescued vs wasted (7d)</h3>
          <p className="text-xs text-muted-foreground mb-4">Kilograms per day</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 88%)" />
                <XAxis dataKey="day" stroke="hsl(150 10% 38%)" fontSize={12} />
                <YAxis stroke="hsl(150 10% 38%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="rescued" stroke={FOREST} strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="wasted" stroke={CLAY} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5 lg:p-6">
          <h3 className="font-display text-lg font-semibold mb-1">Donations by food type</h3>
          <p className="text-xs text-muted-foreground mb-4">Share of total kg</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={typeColors[i]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5 lg:p-6">
          <h3 className="font-display text-lg font-semibold mb-1">Peak surplus hours by area</h3>
          <p className="text-xs text-muted-foreground mb-4">Darker = more kg of surplus</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-xs uppercase tracking-wide text-muted-foreground py-2 pr-3">Area</th>
                  {SLOTS.map((s) => (
                    <th key={s} className="text-xs uppercase tracking-wide text-muted-foreground py-2 px-2 text-center">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmap.map((row) => (
                  <tr key={row.area}>
                    <td className="py-1 pr-3 font-medium">{row.area}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className="p-1">
                        <div
                          className="rounded-md text-center py-2.5 text-xs font-semibold"
                          style={{
                            background: heatColor(v),
                            color: v > 35 ? "hsl(40 30% 97%)" : "hsl(150 20% 12%)",
                          }}
                        >
                          {v}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-2 mt-3 text-[11px] text-muted-foreground">
              <span>low</span>
              <div className="flex-1 h-1.5 rounded-full" style={{
                background: "linear-gradient(to right, hsl(152 45% 28% / 0.08), hsl(152 45% 28% / 0.85))",
              }} />
              <span>high</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;