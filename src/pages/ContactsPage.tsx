import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/lib/api';
import type { EmergencyContactItem } from '@/lib/api';
import { usePreferences } from '@/contexts/UserPreferencesContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Phone, Search, Shield, Ambulance, BadgeAlert, Flame, Building2, AlertTriangle, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ContactCategory = 'sar' | 'ambulance' | 'police' | 'hospital';

const categoryIcons: Record<ContactCategory, typeof Shield> = {
  sar: Shield,
  ambulance: Ambulance,
  police: BadgeAlert,
  hospital: Building2,
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

const ContactsPage = () => {
  const { preferences } = usePreferences();
  const { t } = useTranslation();

  const categoryLabels: Record<ContactCategory, string> = {
    sar: t('sar_team'),
    ambulance: t('ambulance_cat'),
    police: t('police_cat'),
    hospital: t('hospital_cat'),
  };

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ContactCategory | 'all'>('all');
  const [gpsCountry, setGpsCountry] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);

  // Detect country from GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=5`
          );
          const data = await res.json();
          const country = data.address?.country;
          if (country && nominatimToAsean[country]) {
            setGpsCountry(nominatimToAsean[country]);
          }
        } catch { /* fallback */ }
        setGpsLoading(false);
      },
      () => { setGpsLoading(false); },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  // Use GPS-detected country, fallback to user's home country
  const contactCountry = gpsCountry || preferences.country || 'Indonesia';

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts', contactCountry],
    queryFn: () => profileApi.getContacts(contactCountry),
  });

  const filtered = contacts.filter((c: EmergencyContactItem) => {
    const matchCategory = activeCategory === 'all' || c.category === activeCategory;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-foreground">{t('emergency_contacts')}</h1>
        <div className="flex items-center gap-1.5 mt-1">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <p className="text-sm text-muted-foreground">
            {gpsLoading ? t('detecting_location') : `${t('showing_contacts_for')} ${contactCountry}`}
          </p>
        </div>
      </div>

      {/* SOS Button */}
      <div className="px-4 mb-4">
        <Button
          className="w-full h-14 text-lg font-bold rounded-2xl animate-pulse-emergency gap-2 shadow-clay"
          onClick={() => window.open('tel:112')}
        >
          <AlertTriangle className="h-5 w-5" />
          {t('sos_emergency')}
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('search_contacts')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl bg-card shadow-clay-inset px-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            'shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
            activeCategory === 'all' ? 'bg-primary/15 text-primary shadow-clay-sm' : 'bg-card shadow-clay-sm text-muted-foreground hover:shadow-clay'
          )}
        >
          {t('all')}
        </button>
        {(Object.keys(categoryLabels) as ContactCategory[]).map(cat => {
          const Icon = categoryIcons[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
              'shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1',
              activeCategory === cat ? 'bg-primary/15 text-primary shadow-clay-sm' : 'bg-card shadow-clay-sm text-muted-foreground hover:shadow-clay'
            )}
            >
              <Icon className="h-3 w-3" />
              {categoryLabels[cat]}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {(isLoading || gpsLoading) && (
        <div className="px-4 pb-6 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">{t('loading_contacts')}</p>
        </div>
      )}

      {/* Contact List */}
      <div className="px-4 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {filtered.map((contact: EmergencyContactItem) => {
          const Icon = categoryIcons[contact.category as ContactCategory] || Shield;
          return (
            <div key={contact.id} className="flex items-center gap-3 rounded-2xl bg-card shadow-clay-sm p-3 transition-all hover:-translate-y-0.5 hover:shadow-clay">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary shadow-clay-inset">
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{contact.city}</span>
                  <span className={cn(
                    'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                    contact.status === 'active' ? 'bg-zone-evacuation/20 text-zone-evacuation' : 'bg-zone-danger/20 text-zone-danger'
                  )}>
                    {contact.status}
                  </span>
                </div>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow-clay-sm transition-all hover:shadow-clay hover:-translate-y-0.5 active:shadow-clay-pressed"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {!isLoading && !gpsLoading && filtered.length === 0 && (
        <div className="px-4 pb-6 text-center">
          <p className="text-sm text-muted-foreground">{t('no_contacts_found')} "{search}"</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default ContactsPage;
