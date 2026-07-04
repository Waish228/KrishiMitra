import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun, Moon, Globe, Bell, Shield, Smartphone,
  ChevronRight, Info, Trash2, LogOut,
  Volume2, Wifi, Database, HelpCircle, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, PageHeader, Badge } from '../components/ui/Components';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  id?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon, label, description, action, onClick, danger, id
}) => (
  <div
    onClick={onClick}
    id={id}
    className={cn(
      'flex items-center gap-4 px-5 py-4 transition-colors',
      onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50' : ''
    )}
  >
    <div className={cn(
      'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
      danger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-100 dark:bg-slate-700'
    )}>
      <div className={danger ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}>
        {icon}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className={cn('text-sm font-medium', danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white')}>
        {label}
      </p>
      {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{description}</p>}
    </div>
    {action || (onClick && !action && <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 flex-shrink-0" />)}
  </div>
);

const Toggle2: React.FC<{ checked: boolean; onChange: (v: boolean) => void; id?: string }> = ({ checked, onChange, id }) => (
  <button
    id={id}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none',
      checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-600'
    )}
  >
    <span className={cn(
      'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300',
      checked ? 'translate-x-6' : 'translate-x-0'
    )} />
  </button>
);

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [settings, setSettings] = useState({
    notifications: true,
    weatherAlerts: true,
    marketAlerts: false,
    diseaseAlerts: true,
    offlineMode: false,
    autoSync: true,
    soundEffects: true,
    locationAccess: true,
    biometric: false,
    analyticsOptIn: true,
    units: 'Metric',
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' }
  ];

  return (
    <div className="page-container max-w-2xl mx-auto">
      <PageHeader
        title={t('settings.title', 'Settings')}
        subtitle={t('settings.subtitle', 'Customize your KrishiMitra experience')}
      />

      {/* Appearance */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
          {t('settings.appearance', 'Appearance')}
        </h2>
        <Card className="overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
          {/* Theme */}
          <div className="px-5 py-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">{t('settings.theme', 'Theme')}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => !isDark || toggleTheme()}
                id="light-mode-btn"
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                  !isDark
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                )}
              >
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                  <Sun className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.theme_light', 'Light')}</p>
                  <p className="text-xs text-gray-400">{t('settings.theme_light_desc', 'Clean and bright')}</p>
                </div>
                {!isDark && <div className="ml-auto w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>}
              </button>

              <button
                onClick={() => isDark || toggleTheme()}
                id="dark-mode-btn"
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                  isDark
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                )}
              >
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center">
                  <Moon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.theme_dark', 'Dark')}</p>
                  <p className="text-xs text-gray-400">{t('settings.theme_dark_desc', 'Easy on eyes')}</p>
                </div>
                {isDark && <div className="ml-auto w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>}
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.language', 'Language')}</p>
                <p className="text-xs text-gray-400">{t('settings.language_desc', 'App display language')}</p>
              </div>
              <select
                value={i18n.language.split('-')[0]}
                onChange={(e) => {
                  i18n.changeLanguage(e.target.value);
                  toast.success(`Language switched successfully!`);
                }}
                className="text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                id="language-select"
              >
                {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
          </div>

          {/* Units */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                <Database className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.measurement', 'Measurement Units')}</p>
                <p className="text-xs text-gray-400">{t('settings.measurement_desc', 'For area, temperature, weight')}</p>
              </div>
              <select
                value={settings.units}
                onChange={(e) => setSettings(prev => ({ ...prev, units: e.target.value }))}
                className="text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                id="units-select"
              >
                <option value="Metric">{t('settings.metric', 'Metric')}</option>
                <option value="Imperial">{t('settings.imperial', 'Imperial')}</option>
              </select>
            </div>
          </div>
        </Card>
      </section>

      {/* Notifications */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
          {t('settings.notifications', 'Notifications')}
        </h2>
        <Card className="overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
          {[
            { key: 'notifications' as const, icon: <Bell className="w-4 h-4" />, label: t('settings.notifications', 'Push Notifications'), desc: t('settings.push_desc', 'Receive alerts on your device') },
            { key: 'weatherAlerts' as const, icon: <span className="text-sm">🌤️</span>, label: t('settings.weather_alerts', 'Weather Alerts'), desc: t('settings.weather_desc', 'Rain, frost, and extreme weather') },
            { key: 'marketAlerts' as const, icon: <span className="text-sm">📈</span>, label: t('settings.market_alerts', 'Market Price Alerts'), desc: t('settings.market_desc', 'Price changes for your crops') },
            { key: 'diseaseAlerts' as const, icon: <span className="text-sm">🦠</span>, label: t('settings.disease_alerts', 'Disease Outbreak Alerts'), desc: t('settings.disease_desc', 'Regional pest and disease warnings') },
            { key: 'soundEffects' as const, icon: <Volume2 className="w-4 h-4" />, label: t('settings.sound', 'Sound Effects'), desc: t('settings.sound_desc', 'App sounds and alerts') },
          ].map((item) => (
            <SettingItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              description={item.desc}
              id={`toggle-${item.key}`}
              action={
                <Toggle2
                  checked={settings[item.key] as boolean}
                  onChange={() => toggle(item.key)}
                  id={`${item.key}-toggle`}
                />
              }
            />
          ))}
        </Card>
      </section>

      {/* Privacy & Data */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
          {t('settings.privacy', 'Privacy & Data')}
        </h2>
        <Card className="overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
          <SettingItem
            icon={<Wifi className="w-4 h-4" />}
            label={t('settings.offline', 'Offline Mode')}
            description={t('settings.offline_desc', 'Cache data for offline access')}
            action={<Toggle2 checked={settings.offlineMode} onChange={() => toggle('offlineMode')} id="offline-toggle" />}
          />
          <SettingItem
            icon={<Database className="w-4 h-4" />}
            label={t('settings.sync', 'Auto Sync')}
            description={t('settings.sync_desc', 'Sync data when connected')}
            action={<Toggle2 checked={settings.autoSync} onChange={() => toggle('autoSync')} id="sync-toggle" />}
          />
          <SettingItem
            icon={<Shield className="w-4 h-4" />}
            label={t('settings.biometric', 'Biometric Lock')}
            description={t('settings.biometric_desc', 'Use fingerprint/face for login')}
            action={<Toggle2 checked={settings.biometric} onChange={() => toggle('biometric')} id="biometric-toggle" />}
          />
          <SettingItem
            icon={<Info className="w-4 h-4" />}
            label={t('settings.analytics', 'Analytics')}
            description={t('settings.analytics_desc', 'Help improve the app with usage data')}
            action={<Toggle2 checked={settings.analyticsOptIn} onChange={() => toggle('analyticsOptIn')} id="analytics-toggle" />}
          />
        </Card>
      </section>

      {/* Support */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
          {t('settings.support', 'Support')}
        </h2>
        <Card className="overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
          <SettingItem icon={<HelpCircle className="w-4 h-4" />} label={t('settings.help', 'Help & FAQ')} description={t('settings.help_desc', 'Get answers to common questions')} onClick={() => {}} id="help-btn" />
          <SettingItem icon={<Star className="w-4 h-4" />} label={t('settings.rate', 'Rate KrishiMitra')} description={t('settings.rate_desc', 'Share your experience')} onClick={() => {}} id="rate-btn" />
          <SettingItem icon={<Smartphone className="w-4 h-4" />} label={t('settings.about', 'About')} description={t('settings.about_desc', 'Version 2.1.4 • Build 241203')} onClick={() => {}} id="about-btn" />
        </Card>
      </section>

      {/* Danger Zone */}
      <section className="mb-6">
        <Card className="overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
          <SettingItem
            icon={<LogOut className="w-4 h-4" />}
            label={t('settings.signout', 'Sign Out')}
            danger
            onClick={async () => {
              try {
                await signOut();
                toast.success(t('settings.signout_success', 'Signed out successfully'));
                navigate('/auth');
              } catch {
                toast.error(t('settings.signout_error', 'Failed to sign out'));
              }
            }}
            id="signout-btn"
          />
          <SettingItem
            icon={<Trash2 className="w-4 h-4" />}
            label={t('settings.delete_account', 'Delete Account')}
            description={t('settings.delete_desc', 'This action cannot be undone')}
            danger
            onClick={() => {}}
            id="delete-account-btn"
          />
        </Card>
      </section>

      <div className="text-center text-xs text-gray-400 pb-4">
        KrishiMitra AI v2.1.4 • {t('settings.footer', 'Made with ❤️ for Indian Farmers')}
      </div>
    </div>
  );
};

export default SettingsPage;
