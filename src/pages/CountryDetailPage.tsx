import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  countryFlags, countryDefaultCenters,
} from '@/data/mockData';
import { useTranslation } from '@/contexts/TranslationContext';
import { usePreferences } from '@/contexts/UserPreferencesContext';
import {
  ApiError,
  countryApi,
  type DisasterNewsItem,
  type DisasterReportDetailItem,
  type DisasterReportItem,
  type DisasterZoneItem,
  type ReportTimelineItem,
} from '@/lib/api';
import {
  ArrowLeft,
  AlertTriangle,
  Users,
  Activity,
  ExternalLink,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Newspaper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRef, useEffect, useMemo, useState } from 'react';

const zoneColors: Record<string, string> = {
  evacuation: 'hsl(var(--zone-evacuation))',
  caution: 'hsl(var(--zone-caution))',
  danger: 'hsl(var(--zone-danger))',
};

const zoneHex: Record<string, string> = {
  evacuation: '#22c55e',
  caution: '#eab308',
  danger: '#dc2626',
};

const levelRank: Record<string, number> = {
  danger: 3,
  caution: 2,
  evacuation: 1,
};

const newsImages: Record<string, string> = {
  flood: 'https://images.unsplash.com/photo-1485617359743-4dc5d2e53c89?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  landslide: 'https://images.unsplash.com/photo-1611932846203-c4c9e2e825a8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  typhoon: 'https://plus.unsplash.com/premium_photo-1733349608730-92c509594d76?q=80&w=1362&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  earthquake: 'https://images.unsplash.com/photo-1635068741358-ab1b9813623f?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
};
const DISASTER_IMAGE_FALLBACK = '/placeholder.svg';

const getDisasterImage = (disasterType: string) => {
  const normalized = (disasterType || '')
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_');

  // Prefer direct DB/API disaster_type values: flood | landslide | earthquake | typhoon.
  if (normalized in newsImages) return newsImages[normalized];

  // Lightweight alias support for external source variants.
  if (normalized === 'tropical_cyclone' || normalized === 'cyclone' || normalized === 'hurricane') {
    return newsImages.typhoon;
  }

  return DISASTER_IMAGE_FALLBACK;
};

const ACTIVITY_PER_PAGE = 10;
const ZONES_PER_PAGE = 10;

const CountryDetailPage = () => {
  type ActivityItem =
    | { kind: 'event'; id: string; title: string; level: string; date: string }
    | {
      kind: 'news';
      id: string;
      title: string;
      source: string;
      date: string;
      disasterType: string;
      sourceUrl: string | null;
    }
    | {
      kind: 'report';
      id: string;
      title: string;
      summary: string;
      date: string;
      source: string | null;
      sourceUrl: string | null;
      disasterType: string;
      timeline: { time: string; event: string }[];
    };

  const miniMapRef = useRef<HTMLDivElement>(null);
  const miniMapInstance = useRef<L.Map | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const [zonePage, setZonePage] = useState(1);
  const [expandedReportTimelines, setExpandedReportTimelines] = useState<Record<string, boolean>>({});
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { preferences } = usePreferences();
  const country = decodeURIComponent(name || '');

  const {
    data: status,
    isLoading: isStatusLoading,
    error: statusError,
  } = useQuery({
    queryKey: ['country-detail', 'status', country],
    queryFn: () => countryApi.getCountryStatus(country),
    enabled: Boolean(country),
  });

  const {
    data: countryNews = [],
    isError: isCountryNewsError,
  } = useQuery({
    queryKey: ['country-detail', 'news', country],
    queryFn: () => countryApi.getCountryNews(country),
    enabled: Boolean(country),
  });

  const {
    data: countryZones = [],
    isError: isCountryZonesError,
  } = useQuery({
    queryKey: ['country-detail', 'zones', country],
    queryFn: () => countryApi.getCountryZones(country),
    enabled: Boolean(country),
  });

  const {
    data: reportSummaries = [],
    isError: isReportSummariesError,
  } = useQuery({
    queryKey: ['country-detail', 'reports', country],
    queryFn: () => countryApi.getCountryReports(country),
    enabled: Boolean(country),
  });

  const reportIdsKey = reportSummaries.map((report) => report.id).join('|');
  const {
    data: reportDetails = [],
    isError: isReportDetailsError,
  } = useQuery({
    queryKey: ['country-detail', 'reports-detail', country, reportIdsKey],
    queryFn: async () => Promise.all(reportSummaries.map((report) => countryApi.getReportDetail(report.id))),
    enabled: reportSummaries.length > 0,
  });

  const countryReports = useMemo<Array<DisasterReportItem | DisasterReportDetailItem>>(
    () => (reportDetails.length > 0
      ? reportDetails
      : reportSummaries.map((report) => ({ ...report, timeline: [] as ReportTimelineItem[] }))),
    [reportDetails, reportSummaries],
  );

  const sortedCountryZones = useMemo(
    () => [...countryZones].sort((a, b) => (levelRank[b.level] || 0) - (levelRank[a.level] || 0)),
    [countryZones],
  );

  const recentDisasters = useMemo(() => {
    if (countryReports.length > 0) {
      return countryReports
        .map((report) => ({
          id: report.id,
          title: report.title,
          level: report.severity,
          date: report.date,
        }))
        .sort((a, b) => (levelRank[b.level] || 0) - (levelRank[a.level] || 0));
    }

    return (status?.recentEvents || []).map((event, index) => ({
      id: `status-${index}`,
      title: event,
      level: status?.alertLevel || 'caution',
      date: '',
    }));
  }, [countryReports, status]);

  const activityItems = useMemo<ActivityItem[]>(() => {
    const normalizeTitle = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');
    const parseDate = (value: string) => {
      if (!value) return null;
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? null : parsed;
    };
    const getIncidentKey = (id: string, expectedPrefix: string, title: string, date: string) => {
      if (id.startsWith(expectedPrefix) && id.length > 1) return id.slice(1);
      return `${normalizeTitle(title)}|${date || ''}`;
    };

    const rawNewsItems = countryNews.map((news: DisasterNewsItem) => ({
      kind: 'news' as const,
      id: news.id,
      title: news.title,
      source: news.source,
      date: news.date,
      disasterType: news.disasterType,
      sourceUrl: news.sourceUrl,
    }));

    const newsByIncidentKey = new Map<string, typeof rawNewsItems[number]>();
    rawNewsItems.forEach((news) => {
      const key = getIncidentKey(news.id, 'n', news.title, news.date);
      if (!newsByIncidentKey.has(key) || (!newsByIncidentKey.get(key)?.sourceUrl && news.sourceUrl)) {
        newsByIncidentKey.set(key, news);
      }
    });

    const consumedNewsKeys = new Set<string>();

    const reportItems: ActivityItem[] = countryReports.map((report: DisasterReportItem | DisasterReportDetailItem) => {
      const incidentKey = getIncidentKey(report.id, 'r', report.title, report.date);
      const matchedNews = newsByIncidentKey.get(incidentKey) || null;
      if (matchedNews) consumedNewsKeys.add(incidentKey);
      return {
        kind: 'report',
        id: report.id,
        title: report.title,
        summary: report.summary,
        date: report.date,
        source: matchedNews?.source ?? null,
        sourceUrl: matchedNews?.sourceUrl ?? null,
        disasterType: matchedNews?.disasterType ?? report.disasterType,
        timeline: ('timeline' in report ? report.timeline : []) || [],
      };
    });

    const reportTitleSet = new Set(countryReports.map((report) => normalizeTitle(report.title)));

    const eventItems: ActivityItem[] = recentDisasters
      .filter((event) => !reportTitleSet.has(normalizeTitle(event.title)))
      .map((event) => ({
        kind: 'event',
        id: event.id,
        title: event.title,
        level: event.level,
        date: event.date || '',
      }));

    const newsItems: ActivityItem[] = Array.from(newsByIncidentKey.entries())
      .filter(([incidentKey]) => !consumedNewsKeys.has(incidentKey))
      .map(([, news]) => news);

    return [...eventItems, ...newsItems, ...reportItems].sort((a, b) => {
      const aDate = parseDate(a.date);
      const bDate = parseDate(b.date);

      if (aDate === null && bDate === null) return 0;
      if (aDate === null) return 1;
      if (bDate === null) return -1;
      return bDate - aDate;
    });
  }, [countryReports, recentDisasters, countryNews]);

  const activityTotalPages = Math.max(1, Math.ceil(activityItems.length / ACTIVITY_PER_PAGE));
  const currentActivityPage = Math.min(activityPage, activityTotalPages);
  const pagedActivityItems = useMemo(() => {
    const start = (currentActivityPage - 1) * ACTIVITY_PER_PAGE;
    return activityItems.slice(start, start + ACTIVITY_PER_PAGE);
  }, [activityItems, currentActivityPage]);
  const zoneTotalPages = Math.max(1, Math.ceil(sortedCountryZones.length / ZONES_PER_PAGE));
  const currentZonePage = Math.min(zonePage, zoneTotalPages);
  const pagedSortedCountryZones = useMemo(() => {
    const start = (currentZonePage - 1) * ZONES_PER_PAGE;
    return sortedCountryZones.slice(start, start + ZONES_PER_PAGE);
  }, [sortedCountryZones, currentZonePage]);
  const hasActivityDataError = (
    isCountryNewsError
    || isReportSummariesError
    || isReportDetailsError
    || isCountryZonesError
  );

  const center = useMemo<[number, number]>(() => {
    if (countryZones.length > 0) {
      return [countryZones[0].centerLat, countryZones[0].centerLng];
    }
    return countryDefaultCenters[country] || [0, 0];
  }, [countryZones, country]);

  const getZoneLabel = (level: string) => {
    if (level === 'evacuation') return t('stable');
    if (level === 'caution') return t('caution');
    return t('critical');
  };

  // Imperative Leaflet mini-map — must be before any early return
  useEffect(() => {
    if (!miniMapRef.current || !status) return;

    if (miniMapInstance.current) {
      miniMapInstance.current.remove();
      miniMapInstance.current = null;
    }

    const map = L.map(miniMapRef.current, {
      center: center as [number, number],
      zoom: countryZones.length > 0 ? 11 : 6,
      zoomControl: isMapExpanded,
      dragging: isMapExpanded,
      scrollWheelZoom: isMapExpanded,
      doubleClickZoom: isMapExpanded,
      touchZoom: isMapExpanded,
      attributionControl: false,
    });

    const tileUrl = preferences.theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    L.tileLayer(tileUrl).addTo(map);

    const bounds = L.latLngBounds([]);
    sortedCountryZones.forEach((zone: DisasterZoneItem) => {
      const areaKm2 = Math.PI * ((zone.radius / 1000) ** 2);
      const circle = L.circle([zone.centerLat, zone.centerLng], {
        radius: zone.radius,
        color: zoneHex[zone.level] || zoneHex.caution,
        fillColor: zoneHex[zone.level] || zoneHex.caution,
        fillOpacity: 0.25,
        weight: 2,
      }).addTo(map);
      circle.bindTooltip(
        `${zone.name} • ${zone.disasterType.toUpperCase()} • ${getZoneLabel(zone.level)} • ${areaKm2.toFixed(1)} km2`,
      );
      bounds.extend(circle.getBounds());
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.12), { animate: false });
    }

    window.requestAnimationFrame(() => {
      map.invalidateSize();
    });

    miniMapInstance.current = map;

    return () => {
      if (miniMapInstance.current) {
        miniMapInstance.current.remove();
        miniMapInstance.current = null;
      }
    };
  }, [center, countryZones, status, preferences.theme, isMapExpanded, sortedCountryZones]);

  useEffect(() => {
    if (!isMapExpanded) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMapExpanded(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isMapExpanded]);

  useEffect(() => {
    setActivityPage(1);
    setZonePage(1);
    setExpandedReportTimelines({});
  }, [country]);

  useEffect(() => {
    setActivityPage((page) => Math.min(page, activityTotalPages));
  }, [activityTotalPages]);

  useEffect(() => {
    setZonePage((page) => Math.min(page, zoneTotalPages));
  }, [zoneTotalPages]);

  if (isStatusLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background p-4">
        <p className="text-muted-foreground">Loading country data...</p>
      </div>
    );
  }

  if (!status) {
    const isNotFound = statusError instanceof ApiError && statusError.status === 404;
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background p-4">
        <p className="text-muted-foreground">
          {isNotFound ? t('country_not_found') : 'Failed to load country data.'}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>{t('go_back')}</Button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 bg-card mt-4 rounded-xl pt-4 pb-3 border-b ">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-accent">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-2xl">{countryFlags[country]}</span>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">{country}</h1>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: zoneColors[status.alertLevel] }} />
            <span className="text-xs font-semibold" style={{ color: zoneColors[status.alertLevel] }}>
              {getZoneLabel(status.alertLevel)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-4">
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <AlertTriangle className="h-5 w-5 mx-auto text-zone-danger mb-1" />
          <p className="text-xl font-bold text-foreground">{status.activeDisasters}</p>
          <p className="text-[10px] text-muted-foreground">{t('active_disasters')}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <Users className="h-5 w-5 mx-auto text-zone-caution mb-1" />
          <p className="text-xl font-bold text-foreground">{status.affectedPopulation.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">{t('people_affected')}</p>
        </div>
      </div>
    

      {status.prediction && (
        <div className="mx-4 mt-4 rounded-xl p-3 border border-border"
          style={{ background: `${zoneColors[status.alertLevel]}10` }}>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4" style={{ color: zoneColors[status.alertLevel] }} />
            <span className="text-xs font-bold text-foreground">{t('risk_forecast')}</span>
          </div>
          <p className="text-xs text-muted-foreground">{status.prediction}</p>
        </div>
      )}

      {/* Mini Map */}
      <section className="px-4 mt-5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('disaster_map')}</h2>
        <div className={isMapExpanded ? 'fixed inset-0 z-50 bg-background p-4' : ''}>
          {isMapExpanded && (
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">{country} {t('disaster_map')}</h3>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsMapExpanded(false)}>
                <Minimize2 className="h-4 w-4" />
                Collapse
              </Button>
            </div>
          )}
          <div className="rounded-xl overflow-hidden border border-border relative">
            <div ref={miniMapRef} className={isMapExpanded ? 'h-[calc(100vh-8.5rem)] w-full' : 'h-44 w-full'} />
            {!isMapExpanded && (
              <button
                type="button"
                onClick={() => setIsMapExpanded(true)}
                className="absolute inset-0 flex items-center justify-end p-3 bg-gradient-to-t from-black/45 via-transparent to-transparent"
              >
                <span className="inline-flex items-center gap-1 rounded-md border border-white/30 bg-black/40 px-2.5 py-1 text-[11px] text-white">
                  <Maximize2 className="h-3.5 w-3.5" />
                  Expand map
                </span>
              </button>
            )}
          </div>
          <div className="mt-2 space-y-1.5">
            {sortedCountryZones.length === 0 && (
              <div className="rounded-lg border border-border bg-card px-2.5 py-2 text-[11px] text-muted-foreground">
                No mapped disaster zones for this country yet.
              </div>
            )}
            {pagedSortedCountryZones.map((zone) => {
              const areaKm2 = Math.PI * ((zone.radius / 1000) ** 2);
              return (
                <div key={zone.id} className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: zoneColors[zone.level] || zoneColors.caution }} />
                  <span className="text-[11px] text-foreground truncate flex-1">{zone.name}</span>
                  <span className="text-[10px] text-muted-foreground">{areaKm2.toFixed(1)} km2</span>
                </div>
              );
            })}
            {zoneTotalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-1">
                <button
                  onClick={() => setZonePage((page) => Math.max(1, page - 1))}
                  disabled={currentZonePage === 1}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent text-foreground"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {currentZonePage} / {zoneTotalPages}
                </span>
                <button
                  onClick={() => setZonePage((page) => Math.min(zoneTotalPages, page + 1))}
                  disabled={currentZonePage === zoneTotalPages}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent text-foreground"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Activity */}
      <section className="px-4 mt-5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Activity</h2>
        <div className="space-y-2">
          {pagedActivityItems.map((item) => {
            if (item.kind === 'event') {
              return (
                <div key={`${item.kind}-${item.id}`} className="rounded-lg bg-card border border-border p-2.5">
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full shrink-0 mt-1.5" style={{ background: zoneColors[item.level] || zoneColors.caution }} />
                    <div className="min-w-0">
                      <span className="text-xs text-foreground block">{item.title}</span>
                      <span className="text-[10px] text-muted-foreground">{item.date || 'Date unavailable'}</span>
                    </div>
                  </div>
                </div>
              );
            }

            if (item.kind === 'news') {
              return (
                <button
                  type="button"
                  key={`${item.kind}-${item.id}`}
                  onClick={() => (item.sourceUrl ? window.open(item.sourceUrl, '_blank', 'noopener,noreferrer') : null)}
                  disabled={!item.sourceUrl}
                  className="w-full flex gap-3 rounded-lg bg-card border border-border p-2.5 text-left disabled:cursor-default"
                >
                  <img
                    src={getDisasterImage(item.disasterType)}
                    alt={item.title}
                    className="h-16 w-20 rounded-md object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 py-0.5">
                    <h3 className="text-xs font-semibold text-foreground line-clamp-2">{item.title}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Newspaper className="h-3 w-3 shrink-0" />
                      <span className="truncate">{item.source} • {item.date}</span>
                    </p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
                </button>
              );
            }

            const isTimelineExpanded = Boolean(expandedReportTimelines[item.id]);
            return (
              <div key={`${item.kind}-${item.id}`} className="rounded-lg bg-card border border-border p-2.5">
                <div className="flex items-start gap-3">
                  <img
                    src={getDisasterImage(item.disasterType)}
                    alt={item.title}
                    className="h-16 w-20 rounded-md object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-semibold text-foreground">{item.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
                        {item.source ? (
                          <p className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Newspaper className="h-3 w-3 shrink-0" />
                            <span className="truncate">{item.source} • {item.date || 'Date unavailable'}</span>
                          </p>
                        ) : (
                          <p className="mt-1 text-[10px] text-muted-foreground">{item.date || 'Date unavailable'}</p>
                        )}
                      </div>
                      {item.sourceUrl && (
                        <button
                          type="button"
                          className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground"
                          onClick={() => window.open(item.sourceUrl!, '_blank', 'noopener,noreferrer')}
                          aria-label="Open source article"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {item.timeline.length > 0 && (
                      <>
                        <button
                          type="button"
                          className="mt-1 text-[11px] text-foreground hover:underline"
                          onClick={() => setExpandedReportTimelines((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                        >
                          {isTimelineExpanded ? 'Hide timeline' : 'Show timeline'}
                        </button>
                        {isTimelineExpanded && (
                          <div className="mt-2 space-y-1">
                            {item.timeline.map((timelineItem, index) => (
                              <div key={`${item.id}-${timelineItem.time}-${index}`} className="flex gap-2 text-[11px]">
                                <span className="text-muted-foreground font-mono shrink-0">{timelineItem.time}</span>
                                <span className="text-foreground">{timelineItem.event}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {activityItems.length === 0 && (
            <div className="rounded-lg bg-card border border-border p-2.5 text-xs text-muted-foreground">
              No activity available yet.
            </div>
          )}
        </div>

        {activityTotalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-3">
            <button
              onClick={() => setActivityPage((page) => Math.max(1, page - 1))}
              disabled={currentActivityPage === 1}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <span className="text-[11px] text-muted-foreground font-medium">
              {currentActivityPage} / {activityTotalPages}
            </span>
            <button
              onClick={() => setActivityPage((page) => Math.min(activityTotalPages, page + 1))}
              disabled={currentActivityPage === activityTotalPages}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent text-foreground"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {hasActivityDataError && (
          <p className="mt-3 text-xs text-muted-foreground">Some data failed to load.</p>
        )}
      </section>
    </div>
  );
};

export default CountryDetailPage;
