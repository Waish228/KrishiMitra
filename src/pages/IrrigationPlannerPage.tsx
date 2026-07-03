import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Droplets, Calendar, Clock, Plus, Edit2, Trash2,
  CheckCircle, AlertTriangle, Zap, Leaf
} from 'lucide-react';
import { Card, PageHeader, Badge, Button } from '../components/ui/Components';
import { cn } from '../lib/utils';

interface IrrigationSchedule {
  id: string;
  crop: string;
  field: string;
  nextDate: string;
  nextTime: string;
  duration: number;
  method: string;
  status: 'scheduled' | 'completed' | 'overdue';
  waterAmount: number;
}

const schedules: IrrigationSchedule[] = [
  {
    id: '1', crop: 'Wheat', field: 'Field A (3.5 ac)', nextDate: 'Today', nextTime: '6:00 AM',
    duration: 90, method: 'Flood', status: 'overdue', waterAmount: 520,
  },
  {
    id: '2', crop: 'Tomato', field: 'Field B (1.2 ac)', nextDate: 'Tomorrow', nextTime: '7:00 AM',
    duration: 45, method: 'Drip', status: 'scheduled', waterAmount: 180,
  },
  {
    id: '3', crop: 'Mustard', field: 'Field C (2.0 ac)', nextDate: 'Thu, 5 Jun', nextTime: '6:30 AM',
    duration: 60, method: 'Sprinkler', status: 'scheduled', waterAmount: 280,
  },
];

const weeklyData = [
  { day: 'Mon', scheduled: 520, actual: 500 },
  { day: 'Tue', scheduled: 180, actual: 180 },
  { day: 'Wed', scheduled: 0, actual: 0 },
  { day: 'Thu', scheduled: 280, actual: 0 },
  { day: 'Fri', scheduled: 0, actual: 0 },
  { day: 'Sat', scheduled: 350, actual: 0 },
  { day: 'Sun', scheduled: 0, actual: 0 },
];

const aiRecommendations = [
  { icon: '💧', title: 'Skip Today\'s Irrigation', description: 'Rainfall of 15mm expected tonight. Save ~520L of water.', action: 'Skip Irrigation', type: 'success' },
  { icon: '⚡', title: 'Switch to Drip for Wheat', description: 'Drip irrigation can save 40% water for wheat at this stage.', action: 'Learn More', type: 'info' },
  { icon: '📅', title: 'Adjust Schedule', description: 'Current soil moisture is 75%. Next wheat irrigation can be delayed by 2 days.', action: 'Update Schedule', type: 'warning' },
];

const IrrigationPlannerPage: React.FC = () => {
  const [activeSchedules, setActiveSchedules] = useState(schedules);

  const statusConfig = {
    scheduled: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/10', label: 'Scheduled', icon: Clock },
    completed: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/10', label: 'Completed', icon: CheckCircle },
    overdue: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/10', label: 'Overdue', icon: AlertTriangle },
  };

  const totalWater = activeSchedules.reduce((sum, s) => sum + s.waterAmount, 0);
  const maxBar = Math.max(...weeklyData.map(d => Math.max(d.scheduled, d.actual)));

  return (
    <div className="page-container">
      <PageHeader
        title="Irrigation Planner"
        subtitle="AI-optimized watering schedules for your crops"
        action={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} id="add-schedule-btn">
            Add Schedule
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Fields', value: '3', icon: Leaf, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'This Week (L)', value: totalWater.toLocaleString(), icon: Droplets, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Water Saved', value: '340L', icon: Zap, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Efficiency', value: '82%', icon: CheckCircle, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((stat, i) => (
          <Card key={i} className="p-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-2', stat.bg)}>
              <stat.icon className={cn('w-5 h-5', stat.color)} />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* AI Recommendations */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="section-title mb-3">🤖 AI Recommendations</h2>
        <div className="space-y-3">
          {aiRecommendations.map((rec, i) => (
            <div
              key={i}
              className={cn(
                'flex items-start gap-4 p-4 rounded-2xl border',
                rec.type === 'success' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' :
                rec.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
                'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
              )}
            >
              <span className="text-2xl flex-shrink-0">{rec.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{rec.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-snug">{rec.description}</p>
              </div>
              <button className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors',
                rec.type === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                rec.type === 'warning' ? 'bg-amber-600 text-white hover:bg-amber-700' :
                'bg-blue-600 text-white hover:bg-blue-700'
              )}>
                {rec.action}
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Water Usage Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Weekly Water Usage (Liters)</h2>
          <div className="flex items-end gap-2 h-40">
            {weeklyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-1" style={{ height: '120px', justifyContent: 'flex-end' }}>
                  {d.scheduled > 0 && (
                    <div className="relative w-full">
                      <div
                        className="w-full bg-primary-100 dark:bg-primary-900/30 rounded-t-sm"
                        style={{ height: `${(d.scheduled / maxBar) * 100}px` }}
                      >
                        <div
                          className="w-full bg-primary-500 rounded-t-sm transition-all duration-500"
                          style={{ height: d.actual > 0 ? `${(d.actual / d.scheduled) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  )}
                  {d.scheduled === 0 && <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded" />}
                </div>
                <p className="text-xs text-gray-400 font-medium">{d.day}</p>
                {d.scheduled > 0 && <p className="text-xs text-gray-500">{d.scheduled}L</p>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-primary-100 dark:bg-primary-900/30 rounded-sm inline-block" />Scheduled</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-primary-500 rounded-sm inline-block" />Actual</span>
          </div>
        </Card>
      </motion.div>

      {/* Schedules */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="section-title mb-3">Upcoming Schedules</h2>
        <div className="space-y-3">
          {activeSchedules.map((schedule) => {
            const config = statusConfig[schedule.status];
            const StatusIcon = config.icon;
            return (
              <Card key={schedule.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', config.bg)}>
                      <StatusIcon className={cn('w-5 h-5', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{schedule.crop}</p>
                        <Badge variant={schedule.status === 'overdue' ? 'red' : schedule.status === 'completed' ? 'green' : 'blue'}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{schedule.field}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{schedule.nextDate}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{schedule.nextTime}</span>
                        <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5" />{schedule.waterAmount}L</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Method & Duration */}
                <div className="flex items-center gap-3 mt-3 pl-13">
                  <div className="flex gap-2 ml-13">
                    <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                      {schedule.method}
                    </span>
                    <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                      {schedule.duration} min
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default IrrigationPlannerPage;
