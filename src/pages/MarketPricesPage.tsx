import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Search, Filter,
  MapPin, Bell, ArrowUpRight, BarChart2, Star
} from 'lucide-react';
import { Card, PageHeader, Badge } from '../components/ui/Components';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { cn } from '../lib/utils';

const marketData = [
  { crop: '🌾 Wheat', variety: 'Sharbati', price: 2340, change: 120, unit: 'qtl', market: 'Lucknow', positive: true, trend: 'up', starred: true },
  { crop: '🍅 Tomato', variety: 'Desi', price: 1800, change: -200, unit: 'qtl', market: 'Kanpur', positive: false, trend: 'down', starred: true },
  { crop: '🧅 Onion', variety: 'Red', price: 1200, change: 80, unit: 'qtl', market: 'Varanasi', positive: true, trend: 'up', starred: false },
  { crop: '🌽 Maize', variety: 'Hybrid', price: 1950, change: 30, unit: 'qtl', market: 'Lucknow', positive: true, trend: 'up', starred: false },
  { crop: '🥔 Potato', variety: 'Jyoti', price: 900, change: -50, unit: 'qtl', market: 'Agra', positive: false, trend: 'down', starred: true },
  { crop: '🌿 Mustard', variety: 'RSSC', price: 5800, change: 200, unit: 'qtl', market: 'Jhansi', positive: true, trend: 'up', starred: false },
  { crop: '🍚 Rice', variety: 'Basmati', price: 3200, change: -100, unit: 'qtl', market: 'Gorakhpur', positive: false, trend: 'down', starred: false },
  { crop: '🥦 Cauliflower', variety: 'Snowball', price: 1400, change: 300, unit: 'qtl', market: 'Lucknow', positive: true, trend: 'up', starred: false },
];

const priceHistory = [
  { date: 'Jan', wheat: 2100, tomato: 2200, onion: 1000 },
  { date: 'Feb', wheat: 2200, tomato: 1900, onion: 1100 },
  { date: 'Mar', wheat: 2150, tomato: 1600, onion: 900 },
  { date: 'Apr', wheat: 2250, tomato: 2100, onion: 1050 },
  { date: 'May', wheat: 2280, tomato: 2400, onion: 1150 },
  { date: 'Jun', wheat: 2340, tomato: 1800, onion: 1200 },
];

const mandis = ['All Mandis', 'Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Jhansi', 'Gorakhpur'];

const MarketPricesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedMandi, setSelectedMandi] = useState('All Mandis');
  const [showOnlyStarred, setShowOnlyStarred] = useState(false);
  const [starred, setStarred] = useState<Set<string>>(
    new Set(marketData.filter(d => d.starred).map(d => d.crop))
  );

  const filtered = marketData.filter(d => {
    const matchSearch = d.crop.toLowerCase().includes(search.toLowerCase());
    const matchMandi = selectedMandi === 'All Mandis' || d.market === selectedMandi;
    const matchStarred = !showOnlyStarred || starred.has(d.crop);
    return matchSearch && matchMandi && matchStarred;
  });

  const toggleStar = (crop: string) => {
    setStarred(prev => {
      const next = new Set(prev);
      next.has(crop) ? next.delete(crop) : next.add(crop);
      return next;
    });
  };

  const topGainers = [...marketData].filter(d => d.positive).sort((a, b) => b.change - a.change).slice(0, 3);
  const topLosers = [...marketData].filter(d => !d.positive).sort((a, b) => a.change - b.change).slice(0, 3);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 shadow-lg text-xs">
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color }}>
              {p.name.charAt(0).toUpperCase() + p.name.slice(1)}: ₹{p.value}/qtl
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Market Prices"
        subtitle="Live Mandi rates and AI price predictions"
        action={
          <button className="btn-secondary flex items-center gap-2 text-xs py-2">
            <Bell className="w-3.5 h-3.5" />
            Price Alerts
          </button>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Markets Today</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">247</p>
          <p className="text-xs text-green-500">+12 active</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Gainers</p>
          <p className="text-xl font-bold text-green-600">14</p>
          <p className="text-xs text-gray-400">of 22 crops</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Losers</p>
          <p className="text-xl font-bold text-red-500">8</p>
          <p className="text-xs text-gray-400">of 22 crops</p>
        </Card>
      </div>

      {/* Price Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">6-Month Price Trends</h2>
              <p className="text-xs text-gray-400">Wheat • Tomato • Onion (₹/quintal)</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-1 bg-primary-500 rounded-full inline-block" />Wheat</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1 bg-red-500 rounded-full inline-block" />Tomato</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1 bg-amber-500 rounded-full inline-block" />Onion</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={priceHistory}>
              <defs>
                <linearGradient id="wheatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tomatoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="wheat" stroke="#16a34a" fill="url(#wheatGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="tomato" stroke="#ef4444" fill="url(#tomatoGrad)" strokeWidth={2} />
              <Line type="monotone" dataKey="onion" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Gainers & Losers */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="font-semibold text-green-600 dark:text-green-400 text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Top Gainers
          </h3>
          <div className="space-y-2">
            {topGainers.map((item) => (
              <div key={item.crop} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.crop}</span>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />+₹{item.change}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-red-600 dark:text-red-400 text-sm mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> Top Losers
          </h3>
          <div className="space-y-2">
            {topLosers.map((item) => (
              <div key={item.crop} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.crop}</span>
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                  ₹{item.change}/qtl
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Price Table */}
      <div>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search crop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              id="market-search"
            />
          </div>
          <select
            value={selectedMandi}
            onChange={(e) => setSelectedMandi(e.target.value)}
            className="input-field w-auto"
            id="mandi-select"
          >
            {mandis.map(m => <option key={m}>{m}</option>)}
          </select>
          <button
            onClick={() => setShowOnlyStarred(!showOnlyStarred)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
              showOnlyStarred
                ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400'
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'
            )}
          >
            <Star className={cn('w-4 h-4', showOnlyStarred ? 'fill-amber-400 text-amber-400' : '')} />
            Watchlist
          </button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700/50 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Crop</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Market</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Price</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Change</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Watch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map((item) => (
                  <motion.tr
                    key={item.crop}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.crop}</p>
                        <p className="text-xs text-gray-400">{item.variety}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3 h-3" />{item.market}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        ₹{item.price.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-400">/{item.unit}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={cn(
                        'inline-flex items-center gap-0.5 text-xs font-semibold',
                        item.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      )}>
                        {item.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {item.positive ? '+' : ''}₹{item.change}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => toggleStar(item.crop)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Star className={cn(
                          'w-4 h-4 transition-colors',
                          starred.has(item.crop) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-slate-600'
                        )} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MarketPricesPage;
