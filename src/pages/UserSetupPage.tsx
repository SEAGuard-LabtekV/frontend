import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aseanCountries, aseanLanguages, countryFlags } from '@/data/mockData';
import { usePreferences } from '@/contexts/UserPreferencesContext';
import { Globe, Languages, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const UserSetupPage = () => {
  const navigate = useNavigate();
  const { setCountry, setLanguage, completeSetup } = usePreferences();
  const [step, setStep] = useState<'country' | 'language'>('country');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setCountry(country);
    const lang = aseanLanguages[country];
    if (lang) {
      setSelectedLanguage(lang.name);
      setLanguage(lang.name);
    }
  };

  const handleContinue = () => {
    if (step === 'country' && selectedCountry) {
      setStep('language');
    } else if (step === 'language' && selectedLanguage) {
      completeSetup();
      navigate('/');
    }
  };

  const allLanguages = [
    { name: 'English', nativeName: 'English' },
    ...Object.values(aseanLanguages).filter(
      (l, i, arr) => l.name !== 'English' && arr.findIndex(a => a.name === l.name) === i
    ),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background px-4 py-8 lg:items-center lg:justify-center">
      <div className="w-full max-w-2xl mx-auto flex flex-col flex-1 lg:flex-none lg:clay-lg lg:p-10 lg:my-8">
        {/* Header */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="clay-icon p-2 transition-transform duration-200 hover:scale-110 active:scale-95">
              {step === 'country' ? (
                <Globe className="h-5 w-5 text-primary" />
              ) : (
                <Languages className="h-5 w-5 text-primary" />
              )}
            </div>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Step {step === 'country' ? '1' : '2'} of 2
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {step === 'country' ? 'Where are you from?' : 'Preferred Language'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === 'country'
              ? 'This helps us show relevant local disaster information and emergency contacts.'
              : 'Choose the language for displaying content in the app.'}
          </p>
        </div>

        {/* Options */}
        <div className="flex-1 space-y-3 overflow-y-auto pb-4 lg:max-h-[480px]">
          {step === 'country' ? (
            aseanCountries.map((country, i) => (
              <button
                key={country}
                onClick={() => handleCountrySelect(country)}
                style={{ animationDelay: `${i * 40}ms` }}
                className={cn(
                  'w-full flex items-center gap-3 p-4 text-left animate-fade-in',
                  'transition-all duration-200 active:scale-[0.97]',
                  selectedCountry === country
                    ? 'clay-sm border-primary bg-primary/10 scale-[1.01]'
                    : 'clay-sm hover:shadow-clay hover:-translate-y-0.5'
                )}
              >
                <span className="text-2xl transition-transform duration-200 hover:scale-125">{countryFlags[country]}</span>
                <span className="flex-1 text-sm font-semibold text-foreground">{country}</span>
                {selectedCountry === country && (
                  <div className="clay-icon p-1 bg-primary/15 animate-scale-in">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
              </button>
            ))
          ) : (
            allLanguages.map((lang, i) => (
              <button
                key={lang.name}
                onClick={() => { setSelectedLanguage(lang.name); setLanguage(lang.name); }}
                style={{ animationDelay: `${i * 40}ms` }}
                className={cn(
                  'w-full flex items-center justify-between p-4 text-left animate-fade-in',
                  'transition-all duration-200 active:scale-[0.97]',
                  selectedLanguage === lang.name
                    ? 'clay-sm border-primary bg-primary/10 scale-[1.01]'
                    : 'clay-sm hover:shadow-clay hover:-translate-y-0.5'
                )}
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{lang.name}</p>
                  <p className="text-xs text-muted-foreground">{lang.nativeName}</p>
                </div>
                {selectedLanguage === lang.name && (
                  <div className="clay-icon p-1 bg-primary/15 animate-scale-in">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Continue */}
        <Button
          onClick={handleContinue}
          disabled={step === 'country' ? !selectedCountry : !selectedLanguage}
          className="w-full h-14 text-base font-semibold rounded-xl gap-2 mt-4 clay-primary transition-all duration-200 hover:-translate-y-1 active:scale-[0.97]"
        >
          {step === 'language' ? 'Start Using SEAGuard' : 'Continue'}
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default UserSetupPage;
