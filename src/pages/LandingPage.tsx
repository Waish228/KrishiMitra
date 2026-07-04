import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sprout, MessageSquare, Leaf, CloudSun, TrendingUp,
  Droplets, FlaskConical, BookOpen, ArrowRight, Star,
  Shield, Zap, Globe, ChevronDown, Check, Play
} from 'lucide-react';

const features = [
  {
    icon: <Leaf className="w-6 h-6" />,
    title: 'AI Disease Detection',
    description: 'Upload crop photos and get instant AI-powered disease diagnosis with treatment recommendations.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'KrishiMitra AI Chat',
    description: 'Ask farming questions in Hindi or English and get expert answers powered by advanced AI.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: <CloudSun className="w-6 h-6" />,
    title: 'Hyperlocal Weather',
    description: 'Get precise weather forecasts for your farm location with crop-specific advisory.',
    color: 'from-orange-500 to-amber-600',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Live Market Prices',
    description: 'Track real-time Mandi prices and get AI-powered predictions for best selling time.',
    color: 'from-purple-500 to-violet-600',
  },
  {
    icon: <Droplets className="w-6 h-6" />,
    title: 'Smart Irrigation',
    description: 'AI-optimized irrigation schedules based on soil moisture, crop stage, and weather data.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: <FlaskConical className="w-6 h-6" />,
    title: 'Fertilizer Planner',
    description: 'Personalized NPK recommendations based on soil test reports and crop requirements.',
    color: 'from-rose-500 to-pink-600',
  },
];

const testimonials = [
  {
    name: 'Ramesh Kumar',
    location: 'Pune, Maharashtra',
    crop: 'Sugarcane Farmer',
    text: 'KrishiMitra helped me detect leaf blight early. Saved 40% of my crop this season!',
    rating: 5,
  },
  {
    name: 'Priya Devi',
    location: 'Amritsar, Punjab',
    crop: 'Wheat Farmer',
    text: 'The market price alerts helped me sell at the right time. Profit increased by ₹2000/quintal.',
    rating: 5,
  },
  {
    name: 'Suresh Patel',
    location: 'Anand, Gujarat',
    crop: 'Cotton Farmer',
    text: 'AI irrigation planner reduced my water usage by 30% while improving yields.',
    rating: 5,
  },
];

const stats = [
  { value: '2M+', label: 'Farmers Helped' },
  { value: '15K+', label: 'Diseases Detected' },
  { value: '98%', label: 'Accuracy Rate' },
  { value: '12', label: 'Languages Supported' },
];

const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does AI crop disease detection work?',
      a: 'Upload a clear photo of your affected crop. Our AI model analyzes visual patterns, compares with a database of 50,000+ disease samples, and provides diagnosis with 98% accuracy along with treatment options.'
    },
    {
      q: 'Is KrishiMitra available in Hindi?',
      a: 'Yes! KrishiMitra fully supports Hindi, English, Marathi, Telugu, Tamil, Punjabi, and 6 more regional languages.'
    },
    {
      q: 'How accurate are the market price predictions?',
      a: 'Our AI analyzes historical Mandi data, seasonal trends, and supply-demand factors to provide price forecasts with typically 85-90% accuracy for 7-day predictions.'
    },
    {
      q: 'Is it free to use?',
      a: 'KrishiMitra offers a free plan with basic features. Premium plans unlock unlimited AI scans, advanced analytics, and priority support.'
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-card-gradient-green rounded-lg flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white font-display">KrishiMitra AI</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Features</a>
              <a href="#testimonials" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Testimonials</a>
              <a href="#faq" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">FAQ</a>
              <Link
                to="/dashboard"
                className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
            <Link to="/dashboard" className="md:hidden bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-hero-gradient overflow-hidden pt-16">
        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span className="text-white/90 text-sm font-medium">Powered by Google Gemini AI</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight font-display">
                Smart Farming
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200">
                  Starts Here
                </span>
              </h1>

              <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-lg">
                KrishiMitra AI empowers farmers with AI-powered crop disease detection, 
                real-time market prices, weather forecasts, and expert farming guidance — 
                all in one app.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                >
                  Start for Free <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="flex items-center justify-center gap-2 border border-white/30 text-white font-medium px-6 py-3.5 rounded-xl hover:bg-white/10 transition-all duration-200">
                  <Play className="w-5 h-5 fill-white" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-6 mt-10">
                <div className="flex -space-x-3">
                  {['RS', 'PD', 'SP', 'MK'].map((initials, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{initials}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/70 text-sm">Trusted by 2M+ farmers</p>
                </div>
              </div>
            </motion.div>

            {/* Hero visual cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                {/* Main card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-red-300" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Disease Detected</p>
                      <p className="text-white/60 text-xs">Wheat Rust • 94% confidence</p>
                    </div>
                    <span className="ml-auto bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-full">High Risk</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Affected Area</span>
                      <span className="text-white font-medium">~35%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-yellow-400 to-red-500 h-2 rounded-full" style={{ width: '35%' }} />
                    </div>
                    <p className="text-white/60 text-xs mt-2">Recommended: Apply Propiconazole fungicide within 48hrs</p>
                  </div>
                </div>

                {/* Weather card floating */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⛅</span>
                    <div>
                      <p className="text-white font-bold text-xl">28°C</p>
                      <p className="text-white/60 text-xs">Partly Cloudy • Lucknow</p>
                    </div>
                  </div>
                </motion.div>

                {/* Price card floating */}
                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl"
                >
                  <p className="text-white/70 text-xs mb-1">🌾 Wheat • Mandi Price</p>
                  <p className="text-white font-bold text-lg">₹2,340/qtl</p>
                  <p className="text-green-300 text-xs">↑ +120 today</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-bold text-white font-display">{stat.value}</p>
                <p className="text-primary-200 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white font-display">
              Everything a Smart Farmer Needs
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              AI-powered tools designed specifically for Indian farmers to maximize yield and profit.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-md`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-display">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display">What Farmers Say</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">Real stories from real farmers across India</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 dark:bg-slate-700 rounded-2xl p-6 border border-gray-100 dark:border-slate-600"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.crop} • {t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-display mb-4">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join 2 million farmers already using KrishiMitra AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold px-8 py-4 rounded-xl hover:bg-green-50 transition-all shadow-lg hover:shadow-xl"
            >
              Start Free Today <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-white/60 text-sm">
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-300" /> No credit card required</div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-300" /> Free forever plan</div>
            <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-green-300" /> Works offline</div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-card-gradient-green rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">KrishiMitra AI</span>
          </div>
          <p className="text-slate-400 text-sm mb-8 max-w-md">
            Empowering Indian farmers with AI-powered insights for better yields and sustainable farming.
          </p>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-400">
            <p>© 2026 KrishiMitra AI. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
