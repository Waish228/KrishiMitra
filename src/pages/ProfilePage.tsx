import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, MapPin, Phone, Mail, Camera, Award,
  Leaf, TrendingUp, Droplets, Edit2, Check, Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, PageHeader, Badge, Button } from '../components/ui/Components';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../api/users';

const achievements = [
  { icon: '🏆', title: 'Early Adopter', desc: 'Joined in first 100 users', earned: true },
  { icon: '🌾', title: 'Crop Master', desc: 'Logged 5+ different crops', earned: true },
  { icon: '🤖', title: 'AI Farmer', desc: 'Used AI chat 50+ times', earned: true },
  { icon: '💧', title: 'Water Saver', desc: 'Saved 1000L+ through smart irrigation', earned: false },
  { icon: '📈', title: 'Market Pro', desc: 'Tracked prices for 30 days', earned: false },
  { icon: '🔬', title: 'Disease Detective', desc: 'Detected 10+ diseases', earned: false },
];

const farmHistory = [
  { season: 'Rabi 2023-24', crops: 'Wheat, Mustard', yield: '24 qtl/acre', revenue: '₹1.2L', rating: 5 },
  { season: 'Kharif 2023', crops: 'Rice, Vegetables', yield: '18 qtl/acre', revenue: '₹80K', rating: 4 },
  { season: 'Rabi 2022-23', crops: 'Wheat, Gram', yield: '20 qtl/acre', revenue: '₹95K', rating: 4 },
];

const ProfilePage: React.FC = () => {
  const { profile: authProfile, user, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'farm' | 'achievements' | 'history'>('farm');

  // Local form state (editable fields)
  const [formData, setFormData] = useState({
    full_name: authProfile?.full_name ?? '',
    phone: authProfile?.phone ?? '',
    farm_name: authProfile?.farm_name ?? '',
    farm_area_acres: authProfile?.farm_area_acres?.toString() ?? '',
    soil_type: authProfile?.soil_type ?? '',
    primary_crops: authProfile?.primary_crops?.join(', ') ?? '',
    village: authProfile?.village ?? '',
    district: authProfile?.district ?? '',
    state: authProfile?.state ?? '',
    kcc_number: authProfile?.kcc_number ?? '',
    farming_experience_years: authProfile?.farming_experience_years?.toString() ?? '',
  });

  const handleSave = async () => {
    if (!authProfile?.id) return;
    setSaving(true);
    try {
      await updateProfile(authProfile.id, {
        full_name: formData.full_name,
        phone: formData.phone || null,
        farm_name: formData.farm_name || null,
        farm_area_acres: formData.farm_area_acres ? Number(formData.farm_area_acres) : null,
        soil_type: formData.soil_type || null,
        primary_crops: formData.primary_crops ? formData.primary_crops.split(',').map(s => s.trim()) : null,
        village: formData.village || null,
        district: formData.district || null,
        state: formData.state || null,
        kcc_number: formData.kcc_number || null,
        farming_experience_years: formData.farming_experience_years ? Number(formData.farming_experience_years) : null,
      });
      await refreshProfile();
      toast.success('Profile saved! ✅');
      setEditing(false);
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const displayName = authProfile?.full_name ?? user?.email?.split('@')[0] ?? 'Farmer';
  const memberSince = authProfile?.created_at
    ? new Date(authProfile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently';

  const stats = [
    { label: 'Farm Area', value: authProfile?.farm_area_acres ? `${authProfile.farm_area_acres} ac` : '--', icon: Leaf },
    { label: 'AI Chats', value: '89', icon: TrendingUp },
    { label: 'Scans Done', value: '34', icon: Droplets },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="My Profile"
        subtitle="Your farmer profile and farm details"
        action={
          <Button
            variant={editing ? 'primary' : 'secondary'}
            icon={editing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            onClick={editing ? handleSave : () => setEditing(true)}
            disabled={saving}
            id="edit-profile-btn"
          >
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        }
      />

      {/* Profile Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Card className="p-6 bg-card-gradient-green text-white">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg overflow-hidden">
                {authProfile?.avatar_url ? (
                  <img src={authProfile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold">{displayName.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                <Camera className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold font-display">{displayName}</h2>
                <Badge className="bg-white/20 text-white border-0">Verified Farmer ✓</Badge>
              </div>
              <p className="text-white/70 text-sm mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {[authProfile?.village, authProfile?.district, authProfile?.state].filter(Boolean).join(', ') || 'Location not set'}
              </p>
              <p className="text-white/60 text-xs mt-1">Member since {memberSince}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-5 bg-white/10 rounded-2xl p-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
        {(['farm', 'achievements', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            id={`profile-tab-${tab}`}
          >
            {tab === 'farm' ? '🌾 Farm' : tab === 'achievements' ? '🏆 Badges' : '📋 History'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'farm' && (
          <div className="grid sm:grid-cols-2 gap-4">
            {([
              { label: 'Full Name', key: 'full_name', icon: User, type: 'text' },
              { label: 'Phone Number', key: 'phone', icon: Phone, type: 'tel' },
              { label: 'Email Address', key: '_email', icon: Mail, type: 'email' },
              { label: 'Village', key: 'village', icon: MapPin, type: 'text' },
              { label: 'District', key: 'district', icon: MapPin, type: 'text' },
              { label: 'State', key: 'state', icon: MapPin, type: 'text' },
              { label: 'Farm Area (acres)', key: 'farm_area_acres', icon: Leaf, type: 'number' },
              { label: 'Soil Type', key: 'soil_type', icon: Leaf, type: 'text' },
              { label: 'Primary Crops', key: 'primary_crops', icon: Leaf, type: 'text' },
              { label: 'Experience (years)', key: 'farming_experience_years', icon: Award, type: 'number' },
              { label: 'KCC Number', key: 'kcc_number', icon: Award, type: 'text' },
            ] as const).map((field) => {
              const value = field.key === '_email'
                ? (user?.email ?? '--')
                : (formData as Record<string, string>)[field.key] ?? '--';
              return (
                <Card key={field.label} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <field.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">{field.label}</p>
                      {editing && field.key !== '_email' ? (
                        <input
                          type={field.type}
                          value={(formData as Record<string, string>)[field.key] ?? ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full text-sm font-medium text-gray-900 dark:text-white bg-transparent border-b border-primary-400 focus:outline-none pb-0.5"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value || '--'}</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((a, i) => (
              <Card key={i} className={`p-4 ${!a.earned ? 'opacity-50' : ''}`}>
                <div className="text-center">
                  <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl ${
                    a.earned ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-100 dark:bg-slate-700'
                  }`}>
                    {a.earned ? a.icon : '🔒'}
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{a.desc}</p>
                  {a.earned && <Badge variant="green" className="mt-2">Earned ✓</Badge>}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {farmHistory.map((h, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{h.season}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{h.crops}</p>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-4 h-4 ${j < h.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-slate-600'}`} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Avg Yield</p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm mt-0.5">{h.yield}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Revenue</p>
                    <p className="font-bold text-green-600 dark:text-green-400 text-sm mt-0.5">{h.revenue}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfilePage;
