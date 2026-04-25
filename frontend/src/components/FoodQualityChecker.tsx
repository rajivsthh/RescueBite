import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeFood, QualityResult, qualityChipClass } from "@/lib/quality";

interface Props {
  result: QualityResult | null;
  onResult: (r: QualityResult | null) => void;
}

const FoodQualityChecker = ({ result, onResult }: Props) => {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (f: File) => {
    setPreview(URL.createObjectURL(f));
    setLoading(true);
    try {
      const r = await analyzeFood(f);
      onResult(r);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    onResult(null);
    if (ref.current) ref.current.value = "";
  };

  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Camera className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium">Food quality check</div>
            <div className="text-xs text-muted-foreground">Optional — AI advisory only</div>
          </div>
        </div>
        {!preview && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => ref.current?.click()}
          >
            Upload photo
          </Button>
        )}
        {preview && (
          <Button type="button" size="sm" variant="ghost" onClick={reset}>
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {preview && (
        <div className="mt-3 flex gap-3">
          <img
            src={preview}
            alt="Uploaded food"
            className="h-20 w-20 rounded-lg object-cover border border-border"
          />
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing image…
              </div>
            ) : result ? (
              <>
                <span
                  className={
                    "inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold " +
                    qualityChipClass(result.verdict)
                  }
                >
                  <span>{result.emoji}</span> {result.label}
                </span>
                <p className="text-xs text-muted-foreground">{result.detail}</p>
              </>
            ) : null}
          </div>
        </div>
      )}

      <p className="mt-2 text-[11px] text-muted-foreground italic">
        AI check is advisory only. Donor is responsible for food safety.
      </p>
    </div>
  );
};

export default FoodQualityChecker;