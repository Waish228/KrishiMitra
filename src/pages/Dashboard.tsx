import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf, CloudSun, TrendingUp, Droplets, MessageSquare,
  FlaskConical, BookOpen, Bell, ArrowRight, ThumbsUp,
  AlertTriangle, Sun, Wind, Thermometer, MapPin
} from 'lucide-react';
import { StatCard, Card, Badge, PageHeader } from '../components/ui/Components';
import { getGreeting } from '../lib/utils';

const quickActions = [
  { icon: <Leaf className="w-5 h-5" />, label: 'Scan Disease', path: '/disease', color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
  { icon: <MessageSquare className="w-5 h-5" />, label: 'Ask AI', path: '/chat', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
  { icon: <TrendingUp className="w-5 h-5" />, label: 'Market', path: '/market', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
  { icon: <Droplets className="w-5 h-5" />, label: 'Irrigation', path: '/irrigation', color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400' },
  { icon: <FlaskConical className="w-5 h-5" />, label: 'Fertilizer', path: '/fertilizer', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
  { icon: <BookOpen className="w-5 h-5" />, label: 'Crop Guide', path: '/crop-guide', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
];

const alerts = [
  { type: 'warning', icon: '🌧️', message: 'Heavy rainfall expected in next 48 hours. Consider harvesting early.', time: '2h ago' },
  { type: 'success', icon: '📈', message: 'Wheat prices up 8% at nearby Mandi. Good time to sell!', time: '4h ago' },
  { type: 'danger', icon: '🐛', message: 'High pest alert: Fall armyworm reported in your region.', time: '1d ago' },
];

const recentCrops = [
  { name: 'Wheat', stage: 'Ripening', health: 92, area: '3.5 acres', nextAction: 'Harvest in 12 days' },
  { name: 'Tomato', stage: 'Flowering', health: 78, area: '1.2 acres', nextAction: 'Apply fungicide' },
  { name: 'Mustard', stage: 'Seedling', health: 95, area: '2.0 acres', nextAction: 'First watering due' },
];

const marketPrices = [
  { crop: '🌾 Wheat', price: '₹2,340', change: '+₹120', positive: true, unit: '/qtl' },
  { crop: '🍅 Tomato', price: '₹1,800', change: '-₹200', positive: false, unit: '/qtl' },
  { crop: '🧅 Onion', price: '₹1,200', change: '+₹80', positive: true, unit: '/qtl' },
  { crop: '🌽 Maize', price: '₹1,950', change: '+₹30', positive: true, unit: '/qtl' },
];

const Dashboard: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="page-container"
    >
      {/* Greeting */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{getGreeting()},</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Ramesh Singh 👋</h1>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-xs text-gray-400">Lucknow, Uttar Pradesh</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-slate-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Weather Summary Card */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="bg-card-gradient-green rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/70 text-sm mb-1">Current Weather</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold">28°</span>
                <span className="text-white/80 text-lg mb-1">Partly Cloudy</span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
                <span className="flex items-center gap-1"><Wind className="w-4 h-4" /> 12 km/h</span>
                <span className="flex items-center gap-1"><Droplets className="w-4 h-4" /> 68%</span>
                <span className="flex items-center gap-1"><Sun className="w-4 h-4" /> UV 6</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-6xl">⛅</span>
              <p className="text-white/70 text-xs mt-2">Lucknow, UP</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4 bg-white/10 rounded-xl p-3">
            {['Mon','Tue','Wed','Thu'].map((day, i) => (
              <div key={day} className="text-center">
                <p className="text-white/60 text-xs">{day}</p>
                <p className="text-lg my-1">{['⛅','☁️','🌧️','☀️'][i]}</p>
                <p className="text-white text-xs font-medium">{[28, 26, 24, 31][i]}°</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Farm Area"
          value="6.7 ac"
          subtitle="3 active crops"
          icon={<Leaf className="w-5 h-5" />}
          gradient="green"
        />
        <StatCard
          title="Crop Health"
          value="87%"
          subtitle="Above average"
          icon={<ThumbsUp className="w-5 h-5" />}
          trend={{ value: 5, positive: true }}
        />
        <StatCard
          title="Water Usage"
          value="1,240L"
          subtitle="This week"
          icon={<Droplets className="w-5 h-5" />}
          trend={{ value: 12, positive: false }}
        />
        <StatCard
          title="Est. Revenue"
          value="₹82K"
          subtitle="This season"
          icon={<TrendingUp className="w-5 h-5" />}
          gradient="earth"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl ${action.color} transition-all duration-200 hover:scale-105 active:scale-95`}
            >
              {action.icon}
              <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Crops */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">My Crops</h2>
            <Link to="/crop-guide" className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentCrops.map((crop) => (
              <Card key={crop.name} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{crop.name}</p>
                      <p className="text-xs text-gray-400">{crop.area} • {crop.stage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end mb-1">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{crop.health}%</span>
                    </div>
                    <Badge variant={crop.health >= 90 ? 'green' : crop.health >= 75 ? 'yellow' : 'red'}>
                      {crop.health >= 90 ? 'Excellent' : crop.health >= 75 ? 'Good' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${crop.health}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    📋 Next: {crop.nextAction}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Sidebar panels */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Alerts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Alerts</h2>
              <Bell className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-sm ${
                    alert.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800'
                      : alert.type === 'success'
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
                      : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">{alert.icon}</span>
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 text-xs leading-snug">{alert.message}</p>
                      <p className="text-gray-400 text-xs mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Prices */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Market Today</h2>
              <Link to="/market" className="text-primary-600 dark:text-primary-400 text-xs font-medium hover:underline">View all</Link>
            </div>
            <Card className="divide-y divide-gray-100 dark:divide-slate-700">
              {marketPrices.map((item) => (
                <div key={item.crop} className="flex items-center justify-between p-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.crop}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{item.price}<span className="text-xs text-gray-400">{item.unit}</span></p>
                    <p className={`text-xs font-medium ${item.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {item.change}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
