import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen, Droplets, Sun, Thermometer, Clock, ChevronRight, X } from 'lucide-react';
import { Card, Badge, PageHeader } from '../components/ui/Components';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface Crop {
    id: string;
    name: string;
    emoji: string;
    category: string;
    season: string;
    duration: string;
    waterNeed: 'Low' | 'Medium' | 'High';
    temperature: string;
    soilType: string;
    description: string;
    sowingTime: string;
    yieldPerAcre: string;
    commonDiseases: string[];
    tips: string[];
}

const crops: Crop[] = [
    {
        id: '1', name: 'Wheat', emoji: '🌾', category: 'Cereal', season: 'Rabi',
        duration: '120-150 days', waterNeed: 'Medium', temperature: '15-25°C',
        soilType: 'Loamy, Well-drained', description: 'Wheat is the most important cereal crop in India. It grows well in cool, dry climates.',
        sowingTime: 'Oct-Dec', yieldPerAcre: '18-22 quintals',
        commonDiseases: ['Leaf Rust', 'Stem Rust', 'Loose Smut', 'Powdery Mildew'],
        tips: ['Use certified seeds', 'Sow at correct depth (5cm)', 'Apply DAP at sowing', 'First irrigation at crown root stage'],
    },
    {
        id: '2', name: 'Rice', emoji: '🌾', category: 'Cereal', season: 'Kharif',
        duration: '100-150 days', waterNeed: 'High', temperature: '25-35°C',
        soilType: 'Clay, Waterlogged', description: 'Rice is the staple food crop requiring high water supply and warm temperatures.',
        sowingTime: 'Jun-Jul', yieldPerAcre: '20-28 quintals',
        commonDiseases: ['Blast', 'Brown Spot', 'Sheath Blight', 'BLB'],
        tips: ['Transplant at 4-5 leaf stage', 'Maintain 5cm water level', 'Use SRI method for water saving', 'Apply zinc sulfate at transplanting'],
    },
    {
        id: '3', name: 'Tomato', emoji: '🍅', category: 'Vegetable', season: 'All Year',
        duration: '70-100 days', waterNeed: 'Medium', temperature: '20-30°C',
        soilType: 'Sandy Loam, pH 6-7', description: 'Tomato is a major commercial vegetable crop with high market value and nutritional content.',
        sowingTime: 'Jan-Feb, Jun-Jul', yieldPerAcre: '150-200 quintals',
        commonDiseases: ['Early Blight', 'Late Blight', 'Fusarium Wilt', 'TLCV'],
        tips: ['Support plants with stakes', 'Prune suckers regularly', 'Drip irrigation preferred', 'Apply calcium spray to prevent BER'],
    },
    {
        id: '4', name: 'Mustard', emoji: '🌿', category: 'Oilseed', season: 'Rabi',
        duration: '90-110 days', waterNeed: 'Low', temperature: '10-25°C',
        soilType: 'Sandy Loam, Well-drained', description: 'Mustard is the most important oilseed crop in India, grown mainly in Rabi season.',
        sowingTime: 'Oct-Nov', yieldPerAcre: '8-12 quintals',
        commonDiseases: ['Alternaria Blight', 'White Rust', 'Downy Mildew'],
        tips: ['Thin plants to 15cm spacing', 'Apply sulfur for oil content', 'Control Aphids early', 'Harvest at 90% siliqua maturity'],
    },
    {
        id: '5', name: 'Cotton', emoji: '🌸', category: 'Fiber', season: 'Kharif',
        duration: '150-180 days', waterNeed: 'Medium', temperature: '21-35°C',
        soilType: 'Black Cotton Soil, Deep', description: 'Cotton is a major cash crop known as white gold, essential for textile industry.',
        sowingTime: 'Apr-Jun', yieldPerAcre: '8-12 quintals',
        commonDiseases: ['Bollworm', 'Leaf Curl Virus', 'Fusarium Wilt', 'Boll Rot'],
        tips: ['Grow Bt cotton varieties', 'Monitor bollworm regularly', 'Avoid excess irrigation', 'Spray Neem oil as organic protection'],
    },
    {
        id: '6', name: 'Sugarcane', emoji: '🎋', category: 'Cash Crop', season: 'Annual',
        duration: '10-18 months', waterNeed: 'High', temperature: '20-35°C',
        soilType: 'Deep Loamy, Rich in Humus', description: 'Sugarcane is the primary source of sugar and biofuel in India.',
        sowingTime: 'Feb-Mar, Oct-Nov', yieldPerAcre: '300-400 quintals',
        commonDiseases: ['Red Rot', 'Smut', 'Grassy Shoot', 'Top Borer'],
        tips: ['Use disease-free seed cane', 'Earthing up at 4-5 months', 'Apply trash mulching', 'Ratoon management for 2nd year'],
    },
    {
        id: '7', name: 'Potato', emoji: '🥔', category: 'Vegetable', season: 'Rabi',
        duration: '70-100 days', waterNeed: 'Medium', temperature: '15-20°C',
        soilType: 'Sandy Loam, Rich in Potash', description: 'Potato is a major food and cash crop with high yield potential.',
        sowingTime: 'Oct-Nov', yieldPerAcre: '100-150 quintals',
        commonDiseases: ['Late Blight', 'Early Blight', 'Black Scurf', 'Bacterial Wilt'],
        tips: ['Use certified seed potatoes', 'Ridge planting for drainage', 'Earthing up at 30 days', 'Apply fungicide before rains'],
    },
    {
        id: '8', name: 'Onion', emoji: '🧅', category: 'Vegetable', season: 'Rabi',
        duration: '100-130 days', waterNeed: 'Medium', temperature: '13-24°C',
        soilType: 'Sandy Loam, pH 6-7', description: 'Onion is an important vegetable and spice crop with high export potential.',
        sowingTime: 'Oct-Nov (Kharif: Jun-Jul)', yieldPerAcre: '80-120 quintals',
        commonDiseases: ['Purple Blotch', 'Thrips', 'Downy Mildew', 'Stemphylium Blight'],
        tips: ['Transplant at 5-6 leaf stage', 'Stop irrigation 2 weeks before harvest', 'Proper curing reduces storage loss', 'Drip irrigation increases yield by 30%'],
    },
];

const categories = ['All', 'Cereal', 'Vegetable', 'Oilseed', 'Cash Crop', 'Fiber'];
const seasons = ['All', 'Kharif', 'Rabi', 'Annual', 'All Year'];

const CropGuidePage: React.FC = () => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSeason, setSelectedSeason] = useState('All');
    const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'diseases' | 'tips'>('overview');

    const filteredCrops = crops.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = selectedCategory === 'All' || c.category === selectedCategory;
        const matchSeason = selectedSeason === 'All' || c.season === selectedSeason;
        return matchSearch && matchCategory && matchSeason;
    });

    const waterColor = {
        Low: 'text-amber-600 dark:text-amber-400',
        Medium: 'text-blue-600 dark:text-blue-400',
        High: 'text-cyan-600 dark:text-cyan-400',
    };

    return (
        <div className="page-container">
            <PageHeader
                title={t('nav.crop_guide', 'Crop Guide')}
                subtitle={t('crop_guide.subtitle', 'Encyclopedia of crops with growing tips')}
                action={<Badge variant="blue"><BookOpen className="w-3 h-3 mr-1" />{crops.length} {t('nav.crop_guide', 'Crops')}</Badge>}
            />

            <div className="grid lg:grid-cols-5 gap-6">
                {/* Left Panel - List */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Search & Filters */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('crop_guide.search_placeholder', 'Search crops...')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field pl-10"
                            id="crop-search"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                                    selectedCategory === cat
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                                )}
                            >
                                {cat === 'All' ? t('ui.all', 'All') : t('categories.' + cat.toLowerCase().replace(' ', '_'), cat)}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {seasons.map(s => (
                            <button
                                key={s}
                                onClick={() => setSelectedSeason(s)}
                                className={cn(
                                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                                    selectedSeason === s
                                        ? 'bg-earth-600 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                                )}
                            >
                                {s === 'All' ? t('ui.all', 'All') : t('seasons.' + s.toLowerCase().replace(' ', '_'), s)}
                            </button>
                        ))}
                    </div>

                    {/* Crop List */}
                    <div className="space-y-2">
                        {filteredCrops.map((crop) => (
                            <motion.div
                                key={crop.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setSelectedCrop(crop); setActiveTab('overview'); }}
                                className={cn(
                                    'p-4 rounded-xl cursor-pointer transition-all duration-200 border',
                                    selectedCrop?.id === crop.id
                                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                                        : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-sm'
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{crop.emoji}</span>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{t('crops.' + crop.name.toLowerCase(), crop.name)}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="gray">{t('categories.' + crop.category.toLowerCase().replace(' ', '_'), crop.category)}</Badge>
                                                <span className="text-xs text-gray-400">{t('seasons.' + crop.season.toLowerCase().replace(' ', '_'), crop.season)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className={cn('w-4 h-4 transition-colors', selectedCrop?.id === crop.id ? 'text-primary-500' : 'text-gray-300 dark:text-slate-600')} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Detail */}
                <div className="lg:col-span-3">
                    {selectedCrop ? (
                        <motion.div
                            key={selectedCrop.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            {/* Header */}
                            <Card className="p-5 bg-card-gradient-green text-white">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-4xl">{selectedCrop.emoji}</span>
                                            <div>
                                                <h2 className="text-2xl font-bold font-display">{t('crops.' + selectedCrop.name.toLowerCase(), selectedCrop.name)}</h2>
                                                <p className="text-white/70 text-sm">{t('categories.' + selectedCrop.category.toLowerCase().replace(' ', '_'), selectedCrop.category)} • {t('seasons.' + selectedCrop.season.toLowerCase().replace(' ', '_'), selectedCrop.season)} {t('crop_guide.season_text', 'Season')}</p>
                                            </div>
                                        </div>
                                        <p className="text-white/80 text-sm leading-relaxed">{t('crop_guide.description.' + selectedCrop.name.toLowerCase(), selectedCrop.description)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                                    <div className="bg-white/10 rounded-xl p-3 text-center">
                                        <Clock className="w-4 h-4 mx-auto mb-1 text-white/70" />
                                        <p className="text-xs text-white/70">{t('crop_guide.duration', 'Duration')}</p>
                                        <p className="text-sm font-semibold">{selectedCrop.duration}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-xl p-3 text-center">
                                        <Droplets className="w-4 h-4 mx-auto mb-1 text-white/70" />
                                        <p className="text-xs text-white/70">{t('crop_guide.water_need', 'Water Need')}</p>
                                        <p className="text-sm font-semibold">{t('water.' + selectedCrop.waterNeed.toLowerCase(), selectedCrop.waterNeed)}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-xl p-3 text-center">
                                        <Thermometer className="w-4 h-4 mx-auto mb-1 text-white/70" />
                                        <p className="text-xs text-white/70">{t('crop_guide.temperature', 'Temperature')}</p>
                                        <p className="text-sm font-semibold">{selectedCrop.temperature}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-xl p-3 text-center">
                                        <Sun className="w-4 h-4 mx-auto mb-1 text-white/70" />
                                        <p className="text-xs text-white/70">{t('crop_guide.yield', 'Yield/Acre')}</p>
                                        <p className="text-sm font-semibold">{selectedCrop.yieldPerAcre}</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Tabs */}
                            <Card className="overflow-hidden">
                                <div className="flex border-b border-gray-100 dark:border-slate-700">
                                    {(['overview', 'diseases', 'tips'] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={cn(
                                                'flex-1 py-3 text-sm font-medium capitalize transition-colors',
                                                activeTab === tab
                                                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                                                    : 'text-gray-500 dark:text-gray-400'
                                            )}
                                        >
                                            {tab === 'overview' ? `📋 ${t('crop_guide.overview', 'Overview')}` : tab === 'diseases' ? `🦠 ${t('crop_guide.diseases', 'Diseases')}` : `💡 ${t('crop_guide.tips', 'Tips')}`}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-5">
                                    {activeTab === 'overview' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">{t('crop_guide.sowing_time', 'Sowing Time')}</p>
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{selectedCrop.sowingTime}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">{t('crop_guide.soil_type', 'Soil Type')}</p>
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{selectedCrop.soilType}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'diseases' && (
                                        <div className="space-y-2">
                                            {selectedCrop.commonDiseases.map((d, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl">
                                                    <span className="text-red-500 font-bold">!</span>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{d}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {activeTab === 'tips' && (
                                        <div className="space-y-3">
                                            {selectedCrop.tips.map((tip, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {i + 1}
                                                    </span>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">{tip}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                                <BookOpen className="w-10 h-10 text-gray-300 dark:text-slate-600" />
                            </div>
                            <h3 className="font-semibold text-gray-400 dark:text-gray-500">Select a crop to view details</h3>
                            <p className="text-sm text-gray-300 dark:text-gray-600 mt-2">Browse {crops.length} crops in our database</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CropGuidePage;
