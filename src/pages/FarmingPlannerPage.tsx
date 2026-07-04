import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Droplets, Leaf, CheckSquare, Sparkles, 
  ChevronRight, CalendarDays, FlaskConical, Map, Info, Loader2
} from 'lucide-react';
import { Card, PageHeader, Button, Badge } from '../components/ui/Components';
import { cn } from '../lib/utils';
import { generateFarmingPlan } from '../api/ai/client';
import type { FarmingPlanResponse } from '../api/ai/client';
import { useAuth } from '../contexts/AuthContext';
import type { SupportedLanguage } from '../api/ai/prompts';
import { useTranslation } from 'react-i18next';

const crops = ['Wheat', 'Rice', 'Tomato', 'Mustard', 'Cotton', 'Potato', 'Onion', 'Maize'];
const cropStages = ['Pre-sowing', 'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity'];

export default function FarmingPlannerPage() {
  const { t, i18n } = useTranslation();
  const getAI_Language = (code: string): SupportedLanguage => {
    if (code.startsWith('hi')) return 'Hindi';
    if (code.startsWith('bn')) return 'Bengali';
    return 'English';
  };
  const selectedLanguage = getAI_Language(i18n.language);

  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [selectedStage, setSelectedStage] = useState('Vegetative');
  const [area, setArea] = useState('2.5');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<FarmingPlanResponse | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setPlan(null);
    try {
      const result = await generateFarmingPlan(selectedCrop, selectedStage, parseFloat(area) || 1, selectedLanguage);
      setPlan(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTask = (id: string) => {
    if (!plan) return;
    setPlan({
      ...plan,
      checklist: plan.checklist.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    });
  };

  // Generate 14-day calendar data based on today
  const generateCalendarDays = () => {
    const today = new Date();
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      
      const events = plan?.calendarEvents.filter(e => e.dayOffset === i) || [];
      
      return {
        date: d,
        dayName: d.toLocaleDateString(i18n.language, { weekday: 'short' }),
        dayNum: d.getDate(),
        events
      };
    });
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="page-container max-w-6xl mx-auto">
      <PageHeader
        title={t('nav.farming_planner', 'Farming Planner')}
        subtitle={t('planner.subtitle', 'Holistic 14-day schedule with AI-driven insights')}
        action={<Badge variant="green"><Sparkles className="w-3 h-3 mr-1" />{t('planner.ai_powered', 'AI Powered')}</Badge>}
      />

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Form & Checklist */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">{t('planner.farm_details', 'Farm Details')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('planner.select_crop', 'Select Crop')}</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="input-field"
                >
                  {crops.map(c => <option key={c} value={c}>{t('crops.' + c.toLowerCase(), c)}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('planner.growth_stage', 'Growth Stage')}</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="input-field"
                >
                  {cropStages.map(s => <option key={s} value={s}>{t('crop_stages.' + s.toLowerCase().replace('-', '_'), s)}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('planner.land_area', 'Land Area (Acres)')}</label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder={t('planner.enter_area', 'Enter area')}
                  className="input-field"
                />
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleGenerate}
                disabled={isGenerating}
                icon={isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              >
                {isGenerating ? t('planner.generating', 'Generating Plan...') : t('planner.generate_btn', 'Generate 14-Day Plan')}
              </Button>
            </div>
          </Card>

          {plan && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary-500" />
                  {t('planner.action_checklist', 'Action Checklist')}
                </h3>
                <div className="space-y-2">
                  {plan.checklist.map((item) => (
                    <label 
                      key={item.id} 
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                        item.completed 
                          ? "bg-gray-50 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 opacity-60" 
                          : "bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700 hover:border-primary-300"
                      )}
                    >
                      <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        checked={item.completed}
                        onChange={() => toggleTask(item.id)}
                      />
                      <span className={cn(
                        "text-sm",
                        item.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-200"
                      )}>
                        {item.task}
                      </span>
                    </label>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column: AI Outputs & Calendar */}
        <div className="lg:col-span-8">
          {!plan && !isGenerating && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mb-6">
                <CalendarDays className="w-10 h-10 text-gray-300 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('planner.hero_title', 'Generate Your Holistic Farming Plan')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm">
                {t('planner.hero_desc', 'Enter your crop details to receive a comprehensive AI-driven watering, fertilizing, and task schedule for the next two weeks.')}
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
              <p className="text-gray-500 dark:text-gray-400 animate-pulse">{t('planner.analyzing', 'Analyzing optimal schedules...')}</p>
            </div>
          )}

          {plan && !isGenerating && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="space-y-6"
            >
              {/* Detailed AI Explanation Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="p-5 border-l-4 border-l-blue-500 relative overflow-hidden">
                  <Droplets className="absolute -right-4 -top-4 w-24 h-24 text-blue-50 dark:text-blue-900/10" />
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    {t('planner.water_schedule', 'Water Schedule')}
                  </h3>
                  <div className="space-y-3 relative z-10">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('planner.frequency', 'Frequency')}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{plan.waterSchedule.frequency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('planner.amount', 'Amount')}</p>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{plan.waterSchedule.amount}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-900 dark:text-blue-200">{plan.waterSchedule.reasoning}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border-l-4 border-l-green-500 relative overflow-hidden">
                  <FlaskConical className="absolute -right-4 -top-4 w-24 h-24 text-green-50 dark:text-green-900/10" />
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                    <Leaf className="w-4 h-4 text-green-500" />
                    {t('planner.fertilizer_schedule', 'Fertilizer Schedule')}
                  </h3>
                  <div className="space-y-3 relative z-10">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('planner.npk_split', 'NPK Split')}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{plan.fertilizerSchedule.npkSplit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('planner.sources', 'Sources')}</p>
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">{plan.fertilizerSchedule.recommendedSources}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl flex items-start gap-2">
                      <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-green-900 dark:text-green-200">{plan.fertilizerSchedule.reasoning}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 14-Day Calendar View */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    {t('planner.14day_outlook', '14-Day Outlook')}
                  </h3>
                  <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Droplets className="w-3 h-3 text-blue-500" /> {t('planner.legend_water', 'Water')}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <FlaskConical className="w-3 h-3 text-green-500" /> {t('planner.legend_fertilizer', 'Fertilizer')}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <CheckSquare className="w-3 h-3 text-purple-500" /> {t('planner.legend_task', 'Task')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                  {calendarDays.map((day, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "p-3 rounded-xl border flex flex-col min-h-[100px]",
                        i === 0 
                          ? "bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800" 
                          : "bg-white border-gray-100 dark:bg-slate-800 dark:border-slate-700"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          "text-xs font-semibold uppercase tracking-wider",
                          i === 0 ? "text-primary-600 dark:text-primary-400" : "text-gray-400"
                        )}>
                          {i === 0 ? t('days.today', 'Today') : day.dayName}
                        </span>
                        <span className={cn(
                          "text-sm font-bold",
                          i === 0 ? "text-primary-700 dark:text-primary-300" : "text-gray-700 dark:text-gray-300"
                        )}>
                          {day.dayNum}
                        </span>
                      </div>
                      
                      <div className="mt-auto space-y-1.5 flex-1 flex flex-col justify-end">
                        {day.events.length > 0 ? (
                          day.events.map((e, idx) => (
                            <div 
                              key={idx} 
                              className={cn(
                                "text-[10px] px-1.5 py-1 rounded flex items-center gap-1 font-medium truncate",
                                e.type === 'water' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                                e.type === 'fertilizer' ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
                                "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                              )}
                              title={e.description}
                            >
                              {e.type === 'water' && <Droplets className="w-2.5 h-2.5 flex-shrink-0" />}
                              {e.type === 'fertilizer' && <FlaskConical className="w-2.5 h-2.5 flex-shrink-0" />}
                              {e.type === 'task' && <CheckSquare className="w-2.5 h-2.5 flex-shrink-0" />}
                              <span className="truncate">{e.description}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-[10px] text-gray-300 dark:text-slate-600 italic">{t('planner.no_events', 'No events')}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
