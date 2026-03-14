import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/UserPreferencesContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/lib/api';
import type { ZoneLevel } from '@/lib/api';
import {
  countryFlags,
  countryDefaultCenters, aseanLanguages
} from '@/data/mockData';
import {
  User, LogOut, Bell, MapPin, Navigation, Phone, Share2, Globe, Shield, Sun, Moon, Copy, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const zoneColors: Record<ZoneLevel, string> = {
  evacuation: 'hsl(var(--zone-evacuation))',
  caution: 'hsl(var(--zone-caution))',
  danger: 'hsl(var(--zone-danger))',
};

const zoneHex: Record<ZoneLevel, string> = {
  evacuation: '#22c55e',
  caution: '#eab308',
  danger: '#dc2626',
};

// ASEAN country name mapping for reverse geocoding
const nominatimToAsean: Record<string, string> = {
  'Indonesia': 'Indonesia',
  'Philippines': 'Philippines',
  'Thailand': 'Thailand',
  'Malaysia': 'Malaysia',
  'Vietnam': 'Vietnam',
  'Viet Nam': 'Vietnam',
  'Myanmar': 'Myanmar',
  'Cambodia': 'Cambodia',
  'Laos': 'Laos',
  "Lao People's Democratic Republic": 'Laos',
  'Singapore': 'Singapore',
  'Brunei': 'Brunei',
  'Brunei Darussalam': 'Brunei',
};

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { preferences, setLanguage, setLocation, setTheme } = usePreferences();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [gpsStatus, setGpsStatus] = useState<'loading' | 'success' | 'denied'>('loading');
  const [gpsCountry, setGpsCountry] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  // Auto-detect GPS location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`
          );
          const data = await res.json();
          if (data.display_name) label = data.display_name;
          if (data.address?.country) {
            const mappedCountry = nominatimToAsean[data.address.country];
            if (mappedCountry) setGpsCountry(mappedCountry);
          }
        } catch { /* fallback to coordinates */ }
        setLocation({ lat: latitude, lng: longitude, label });
        setGpsStatus('success');
      },
      () => {
        setGpsStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const activeCountry = gpsCountry || preferences.country || 'Indonesia';

  const { data: fetchedZones = [] } = useQuery({
    queryKey: ['zones', activeCountry],
    queryFn: () => profileApi.getZones(activeCountry),
  });
  const { data: fetchedAlerts = [] } = useQuery({
    queryKey: ['alerts', activeCountry],
    queryFn: () => profileApi.getAlerts(activeCountry),
  });
  const { data: fetchedContacts = [] } = useQuery({
    queryKey: ['contacts', activeCountry],
    queryFn: () => profileApi.getContacts(activeCountry),
  });

  const nearbyZones = fetchedZones;
  const unreadAlerts = fetchedAlerts.filter(a => !a.read).length;
  const userZone = nearbyZones.find(z => z.level === 'caution') || nearbyZones[0];
  const nearbyContacts = fetchedContacts.slice(0, 2);

  const center: [number, number] = preferences.location
    ? [preferences.location.lat, preferences.location.lng]
    : (countryDefaultCenters[activeCountry] || [-6.2, 106.845]);
  const isInDanger = userZone && (userZone.level === 'caution' || userZone.level === 'danger');
  const locationLabel = preferences.location?.label || `${activeCountry}`;

  const currentLangName = preferences.language || 'English';
  const availableLanguages = Object.entries(aseanLanguages)
    .filter(([, lang], index, self) => 
      self.findIndex(([, l]) => l.name === lang.name) === index
    )
    .map(([country, lang]) => ({
      country,
      name: lang.name,
      nativeName: lang.nativeName,
    }));

  // Imperative Leaflet map
  const hasUserLocation = !!preferences.location;
  const mapZoom = hasUserLocation ? 13 : 10;

  // Southeast Asia bounds to restrict map view
  const seaBounds: L.LatLngBoundsExpression = [[-11.0, 92.0], [28.5, 141.0]];

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous instance
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current, {
      center,
      zoom: mapZoom,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      attributionControl: false,
      maxBounds: seaBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 4,
    });

    const tileUrl = preferences.theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    L.tileLayer(tileUrl).addTo(map);

    // Add zone circles
    nearbyZones.forEach(zone => {
      L.circle([zone.centerLat, zone.centerLng], {
        radius: zone.radius,
        color: zoneHex[zone.level],
        fillColor: zoneHex[zone.level],
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(map);
    });

    // Add user marker
    const userIcon = L.divIcon({
      className: '',
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 8px rgba(59,130,246,0.6)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    L.marker(center, { icon: userIcon }).addTo(map);

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [center[0], center[1], nearbyZones.length, preferences.theme, mapZoom]);

  const shareLink = `https://www.google.com/maps?q=${center[0]},${center[1]}`;

  const shareLocation = () => {
    setShowShareModal(true);
    setCopied(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-6 space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary shadow-clay-sm">
            <User className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">{user?.name || 'User'}</h1>
            <p className="text-sm text-muted-foreground">{user?.email || 'Guest access'}</p>
            {preferences.country && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {countryFlags[preferences.country]} {preferences.country}
              </p>
            )}
          </div>
        </div>

        {/* GPS Location Display (read-only) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('your_location')}</span>
            </div>
            <button onClick={shareLocation} className="flex items-center gap-1 text-primary text-[10px] font-medium px-2 py-1 rounded-lg hover:bg-accent">
              <Share2 className="h-3 w-3" /> {t('share_location')}
            </button>
          </div>
          {gpsStatus === 'loading' && (
            <p className="text-sm text-muted-foreground animate-pulse">Detecting your location…</p>
          )}
          {gpsStatus === 'denied' && !preferences.location && (
            <p className="text-sm text-muted-foreground">Location access denied. Showing default for {activeCountry}.</p>
          )}
          {(gpsStatus === 'success' || preferences.location) && (
            <>
              <p className="text-sm text-foreground">{locationLabel}</p>
              <p className="text-[10px] text-muted-foreground">{center[0].toFixed(4)}, {center[1].toFixed(4)}</p>
            </>
          )}
        </div>

        {/* Mini Map */}
        <div className="rounded-2xl overflow-hidden shadow-clay">
          <div ref={mapRef} className="h-44 w-full" />
        </div>

        {/* Current Status */}
        {userZone && (
          <div
            className="rounded-xl border-2 p-4 space-y-2"
            style={{ borderColor: zoneColors[userZone.level] + '60', background: zoneColors[userZone.level] + '10' }}
          >
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full animate-pulse" style={{ background: zoneColors[userZone.level] }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: zoneColors[userZone.level] }}>
                {t('current_status')}
              </span>
            </div>
            <p className="text-foreground text-sm font-medium">
              {userZone.level === 'evacuation' && t('near_evacuation')}
              {userZone.level === 'caution' && t('caution_zone')}
              {userZone.level === 'danger' && t('danger_zone')}
            </p>
            <p className="text-xs text-muted-foreground">{userZone.name} — {userZone.description}</p>
          </div>
        )}

        {/* Evacuation CTA */}
        {isInDanger && (
          <Button
            onClick={() => navigate('/evacuation')}
            className="w-full h-14 gap-2 text-base font-bold rounded-xl"
            style={{
              background: zoneColors[userZone!.level],
              color: userZone!.level === 'caution' ? '#000' : '#fff',
            }}
          >
            <Navigation className="h-5 w-5" />
            {t('get_evacuation_guide')}
          </Button>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-2xl bg-card shadow-clay-sm p-3 text-center">
            <Bell className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold text-foreground">{unreadAlerts}</p>
            <p className="text-[10px] text-muted-foreground">{t('unread_alerts')}</p>
          </div>
          <div className="rounded-2xl bg-card shadow-clay-sm p-3 text-center">
            <MapPin className="h-5 w-5 mx-auto text-zone-caution mb-1" />
            <p className="text-lg font-bold text-foreground">{nearbyZones.filter(z => z.level !== 'evacuation').length}</p>
            <p className="text-[10px] text-muted-foreground">{t('active_zones')}</p>
          </div>
          <div className="rounded-2xl bg-card shadow-clay-sm p-3 text-center">
            <Shield className="h-5 w-5 mx-auto text-zone-evacuation mb-1" />
            <p className="text-lg font-bold text-foreground">{nearbyZones.filter(z => z.level === 'evacuation').length}</p>
            <p className="text-[10px] text-muted-foreground">{t('shelters')}</p>
          </div>
        </div>

        {/* Nearby Contacts */}
        {nearbyContacts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('nearest_emergency')}</p>
            {nearbyContacts.map(c => (
              <a
                key={c.id}
                href={`tel:${c.phone}`}
                className="flex items-center gap-3 rounded-2xl bg-card shadow-clay-sm p-3 transition-all hover:-translate-y-0.5 hover:shadow-clay"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.distance} away • {c.phone}</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Settings Section */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('settings')}</p>

          {/* Theme Toggle */}
          <div className="rounded-2xl bg-card shadow-clay-sm p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {preferences.theme === 'dark' ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
                <span className="text-sm font-medium text-foreground">
                  {preferences.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <button
                onClick={() => setTheme(preferences.theme === 'dark' ? 'light' : 'dark')}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{ background: preferences.theme === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm"
                  style={{ transform: preferences.theme === 'dark' ? 'translateX(24px)' : 'translateX(4px)' }}
                />
              </button>
            </div>
          </div>

          {/* Language Selector */}
          <div className="rounded-2xl bg-card shadow-clay-sm p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{t('language')}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {availableLanguages.map(lang => (
                <button
                  key={lang.country}
                  onClick={() => setLanguage(lang.name)}
                  className={`text-left rounded-xl px-3 py-2 text-xs transition-all ${currentLangName === lang.name
                      ? 'bg-primary/10 text-primary shadow-clay-sm font-bold'
                      : 'bg-muted text-foreground hover:shadow-clay-sm font-medium'
                    }`}
                >
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="block text-[10px] text-muted-foreground">{countryFlags[lang.country]} {lang.country}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Logout */}
        <Button variant="outline" className="w-full gap-2 rounded-2xl" onClick={logout}>
          <LogOut className="h-4 w-4" />
          {t('sign_out')}
        </Button>
      </div>

      {/* Share Location Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          />

          <div className="relative w-full max-w-sm mx-4 bg-card rounded-t-2xl sm:rounded-2xl shadow-clay-lg p-5 space-y-4 animate-in slide-in-from-bottom">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">Share My Location</span>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Location info */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Current location</p>
              <p className="text-sm text-foreground line-clamp-2">{locationLabel}</p>
            </div>

            {/* Link box */}
            <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
              <p className="flex-1 text-xs text-foreground font-mono truncate">{shareLink}</p>
              <button
                onClick={copyLink}
                className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Open in Google Maps */}
            <a
              href={shareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <MapPin className="h-4 w-4" />
              Open in Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
