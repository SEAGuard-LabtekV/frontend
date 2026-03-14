const API_ORIGIN = (import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
export const API_BASE_URL = `${API_ORIGIN}/api`;

export const getToken = () => localStorage.getItem('token');
export const setToken = (token: string) => localStorage.setItem('token', token);
export const clearToken = () => localStorage.removeItem('token');

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `API Error (${response.status})`;
    try {
      const data = await response.json();

      const formatIssue = (issue: any) => {
        const field = issue.path?.length ? String(issue.path[0]) : '';
        const capField = field ? field.charAt(0).toUpperCase() + field.slice(1) : '';
        const msg = issue.message || 'Invalid format';
        return capField ? `${capField}: ${msg}` : msg;
      };

      let errObj = data.error;

      // Hono Zod validator puts stringified JSON array in `error.message` sometimes
      if (errObj && typeof errObj === 'object' && errObj.message && typeof errObj.message === 'string' && errObj.message.startsWith('[')) {
        try { errObj = JSON.parse(errObj.message); } catch { /* ignore */ }
      } else if (typeof errObj === 'string' && errObj.startsWith('[')) {
        try { errObj = JSON.parse(errObj); } catch { /* ignore */ }
      }

      if (Array.isArray(errObj) && errObj.length > 0) {
        message = formatIssue(errObj[0]);
      } else if (Array.isArray(data) && data.length > 0) {
        message = formatIssue(data[0]);
      } else if (typeof errObj === 'object' && errObj !== null) {
        if (Array.isArray(errObj.issues) && errObj.issues.length > 0) {
          message = formatIssue(errObj.issues[0]);
        } else if (errObj.message) {
          message = errObj.message;
        } else {
          message = JSON.stringify(errObj);
        }
      } else {
        message = data.error || data.message || message;
      }
    } catch {
      // Ignore JSON parse error and fallback to text if possible
    }
    throw new ApiError(response.status, message);
  }

  return response.json();
}

export const authApi = {
  register: (data: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
};

export interface DisasterNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  imageUrl: string;
  country: string;
  disasterType: string;
  isGlobal: boolean;
  videoUrl: string | null;
  sourceUrl: string | null;
}

export interface ExternalNewsItem {
  id: string;
  country: string;
  countryCode: string;
  countryTimezone: string;
  fetchDateLocal: string;
  fetchMode: "top_headlines" | "everything";
  disasterType: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceId: string | null;
  sourceUrl: string;
  imageUrl: string;
  publishedAt: string;
}

export interface CountryStatusItem {
  id: string;
  country: string;
  activeDisasters: number;
  affectedPopulation: number;
  alertLevel: string;
  recentEvents: string[];
  prediction: string;
}

export interface SurvivalTipItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  disasterType: string;
  steps: string[];
}

export const dashboardApi = {
  getLocalNews: (country: string) =>
    apiFetch(`/news?country=${encodeURIComponent(country)}`) as Promise<DisasterNewsItem[]>,
  getExternalNews: (country?: string) =>
    apiFetch(
      country
        ? `/external-news?country=${encodeURIComponent(country)}&limit=10`
        : "/external-news",
    ) as Promise<ExternalNewsItem[]>,
  getGlobalNews: () =>
    apiFetch('/news?global=true') as Promise<DisasterNewsItem[]>,
  getCountryStatuses: () =>
    apiFetch('/countries') as Promise<CountryStatusItem[]>,
  getSurvivalTips: () =>
    apiFetch('/guides/survival') as Promise<SurvivalTipItem[]>,
};

export interface AlertItem {
  id: string;
  level: number;
  title: string;
  disasterType: string;
  area: string;
  country: string;
  time: string;
  action: string;
  read: boolean;
}

export type ZoneLevel = 'evacuation' | 'caution' | 'danger';

export interface DisasterZoneItem {
  id: string;
  centerLat: number;
  centerLng: number;
  radius: number;
  level: ZoneLevel;
  disasterType: string;
  name: string;
  country: string;
  description: string;
}

export interface EmergencyContactItem {
  id: string;
  name: string;
  category: string;
  phone: string;
  distance: string;
  status: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
}

export const profileApi = {
  getAlerts: (country?: string) =>
    apiFetch(country ? `/alerts?country=${encodeURIComponent(country)}` : '/alerts') as Promise<AlertItem[]>,
  getZones: (country?: string) =>
    apiFetch(country ? `/disasters/zones?country=${encodeURIComponent(country)}` : '/disasters/zones') as Promise<DisasterZoneItem[]>,
  getContacts: (country?: string) =>
    apiFetch(country ? `/contacts?country=${encodeURIComponent(country)}` : '/contacts') as Promise<EmergencyContactItem[]>,
};

export interface BackendPreferences {
  id: string;
  userId: string;
  country: string;
  language: string;
  locationLat: number | null;
  locationLng: number | null;
  locationLabel: string | null;
  theme: string;
  setupComplete: boolean;
}

export interface UpsertPreferencesPayload {
  country?: string;
  language?: string;
  locationLat?: number;
  locationLng?: number;
  locationLabel?: string;
  theme?: string;
  setupComplete?: boolean;
}

export const preferencesApi = {
  get: () =>
    apiFetch('/preferences') as Promise<BackendPreferences>,
  upsert: (data: UpsertPreferencesPayload) =>
    apiFetch('/preferences', { method: 'PUT', body: JSON.stringify(data) }) as Promise<BackendPreferences>,
};

export interface ReportTimelineItem {
  time: string;
  event: string;
}

export interface DisasterReportItem {
  id: string;
  country: string;
  disasterType: string;
  severity: string;
  date: string;
  affectedPopulation: number;
  title: string;
  summary: string;
}

export interface DisasterReportDetailItem extends DisasterReportItem {
  timeline: ReportTimelineItem[];
}

export const countryApi = {
  getCountryStatus: (country: string) =>
    apiFetch(`/countries/${encodeURIComponent(country)}`) as Promise<CountryStatusItem>,
  getCountryNews: (country: string) =>
    apiFetch(`/news?country=${encodeURIComponent(country)}`) as Promise<DisasterNewsItem[]>,
  getCountryZones: (country: string) =>
    apiFetch(`/disasters/zones?country=${encodeURIComponent(country)}`) as Promise<DisasterZoneItem[]>,
  getCountryReports: (country: string) =>
    apiFetch(`/reports?country=${encodeURIComponent(country)}`) as Promise<DisasterReportItem[]>,
  getReportDetail: (id: string) =>
    apiFetch(`/reports/${encodeURIComponent(id)}`) as Promise<DisasterReportDetailItem>,
};
