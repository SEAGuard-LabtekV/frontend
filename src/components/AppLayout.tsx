import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Map, Phone, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { alerts } from "@/data/mockData";
import { useTranslation } from "@/contexts/TranslationContext";
import ChatbotWidget from "@/components/ChatbotWidget";

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const unreadCount = alerts.filter((a) => !a.read).length;

  const hideBar = location.pathname.includes("/ar");

  const navItems = [
    { path: "/dashboard", icon: Home, label: t("home") },
    { path: "/map", icon: Map, label: t("map") },
    { path: "/contacts", icon: Phone, label: t("contacts") },
    { path: "/profile", icon: User, label: t("profile") },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      {!hideBar && (
        <aside className="hidden lg:flex flex-col w-60 bg-card shadow-clay shrink-0 m-3 mr-0 rounded-2xl overflow-hidden">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 px-5 h-16 shrink-0 transition-opacity hover:opacity-90"
          >
            <img
              src="/logo-1.png"
              alt="SEAGuard logo"
              className="h-9 w-9 rounded-xl object-cover shadow-clay-sm"
            />
            <span className="text-base font-extrabold text-foreground tracking-tight">
              SEAGuard
            </span>
          </button>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-2 space-y-1.5">
            {navItems.map(({ path, icon: Icon, label }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                    active
                      ? "bg-primary/10 text-primary shadow-clay-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground hover:shadow-clay-sm",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Alerts Button */}
          <div className="px-3 pb-4">
            <button
              onClick={() => navigate("/alerts")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                location.pathname === "/alerts"
                  ? "bg-primary/10 text-primary shadow-clay-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground hover:shadow-clay-sm",
              )}
            >
              <div className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-clay-sm">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span>Alerts</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Top Bar */}
        {!hideBar && (
          <div className="flex lg:hidden items-center justify-between px-4 pt-[env(safe-area-inset-top)] py-2 bg-card shadow-clay-sm mx-3 mt-3 rounded-2xl shrink-0">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 transition-opacity hover:opacity-90"
            >
              <img
                src="/logo-1.png"
                alt="SEAGuard logo"
                className="h-8 w-8 rounded-xl object-cover shadow-clay-sm"
              />
              <span className="text-sm font-extrabold text-foreground">
                SEAGuard
              </span>
            </button>
            <button
              onClick={() => navigate("/alerts")}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                location.pathname === "/alerts"
                  ? "text-primary bg-primary/10 shadow-clay-sm"
                  : "text-muted-foreground clay-sm hover:shadow-clay-sm",
              )}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Desktop Top Bar */}
        {!hideBar && (
          <div className="hidden lg:flex items-center justify-end gap-3 px-6 h-16 m-3 mb-0 bg-card shadow-clay-sm rounded-2xl shrink-0">
            <button
              onClick={() => navigate("/alerts")}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                location.pathname === "/alerts"
                  ? "text-primary bg-primary/10 shadow-clay-sm"
                  : "text-muted-foreground hover:shadow-clay-sm hover:bg-accent",
              )}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/profile")}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl bg-secondary transition-all shadow-clay-sm",
                location.pathname === "/profile"
                  ? "ring-2 ring-primary"
                  : "hover:shadow-clay",
              )}
            >
              <User className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>

        <ChatbotWidget />

        {/* Mobile Bottom Tab Bar */}
        {!hideBar && (
          <nav className="flex lg:hidden items-center justify-around bg-card shadow-clay mx-3 mb-3 rounded-2xl px-2 pb-[env(safe-area-inset-bottom)] h-16 shrink-0">
            {navItems.map(({ path, icon: Icon, label }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all",
                    active
                      ? "text-primary bg-primary/10 shadow-clay-sm"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-bold">{label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
};

export default AppLayout;
