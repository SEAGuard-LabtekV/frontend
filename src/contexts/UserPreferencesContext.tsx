import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { preferencesApi } from '@/lib/api';
import type { UpsertPreferencesPayload } from '@/lib/api';

interface UserLocation {
  lat: number;
  lng: number;
  label: string;
}

interface UserPreferences {
  country: string;
  language: string;
  setupComplete: boolean;
  location: UserLocation | null;
  theme: 'light' | 'dark';
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  setCountry: (country: string) => void;
  setLanguage: (language: string) => void;
  setLocation: (location: UserLocation) => void;
  completeSetup: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const defaultPrefs: UserPreferences = {
  country: '',
  language: '',
  setupComplete: false,
  location: null,
  theme: 'dark',
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const isGuest = !user || user.isGuest;
  const storageKey = user ? `adrrs_preferences_${user.id}` : 'adrrs_preferences_guest';

  const [currentKey, setCurrentKey] = useState(storageKey);
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return { ...defaultPrefs };
  });

  // Track whether we've loaded from the backend for this user
  const loadedFromBackend = useRef(false);

  // Synchronously reset preferences when user changes
  if (storageKey !== currentKey) {
    setCurrentKey(storageKey);
    loadedFromBackend.current = false;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setPreferences(JSON.parse(saved));
      } else {
        setPreferences({ ...defaultPrefs });
      }
    } catch {
      setPreferences({ ...defaultPrefs });
    }
  }

  // Load preferences from backend when an authenticated user mounts
  useEffect(() => {
    if (isGuest || loadedFromBackend.current) return;
    loadedFromBackend.current = true;

    preferencesApi.get().then((backendPrefs) => {
      const merged: UserPreferences = {
        country: backendPrefs.country || '',
        language: backendPrefs.language || '',
        setupComplete: backendPrefs.setupComplete ?? false,
        location: backendPrefs.locationLat != null && backendPrefs.locationLng != null
          ? { lat: backendPrefs.locationLat, lng: backendPrefs.locationLng, label: backendPrefs.locationLabel || '' }
          : null,
        theme: (backendPrefs.theme === 'light' ? 'light' : 'dark'),
      };
      setPreferences(merged);
      localStorage.setItem(storageKey, JSON.stringify(merged));
    }).catch(() => {
      // 404 = no preferences yet on the backend, that's fine
    });
  }, [isGuest, storageKey]);

  // Save to localStorage whenever preferences change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
  }, [preferences, storageKey]);

  // Sync .dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [preferences.theme]);

  // Helper to sync a partial update to the backend (fire-and-forget)
  const syncToBackend = useCallback((partial: UpsertPreferencesPayload) => {
    if (isGuest) return;
    preferencesApi.upsert(partial).catch(() => {
      // Silently fail — localStorage is the fallback
    });
  }, [isGuest]);

  const setCountry = (country: string) => {
    setPreferences(p => ({ ...p, country }));
    syncToBackend({ country });
  };

  const setLanguage = (language: string) => {
    setPreferences(p => ({ ...p, language }));
    syncToBackend({ language });
  };

  const setLocation = (location: UserLocation) => {
    setPreferences(p => ({ ...p, location }));
    syncToBackend({ locationLat: location.lat, locationLng: location.lng, locationLabel: location.label });
  };

  const completeSetup = () => {
    setPreferences(p => ({ ...p, setupComplete: true }));
    syncToBackend({ setupComplete: true });
  };

  const setTheme = (theme: 'light' | 'dark') => {
    setPreferences(p => ({ ...p, theme }));
    syncToBackend({ theme });
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, setCountry, setLanguage, setLocation, completeSetup, setTheme }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within UserPreferencesProvider');
  return ctx;
};
