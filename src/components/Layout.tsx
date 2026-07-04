import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, MessageSquare, Leaf, BookOpen, CloudSun,
    TrendingUp, Droplets, FlaskConical, User, Settings,
    Sprout, ChevronRight, Menu, X, Bell, Search, LogOut, CalendarDays
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ui/ThemeToggle';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/chat', label: 'AI Chat', icon: MessageSquare },
    { path: '/disease', label: 'Disease Detection', icon: Leaf },
    { path: '/crop-guide', label: 'Crop Guide', icon: BookOpen },
    { path: '/weather', label: 'Weather', icon: CloudSun },
    { path: '/reminders', label: 'Smart Reminders', icon: Bell },
    { path: '/market', label: 'Market Prices', icon: TrendingUp },
    { path: '/planner', label: 'Farming Planner', icon: CalendarDays },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
];

const bottomNavItems = [
    { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { path: '/chat', label: 'AI Chat', icon: MessageSquare },
    { path: '/disease', label: 'Detect', icon: Leaf },
    { path: '/weather', label: 'Weather', icon: CloudSun },
    { path: '/profile', label: 'Profile', icon: User },
];

interface LayoutProps {
    children: React.ReactNode;
}

// ─── Helper: user initials avatar ────────────────────────────────────────────
const UserAvatar: React.FC<{ name?: string; avatarUrl?: string | null; size?: 'sm' | 'md' }> = ({
    name, avatarUrl, size = 'md'
}) => {
    const initials = name
        ? name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : 'KM';
    const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={name ?? 'User'}
                className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
            />
        );
    }
    return (
        <div className={`${sizeClass} rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0`}>
            <span className="font-bold text-white">{initials}</span>
        </div>
    );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { profile, signOut } = useAuth();

    const currentPage = navItems.find(item => item.path === location.pathname);

    const displayName = profile?.full_name ?? 'Farmer';
    const subtitle = profile
        ? [profile.district, profile.state].filter(Boolean).join(', ') || 'KrishiMitra User'
        : 'Loading...';

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success('Signed out successfully');
            navigate('/auth');
        } catch {
            toast.error('Failed to sign out');
        }
    };

    // ─── User info panel (reused in both sidebars) ──────────────────────────
    const UserPanel = () => (
        <div className="p-4 border-t border-gray-100 dark:border-slate-700">
            <NavLink
                to="/profile"
                className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                onClick={() => setSidebarOpen(false)}
                id="user-profile-link"
            >
                <UserAvatar name={displayName} avatarUrl={profile?.avatar_url} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>
                </div>
            </NavLink>
            <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full mt-2 px-3 py-2 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                id="sidebar-signout-btn"
            >
                <LogOut className="w-4 h-4" />
                Sign Out
            </button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex-shrink-0">
                {/* Logo */}
                <div className="flex items-center gap-3 p-5 border-b border-gray-100 dark:border-slate-700">
                    <div className="w-10 h-10 bg-card-gradient-green rounded-xl flex items-center justify-center shadow-md">
                        <Sprout className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-gray-900 dark:text-white font-display">KrishiMitra</h1>
                        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">AI Farming Assistant</p>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                                    isActive
                                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
                                )}
                            >
                                <Icon className={cn('w-5 h-5 flex-shrink-0 transition-transform duration-200',
                                    'group-hover:scale-110',
                                    isActive ? 'text-primary-600 dark:text-primary-400' : ''
                                )} />
                                <span className="flex-1">{item.label}</span>
                                {isActive && <ChevronRight className="w-4 h-4 text-primary-400" />}
                            </NavLink>
                        );
                    })}
                </nav>

                <UserPanel />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-800 z-50 lg:hidden flex flex-col shadow-2xl"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-card-gradient-green rounded-xl flex items-center justify-center shadow-md">
                                        <Sprout className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="font-bold text-lg text-gray-900 dark:text-white font-display">KrishiMitra</h1>
                                        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">AI Farming Assistant</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                                                isActive
                                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span>{item.label}</span>
                                        </NavLink>
                                    );
                                })}
                            </nav>

                            <UserPanel />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3 flex-shrink-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        id="mobile-menu-btn"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex-1">
                        <h2 className="font-semibold text-gray-900 dark:text-white text-base">
                            {currentPage?.label || 'KrishiMitra AI'}
                        </h2>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 flex-1 max-w-xs">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="relative p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            id="notifications-btn"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        <ThemeToggle />
                        {/* Mobile avatar */}
                        <div className="lg:hidden">
                            <UserAvatar name={displayName} avatarUrl={profile?.avatar_url} size="sm" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            {/* Bottom Navigation (Mobile) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-800/90 bottom-nav-blur border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-around px-2 py-2">
                    {bottomNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200"
                            >
                                <div className={cn(
                                    'p-1.5 rounded-lg transition-all duration-200',
                                    isActive ? 'bg-primary-100 dark:bg-primary-900/30' : ''
                                )}>
                                    <Icon className={cn(
                                        'w-5 h-5 transition-colors duration-200',
                                        isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                                    )} />
                                </div>
                                <span className={cn(
                                    'text-[10px] font-medium transition-colors duration-200',
                                    isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                                )}>
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default Layout;
