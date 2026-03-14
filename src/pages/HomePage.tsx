import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePreferences } from "@/contexts/UserPreferencesContext";
import { useTranslation } from "@/contexts/TranslationContext";
import NewsCard from "@/components/NewsCard";
import {
	dashboardApi,
	type CountryStatusItem,
	type DisasterNewsItem,
} from "@/lib/api";
import {
	Globe,
	Newspaper,
	BookOpen,
	ChevronRight,
	ChevronLeft,
	Activity,
	ExternalLink,
	AlertTriangle,
} from "lucide-react";

const LOCAL_NEWS_PER_PAGE = 3;
const EXTERNAL_NEWS_PER_PAGE = 2;
const GLOBAL_NEWS_PER_PAGE = 10;

const ASEAN_COUNTRIES = [
	"Indonesia",
	"Philippines",
	"Thailand",
	"Malaysia",
	"Vietnam",
	"Myanmar",
	"Cambodia",
	"Laos",
	"Singapore",
	"Brunei",
] as const;

const ASEAN_COUNTRY_SET = new Set<string>(ASEAN_COUNTRIES);

const countryFlags: Record<string, string> = {
	Indonesia: "🇮🇩",
	Philippines: "🇵🇭",
	Thailand: "🇹🇭",
	Malaysia: "🇲🇾",
	Vietnam: "🇻🇳",
	Myanmar: "🇲🇲",
	Cambodia: "🇰🇭",
	Laos: "🇱🇦",
	Singapore: "🇸🇬",
	Brunei: "🇧🇳",
};

const zoneColors: Record<string, string> = {
	evacuation: "hsl(var(--zone-evacuation))",
	caution: "hsl(var(--zone-caution))",
	danger: "hsl(var(--zone-danger))",
};

const newsImages: Record<string, string> = {
	flood: "https://images.unsplash.com/photo-1485617359743-4dc5d2e53c89?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
	landslide:
		"https://images.unsplash.com/photo-1611932846203-c4c9e2e825a8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
	typhoon:
		"https://plus.unsplash.com/premium_photo-1733349608730-92c509594d76?q=80&w=1362&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
	earthquake:
		"https://images.unsplash.com/photo-1635068741358-ab1b9813623f?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
	global: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=340&fit=crop",
};

function PaginationControls({
	page,
	totalPages,
	onPrev,
	onNext,
}: {
	page: number;
	totalPages: number;
	onPrev: () => void;
	onNext: () => void;
}) {
	if (totalPages <= 1) return null;
	return (
		<div className="flex items-center justify-center gap-3 mt-3">
			<button
				onClick={onPrev}
				disabled={page === 1}
				className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent text-foreground"
			>
				<ChevronLeft className="h-3.5 w-3.5" />
				Prev
			</button>
			<span className="text-[11px] text-muted-foreground font-medium">
				{page} / {totalPages}
			</span>
			<button
				onClick={onNext}
				disabled={page === totalPages}
				className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent text-foreground"
			>
				Next
				<ChevronRight className="h-3.5 w-3.5" />
			</button>
		</div>
	);
}

const HomePage = () => {
	const { preferences } = usePreferences();
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [localNewsPage, setLocalNewsPage] = useState(1);
	const [externalNewsPage, setExternalNewsPage] = useState(1);
	const [globalNewsPage, setGlobalNewsPage] = useState(1);

	const {
		data: localNews = [],
		isLoading: isLocalNewsLoading,
		isError: isLocalNewsError,
	} = useQuery({
		queryKey: ["dashboard", "news", "local", preferences.country],
		queryFn: () => dashboardApi.getLocalNews(preferences.country),
		enabled: Boolean(preferences.country),
	});

	const {
		data: globalNews = [],
		isLoading: isGlobalNewsLoading,
		isError: isGlobalNewsError,
	} = useQuery({
		queryKey: ["dashboard", "news", "global"],
		queryFn: () => dashboardApi.getGlobalNews(),
	});

	const {
		data: externalNews = [],
		isLoading: isExternalNewsLoading,
		isError: isExternalNewsError,
	} = useQuery({
		queryKey: ["dashboard", "external-news", "asean"],
		queryFn: () => dashboardApi.getExternalNews(),
	});

	const {
		data: countryStatuses = [],
		isLoading: isCountryStatusesLoading,
		isError: isCountryStatusesError,
	} = useQuery({
		queryKey: ["dashboard", "countries"],
		queryFn: () => dashboardApi.getCountryStatuses(),
	});

	const {
		data: survivalTips = [],
		isLoading: isSurvivalTipsLoading,
		isError: isSurvivalTipsError,
	} = useQuery({
		queryKey: ["dashboard", "guides", "survival"],
		queryFn: () => dashboardApi.getSurvivalTips(),
	});

	const aseanRegionalNews = globalNews.filter((news) =>
		ASEAN_COUNTRY_SET.has(news.country),
	);

	useEffect(() => {
		setExternalNewsPage(1);
	}, [externalNews.length]);

	// Local news pagination: 1 hero + (LOCAL_NEWS_PER_PAGE - 1) secondary cards per page
	const localNewsTotalPages = Math.max(
		1,
		Math.ceil(localNews.length / LOCAL_NEWS_PER_PAGE),
	);
	const localNewsStart = (localNewsPage - 1) * LOCAL_NEWS_PER_PAGE;
	const localNewsSlice = localNews.slice(
		localNewsStart,
		localNewsStart + LOCAL_NEWS_PER_PAGE,
	);
	const localHero = localNewsSlice[0] ?? null;
	const localSecondary = localNewsSlice.slice(1);

	const externalNewsTotalPages = Math.max(
		1,
		Math.ceil(externalNews.length / EXTERNAL_NEWS_PER_PAGE),
	);
	const externalNewsStart = (externalNewsPage - 1) * EXTERNAL_NEWS_PER_PAGE;
	const externalNewsSlice = externalNews.slice(
		externalNewsStart,
		externalNewsStart + EXTERNAL_NEWS_PER_PAGE,
	);

	// Global news pagination: GLOBAL_NEWS_PER_PAGE per page
	const globalTotalPages = Math.max(
		1,
		Math.ceil(aseanRegionalNews.length / GLOBAL_NEWS_PER_PAGE),
	);
	const globalStart = (globalNewsPage - 1) * GLOBAL_NEWS_PER_PAGE;
	const globalSlice = aseanRegionalNews.slice(
		globalStart,
		globalStart + GLOBAL_NEWS_PER_PAGE,
	);

	const aseanStatusMap = new Map<string, CountryStatusItem>(
		countryStatuses
			.filter((status) => ASEAN_COUNTRY_SET.has(status.country))
			.map((status) => [status.country, status]),
	);
	const forecastCards = ASEAN_COUNTRIES.map((country) => ({
		country,
		status: aseanStatusMap.get(country) ?? null,
	}));
	const hasForecastData = forecastCards.some((card) => card.status !== null);

	const getNewsImage = (news: DisasterNewsItem) => {
		const typeKey = news.disasterType as keyof typeof newsImages;
		return news.imageUrl !== "/placeholder.svg"
			? news.imageUrl
			: news.isGlobal
				? newsImages.global
				: newsImages[typeKey] || newsImages.flood;
	};

	const openNews = (news: DisasterNewsItem) => {
		if (news.sourceUrl) {
			window.open(news.sourceUrl, "_blank");
		} else {
			navigate(`/news/${news.id}`);
		}
	};

	const getZoneLabel = (level: string) => {
		if (level === "evacuation") return t("stable");
		if (level === "caution") return t("caution");
		return t("critical");
	};

	const getZoneColor = (level: string) =>
		zoneColors[level] || "hsl(var(--muted-foreground))";

	return (
		<div className="h-full overflow-y-auto pb-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="px-4 pt-6 pb-3">
					<div className="flex items-center gap-2">
						<Globe className="h-5 w-5 text-primary" />
						<h1 className="text-xl font-bold text-foreground">
							{t("overview")}
						</h1>
					</div>
				</div>

				{/* Hero Local News — 3 per page */}
				{(isLocalNewsLoading ||
					isLocalNewsError ||
					localNews.length > 0) && (
					<section className="px-4 mt-2">
						<div className="flex items-center gap-2 mb-3">
							<Newspaper className="h-4 w-4 text-primary" />
							<h2 className="text-sm font-bold text-foreground">
								{countryFlags[preferences.country] || "🏳️"}{" "}
								{t("local_updates")}
							</h2>
						</div>
						{isLocalNewsLoading && (
							<div className="w-full clay-lg h-44 animate-pulse bg-card/70" />
						)}
						{isLocalNewsError && !isLocalNewsLoading && (
							<div className="w-full clay-sm p-4 text-xs text-muted-foreground">
								Failed to load local updates.
							</div>
						)}
						{!isLocalNewsLoading &&
							!isLocalNewsError &&
							localNews.length > 0 &&
							localHero && (
								<>
									<button
										onClick={() => openNews(localHero)}
										className="w-full clay-lg overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-clay-lg active:animate-clay-bounce"
									>
										<div className="relative h-44 w-full">
											<img
												src={getNewsImage(localHero)}
												alt={localHero.title}
												className="h-full w-full object-cover"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
											<div className="absolute bottom-0 left-0 right-0 p-3">
												<span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-primary-foreground mb-1.5">
													<AlertTriangle className="h-3 w-3" />{" "}
													{t("breaking")}
												</span>
												<h3 className="text-sm font-bold text-white line-clamp-2">
													{localHero.title}
												</h3>
												<p className="text-[11px] text-white/70 mt-0.5">
													{localHero.source} •{" "}
													{localHero.date}
												</p>
											</div>
										</div>
									</button>
									{localSecondary.length > 0 && (
										<div className="space-y-2 mt-2">
											{localSecondary.map((news, i) => (
												<button
													key={news.id}
													onClick={() =>
														openNews(news)
													}
													className="w-full flex gap-3 clay-sm p-2.5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-clay active:animate-clay-bounce animate-fade-in"
													style={{
														animationDelay: `${i * 80}ms`,
													}}
												>
													<img
														src={getNewsImage(news)}
														alt={news.title}
														className="h-16 w-20 rounded-lg object-cover shrink-0"
													/>
													<div className="flex-1 min-w-0 py-0.5">
														<h3 className="text-xs font-semibold text-foreground line-clamp-2">
															{news.title}
														</h3>
														<p className="text-[10px] text-muted-foreground mt-1">
															{news.source} •{" "}
															{news.date}
														</p>
													</div>
													<ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
												</button>
											))}
										</div>
									)}
									<PaginationControls
										page={localNewsPage}
										totalPages={localNewsTotalPages}
										onPrev={() =>
											setLocalNewsPage((p) =>
												Math.max(1, p - 1),
											)
										}
										onNext={() =>
											setLocalNewsPage((p) =>
												Math.min(
													localNewsTotalPages,
													p + 1,
												),
											)
										}
									/>
								</>
							)}
						{!isLocalNewsLoading &&
							!isLocalNewsError &&
							localNews.length === 0 && (
								<div className="w-full clay-sm p-4 text-xs text-muted-foreground">
									No local updates available yet.
								</div>
							)}
					</section>
				)}

				{/* Risk Forecast — Horizontal Scroll */}
				<section className="mt-6">
					<div className="flex items-center gap-2 mb-3 px-4 ">
						<Activity className="h-4 w-4 text-primary" />
						<h2 className="text-sm font-bold text-foreground">
							{t("asean_status")}
						</h2>
					</div>
					{isCountryStatusesLoading && (
						<div className="flex gap-3 overflow-x-auto px-4 pb-2">
							{[1, 2, 3, 4, 5].map((n) => (
								<div
									key={n}
									className="shrink-0 w-36 h-36 clay-sm animate-pulse bg-card/70"
								/>
							))}
						</div>
					)}
					{isCountryStatusesError && !isCountryStatusesLoading && (
						<div className="px-4">
							<div className="w-full clay-sm p-4 text-xs text-muted-foreground">
								Failed to load ASEAN status.
							</div>
						</div>
					)}
					{!isCountryStatusesLoading &&
						!isCountryStatusesError &&
						!hasForecastData && (
							<div className="px-4">
								<div className="w-full clay-sm p-4 text-xs text-muted-foreground">
									No ASEAN status data available yet.
								</div>
							</div>
						)}
					{!isCountryStatusesLoading && !isCountryStatusesError && (
						<div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
							{forecastCards.map(({ country, status }, i) => (
								<button
									key={country}
									onClick={() =>
										navigate(
											`/country/${encodeURIComponent(country)}`,
										)
									}
									className="shrink-0 w-36 snap-start clay-sm p-3 relative overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-clay active:animate-clay-bounce animate-fade-in"
									style={{
										background: `linear-gradient(135deg, ${getZoneColor(status?.alertLevel || "caution")}15, hsl(var(--card)))`,
										animationDelay: `${i * 60}ms`,
									}}
								>
									<div
										className="absolute top-0 right-0 h-12 w-12 rounded-bl-full opacity-20"
										style={{
											background: getZoneColor(
												status?.alertLevel || "caution",
											),
										}}
									/>
									<span className="text-2xl">
										{countryFlags[country] || "🏳️"}
									</span>
									<p className="text-xs font-bold text-foreground mt-1.5">
										{country}
									</p>
									{status ? (
										<>
											<div className="flex items-center gap-1 mt-1">
												<div
													className="h-1.5 w-1.5 rounded-full"
													style={{
														background:
															getZoneColor(
																status.alertLevel,
															),
													}}
												/>
												<span
													className="text-[10px] font-semibold"
													style={{
														color: getZoneColor(
															status.alertLevel,
														),
													}}
												>
													{getZoneLabel(
														status.alertLevel,
													)}
												</span>
											</div>
											<p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed">
												{status.prediction}
											</p>
										</>
									) : (
										<p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
											No live status from API yet.
										</p>
									)}
								</button>
							))}
						</div>
					)}
				</section>

				<section className="mt-6 mx-4 clay-lg p-4">
					<div className="flex items-center gap-2 mb-3">
						<Newspaper className="h-4 w-4 text-primary" />
						<h2 className="text-sm font-bold text-foreground">
							ASEAN News
						</h2>
					</div>
					{isExternalNewsLoading && (
						<div className="space-y-3">
							{[1, 2].map((n) => (
								<div
									key={n}
									className="w-full h-40 rounded-2xl bg-muted/50 animate-pulse"
								/>
							))}
						</div>
					)}
					{isExternalNewsError && !isExternalNewsLoading && (
						<div className="w-full rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
							Failed to load ASEAN news.
						</div>
					)}
					{!isExternalNewsLoading && !isExternalNewsError && (
						<>
							<div className="space-y-3">
								{externalNewsSlice.map((item) => (
									<NewsCard key={item.id} item={item} />
								))}
								{externalNews.length === 0 && (
									<div className="w-full rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
										No ASEAN news available yet.
									</div>
								)}
							</div>
							<PaginationControls
								page={externalNewsPage}
								totalPages={externalNewsTotalPages}
								onPrev={() =>
									setExternalNewsPage((p) => Math.max(1, p - 1))
								}
								onNext={() =>
									setExternalNewsPage((p) =>
										Math.min(externalNewsTotalPages, p + 1),
									)
								}
							/>
						</>
					)}
				</section>

				{/* Global News — 10 per page with country flags */}
				<section className="mt-6 mx-4 clay-lg p-4">
					<div className="flex items-center gap-2 mb-3">
						<Globe className="h-4 w-4 text-primary" />
						<h2 className="text-sm font-bold text-foreground">
							{t("global_alerts")}
						</h2>
					</div>
					{isGlobalNewsLoading && (
						<div className="space-y-2">
							{[1, 2].map((n) => (
								<div
									key={n}
									className="w-full h-20 rounded-xl bg-muted/50 animate-pulse"
								/>
							))}
						</div>
					)}
					{isGlobalNewsError && !isGlobalNewsLoading && (
						<div className="w-full rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
							Failed to load global alerts.
						</div>
					)}
					{!isGlobalNewsLoading && !isGlobalNewsError && (
						<>
							<div className="space-y-2">
								{globalSlice.map((news, i) => (
									<button
										key={news.id}
										onClick={() => openNews(news)}
										className="w-full flex gap-3 rounded-xl bg-muted/50 p-2.5 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-accent active:animate-clay-bounce animate-fade-in"
										style={{
											animationDelay: `${i * 80}ms`,
										}}
									>
										<img
											src={getNewsImage(news)}
											alt={news.title}
											className="h-16 w-20 rounded-xl object-cover shrink-0"
										/>
										<div className="flex-1 min-w-0 py-0.5">
											<div className="flex items-center gap-1.5 mb-0.5">
												<span className="text-sm leading-none">
													{countryFlags[
														news.country
													] || "🏳️"}
												</span>
												<span className="text-[10px] font-semibold text-muted-foreground">
													{news.country}
												</span>
											</div>
											<h3 className="text-xs font-semibold text-foreground line-clamp-2">
												{news.title}
											</h3>
											<p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
												{news.summary}
											</p>
											<p className="text-[10px] text-muted-foreground mt-1">
												{news.source} • {news.date}
											</p>
										</div>
										<ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
									</button>
								))}
								{aseanRegionalNews.length === 0 && (
									<div className="w-full rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
										No global alerts available yet.
									</div>
								)}
							</div>
							<PaginationControls
								page={globalNewsPage}
								totalPages={globalTotalPages}
								onPrev={() =>
									setGlobalNewsPage((p) => Math.max(1, p - 1))
								}
								onNext={() =>
									setGlobalNewsPage((p) =>
										Math.min(globalTotalPages, p + 1),
									)
								}
							/>
						</>
					)}
				</section>

				{/* Survival Guide */}
				<section className="px-4 mt-6">
					<div className="flex items-center gap-2 mb-3">
						<BookOpen className="h-4 w-4 text-primary" />
						<h2 className="text-sm font-bold text-foreground">
							{t("survival_guide")}
						</h2>
					</div>
					{isSurvivalTipsLoading && (
						<div className="space-y-2">
							{[1, 2, 3].map((n) => (
								<div
									key={n}
									className="w-full h-16 clay-sm animate-pulse bg-card/70"
								/>
							))}
						</div>
					)}
					{isSurvivalTipsError && !isSurvivalTipsLoading && (
						<div className="w-full clay-sm p-4 text-xs text-muted-foreground">
							Failed to load survival guide.
						</div>
					)}
					{!isSurvivalTipsLoading && !isSurvivalTipsError && (
						<div className="space-y-2">
							{survivalTips.map((tip, i) => (
								<button
									key={tip.id}
									onClick={() => navigate(`/guide/${tip.id}`)}
									className="w-full flex items-center gap-3 clay-sm p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-clay active:animate-clay-bounce animate-fade-in"
									style={{ animationDelay: `${i * 60}ms` }}
								>
									<span className="text-2xl">{tip.icon}</span>
									<div className="flex-1">
										<p className="text-sm font-medium text-foreground">
											{tip.title}
										</p>
										<p className="text-[10px] text-muted-foreground">
											{tip.description}
										</p>
									</div>
									<ChevronRight className="h-4 w-4 text-primary shrink-0" />
								</button>
							))}
							{survivalTips.length === 0 && (
								<div className="w-full clay-sm p-4 text-xs text-muted-foreground">
									No survival guide data available yet.
								</div>
							)}
						</div>
					)}
				</section>
			</div>
		</div>
	);
};

export default HomePage;
