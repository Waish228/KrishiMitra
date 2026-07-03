import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, ChevronDown, Info, Sparkles, Download, Share2 } from 'lucide-react';
import { Card, PageHeader, Badge, Button } from '../components/ui/Components';
import { cn } from '../lib/utils';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';

const crops = ['Wheat', 'Rice', 'Tomato', 'Mustard', 'Cotton', 'Potato', 'Onion', 'Maize'];
const soilTypes = ['Sandy Loam', 'Clay Loam', 'Black Cotton', 'Red Laterite', 'Alluvial'];
const cropStages = ['Pre-sowing', 'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity'];

interface NutrientRec {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  zinc: number;
  sulfur: number;
}

const getRecommendation = (crop: string, stage: string): NutrientRec => {
  // Simulated AI recommendations based on crop/stage
  const base: Record<string, NutrientRec> = {
    Wheat: { nitrogen: 120, phosphorus: 60, potassium: 40, zinc: 25, sulfur: 20 },
    Rice: { nitrogen: 100, phosphorus: 50, potassium: 50, zinc: 25, sulfur: 15 },
    Tomato: { nitrogen: 150, phosphorus: 80, potassium: 120, zinc: 20, sulfur: 25 },
    Mustard: { nitrogen: 80, phosphorus: 40, potassium: 30, zinc: 25, sulfur: 40 },
    Cotton: { nitrogen: 100, phosphorus: 50, potassium: 50, zinc: 20, sulfur: 30 },
    Potato: { nitrogen: 120, phosphorus: 100, potassium: 150, zinc: 25, sulfur: 20 },
    Onion: { nitrogen: 100, phosphorus: 60, potassium: 80, zinc: 20, sulfur: 30 },
    Maize: { nitrogen: 150, phosphorus: 75, potassium: 40, zinc: 25, sulfur: 20 },
  };
  const stageMultiplier: Record<string, number> = {
    'Pre-sowing': 0.3, 'Seedling': 0.5, 'Vegetative': 0.8, 'Flowering': 1.0, 'Fruiting': 0.9, 'Maturity': 0.3,
  };
  const b = base[crop] || base.Wheat;
  const m = stageMultiplier[stage] || 1;
  return {
    nitrogen: Math.round(b.nitrogen * m),
    phosphorus: Math.round(b.phosphorus * m),
    potassium: Math.round(b.potassium * m),
    zinc: Math.round(b.zinc * m),
    sulfur: Math.round(b.sulfur * m),
  };
};

const fertilizerSources: Record<string, { name: string; nutrient: string; quantity: string; cost: string }[]> = {
  nitrogen: [{ name: 'Urea', nutrient: 'N (46%)', quantity: 'per 10kg N', cost: '₹580' }],
  phosphorus: [{ name: 'DAP', nutrient: 'P (46%) + N (18%)', quantity: 'per 10kg P', cost: '₹1,350' }],
  potassium: [{ name: 'MOP', nutrient: 'K (60%)', quantity: 'per 10kg K', cost: '₹850' }],
  zinc: [{ name: 'Zinc Sulfate', nutrient: 'Zn (21%)', quantity: '25 kg/ha', cost: '₹1,200' }],
  sulfur: [{ name: 'Gypsum', nutrient: 'S (16%)', quantity: '250 kg/ha', cost: '₹900' }],
};

const FertilizerPlannerPage: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [selectedSoil, setSelectedSoil] = useState('Alluvial');
  const [selectedStage, setSelectedStage] = useState('Vegetative');
  const [area, setArea] = useState('2.5');
  const [showResult, setShowResult] = useState(false);
  const [rec, setRec] = useState<NutrientRec | null>(null);

  const handleCalculate = () => {
    const result = getRecommendation(selectedCrop, selectedStage);
    setRec(result);
    setShowResult(true);
  };

  const radarData = rec ? [
    { nutrient: 'N', value: rec.nitrogen, max: 200 },
    { nutrient: 'P', value: rec.phosphorus, max: 200 },
    { nutrient: 'K', value: rec.potassium, max: 200 },
    { nutrient: 'Zn', value: rec.zinc, max: 200 },
    { nutrient: 'S', value: rec.sulfur, max: 200 },
  ] : [];

  const nutrients = rec ? [
    { key: 'nitrogen', label: 'Nitrogen (N)', value: rec.nitrogen, color: 'bg-blue-500', lightColor: 'bg-blue-100 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400', max: 200 },
    { key: 'phosphorus', label: 'Phosphorus (P)', value: rec.phosphorus, color: 'bg-orange-500', lightColor: 'bg-orange-100 dark:bg-orange-900/20', textColor: 'text-orange-600 dark:text-orange-400', max: 150 },
    { key: 'potassium', label: 'Potassium (K)', value: rec.potassium, color: 'bg-purple-500', lightColor: 'bg-purple-100 dark:bg-purple-900/20', textColor: 'text-purple-600 dark:text-purple-400', max: 200 },
    { key: 'zinc', label: 'Zinc (Zn)', value: rec.zinc, color: 'bg-cyan-500', lightColor: 'bg-cyan-100 dark:bg-cyan-900/20', textColor: 'text-cyan-600 dark:text-cyan-400', max: 50 },
    { key: 'sulfur', label: 'Sulfur (S)', value: rec.sulfur, color: 'bg-amber-500', lightColor: 'bg-amber-100 dark:bg-amber-900/20', textColor: 'text-amber-600 dark:text-amber-400', max: 60 },
  ] : [];

  return (
    <div className="page-container">
      <PageHeader
        title="Fertilizer Planner"
        subtitle="AI-powered NPK recommendations for optimal yield"
        action={<Badge variant="green"><Sparkles className="w-3 h-3 mr-1" />AI Powered</Badge>}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary-600" />
              Crop Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Select Crop</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="input-field"
                  id="fertilizer-crop-select"
                >
                  {crops.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Soil Type</label>
                <select
                  value={selectedSoil}
                  onChange={(e) => setSelectedSoil(e.target.value)}
                  className="input-field"
                  id="soil-type-select"
                >
                  {soilTypes.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Crop Growth Stage</label>
                <div className="grid grid-cols-3 gap-2">
                  {cropStages.map(stage => (
                    <button
                      key={stage}
                      onClick={() => setSelectedStage(stage)}
                      className={cn(
                        'py-2 px-2 text-xs font-medium rounded-xl border transition-all text-center',
                        selectedStage === stage
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:border-primary-300'
                      )}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Farm Area (Acres)
                </label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Enter area in acres"
                  className="input-field"
                  id="farm-area-input"
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  For best results, upload your soil test report. AI will customize recommendations based on actual soil nutrient levels.
                </p>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleCalculate}
                icon={<Sparkles className="w-4 h-4" />}
                id="calculate-fertilizer-btn"
              >
                Generate AI Recommendation
              </Button>
            </div>
          </Card>

          {/* Organic Options */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">🌿 Organic Alternatives</h3>
            <div className="space-y-2">
              {[
                { name: 'Vermicompost', desc: '2-3 tons/acre for base nutrition', benefit: 'Improves soil structure' },
                { name: 'FYM (Farm Yard Manure)', desc: '5-10 tons/acre before sowing', benefit: 'Slow release nutrients' },
                { name: 'Neem Cake', desc: '100-150 kg/acre with DAP', benefit: 'Natural pest repellent' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-xl">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">{item.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Results Panel */}
        <div>
          {showResult && rec ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* NPK Header Card */}
              <Card className="p-5 bg-card-gradient-green text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/70 text-sm">AI Recommendation for</p>
                    <h3 className="text-xl font-bold font-display">{selectedCrop} • {selectedStage}</h3>
                    <p className="text-white/60 text-xs">{area} acres • {selectedSoil} soil</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Nitrogen', value: rec.nitrogen, symbol: 'N' },
                    { label: 'Phosphorus', value: rec.phosphorus, symbol: 'P' },
                    { label: 'Potassium', value: rec.potassium, symbol: 'K' },
                  ].map((n) => (
                    <div key={n.symbol} className="bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-white/60 text-xs">{n.symbol}</p>
                      <p className="text-2xl font-bold">{n.value}</p>
                      <p className="text-white/60 text-xs">kg/ha</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Radar Chart */}
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Nutrient Profile</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="nutrient" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 200]} tick={{ fontSize: 10 }} />
                    <Radar name="Nutrients" dataKey="value" stroke="#16a34a" fill="#16a34a" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>

              {/* Nutrient Bars */}
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Required Quantities (kg/ha)</h3>
                <div className="space-y-4">
                  {nutrients.map((n) => (
                    <div key={n.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{n.label}</span>
                        <span className={cn('text-sm font-bold', n.textColor)}>{n.value} kg/ha</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(n.value / n.max) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          className={cn('h-2 rounded-full', n.color)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Fertilizer Sources */}
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">📦 Recommended Fertilizers</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Urea', amount: `${(rec.nitrogen * parseFloat(area) / 46 * 100).toFixed(0)} kg`, use: 'Apply in 2 splits', cost: `₹${Math.round(rec.nitrogen * parseFloat(area) * 5.8)}`, timing: 'Basal + Tillering' },
                    { name: 'DAP (Di-Ammonium Phosphate)', amount: `${(rec.phosphorus * parseFloat(area) / 46 * 100).toFixed(0)} kg`, use: 'Apply at sowing', cost: `₹${Math.round(rec.phosphorus * parseFloat(area) * 13.5)}`, timing: 'Basal application' },
                    { name: 'MOP (Muriate of Potash)', amount: `${(rec.potassium * parseFloat(area) / 60 * 100).toFixed(0)} kg`, use: 'Apply before sowing', cost: `₹${Math.round(rec.potassium * parseFloat(area) * 8.5)}`, timing: 'Basal application' },
                  ].map((f, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{f.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{f.use} • {f.timing}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{f.amount}</p>
                          <p className="text-xs text-gray-400">{f.cost}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <FlaskConical className="w-12 h-12 text-gray-300 dark:text-slate-600" />
              </div>
              <h3 className="font-semibold text-gray-400 dark:text-gray-500 text-base">
                Fill in crop details to get recommendations
              </h3>
              <p className="text-sm text-gray-300 dark:text-gray-600 mt-2 max-w-xs">
                AI will calculate precise NPK requirements based on crop, soil, and growth stage
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FertilizerPlannerPage;
