import { useState } from 'react';
import { alerts, type Alert, type AlertLevel } from '@/data/mockData';
import { AlertTriangle, Info, Bell, ChevronRight, Droplets, Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const levelConfig: Record<AlertLevel, { label: string; sublabel: string; color: string; icon: typeof Info }> = {
  1: { label: 'Siaga 1', sublabel: 'Monitor', color: 'hsl(45, 95%, 55%)', icon: Info },
  2: { label: 'Siaga 2', sublabel: 'Prepare', color: 'hsl(25, 95%, 55%)', icon: AlertTriangle },
  3: { label: 'Siaga 3', sublabel: 'Evacuate', color: 'hsl(0, 85%, 55%)', icon: Bell },
};

const AlertsPage = () => {
  const [alertList, setAlertList] = useState<Alert[]>(alerts);
  const navigate = useNavigate();

  const markRead = (id: string) => {
    setAlertList(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-foreground">Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">Early warning notifications</p>
      </div>

      <div className="px-4 space-y-3 pb-6">
        {alertList.map((alert, i) => {
          const config = levelConfig[alert.level];
          const Icon = config.icon;
          return (
            <button
              key={alert.id}
              onClick={() => { markRead(alert.id); }}
              className={cn(
                'w-full relative p-4 text-left transition-all duration-300 hover:-translate-y-1 active:animate-clay-bounce animate-fade-in',
                alert.read ? 'clay-sm' : 'clay border-l-4',
              )}
              style={{
                ...(!alert.read ? { borderLeftColor: config.color } : {}),
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${config.color}20` }}
                >
                  <Icon className="h-4 w-4" style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: config.color }}
                    >
                      {config.label} — {config.sublabel}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{alert.time}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mt-1 truncate">{alert.title}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {alert.disasterType === 'flood'
                      ? <Droplets className="h-3 w-3 text-muted-foreground" />
                      : <Mountain className="h-3 w-3 text-muted-foreground" />
                    }
                    <p className="text-xs text-muted-foreground truncate">{alert.area}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{alert.action}</p>
                  {alert.level >= 2 && (
                    <div
                      className="mt-3 flex items-center gap-1 text-xs font-medium"
                      style={{ color: config.color }}
                      onClick={(e) => { e.stopPropagation(); navigate('/evacuation'); }}
                    >
                      View Evacuation Route <ChevronRight className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
              {!alert.read && (
                <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
};

export default AlertsPage;
