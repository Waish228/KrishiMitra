import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
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

function App() {
  return (
    <ThemeProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'text-sm font-medium',
          style: {
            borderRadius: '12px',
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
          duration: 3000,
        }}
      />
      <Routes>
        {/* Landing Page - no layout */}
        <Route path="/" element={<LandingPage />} />

        {/* App pages with layout */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/chat"
          element={
            <Layout>
              <AIChatPage />
            </Layout>
          }
        />
        <Route
          path="/disease"
          element={
            <Layout>
              <DiseaseDetectionPage />
            </Layout>
          }
        />
        <Route
          path="/crop-guide"
          element={
            <Layout>
              <CropGuidePage />
            </Layout>
          }
        />
        <Route
          path="/weather"
          element={
            <Layout>
              <WeatherPage />
            </Layout>
          }
        />
        <Route
          path="/market"
          element={
            <Layout>
              <MarketPricesPage />
            </Layout>
          }
        />
        <Route
          path="/irrigation"
          element={
            <Layout>
              <IrrigationPlannerPage />
            </Layout>
          }
        />
        <Route
          path="/fertilizer"
          element={
            <Layout>
              <FertilizerPlannerPage />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <ProfilePage />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <SettingsPage />
            </Layout>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
