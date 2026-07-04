import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AIChatPage from './pages/AIChatPage';
import DiseaseDetectionPage from './pages/DiseaseDetectionPage';
import CropGuidePage from './pages/CropGuidePage';
import WeatherPage from './pages/WeatherPage';
import MarketPricesPage from './pages/MarketPricesPage';
import IrrigationPlannerPage from './pages/IrrigationPlannerPage';
import FertilizerPlannerPage from './pages/FertilizerPlannerPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Helper to wrap an element with Layout + ProtectedRoute
const Protected = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'text-sm font-medium',
            style: {
              borderRadius: '12px',
              background: 'var(--toast-bg, #fff)',
              color: 'var(--toast-color, #1f2937)',
            },
            duration: 3500,
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected app routes */}
          <Route path="/dashboard"  element={<Protected><Dashboard /></Protected>} />
          <Route path="/chat"       element={<Protected><AIChatPage /></Protected>} />
          <Route path="/disease"    element={<Protected><DiseaseDetectionPage /></Protected>} />
          <Route path="/crop-guide" element={<Protected><CropGuidePage /></Protected>} />
          <Route path="/weather"    element={<Protected><WeatherPage /></Protected>} />
          <Route path="/market"     element={<Protected><MarketPricesPage /></Protected>} />
          <Route path="/irrigation" element={<Protected><IrrigationPlannerPage /></Protected>} />
          <Route path="/fertilizer" element={<Protected><FertilizerPlannerPage /></Protected>} />
          <Route path="/profile"    element={<Protected><ProfilePage /></Protected>} />
          <Route path="/settings"   element={<Protected><SettingsPage /></Protected>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
