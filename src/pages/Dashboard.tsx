import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Leaf, CloudSun, TrendingUp, Droplets, MessageSquare,
  FlaskConical, BookOpen, Bell, ArrowRight, Sparkles,
  AlertTriangle, Sun, Wind, MapPin, CalendarDays, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Card, Badge } from '../components/ui/Components';
import { getGreeting } from '../lib/utils';

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
  const { t } = useTranslation();

  const quickActions: QuickActionItem[] = [
    { icon: <Leaf className="w-5 h-5" />, labelKey: 'dashboard.scan_crop', defaultLabel: 'Scan Disease', path: '/disease', color: 'bg-rose-500/10 text-rose-500 border border-rose-500/20', hoverColor: 'hover:bg-rose-500/20' },
    { icon: <MessageSquare className="w-5 h-5" />, labelKey: 'dashboard.ask_ai', defaultLabel: 'Ask AI', path: '/chat', color: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20', hoverColor: 'hover:bg-indigo-500/20' },
    { icon: <TrendingUp className="w-5 h-5" />, labelKey: 'dashboard.view_markets', defaultLabel: 'Market Prices', path: '/market', color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20', hoverColor: 'hover:bg-emerald-500/20' },
    { icon: <Droplets className="w-5 h-5" />, labelKey: 'nav.farming_planner', defaultLabel: 'Planner', path: '/planner', color: 'bg-sky-500/10 text-sky-500 border border-sky-500/20', hoverColor: 'hover:bg-sky-500/20' },
    { icon: <FlaskConical className="w-5 h-5" />, labelKey: 'nav.reminders', defaultLabel: 'Reminders', path: '/reminders', color: 'bg-amber-500/10 text-amber-500 border border-amber-500/20', hoverColor: 'hover:bg-amber-500/20' },
    { icon: <BookOpen className="w-5 h-5" />, labelKey: 'nav.crop_guide', defaultLabel: 'Crop Guide', path: '/crop-guide', color: 'bg-teal-500/10 text-teal-500 border border-teal-500/20', hoverColor: 'hover:bg-teal-500/20' },
  ];

  const diseaseReports: AlertItem[] = [
    { type: 'danger', icon: '🐛', message: 'High pest alert: Fall armyworm reported in Lucknow region.', time: '1d ago' },
    { type: 'warning', icon: '🍂', message: 'Late blight symptoms found in neighboring potato fields.', time: '2d ago' },
  ];

  const recentCrops: CropItem[] = [
    { name: 'Wheat', stage: 'Ripening', health: 92, area: '3.5 acres', nextAction: 'Harvest in 12 days' },
    { name: 'Tomato', stage: 'Flowering', health: 78, area: '1.2 acres', nextAction: 'Apply fungicide' },
    { name: 'Mustard', stage: 'Seedling', health: 95, area: '2.0 acres', nextAction: 'First watering due' },
  ];

  const marketPrices: MarketItem[] = [
    { crop: '🌾 Wheat', price: '₹2,340', change: '+₹120', positive: true, unit: '/qtl' },
    { crop: '🍅 Tomato', price: '₹1,800', change: '-₹200', positive: false, unit: '/qtl' },
    { crop: '🧅 Onion', price: '₹1,200', change: '+₹80', positive: true, unit: '/qtl' },
  ];

  const reminders: ReminderItem[] = [
    { id: '1', task: 'Water Tomato crop (Flower stage)', due: 'Today, 4:00 PM', done: false },
    { id: '2', task: 'Check Wheat moisture content', due: 'Tomorrow', done: false },
    { id: '3', task: 'Apply NPK Fertilizer to Mustard', due: 'Jul 8', done: true },
  ];

  const aiSuggestions: SuggestionItem[] = [
    { title: 'Early Harvesting Advised', desc: 'Rainfall expected in 48 hours. Secure mature wheat crop immediately.', impact: 'High Impact' },
    { title: 'Fungicide schedule', desc: 'Moist weather increases fungal risk for flowering tomato beds.', impact: 'Medium Impact' },
  ];

  const recentConversations: ChatItem[] = [
    { id: '1', query: 'How to manage leaf spot in tomatoes?', time: '3h ago' },
    { id: '2', query: 'Best NPK ratio for seed germination', time: 'Yesterday' },
  ];

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
          <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider">{getGreeting()}</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white font-display mt-0.5">Ramesh Singh 👋</h1>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4 text-primary-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Lucknow, Uttar Pradesh</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/50 p-2 rounded-xl border border-gray-100 dark:border-slate-800">
          <CalendarDays className="w-5 h-5 text-gray-500" />
          <div className="text-left">
            <p className="text-[10px] text-gray-400 uppercase font-semibold">System Time</p>
            <p className="font-bold text-gray-900 dark:text-white text-xs">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
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
            
            {/* Weather Widget */}
            <motion.div variants={itemVariants}>
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl p-6 shadow-md h-full flex flex-col justify-between min-h-[220px]">
                <div className="absolute top-[-20%] right-[-10%] w-36 h-36 rounded-full bg-yellow-400/20 blur-xl"></div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider text-white">Weather Today</span>
                    <h3 className="text-sm text-white/80 mt-2 font-medium">Partly Cloudy</h3>
                  </div>
                  <span className="text-4xl">⛅</span>
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold font-display">28°</span>
                    <span className="text-xl ml-1">C</span>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-white/70">
                    <div className="flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> 12 km/h</div>
                    <div className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5" /> 68%</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/10">
                  {['Mon', 'Tue', 'Wed', 'Thu'].map((day, i) => (
                    <div key={day} className="text-center">
                      <p className="text-[10px] text-white/50">{day}</p>
                      <p className="text-sm my-0.5">{['⛅', '☁️', '🌧️', '☀️'][i]}</p>
                      <p className="text-xs font-bold text-white">{[28, 26, 24, 31][i]}°</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Widget */}
            <motion.div variants={itemVariants}>
              <Card className="p-6 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-slate-400 mb-3">Quick Actions</h3>
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
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-slate-400">Crop Health Index</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Active crop metrics & diagnostics</p>
                </div>
                <Link to="/crop-guide" className="text-primary-600 dark:text-primary-400 text-xs font-bold hover:underline flex items-center gap-0.5">
                  Analyze Crops <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentCrops.map((crop) => (
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
                      <p className="text-[10px] text-gray-400 font-medium truncate">Next Action: {crop.nextAction}</p>
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
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-slate-400">Gemma AI Suggestions</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Real-time advisory suggestions</p>
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
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-slate-400">Market Today</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current Mandi rates</p>
                </div>
                <Link to="/market" className="text-primary-600 dark:text-primary-400 text-xs font-bold hover:underline">
                  View All
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
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-slate-400">Reminders</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Task schedules</p>
                </div>
                <Link to="/reminders" className="text-primary-600 dark:text-primary-400 text-xs font-bold hover:underline">
                  Manage
                </Link>
              </div>

              <div className="space-y-2.5">
                {reminders.map((rem) => (
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
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-slate-400">Recent Chats</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI Consultations</p>
                </div>
                <Link to="/chat" className="text-primary-600 dark:text-primary-400 text-xs font-bold hover:underline">
                  New Chat
                </Link>
              </div>

              <div className="space-y-2.5">
                {recentConversations.map((chat) => (
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
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-slate-400">Disease Warnings</h3>
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
