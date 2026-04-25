import { forwardRef, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Award, Download, Leaf } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface CertificateData {
  restaurantName: string;
  meals: number;
  ngoName: string;
  date: Date;
  co2Kg: number;
}

interface Props {
  data: CertificateData;
}

const DonationCertificate = ({ data }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    if (!ref.current) return;
    try {
      setBusy(true);
      const dataUrl = await toPng(ref.current, {
        pixelRatio: 2,
        backgroundColor: "#faf8f3",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `donation-certificate-${data.restaurantName.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
      toast({ title: "Certificate downloaded" });
    } catch (e) {
      toast({ title: "Download failed", description: "Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <CertificateCard ref={ref} data={data} />
      <Button onClick={handleDownload} disabled={busy} className="w-full">
        <Download className="h-4 w-4" />
        {busy ? "Preparing..." : "Download certificate"}
      </Button>
    </div>
  );
};

const CertificateCard = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const dateStr = data.date.toLocaleString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-8"
      style={{ boxShadow: "0 12px 40px -16px hsl(150 30% 15% / 0.18)" }}
    >
      {/* Corner ornaments */}
      <div className="absolute top-0 left-0 h-24 w-24 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl" />
      <div className="absolute bottom-0 right-0 h-24 w-24 border-b-2 border-r-2 border-primary/30 rounded-br-2xl" />

      <div className="text-center">
        <div className="inline-flex items-center gap-2 chip mb-4">
          <Award className="h-3 w-3" />
          Certificate of Contribution
        </div>
        <h3 className="font-display text-3xl font-semibold tracking-tight">
          Food Waste Optimizer
        </h3>
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
          Kathmandu Valley
        </div>

        <div className="my-6 h-px w-24 bg-border mx-auto" />

        <div className="text-sm text-muted-foreground">This certifies that</div>
        <div className="font-display text-2xl md:text-3xl font-semibold mt-2 text-primary italic">
          {data.restaurantName}
        </div>
        <div className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
          generously donated surplus food, redirected from waste to nourishment.
        </div>

        <div className="grid grid-cols-3 gap-3 mt-7">
          <Stat label="Meals" value={`${data.meals}`} />
          <Stat label="Recipient" value={data.ngoName.replace(/^NGO\s+[A-Z]\s—\s/, "")} small />
          <Stat
            label="CO₂ saved"
            value={`${data.co2Kg.toFixed(1)} kg`}
            icon={<Leaf className="h-3.5 w-3.5" />}
          />
        </div>

        <div className="mt-7 pt-5 border-t border-border">
          <div className="font-display text-base italic text-foreground">
            "Thank you for saving food and feeding communities."
          </div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-3">
            Issued · {dateStr}
          </div>
        </div>
      </div>
    </div>
  );
});
CertificateCard.displayName = "CertificateCard";

const Stat = ({
  label,
  value,
  small,
  icon,
}: {
  label: string;
  value: string;
  small?: boolean;
  icon?: React.ReactNode;
}) => (
  <div className="rounded-xl bg-secondary/60 border border-border p-3">
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div
      className={`font-display font-semibold mt-1 flex items-center justify-center gap-1.5 ${
        small ? "text-sm leading-tight" : "text-xl"
      }`}
    >
      {icon}
      {value}
    </div>
  </div>
);

export default DonationCertificate;