import { useMemo, useState } from "react";
import { AlertTriangle, ExternalLink, Newspaper } from "lucide-react";
import { countryFlags } from "@/data/mockData";
import { type ExternalNewsItem } from "@/lib/api";

const fallbackImages: Record<string, string> = {
  flood:
    "https://images.unsplash.com/photo-1485617359743-4dc5d2e53c89?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  landslide:
    "https://images.unsplash.com/photo-1611932846203-c4c9e2e825a8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  typhoon:
    "https://plus.unsplash.com/premium_photo-1733349608730-92c509594d76?q=80&w=1362&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  earthquake:
    "https://images.unsplash.com/photo-1635068741358-ab1b9813623f?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
};

function formatPublishedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function NewsCard({ item }: { item: ExternalNewsItem }) {
  const [imageFailed, setImageFailed] = useState(false);

  const fallbackImage = useMemo(() => {
    const disasterType = item.disasterType.toLowerCase();
    return fallbackImages[disasterType] || fallbackImages.flood;
  }, [item.disasterType]);

  const imageSrc =
    !imageFailed &&
    item.imageUrl &&
    item.imageUrl !== "/placeholder.svg"
      ? item.imageUrl
      : fallbackImage;

  const canOpen = Boolean(item.sourceUrl);

  return (
    <button
      type="button"
      onClick={() =>
        item.sourceUrl
          ? window.open(item.sourceUrl, "_blank", "noopener,noreferrer")
          : null
      }
      disabled={!canOpen}
      className="group w-full overflow-hidden rounded-2xl border border-border/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] disabled:cursor-default disabled:hover:translate-y-0"
    >
      <div className="sm:flex">
        <div className="relative h-44 w-full overflow-hidden sm:h-auto sm:w-52 sm:shrink-0">
          <img
            src={imageSrc}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            onError={() => setImageFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent sm:bg-gradient-to-r sm:from-black/35 sm:to-transparent" />
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
            <span>{countryFlags[item.country] || "🏳️"}</span>
            <span>{item.country}</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-primary">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{item.disasterType}</span>
          </div>

          <h3 className="mt-2 text-sm font-semibold leading-6 text-foreground line-clamp-2">
            {item.title}
          </h3>

          <p className="mt-2 text-xs leading-5 text-muted-foreground line-clamp-3">
            {item.summary}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate font-medium text-foreground/85">
                <Newspaper className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.sourceName}</span>
              </p>
              <p className="mt-1 truncate">{formatPublishedAt(item.publishedAt)}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/80 px-2.5 py-1 text-[10px] font-medium text-foreground">
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
