import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Navigation, MapPin, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ARNavigationPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [cameraActive, setCameraActive] = useState(false);
  const [heading, setHeading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Simulated waypoints
  const waypoints = [
    { name: 'Turn right at Jl. MT Haryono', distance: '120m', direction: 45 },
    { name: 'Continue straight past mosque', distance: '340m', direction: 0 },
    { name: 'Evacuation Shelter', distance: '890m', direction: -15 },
  ];

  const [currentWaypoint] = useState(0);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch {
        setError('Camera access denied. Please enable camera permissions.');
      }
    };
    startCamera();

    // Device orientation for compass
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) setHeading(Math.round(e.alpha));
    };

    if ('DeviceOrientationEvent' in window) {
      const DOE = DeviceOrientationEvent as any;
      if (typeof DOE.requestPermission === 'function') {
        DOE.requestPermission().then((state: string) => {
          if (state === 'granted') window.addEventListener('deviceorientation', handleOrientation);
        });
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const wp = waypoints[currentWaypoint];

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />

      {/* AR Overlay */}
      {cameraActive && (
        <>
          {/* Safe zone overlay - bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-500/30 to-transparent pointer-events-none" />

          {/* Direction Arrow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div
              className="flex flex-col items-center"
              style={{ transform: `rotate(${wp.direction}deg)` }}
            >
              <Navigation className="h-20 w-20 text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]" fill="currentColor" />
            </div>
          </div>

          {/* Zone Indicators - Left & Right */}
          <div className="absolute top-1/3 left-4 pointer-events-none">
            <div className="w-2 h-32 rounded-full bg-gradient-to-b from-red-500 via-yellow-500 to-green-500 opacity-80" />
            <p className="text-[10px] text-white/80 mt-1 text-center">Zone</p>
          </div>
          <div className="absolute top-1/3 right-4 pointer-events-none">
            <div className="w-2 h-32 rounded-full bg-gradient-to-b from-red-500 via-yellow-500 to-green-500 opacity-80" />
          </div>

          {/* Danger zone warning at top */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="flex items-center gap-2 rounded-lg bg-red-500/30 backdrop-blur-sm border border-red-500/50 px-4 py-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-bold text-red-300">DANGER ZONE AHEAD</span>
            </div>
          </div>
        </>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center px-8 space-y-4">
            <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto" />
            <p className="text-white text-sm">{error}</p>
            <p className="text-white/60 text-xs">AR navigation requires camera access to guide you.</p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] py-3 bg-gradient-to-b from-black/70 to-transparent">
          <button
            onClick={() => navigate('/evacuation')}
            className="flex items-center gap-2 rounded-lg bg-black/50 backdrop-blur-sm border border-white/20 px-3 py-2 text-sm text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit AR
          </button>
          <div className="flex items-center gap-2 rounded-lg bg-black/50 backdrop-blur-sm border border-white/20 px-3 py-2">
            <span className="text-sm text-white font-mono">{heading}°</span>
            <Navigation className="h-3 w-3 text-white" style={{ transform: `rotate(${heading}deg)` }} />
          </div>
        </div>
      </div>

      {/* Bottom Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)]">
        <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-12 px-4 pb-6">
          {/* Current Waypoint */}
          <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{wp.name}</p>
                  <p className="text-white/60 text-xs">Next waypoint</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-lg font-bold">{wp.distance}</p>
                <p className="text-white/60 text-[10px]">ahead</p>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1 pt-1">
              {waypoints.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i <= currentWaypoint ? 'bg-green-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <p className="text-white/50 text-[10px] text-center">
              Waypoint {currentWaypoint + 1} of {waypoints.length} — Evacuation Shelter
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARNavigationPage;
