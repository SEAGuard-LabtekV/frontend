import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const ModernMapHero = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstance = useRef<L.Map | null>(null);

	// Parallax Effect
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleMouseMove = (e: MouseEvent) => {
			const { left, top, width, height } =
				container.getBoundingClientRect();
			const x = (e.clientX - left) / width - 0.5;
			const y = (e.clientY - top) / height - 0.5;

			container.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
		};

		const handleMouseLeave = () => {
			container.style.transform =
				"perspective(1000px) rotateY(0deg) rotateX(0deg)";
		};

		container.addEventListener("mousemove", handleMouseMove);
		container.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			container.removeEventListener("mousemove", handleMouseMove);
			container.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, []);

	// Map Initialization
	useEffect(() => {
		if (!mapRef.current || mapInstance.current) return;

		// Initialize map centered roughly on ASEAN region - Zoomed out to 4
		const map = L.map(mapRef.current, {
			center: [4.2105, 112.9758], // ASEAN center
			zoom: 4,
			zoomControl: false,
			attributionControl: false,
			dragging: false,
			scrollWheelZoom: false,
			doubleClickZoom: false,
			boxZoom: false,
			keyboard: false,
		});

		// Dark-themed, sleek basemap to match the claymorphic/modern vibe
		L.tileLayer(
			"https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
			{
				maxZoom: 19,
			},
		).addTo(map);

		mapInstance.current = map;

		// --- Custom Animated Markers & Lines ---

		// Bezier Curve Helper for nice curved paths
		const getCurvePoints = (
			start: [number, number],
			end: [number, number],
			offset = 0.25,
		) => {
			const points: [number, number][] = [];
			const [startLat, startLng] = start;
			const [endLat, endLng] = end;
			const midLat = (startLat + endLat) / 2;
			const midLng = (startLng + endLng) / 2;
			// Orthogonal vector for the control point
			const ctrlLat = midLat - (endLng - startLng) * offset;
			const ctrlLng = midLng + (endLat - startLat) * offset;
			for (let t = 0; t <= 1; t += 0.05) {
				const lat =
					(1 - t) * (1 - t) * startLat +
					2 * (1 - t) * t * ctrlLat +
					t * t * endLat;
				const lng =
					(1 - t) * (1 - t) * startLng +
					2 * (1 - t) * t * ctrlLng +
					t * t * endLng;
				points.push([lat, lng]);
			}
			return points;
		};

		// 1. Critical Alert (Red) - Manila area
		const manilaCoords: [number, number] = [14.5995, 120.9842];
		const criticalIcon = L.divIcon({
			className: "custom-marker-critical",
			html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute h-16 w-16 rounded-full border border-destructive/50 animate-ping" style="animation-duration: 3s;"></span>
          <span class="absolute h-24 w-24 rounded-full border border-destructive/20 animate-ping" style="animation-duration: 3s; animation-delay: 1.5s;"></span>
          <div class="relative h-3 w-3 rounded-full bg-destructive shadow-[0_0_12px_rgba(239,68,68,1)] border-[1.5px] border-card"></div>
        </div>
      `,
			iconSize: [32, 32],
			iconAnchor: [16, 16],
		});
		L.marker(manilaCoords, { icon: criticalIcon }).addTo(map);

		// 2. Warning (Orange) - Vietnam
		const vietnamCoords: [number, number] = [14.0583, 108.2772];
		const warningIcon = L.divIcon({
			className: "custom-marker-warning",
			html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute h-14 w-14 rounded-full border border-orange-500/50 animate-ping" style="animation-duration: 3s;"></span>
          <div class="relative h-3 w-3 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,1)] border-[1.5px] border-card"></div>
        </div>
      `,
			iconSize: [32, 32],
			iconAnchor: [16, 16],
		});
		L.marker(vietnamCoords, { icon: warningIcon }).addTo(map);

		// 3. Safe Zone (Green) - KL, Malaysia
		const klCoords: [number, number] = [3.139, 101.6869];
		const safeIcon = L.divIcon({
			className: "custom-marker-safe",
			html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute h-16 w-16 rounded-full border border-emerald-500/50 animate-ping" style="animation-duration: 4s;"></span>
          <div class="relative h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,1)] border-[1.5px] border-card"></div>
        </div>
      `,
			iconSize: [32, 32],
			iconAnchor: [16, 16],
		});
		L.marker(klCoords, { icon: safeIcon }).addTo(map);

		// 4. Incident point - Jakarta
		const jktCoords: [number, number] = [-6.2088, 106.8456];
		const incidentIcon = L.divIcon({
			className: "custom-marker-incident",
			html: `<div class="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(239,68,68,1)] animate-ping"></div>`,
			iconSize: [8, 8],
			iconAnchor: [4, 4],
		});
		L.marker(jktCoords, { icon: incidentIcon }).addTo(map);

		// ASEAN country flag markers (nudged away from pulse points)
		const pulsePoints: [number, number][] = [
			manilaCoords,
			vietnamCoords,
			klCoords,
			jktCoords,
		];

		const aseanFlags: Array<{
			country: string;
			flag: string;
			coords: [number, number];
		}> = [
			{ country: "Indonesia", flag: "🇮🇩", coords: [-2.5, 118.0] },
			{ country: "Malaysia", flag: "🇲🇾", coords: [4.2, 102.0] },
			{ country: "Singapore", flag: "🇸🇬", coords: [1.29, 103.85] },
			{ country: "Thailand", flag: "🇹🇭", coords: [15.87, 100.99] },
			{ country: "Vietnam", flag: "🇻🇳", coords: [16.2, 107.8] },
			{ country: "Philippines", flag: "🇵🇭", coords: [12.88, 121.77] },
			{ country: "Myanmar", flag: "🇲🇲", coords: [19.75, 96.08] },
			{ country: "Cambodia", flag: "🇰🇭", coords: [12.57, 104.99] },
			{ country: "Laos", flag: "🇱🇦", coords: [19.85, 102.5] },
			{ country: "Brunei", flag: "🇧🇳", coords: [4.54, 114.73] },
		];

		const getMinDistanceToPulses = (coords: [number, number]) =>
			Math.min(
				...pulsePoints.map((pulse) =>
					map.distance(L.latLng(coords[0], coords[1]), L.latLng(pulse[0], pulse[1])),
				),
			);

		const avoidPulseOverlap = (coords: [number, number]): [number, number] => {
			const minGapMeters = 450000;
			const candidates: [number, number][] = [
				coords,
				[coords[0] + 1.8, coords[1] + 1.8],
				[coords[0] + 1.8, coords[1] - 1.8],
				[coords[0] - 1.8, coords[1] + 1.8],
				[coords[0] - 1.8, coords[1] - 1.8],
				[coords[0], coords[1] + 2.6],
				[coords[0], coords[1] - 2.6],
				[coords[0] + 2.6, coords[1]],
				[coords[0] - 2.6, coords[1]],
			];

			let best = coords;
			let bestDistance = -1;
			for (const candidate of candidates) {
				const minDistance = getMinDistanceToPulses(candidate);
				if (minDistance >= minGapMeters) return candidate;
				if (minDistance > bestDistance) {
					bestDistance = minDistance;
					best = candidate;
				}
			}
			return best;
		};

		aseanFlags.forEach(({ country, flag, coords }) => {
			const adjustedCoords = avoidPulseOverlap(coords);
			const icon = L.divIcon({
				className: "asean-flag-icon",
				html: `<div class="asean-flag-badge" title="${country}">${flag}</div>`,
				iconSize: [24, 24],
				iconAnchor: [12, 12],
			});

			L.marker(adjustedCoords, {
				icon,
				interactive: false,
				keyboard: false,
				zIndexOffset: -200,
			}).addTo(map);
		});

		// --- Curved SVG Animated Connecting Lines (Domestic Routes) ---
		// We use bezier curve paths to give a smooth local evacuation flow look

		// Philippines Evacuation Route (Manila -> Baguio)
		const luzonCoords: [number, number] = [16.4023, 120.596];
		L.polyline(getCurvePoints(manilaCoords, luzonCoords, 0.2), {
			color: "hsl(var(--primary))",
			weight: 2,
			className: "map-animated-dash",
		}).addTo(map);

		// Vietnam Evacuation Route (Da Nang -> Hanoi)
		const hanoiCoords: [number, number] = [21.0285, 105.8542];
		L.polyline(getCurvePoints(vietnamCoords, hanoiCoords, 0.15), {
			color: "hsl(var(--primary))",
			weight: 2,
			className: "map-animated-dash",
		}).addTo(map);

		// Indonesia Route (Jakarta -> Bandung)
		const bandungCoords: [number, number] = [-6.9175, 107.6191];
		L.polyline(getCurvePoints(jktCoords, bandungCoords, 0.15), {
			color: "hsl(var(--primary))",
			weight: 2,
			className: "map-animated-dash",
		}).addTo(map);

		return () => {
			map.remove();
			mapInstance.current = null;
		};
	}, []);

	return (
		<>
			<style>{`
				.map-animated-dash {
					stroke-dasharray: 6 6;
					animation: leaflet-dash-flow 1s linear infinite;
					opacity: 0.6;
				}
				@keyframes leaflet-dash-flow {
					to { stroke-dashoffset: -12; }
				}
				.map-spin-slow-reverse {
					transform-origin: center;
					animation: leaflet-radar-spin 30s linear infinite reverse;
					opacity: 0.4;
				}
				@keyframes leaflet-radar-spin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
				.asean-flag-badge {
					height: 24px;
					width: 24px;
					border-radius: 9999px;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 14px;
					background: rgba(15, 23, 42, 0.72);
					border: 1px solid rgba(255, 255, 255, 0.24);
					box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
					backdrop-filter: blur(2px);
				}
			`}</style>

			<div
				ref={containerRef}
				className="w-full h-full relative transition-transform duration-300 ease-out preserve-3d"
				style={{ transformStyle: "preserve-3d" }}
			>
				{/* The exact container holding the map with the border frame */}
				<div className="absolute inset-0 clay-lg rounded-full overflow-hidden border-[6px] border-card bg-card/80 backdrop-blur-sm shadow-2xl z-10">
					{/* The Leaflet map container */}
					<div
						ref={mapRef}
						className="w-full h-full bg-transparent"
					/>

					{/* Strong overlay to give a deep claymorphic inset feel and prevent interaction to keep it as a hero graphic */}
					<div
						className="absolute inset-0 pointer-events-none rounded-full z-[1000] border-8 border-transparent"
						style={{
							boxShadow:
								"var(--clay-inner-lg), var(--clay-shadow-pressed), inset 0px 0px 40px rgba(0,0,0,0.2)",
						}}
					></div>

					{/* Subtle inner gradient to beautifully fade the map edges into the clay styling without blurring the map */}
					<div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_60%,hsl(var(--card))_100%)] rounded-full z-[999] opacity-60"></div>
				</div>

				{/* Floating Decorative Elements using Z-translation to pop out during parallax */}
				<div
					className="absolute -top-4 -right-4 h-24 w-24 clay-sm bg-card/60 backdrop-blur-md rounded-2xl rotate-12 flex items-center justify-center animate-clay-bounce z-20"
					style={{
						animationDuration: "4s",
						animationIterationCount: "infinite",
						transform: "translateZ(30px)",
					}}
				>
					<svg
						className="w-10 h-10 text-primary"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
				</div>

				<div
					className="absolute -bottom-8 -left-2 h-20 w-32 clay-sm bg-card/80 backdrop-blur-md rounded-2xl -rotate-6 flex flex-col justify-center px-4 animate-clay-bounce z-20"
					style={{
						animationDuration: "5s",
						animationIterationCount: "infinite",
						animationDelay: "1s",
						transform: "translateZ(40px)",
					}}
				>
					<div className="h-2 w-12 bg-muted rounded-full mb-2"></div>
					<div className="h-2 w-8 bg-muted rounded-full mb-3"></div>
					<div className="flex items-center gap-2">
						<div className="h-4 w-4 rounded-full bg-primary/20"></div>
						<div className="h-1.5 w-16 bg-primary/40 rounded-full"></div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ModernMapHero;
