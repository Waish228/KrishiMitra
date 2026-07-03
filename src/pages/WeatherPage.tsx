import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wind, Droplets, Eye, Gauge, Sunrise, Sunset,
  Thermometer, CloudRain, MapPin, RefreshCw
} from 'lucide-react';
import { Card, PageHeader, Badge } from '../components/ui/Components';
import { cn } from '../lib/utils';

const hourlyForecast = [
  { time: '6 AM', temp: 22, icon: '🌤️', rain: 0 },
  { time: '9 AM', temp: 25, icon: '⛅', rain: 0 },
  { time: '12 PM', temp: 28, icon: '☀️', rain: 0 },
  { time: '3 PM', temp: 30, icon: '🌤️', rain: 10 },
  { time: '6 PM', temp: 27, icon: '🌦️', rain: 40 },
  { time: '9 PM', temp: 24, icon: '🌧️', rain: 70 },
  { time: '12 AM', temp: 21, icon: '🌙', rain: 20 },
];

const weeklyForecast = [
  { day: 'Today', high: 30, low: 22, icon: '⛅', condition: 'Partly Cloudy', rain: 10, wind: 12 },
  { day: 'Tue', high: 28, low: 20, icon: '🌧️', condition: 'Light Rain', rain: 70, wind: 18 },
  { day: 'Wed', high: 24, low: 18, icon: '⛈️', condition: 'Thunderstorm', rain: 90, wind: 25 },
  { day: 'Thu', high: 27, low: 19, icon: '🌦️', condition: 'Showers', rain: 50, wind: 15 },
  { day: 'Fri', high: 31, low: 22, icon: '☀️', condition: 'Sunny', rain: 0, wind: 8 },
  { day: 'Sat', high: 33, low: 24, icon: '☀️', condition: 'Sunny', rain: 0, wind: 6 },
  { day: 'Sun', high: 29, low: 21, icon: '⛅', condition: 'Partly Cloudy', rain: 20, wind: 10 },
];

const farmingAdvisory = [
  { icon: '🚜', title: 'Field Work', advice: 'Avoid field operations tomorrow due to expected heavy rain.', urgency: 'warning' },
  { icon: '💧', title: 'Irrigation', advice: 'Skip irrigation for next 48 hours — rainfall expected to meet crop needs.', urgency: 'info' },
  { icon: '🌿', title: 'Spray Advisory', advice: 'Do not spray pesticides/fungicides today — winds above 15 km/h.', urgency: 'warning' },
  { icon: '🌾', title: 'Harvest Advisory', advice: 'Ideal conditions for wheat harvesting Fri-Sat. Plan accordingly.', urgency: 'success' },
];

const WeatherPage: React.FC = () => {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <div className="page-container">
      <PageHeader
        title="Weather Forecast"
        subtitle="Hyperlocal farming weather intelligence"
        action={
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />

      {/* Location Bar */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400">
        <MapPin className="w-4 h-4 text-primary-500" />
        <span>Lucknow, Uttar Pradesh • Updated 5 mins ago</span>
      </div>

      {/* Current Weather Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="bg-card-gradient-green p-6 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 opacity-10 text-[180px] leading-none">⛅</div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-end gap-3">
                  <span className="text-8xl font-bold font-display leading-none">28°</span>
                  <div className="mb-3">
                    <p className="text-white/80 text-xl">Partly Cloudy</p>
                    <p className="text-white/60 text-sm">Feels like 31°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4 text-sm text-white/70">
                  <span className="flex items-center gap-1.5"><Wind className="w-4 h-4" /> 12 km/h NW</span>
                  <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4" /> 68% Humidity</span>
                  <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> 10 km Visibility</span>
                </div>
              </div>
            </div>

            {/* Sun times */}
            <div className="grid grid-cols-4 gap-3 mt-6 bg-white/10 rounded-2xl p-4">
              <div className="text-center">
                <Sunrise className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
                <p className="text-white/60 text-xs">Sunrise</p>
                <p className="text-white font-semibold text-sm">5:42 AM</p>
              </div>
              <div className="text-center">
                <Sunset className="w-5 h-5 mx-auto mb-1 text-orange-300" />
                <p className="text-white/60 text-xs">Sunset</p>
                <p className="text-white font-semibold text-sm">7:18 PM</p>
              </div>
              <div className="text-center">
                <Gauge className="w-5 h-5 mx-auto mb-1 text-blue-300" />
                <p className="text-white/60 text-xs">Pressure</p>
                <p className="text-white font-semibold text-sm">1012 hPa</p>
              </div>
              <div className="text-center">
                <CloudRain className="w-5 h-5 mx-auto mb-1 text-cyan-300" />
                <p className="text-white/60 text-xs">Rain Chance</p>
                <p className="text-white font-semibold text-sm">10%</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Hourly Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <h2 className="section-title mb-3">Hourly Forecast</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {hourlyForecast.map((h, i) => (
            <div
              key={i}
              className={cn(
                'flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl border w-20',
                i === 2
                  ? 'bg-primary-600 border-primary-600 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-700 dark:text-gray-300'
              )}
            >
              <p className={cn('text-xs font-medium', i === 2 ? 'text-white/70' : 'text-gray-400 dark:text-gray-500')}>{h.time}</p>
              <span className="text-2xl">{h.icon}</span>
              <p className="font-bold text-base">{h.temp}°</p>
              {h.rain > 0 && (
                <p className={cn('text-xs', i === 2 ? 'text-blue-200' : 'text-blue-500 dark:text-blue-400')}>
                  💧{h.rain}%
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* 7-Day Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <h2 className="section-title mb-3">7-Day Forecast</h2>
        <Card className="divide-y divide-gray-100 dark:divide-slate-700">
          {weeklyForecast.map((day, i) => (
            <div
              key={i}
              onClick={() => setActiveDay(i)}
              className={cn(
                'flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors',
                activeDay === i ? 'bg-primary-50 dark:bg-primary-900/10' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
              )}
            >
              <p className={cn('w-12 text-sm font-medium', activeDay === i ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400')}>
                {day.day}
              </p>
              <span className="text-2xl flex-shrink-0">{day.icon}</span>
              <p className="flex-1 text-sm text-gray-500 dark:text-gray-400 hidden sm:block">{day.condition}</p>
              <div className="flex items-center gap-2 text-xs text-blue-500">
                <Droplets className="w-3 h-3" />
                <span>{day.rain}%</span>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">{day.high}°</span>
                <span className="text-sm text-gray-400">{day.low}°</span>
              </div>
            </div>
          ))}
        </Card>
      </motion.div>

      {/* Farming Advisory */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="section-title mb-3">🌾 Farming Advisory</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {farmingAdvisory.map((adv, i) => (
            <div
              key={i}
              className={cn(
                'p-4 rounded-2xl border text-sm',
                adv.urgency === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                  : adv.urgency === 'success'
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                  : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{adv.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{adv.title}</p>
                  <p className="text-gray-600 dark:text-gray-400 leading-snug text-xs">{adv.advice}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default WeatherPage;
