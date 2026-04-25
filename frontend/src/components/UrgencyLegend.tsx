const items = [
  { label: "Urgent", sub: "≤ 2h", cls: "border-warning bg-warning/10 text-warning" },
  { label: "Medium", sub: "2–5h", cls: "border-accent bg-accent/10 text-accent-foreground" },
  { label: "Low", sub: "> 5h", cls: "border-success bg-success/10 text-success" },
];

const UrgencyLegend = () => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="text-[11px] uppercase tracking-widest text-muted-foreground mr-1">
      Urgency legend
    </span>
    {items.map((i) => (
      <span
        key={i.label}
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${i.cls}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {i.label} <span className="font-normal opacity-70">{i.sub}</span>
      </span>
    ))}
  </div>
);

export default UrgencyLegend;