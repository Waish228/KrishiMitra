import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Leaf, CloudSun, TrendingUp, Droplets, MessageSquare,
  FlaskConical, BookOpen, Bell, ArrowRight, Sparkles,
  AlertTriangle, Sun, Wind, MapPin, CalendarDays, CheckCircle2, ChevronRight, Loader2
} from 'lucide-react';
import { Card, Badge } from '../components/ui/Components';
import { getGreeting } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

interface QuickActionItem {
  icon: React.ReactNode;
  labelKey: string;
  defaultLabel: string;
  path: string;
  color: string;
  hoverColor: string;
}

interface AlertItem {
  type: 'warning' | 'success' | 'danger';
  icon: string;
  message: string;
  time: string;
}

interface CropItem {
  name: string;
  stage: string;
  health: number;
  area: string;
  nextAction: string;
}

interface MarketItem {
  crop: string;
  price: string;
  change: string;
  positive: boolean;
  unit: string;
}

interface ReminderItem {
  id: string;
  task: string;
  due: string;
  done: boolean;
}

interface SuggestionItem {
  title: string;
  desc: string;
  impact: string;
}

interface ChatItem {
  id: string;
  query: string;
  time: string;
}

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();

  const [realReminders, setRealReminders] = useState<ReminderItem[]>([]);
  const [realChats, setRealChats] = useState<ChatItem[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Helper weather parser functions
  const getConditionText = (code: number) => {
    if (code === 0) return t('weather.clear', 'Clear');
    if (code <= 3) return t('weather.partly_cloudy', 'Partly Cloudy');
    if (code <= 39) return t('weather.cloudy', 'Cloudy');
    if (code <= 49) return t('weather.foggy', 'Foggy');
    if (code <= 69) return t('weather.rain', 'Rain');
    if (code <= 79) return t('weather.snow', 'Snow');
    return t('weather.storm', 'Storm');
  };

  const getConditionIcon = (code: number) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 39) return '☁️';
    if (code <= 49) return '🌫️';
    if (code <= 69) return '🌧️';
    if (code <= 79) return '❄️';
    return '⛈️';
  };

  // Fetch real reminders from firestore
  useEffect(() => {
    if (!profile?.id) return;
    const fetchReminders = async () => {
      try {
        const q = query(
          collection(db, 'reminders'),
          where('user_id', '==', profile.id)
        );
        const snap = await getDocs(q);
        const list: ReminderItem[] = [];
        snap.forEach(doc => {
          const d = doc.data();
          list.push({
            id: doc.id,
            task: d.title,
            due: d.due_date ? new Date(d.due_date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
            done: d.completed || false
          });
        });
        // Sort locally
        list.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
        setRealReminders(list.slice(0, 3));
      } catch (e) {
        console.error('Error fetching dashboard reminders', e);
      }
    };
    fetchReminders();
  }, [profile?.id, i18n.language]);

  // Fetch real recent chats
  useEffect(() => {
    if (!user?.uid) return;
    const fetchChats = async () => {
      try {
        const q = query(
          collection(db, 'conversations'),
          where('user_id', '==', user.uid)
        );
        const snap = await getDocs(q);
        const list: ChatItem[] = [];
        snap.forEach(doc => {
          const d = doc.data();
          list.push({
            id: doc.id,
            query: d.title || 'Conversation',
            time: d.updated_at ? new Date(d.updated_at).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' }) : ''
          });
        });
        // Sort client-side by time
        list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setRealChats(list.slice(0, 2));
      } catch (e) {
        console.error('Error fetching dashboard chats', e);
      }
    };
    fetchChats();
  }, [user?.uid, i18n.language]);

  // Fetch real weather
  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        let latitude = 26.8467;
        let longitude = 80.9462;
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
          });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        } catch (e) {
          console.warn('Dashboard geo fallback to Lucknow');
        }

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max&timezone=auto`
        );
        const data = await res.json();
        
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        setWeatherData({
          temp: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          wind: Math.round(data.current.wind_speed_10m),
          code: data.current.weather_code,
          daily: data.daily.time.slice(1, 5).map((time: string, idx: number) => {
            const d = new Date(time);
            return {
              day: days[d.getDay()],
              code: data.daily.weather_code[idx + 1],
              temp: Math.round(data.daily.temperature_2m_max[idx + 1])
            };
          })
        });
      } catch (e) {
        console.error('Dashboard weather error', e);
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const quickActions: QuickActionItem[] = [
    { icon: <Leaf className="w-5 h-5" />, labelKey: 'dashboard.scan_crop', defaultLabel: 'Scan Disease', path: '/disease', color: 'bg-rose-500/10 text-rose-500 border border-rose-500/20', hoverColor: 'hover:bg-rose-500/20' },
    { icon: <MessageSquare className="w-5 h-5" />, labelKey: 'dashboard.ask_ai', defaultLabel: 'Ask AI', path: '/chat', color: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20', hoverColor: 'hover:bg-indigo-500/20' },
    { icon: <TrendingUp className="w-5 h-5" />, labelKey: 'dashboard.view_markets', defaultLabel: 'Market Prices', path: '/market', color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20', hoverColor: 'hover:bg-emerald-500/20' },
    { icon: <Droplets className="w-5 h-5" />, labelKey: 'nav.farming_planner', defaultLabel: 'Planner', path: '/planner', color: 'bg-sky-500/10 text-sky-500 border border-sky-500/20', hoverColor: 'hover:bg-sky-500/20' },
    { icon: <FlaskConical className="w-5 h-5" />, labelKey: 'nav.reminders', defaultLabel: 'Reminders', path: '/reminders', color: 'bg-amber-500/10 text-amber-500 border border-amber-500/20', hoverColor: 'hover:bg-amber-500/20' },
    { icon: <BookOpen className="w-5 h-5" />, labelKey: 'nav.crop_guide', defaultLabel: 'Crop Guide', path: '/crop-guide', color: 'bg-teal-500/10 text-teal-500 border border-teal-500/20', hoverColor: 'hover:bg-teal-500/20' },
  ];

  const diseaseReports: AlertItem[] = [
    { type: 'danger', icon: '🐛', message: t('dashboard.alert_pest', 'High pest alert: Fall armyworm reported in Lucknow region.'), time: t('time.1d_ago', '1d ago') },
    { type: 'warning', icon: '🍂', message: t('dashboard.alert_blight', 'Late blight symptoms found in neighboring potato fields.'), time: t('time.2d_ago', '2d ago') },
  ];

  const recentCrops: CropItem[] = [
    { name: t('crops.wheat', 'Wheat'), stage: t('crop_stages.ripening', 'Ripening'), health: 92, area: `3.5 ${t('ui.acres', 'acres')}`, nextAction: t('actions.harvest_12_days', 'Harvest in 12 days') },
    { name: t('crops.tomato', 'Tomato'), stage: t('crop_stages.flowering', 'Flowering'), health: 78, area: `1.2 ${t('ui.acres', 'acres')}`, nextAction: t('actions.apply_fungicide', 'Apply fungicide') },
    { name: t('crops.mustard', 'Mustard'), stage: t('crop_stages.seedling', 'Seedling'), health: 95, area: `2.0 ${t('ui.acres', 'acres')}`, nextAction: t('actions.first_watering', 'First watering due') },
  ];

  const marketPrices: MarketItem[] = [
    { crop: `🌾 ${t('crops.wheat', 'Wheat')}`, price: '₹2,340', change: '+₹120', positive: true, unit: t('ui.qtl', '/qtl') },
    { crop: `🍅 ${t('crops.tomato', 'Tomato')}`, price: '₹1,800', change: '-₹200', positive: false, unit: t('ui.qtl', '/qtl') },
    { crop: `🧅 ${t('crops.onion', 'Onion')}`, price: '₹1,200', change: '+₹80', positive: true, unit: t('ui.qtl', '/qtl') },
  ];

  const reminders: ReminderItem[] = [
    { id: '1', task: t('reminders.task_water_tomato', 'Water Tomato crop (Flower stage)'), due: t('time.today_4pm', 'Today, 4:00 PM'), done: false },
    { id: '2', task: t('reminders.task_check_wheat', 'Check Wheat moisture content'), due: t('time.tomorrow', 'Tomorrow'), done: false },
    { id: '3', task: t('reminders.task_apply_npk', 'Apply NPK Fertilizer to Mustard'), due: t('time.jul8', 'Jul 8'), done: true },
  ];

  const aiSuggestions: SuggestionItem[] = [
    { title: t('suggestions.early_harvest_title', 'Early Harvesting Advised'), desc: t('suggestions.early_harvest_desc', 'Rainfall expected in 48 hours. Secure mature wheat crop immediately.'), impact: t('suggestions.impact_high', 'High Impact') },
    { title: t('suggestions.fungicide_title', 'Fungicide schedule'), desc: t('suggestions.fungicide_desc', 'Moist weather increases fungal risk for flowering tomato beds.'), impact: t('suggestions.impact_medium', 'Medium Impact') },
  ];

  const recentConversations: ChatItem[] = [
    { id: '1', query: t('chats.query_leaf_spot', 'How to manage leaf spot in tomatoes?'), time: t('time.3h_ago', '3h ago') },
    { id: '2', query: t('chats.query_npk_ratio', 'Best NPK ratio for seed germination'), time: t('time.yesterday', 'Yesterday') },
  ];

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Farmer';
  const displayLocation = [profile?.village, profile?.district, profile?.state].filter(Boolean).join(', ') || t('location.lucknow', 'Lucknow, Uttar Pradesh');

  const displayReminders = realReminders.length > 0 ? realReminders : reminders;
  const displayChats = realChats.length > 0 ? realChats : recentConversations;

  const displayCrops = useMemo(() => {
    if (profile?.primary_crops && profile.primary_crops.length > 0) {
      return profile.primary_crops.slice(0, 3).map((cropName: string, idx: number) => {
        const cropClean = cropName.trim();
        const stages = [t('crop_stages.seedling', 'Seedling'), t('crop_stages.flowering', 'Flowering'), t('crop_stages.ripening', 'Ripening')];
        const healths = [95, 88, 92];
        const areas = [`${(Number(profile.farm_area_acres) || 3) / 2} ${t('ui.acres', 'acres')}`, `1.0 ${t('ui.acres', 'acres')}`, `2.0 ${t('ui.acres', 'acres')}`];
        const actions = [t('actions.first_watering', 'First watering due'), t('actions.apply_fungicide', 'Apply fungicide'), t('actions.harvest_12_days', 'Harvest in 12 days')];
        return {
          name: t('crops.' + cropClean.toLowerCase(), cropClean),
          stage: stages[idx % 3],
          health: healths[idx % 3],
          area: areas[idx % 3],
          nextAction: actions[idx % 3]
        };
      });
    }
    return recentCrops;
  }, [profile?.primary_crops, profile?.farm_area_acres, t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="page-container max-w-7xl mx-auto space-y-6"
    >
      {/* SaaS Premium Header Bar */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div>
          <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider">{t('dashboard.welcome', 'Welcome back')}</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white font-display mt-0.5">{displayName} 👋</h1>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4 text-primary-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{displayLocation}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/50 p-2 rounded-xl border border-gray-100 dark:border-slate-800">
          <CalendarDays className="w-5 h-5 text-gray-500" />
          <div className="text-left">
            <p className="text-[10px] text-gray-400 uppercase font-semibold">{t('dashboard.system_time', 'System Time')}</p>
            <p className="font-bold text-gray-900 dark:text-white text-xs">
              {new Date().toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'bn' ? 'bn-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Grid Layout: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Weather & Quick Actions Combo Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <motion.div variants={itemVariants}>
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl p-6 shadow-md h-full flex flex-col justify-between min-h-[220px]">
                <div className="absolute top-[-20%] right-[-10%] w-36 h-36 rounded-full bg-yellow-400/20 blur-xl"></div>
                
                {weatherLoading ? (
                  <div className="flex flex-col items-center justify-center h-full py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-white/80" />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider text-white">{t('dashboard.weather_today', 'Weather Today')}</span>
                        <h3 className="text-sm text-white/80 mt-2 font-medium">
                          {weatherData ? getConditionText(weatherData.code) : t('weather.partly_cloudy', 'Partly Cloudy')}
                        </h3>
                      </div>
                      <span className="text-4xl">
                        {weatherData ? getConditionIcon(weatherData.code) : '⛅'}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-baseline">
                        <span className="text-5xl font-extrabold font-display">
                          {weatherData ? weatherData.temp : 28}°
                        </span>
                        <span className="text-xl ml-1">C</span>
                      </div>
                      <div className="flex gap-4 mt-3 text-xs text-white/70">
                        <div className="flex items-center gap-1">
                          <Wind className="w-3.5 h-3.5" /> {weatherData ? weatherData.wind : 12} {t('ui.kmh', 'km/h')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5" /> {weatherData ? weatherData.humidity : 68}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/10">
                      {(weatherData?.daily || [
                        { day: 'mon', code: 2, temp: 28 },
                        { day: 'tue', code: 3, temp: 26 },
                        { day: 'wed', code: 61, temp: 24 },
                        { day: 'thu', code: 0, temp: 31 }
                      ]).map((item: any, i: number) => (
                        <div key={i} className="text-center">
                          <p className="text-[10px] text-white/50">{t(`days.${item.day}`, item.day)}</p>
                          <p className="text-sm my-0.5">{getConditionIcon(item.code)}</p>
                          <p className="text-xs font-bold text-white">{item.temp}°</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Quick Actions Widget */}
            <motion.div variants={itemVariants}>
              <Card className="p-6 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-slate-400 mb-3">{t('dashboard.quick_actions', 'Quick Actions')}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action) => (
                      <Link
                        key={action.path}
                        to={action.path}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${action.color} ${action.hoverColor} hover:scale-[1.02] active:scale-[0.98]`}
                      >
                        <div className="flex-shrink-0">{action.icon}</div>
                        <span className="text-xs font-bold leading-tight">{t(action.labelKey, action.defaultLabel)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

          </div>

          {/* Crop Health Widget */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-slate-400">{t('dashboard.crop_health_index', 'Crop Health Index')}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('dashboard.crop_metrics', 'Active crop metrics & diagnostics')}</p>
                </div>
                <Link to="/crop-guide" className="text-primary-600 dark:text-primary-400 text-xs font-bold hover:underline flex items-center gap-0.5">
                  {t('dashboard.analyze_crops', 'Analyze Crops')} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {displayCrops.map((crop) => (
                  <div key={crop.name} className="p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{crop.name}</span>
                        <Badge variant={crop.health >= 90 ? 'green' : crop.health >= 75 ? 'yellow' : 'red'}>
                          {crop.health}%
                        </Badge>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">{crop.area} • {crop.stage}</p>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${crop.health}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium truncate">{t('ui.next', 'Next')}: {crop.nextAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* AI Suggestions & Insights */}
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 shadow-sm">
              <div className="absolute top-0 right-0 p-4">
                <Sparkles className="w-6 h-6 text-indigo-500/30 animate-pulse" />
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-slate-400">{t('dashboard.ai_suggestions', 'Gemma AI Suggestions')}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('dashboard.realtime_advisory', 'Real-time advisory suggestions')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiSuggestions.map((sug, i) => (
                  <div key={i} className="p-4 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200">{sug.title}</h4>
                        <span className="text-[9px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                          {sug.impact}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{sug.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

        {/* Right Sidebar Columns (1 Column wide) */}
        <div className="space-y-6">
          
          {/* Market Prices Widget */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-slate-400">{t('dashboard.market_today', 'Market Today')}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.current_mandi', 'Current Mandi rates')}</p>
                </div>
                <Link to="/market" className="text-primary-600 dark:text-primary-400 text-xs font-bold hover:underline">
                  {t('dashboard.view_all', 'View All')}
                </Link>
              </div>

              <div className="space-y-3">
                {marketPrices.map((item) => (
                  <div key={item.crop} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-800/50 rounded-xl">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{item.crop}</span>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-gray-900 dark:text-white">{item.price}<span className="text-[10px] text-gray-400"> {item.unit}</span></p>
                      <p className={`text-[10px] font-bold ${item.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {item.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Smart Reminders Widget */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-slate-400">{t('nav.reminders', 'Reminders')}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.task_schedules', 'Task schedules')}</p>
                </div>
                <Link to="/reminders" className="text-primary-600 dark:text-primary-400 text-xs font-bold hover:underline">
                  {t('ui.manage', 'Manage')}
                </Link>
              </div>

              <div className="space-y-2.5">
                {displayReminders.map((rem) => (
                  <div key={rem.id} className="flex items-start gap-3 p-3 bg-gray-50/50 dark:bg-slate-800/30 rounded-xl border border-gray-100 dark:border-slate-800/50">
                    <button className="mt-0.5">
                      <CheckCircle2 className={`w-4 h-4 ${rem.done ? 'text-emerald-500 fill-emerald-500/10' : 'text-gray-300 dark:text-slate-600'}`} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold text-gray-700 dark:text-gray-300 truncate ${rem.done ? 'line-through opacity-55' : ''}`}>{rem.task}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{rem.due}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Conversations */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-slate-400">{t('dashboard.recent_chats', 'Recent Chats')}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.ai_consultations', 'AI Consultations')}</p>
                </div>
                <Link to="/chat" className="text-primary-600 dark:text-primary-400 text-xs font-bold hover:underline">
                  {t('dashboard.new_chat', 'New Chat')}
                </Link>
              </div>

              <div className="space-y-2.5">
                {displayChats.map((chat) => (
                  <Link key={chat.id} to="/chat" className="block p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{chat.query}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{chat.time}</p>
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Latest Disease Reports */}
          <motion.div variants={itemVariants}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-slate-400">{t('dashboard.disease_warnings', 'Disease Warnings')}</h3>
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
              </div>
              <div className="space-y-2.5">
                {diseaseReports.map((alert, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-xs font-medium ${
                      alert.type === 'warning'
                        ? 'bg-amber-500/[0.04] border-amber-500/20 text-amber-700 dark:text-amber-300'
                        : 'bg-rose-500/[0.04] border-rose-500/20 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-base leading-none">{alert.icon}</span>
                      <div>
                        <p className="leading-snug">{alert.message}</p>
                        <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1 font-semibold">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </motion.div>
  );
};

export default Dashboard;
