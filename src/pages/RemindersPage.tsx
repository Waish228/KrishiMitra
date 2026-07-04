import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Droplets, FlaskConical, Leaf, Sun, CalendarDays,
  Plus, Check, Trash2, ToggleLeft, ToggleRight, Loader2
} from 'lucide-react';
import { Card, PageHeader, Button, Badge } from '../components/ui/Components';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'irrigation' | 'fertilizer' | 'disease' | 'harvest' | 'weather';
  due_date: string; // ISO String
  completed: boolean;
  notify: boolean;
}

const reminderTypes = [
  { id: 'irrigation', labelKey: 'reminders.type_irrigation', label: 'Irrigation', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'fertilizer', labelKey: 'reminders.type_fertilizer', label: 'Fertilizer', icon: FlaskConical, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'disease', labelKey: 'reminders.type_disease', label: 'Disease Check', icon: Leaf, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  { id: 'harvest', labelKey: 'reminders.type_harvest', label: 'Harvest', icon: CalendarDays, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'weather', labelKey: 'reminders.type_weather', label: 'Weather alert', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' }
];

export default function RemindersPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalNotify, setGlobalNotify] = useState(true);

  // New Reminder State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<Reminder['type']>('irrigation');
  const [newDate, setNewDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    fetchReminders();
  }, [profile?.id]);

  const fetchReminders = async () => {
    try {
      const q = query(
        collection(db, 'reminders'),
        where('user_id', '==', profile!.id)
      );
      
      const querySnapshot = await getDocs(q);
      const data: Reminder[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Reminder);
      });
      
      // Sort locally to avoid requiring a composite index in Firestore
      data.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      
      setReminders(data);
    } catch (err: any) {
      // If Firestore index is missing, it will throw an error with a link to create it.
      console.error('Error fetching reminders:', err);
      if (err.message.includes('index')) {
         toast.error('Firestore requires a composite index. Check console for the creation link.', { duration: 8000 });
      } else {
         toast.error('Failed to fetch reminders');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !newTitle || !newDate) return;
    
    setIsSubmitting(true);
    try {
      const newReminder = {
        user_id: profile.id,
        title: newTitle,
        description: newDesc,
        type: newType,
        due_date: new Date(newDate).toISOString(),
        completed: false,
        notify: globalNotify
      };
      
      const docRef = await addDoc(collection(db, 'reminders'), newReminder);
      
      setReminders([...reminders, { id: docRef.id, ...newReminder }]);
      setShowAddForm(false);
      setNewTitle('');
      setNewDesc('');
      toast.success('Reminder added');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to add reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComplete = async (id: string, current: boolean) => {
    // Optimistic update
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !current } : r));
    
    try {
      await updateDoc(doc(db, 'reminders', id), { completed: !current });
    } catch (err: any) {
      // Revert on error
      setReminders(reminders.map(r => r.id === id ? { ...r, completed: current } : r));
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    const prev = [...reminders];
    setReminders(reminders.filter(r => r.id !== id));
    
    try {
      await deleteDoc(doc(db, 'reminders', id));
      toast.success('Reminder deleted');
    } catch (err: any) {
      setReminders(prev);
      toast.error('Failed to delete');
    }
  };

  const toggleNotification = async (id: string, current: boolean) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, notify: !current } : r));
    try {
      await updateDoc(doc(db, 'reminders', id), { notify: !current });
    } catch (err) {
      setReminders(reminders.map(r => r.id === id ? { ...r, notify: current } : r));
      toast.error('Failed to update notification preference');
    }
  };

  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader
        title={t('nav.reminders', 'Smart Reminders')}
        subtitle={t('reminders.subtitle', 'Manage your farming tasks with intelligent notifications')}
        action={
          <Button 
            variant="primary" 
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? t('ui.cancel', 'Cancel') : t('ui.new_reminder', 'New Reminder')}
          </Button>
        }
      />

      {/* Global Controls */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl transition-colors", globalNotify ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600" : "bg-gray-100 dark:bg-slate-700 text-gray-500")}>
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{t('ui.push_notifications', 'Push Notifications')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('ui.receive_alerts', 'Receive alerts on your device')}</p>
          </div>
        </div>
        <button 
          onClick={() => setGlobalNotify(!globalNotify)}
          className="text-gray-400 hover:text-primary-500 transition-colors"
        >
          {globalNotify ? <ToggleRight className="w-8 h-8 text-primary-500" /> : <ToggleLeft className="w-8 h-8" />}
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Main List */}
        <div className={cn("transition-all duration-300", showAddForm ? "lg:col-span-7" : "lg:col-span-12")}>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
              <Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('reminders.no_reminders', 'No active reminders')}</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-2">
                {t('reminders.click_new', 'Click "New Reminder" to start tracking your farming schedule.')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {reminders.map((reminder) => {
                  const typeInfo = reminderTypes.find(t => t.id === reminder.type) || reminderTypes[0];
                  const Icon = typeInfo.icon;
                  const isOverdue = new Date(reminder.due_date) < new Date() && !reminder.completed;

                  return (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all flex items-start gap-4",
                        reminder.completed 
                          ? "bg-gray-50 border-gray-100 dark:bg-slate-800/50 dark:border-slate-700/50 opacity-60" 
                          : "bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700 hover:border-primary-300 hover:shadow-md"
                      )}
                    >
                      <button
                        onClick={() => toggleComplete(reminder.id, reminder.completed)}
                        className={cn(
                          "w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 mt-1 transition-colors",
                          reminder.completed ? "bg-primary-500 border-primary-500 text-white" : "border-gray-300 dark:border-slate-600 hover:border-primary-500"
                        )}
                      >
                        {reminder.completed && <Check className="w-4 h-4" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className={cn("font-semibold text-sm", reminder.completed ? "line-through text-gray-500" : "text-gray-900 dark:text-white")}>
                            {reminder.title}
                          </h3>
                          <Badge variant={isOverdue ? 'red' : 'gray'} className="text-[10px]">
                            {new Date(reminder.due_date).toLocaleDateString()}
                          </Badge>
                          {isOverdue && <span className="text-[10px] font-bold text-red-500 uppercase">{t('ui.overdue', 'Overdue')}</span>}
                        </div>
                        {reminder.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{reminder.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1", typeInfo.bg, typeInfo.color)}>
                            <Icon className="w-3 h-3" />
                            {t(typeInfo.labelKey, typeInfo.label)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleNotification(reminder.id, reminder.notify)}
                          className={cn("p-1.5 rounded-lg transition-colors", reminder.notify ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700")}
                          title={reminder.notify ? "Disable notification" : "Enable notification"}
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(reminder.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Add Form Panel */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-5"
            >
              <Card className="p-5 sticky top-6 border-primary-200 dark:border-primary-900/50 shadow-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('reminders.create_title', 'Create Reminder')}</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('reminders.form_title', 'Title')}</label>
                    <input 
                      type="text" 
                      required
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder={t('reminders.title_placeholder', 'e.g., Apply Urea to Wheat')}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('reminders.form_type', 'Type')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {reminderTypes.map(typeItem => {
                        const Icon = typeItem.icon;
                        return (
                          <button
                            type="button"
                            key={typeItem.id}
                            onClick={() => setNewType(typeItem.id as Reminder['type'])}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all",
                              newType === typeItem.id 
                                ? cn(typeItem.bg, typeItem.color, "border-transparent")
                                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400"
                            )}
                          >
                            <Icon className="w-3 h-3" />
                            {t(typeItem.labelKey, typeItem.label)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('reminders.form_due', 'Due Date & Time')}</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('reminders.form_desc', 'Description (Optional)')}</label>
                    <textarea 
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      placeholder={t('reminders.desc_placeholder', 'Add any extra notes...')}
                      className="input-field resize-none h-20"
                    />
                  </div>

                  <Button 
                    type="submit"
                    variant="primary" 
                    className="w-full"
                    disabled={isSubmitting}
                    icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  >
                    {isSubmitting ? t('ui.saving', 'Saving...') : t('reminders.save_btn', 'Save Reminder')}
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
