import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import {
	UserPreferencesProvider,
	usePreferences,
} from "@/contexts/UserPreferencesContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import UserSetupPage from "@/pages/UserSetupPage";
import HomePage from "@/pages/HomePage";
import LandingPage from "@/pages/LandingPage";
import MapPage from "@/pages/MapPage";
import AlertsPage from "@/pages/AlertsPage";
import ContactsPage from "@/pages/ContactsPage";
import ProfilePage from "@/pages/ProfilePage";
import EvacuationPage from "@/pages/EvacuationPage";
import ARNavigationPage from "@/pages/ARNavigationPage";
import CountryDetailPage from "@/pages/CountryDetailPage";
import GuideDetailPage from "@/pages/GuideDetailPage";
import NewsDetailPage from "@/pages/NewsDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const SetupGuard = ({ children }: { children: React.ReactNode }) => {
	const { user } = useAuth();
	const { preferences } = usePreferences();
	// Guests skip the setup requirement
	if (!user?.isGuest && !preferences.setupComplete) return <Navigate to="/setup" replace />;
	return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
	const { isAuthenticated, user } = useAuth();
	const { preferences } = usePreferences();
	if (isAuthenticated && !user?.isGuest) {
		return preferences.setupComplete ? <Navigate to="/dashboard" replace /> : <Navigate to="/setup" replace />;
	}
	return <>{children}</>;
};

const SetupRoute = ({ children }: { children: React.ReactNode }) => {
	const { isAuthenticated } = useAuth();
	const { preferences } = usePreferences();
	if (!isAuthenticated) return <Navigate to="/login" replace />;
	if (preferences.setupComplete) return <Navigate to="/dashboard" replace />;
	return <>{children}</>;
};

const AppRoutes = () => (
	<Routes>
		<Route path="/" element={<LandingPage />} />
		<Route
			path="/login"
			element={
				<AuthRoute>
					<LoginPage />
				</AuthRoute>
			}
		/>
		<Route
			path="/setup"
			element={
				<SetupRoute>
					<UserSetupPage />
				</SetupRoute>
			}
		/>
		<Route
			element={
				<ProtectedRoute>
					<SetupGuard>
						<AppLayout />
					</SetupGuard>
				</ProtectedRoute>
			}
		>
			<Route path="/dashboard" element={<HomePage />} />
			<Route path="/map" element={<MapPage />} />
			<Route path="/alerts" element={<AlertsPage />} />
			<Route path="/contacts" element={<ContactsPage />} />
			<Route path="/profile" element={<ProfilePage />} />
			<Route path="/country/:name" element={<CountryDetailPage />} />
			<Route path="/guide/:id" element={<GuideDetailPage />} />
			<Route path="/news/:id" element={<NewsDetailPage />} />
		</Route>
		<Route
			path="/evacuation"
			element={
				<ProtectedRoute>
					<EvacuationPage />
				</ProtectedRoute>
			}
		/>
		<Route
			path="/ar"
			element={
				<ProtectedRoute>
					<ARNavigationPage />
				</ProtectedRoute>
			}
		/>
		<Route path="*" element={<NotFound />} />
	</Routes>
);

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<Toaster />
			<Sonner />
			<AuthProvider>
				<UserPreferencesProvider>
					<TranslationProvider>
						<BrowserRouter>
							<AppRoutes />
						</BrowserRouter>
					</TranslationProvider>
				</UserPreferencesProvider>
			</AuthProvider>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
