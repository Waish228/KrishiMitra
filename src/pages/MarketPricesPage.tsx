import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Search,
  MapPin, Bell, ArrowUpRight, Star, Sparkles, X, Store, Loader2
} from 'lucide-react';
import { Card, PageHeader } from '../components/ui/Components';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, Line
} from 'recharts';
import { cn } from '../lib/utils';
import { generateMarketIntelligence } from '../api/ai/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../contexts/AuthContext';
import type { SupportedLanguage } from '../api/ai/prompts';

interface CropData {
  crop: string;
  variety: string;
  price: number;
  change: number;
  unit: string;
  market: string;
  positive: boolean;
  trend: string;
  starred: boolean;
  historyKey: string;
  color: string;
}

const marketData: CropData[] = [
  { crop: '🌾 Wheat', variety: 'Sharbati', price: 2340, change: 120, unit: 'qtl', market: 'Lucknow', positive: true, trend: 'up', starred: true, historyKey: 'wheat', color: '#16a34a' },
  { crop: '🍅 Tomato', variety: 'Desi', price: 1800, change: -200, unit: 'qtl', market: 'Kanpur', positive: false, trend: 'down', starred: true, historyKey: 'tomato', color: '#ef4444' },
  { crop: '🧅 Onion', variety: 'Red', price: 1200, change: 80, unit: 'qtl', market: 'Varanasi', positive: true, trend: 'up', starred: false, historyKey: 'onion', color: '#f59e0b' },
  { crop: '🌽 Maize', variety: 'Hybrid', price: 1950, change: 30, unit: 'qtl', market: 'Lucknow', positive: true, trend: 'up', starred: false, historyKey: 'maize', color: '#eab308' },
  { crop: '🥔 Potato', variety: 'Jyoti', price: 900, change: -50, unit: 'qtl', market: 'Agra', positive: false, trend: 'down', starred: true, historyKey: 'potato', color: '#8b5cf6' },
  { crop: '🌿 Mustard', variety: 'RSSC', price: 5800, change: 200, unit: 'qtl', market: 'Jhansi', positive: true, trend: 'up', starred: false, historyKey: 'mustard', color: '#10b981' },
];

const priceHistory = [
  { date: 'Jan', wheat: 2100, tomato: 2200, onion: 1000, maize: 1800, potato: 1100, mustard: 5500 },
  { date: 'Feb', wheat: 2200, tomato: 1900, onion: 1100, maize: 1850, potato: 1050, mustard: 5600 },
  { date: 'Mar', wheat: 2150, tomato: 1600, onion: 900, maize: 1820, potato: 950, mustard: 5400 },
  { date: 'Apr', wheat: 2250, tomato: 2100, onion: 1050, maize: 1900, potato: 1000, mustard: 5700 },
  { date: 'May', wheat: 2280, tomato: 2400, onion: 1150, maize: 1920, potato: 900, mustard: 5650 },
  { date: 'Jun', wheat: 2340, tomato: 1800, onion: 1200, maize: 1950, potato: 850, mustard: 5800 },
];

const mandis = ['All Mandis', 'Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Jhansi'];

export default function MarketPricesPage() {
  const { profile } = useAuth();
  const selectedLanguage = (profile?.preferred_language as SupportedLanguage) || 'English';

  const [search, setSearch] = useState('');
  const [selectedMandi, setSelectedMandi] = useState('All Mandis');
  const [showOnlyStarred, setShowOnlyStarred] = useState(false);
  const [starred, setStarred] = useState<Set<string>>(new Set(marketData.filter(d => d.starred).map(d => d.crop)));
  
  // AI Panel State
  const [selectedCrop, setSelectedCrop] = useState<CropData | null>(null);
  const [aiStream, setAiStream] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const filtered = marketData.filter(d => {
    const matchSearch = d.crop.toLowerCase().includes(search.toLowerCase());
    const matchMandi = selectedMandi === 'All Mandis' || d.market === selectedMandi;
    const matchStarred = !showOnlyStarred || starred.has(d.crop);
    return matchSearch && matchMandi && matchStarred;
  });

  const toggleStar = (e: React.MouseEvent, crop: string) => {
    e.stopPropagation(); // Prevent row click
    setStarred(prev => {
      const next = new Set(prev);
      next.has(crop) ? next.delete(crop) : next.add(crop);
      return next;
    });
  };

  const handleCropClick = async (crop: CropData) => {
    setSelectedCrop(crop);
    setAiStream('');
    setIsGenerating(true);

    try {
      const stream = generateMarketIntelligence(
          crop.crop.replace(/[^a-zA-Z ]/g, ''), // Remove emoji
          crop.price,
          crop.positive ? 'Upward' : 'Downward',
          crop.market,
          selectedLanguage
      );
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setAiStream(fullText);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const topGainers = [...marketData].filter(d => d.positive).sort((a, b) => b.change - a.change).slice(0, 3);
  const topLosers = [...marketData].filter(d => !d.positive).sort((a, b) => a.change - b.change).slice(0, 3);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 shadow-lg text-xs z-50">
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
    <div className="page-container max-w-6xl mx-auto">
      <PageHeader
        title="Market Prices"
        subtitle="Live Mandi rates & AI market intelligence"
        action={
          <button className="btn-secondary flex items-center gap-2 text-xs py-2">
            <Bell className="w-3.5 h-3.5" />
            Price Alerts
          </button>
        }
      />

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Table and List */}
        <div className={cn("transition-all duration-300", selectedCrop ? "lg:col-span-7" : "lg:col-span-12")}>
            
            {/* Stats - Only show when no crop is selected to save space */}
            {!selectedCrop && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card className="p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Markets Today</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">247</p>
                    <p className="text-xs text-green-500">+12 active</p>
                    </Card>
                    <Card className="p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Gainers</p>
                    <p className="text-xl font-bold text-green-600">{topGainers.length}</p>
                    <p className="text-xs text-gray-400">trending up</p>
                    </Card>
                    <Card className="p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Losers</p>
                    <p className="text-xl font-bold text-red-500">{topLosers.length}</p>
                    <p className="text-xs text-gray-400">trending down</p>
                    </Card>
                </div>
            )}

            {/* Price Table Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search crop..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
                <select
                    value={selectedMandi}
                    onChange={(e) => setSelectedMandi(e.target.value)}
                    className="input-field w-auto"
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

            <Card className="overflow-hidden mb-6">
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
                            onClick={() => handleCropClick(item)}
                            className={cn(
                                "transition-colors cursor-pointer",
                                selectedCrop?.crop === item.crop 
                                    ? "bg-primary-50 dark:bg-primary-900/20" 
                                    : "hover:bg-gray-50 dark:hover:bg-slate-700/30"
                            )}
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
                                onClick={(e) => toggleStar(e, item.crop)}
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

        {/* Right Column: AI Insights & Charts */}
        <AnimatePresence mode="wait">
            {selectedCrop && (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="lg:col-span-5 space-y-6"
                >
                    {/* Interactive Chart */}
                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    {selectedCrop.crop} Trend
                                </h2>
                                <p className="text-xs text-gray-400">6-Month historical price (₹/quintal)</p>
                            </div>
                            <button onClick={() => setSelectedCrop(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={priceHistory}>
                                    <defs>
                                        <linearGradient id={`grad-${selectedCrop.historyKey}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={selectedCrop.color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={selectedCrop.color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-slate-700" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} domain={['dataMin - 100', 'dataMax + 100']} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey={selectedCrop.historyKey} 
                                        stroke={selectedCrop.color} 
                                        fill={`url(#grad-${selectedCrop.historyKey})`} 
                                        strokeWidth={2} 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* AI Market Intelligence */}
                    <Card className="p-5 border border-primary-100 dark:border-primary-900/50 bg-primary-50/30 dark:bg-primary-900/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-primary-500" />
                            AI Market Intelligence
                            {isGenerating && <Loader2 className="w-4 h-4 text-primary-400 animate-spin ml-auto" />}
                        </h3>
                        
                        <div className="prose prose-sm dark:prose-invert">
                            {aiStream ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiStream}</ReactMarkdown>
                            ) : (
                                <p className="text-gray-400 italic">Analyzing market dynamics, supply trends, and seasonal demand for {selectedCrop.crop}...</p>
                            )}
                        </div>
                    </Card>

                    {/* Nearby Markets Widget */}
                    <Card className="p-5">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4 text-sm">
                            <Store className="w-4 h-4 text-amber-500" />
                            Nearby Markets ({selectedCrop.crop.split(' ')[1]})
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                                <div>
                                    <p className="text-sm font-medium">Kanpur Mandi</p>
                                    <p className="text-xs text-gray-500">45 km away</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">₹{selectedCrop.price + 80}</p>
                                    <p className="text-xs text-green-500">+₹80</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                                <div>
                                    <p className="text-sm font-medium">Unnao Market</p>
                                    <p className="text-xs text-gray-500">22 km away</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">₹{selectedCrop.price - 40}</p>
                                    <p className="text-xs text-red-500">-₹40</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}
            
            {/* Show full generic chart if NO crop is selected */}
            {!selectedCrop && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="lg:col-span-12 mb-6"
                >
                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">6-Month Price Trends</h2>
                            <p className="text-xs text-gray-400">Wheat • Tomato • Onion (₹/quintal)</p>
                            </div>
                            <div className="flex gap-3 text-xs">
                            <span className="flex items-center gap-1"><span className="w-3 h-1 bg-green-600 rounded-full inline-block" />Wheat</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-1 bg-red-500 rounded-full inline-block" />Tomato</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-1 bg-amber-500 rounded-full inline-block" />Onion</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
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
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
