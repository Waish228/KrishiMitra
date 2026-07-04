import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Wind, Droplets, Eye, Gauge, Sunrise, Sunset,
    Thermometer, CloudRain, MapPin, RefreshCw, Loader2, Sparkles, Sprout
} from 'lucide-react';
import { Card, PageHeader } from '../components/ui/Components';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { saveWeatherHistory } from '../lib/weather';
import { generateWeatherAdvisory } from '../api/ai/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { SupportedLanguage } from '../api/ai/prompts';

interface WeatherData {
    current: {
        temp: number;
        feelsLike: number;
        humidity: number;
        wind: number;
        rain: number;
        condition: string;
        icon: string;
        isDay: boolean;
    };
    hourly: { time: string; temp: number; icon: string; rain: number }[];
    daily: { day: string; high: number; low: number; icon: string; condition: string; rain: number; wind: number }[];
}

export default function WeatherPage() {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [advisoryStream, setAdvisoryStream] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [locationName, setLocationName] = useState('Fetching location...');
    const [activeDay, setActiveDay] = useState(0);

    const hasFetchedHistory = useRef(false);

    const selectedLanguage = (profile?.preferred_language as SupportedLanguage) || 'English';

    const fetchWeather = async () => {
        setLoading(true);
        setAdvisoryStream('');
        hasFetchedHistory.current = false;

        try {
            // 1. Get user location
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
            });
            const { latitude, longitude } = pos.coords;

            // Reverse geocode for city name
            try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                const geoData = await geoRes.json();
                setLocationName(geoData.address.city || geoData.address.town || geoData.address.village || 'Your Farm');
            } catch (e) {
                setLocationName('Your Farm');
            }

            // 2. Fetch Open-Meteo
            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto`
            );
            const data = await weatherRes.json();

            const parseCode = (code: number, isDay = true) => {
                if (code <= 3) return { condition: 'Clear/Cloudy', icon: isDay ? '⛅' : '🌙' };
                if (code <= 49) return { condition: 'Foggy', icon: '🌫️' };
                if (code <= 69) return { condition: 'Rain', icon: '🌧️' };
                if (code <= 79) return { condition: 'Snow', icon: '❄️' };
                return { condition: 'Storm', icon: '⛈️' };
            };

            const currCond = parseCode(data.current.weather_code, data.current.is_day === 1);

            const formattedData: WeatherData = {
                current: {
                    temp: Math.round(data.current.temperature_2m),
                    feelsLike: Math.round(data.current.apparent_temperature),
                    humidity: data.current.relative_humidity_2m,
                    wind: Math.round(data.current.wind_speed_10m),
                    rain: data.current.precipitation,
                    condition: currCond.condition,
                    icon: currCond.icon,
                    isDay: data.current.is_day === 1,
                },
                hourly: data.hourly.time.slice(0, 24).filter((_: any, i: number) => i % 3 === 0).map((time: string, i: number) => {
                    const d = new Date(time);
                    const isDay = d.getHours() >= 6 && d.getHours() <= 18;
                    return {
                        time: d.getHours() === 0 ? '12 AM' : d.getHours() > 12 ? `${d.getHours() - 12} PM` : `${d.getHours()} AM`,
                        temp: Math.round(data.hourly.temperature_2m[i * 3]),
                        icon: parseCode(data.hourly.weather_code[i * 3], isDay).icon,
                        rain: data.hourly.precipitation_probability[i * 3],
                    };
                }),
                daily: data.daily.time.slice(0, 7).map((time: string, i: number) => {
                    const d = new Date(time);
                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    return {
                        day: i === 0 ? 'Today' : days[d.getDay()],
                        high: Math.round(data.daily.temperature_2m_max[i]),
                        low: Math.round(data.daily.temperature_2m_min[i]),
                        icon: parseCode(data.daily.weather_code[i]).icon,
                        condition: parseCode(data.daily.weather_code[i]).condition,
                        rain: data.daily.precipitation_probability_max[i],
                        wind: Math.round(data.daily.wind_speed_10m_max[i]),
                    };
                }),
            };

            setWeatherData(formattedData);

            // 3. Save History
            if (profile?.id && !hasFetchedHistory.current) {
                hasFetchedHistory.current = true;
                saveWeatherHistory({
                    userId: profile.id,
                    location: { lat: latitude, lng: longitude },
                    temperature: formattedData.current.temp,
                    humidity: formattedData.current.humidity,
                    windSpeed: formattedData.current.wind,
                    rain: formattedData.current.rain,
                });
            }

            // 4. Generate Advisory
            generateAdvisory(formattedData);

        } catch (error) {
            console.error(error);
            setLocationName('Location Access Denied');
        } finally {
            setLoading(false);
        }
    };

    const generateAdvisory = async (data: WeatherData) => {
        setIsGenerating(true);
        const context = `
Current Temp: ${data.current.temp}°C
Humidity: ${data.current.humidity}%
Wind Speed: ${data.current.wind} km/h
Rain Today: ${data.current.rain} mm
Tomorrow's Forecast: ${data.daily[1].high}°C, ${data.daily[1].rain}% chance of rain.
    `;

        try {
            const stream = generateWeatherAdvisory(context, selectedLanguage);
            let fullText = '';
            for await (const chunk of stream) {
                fullText += chunk;
                setAdvisoryStream(fullText);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        fetchWeather();
    }, []);

    return (
        <div className="page-container max-w-5xl mx-auto">
            <PageHeader
                title="Weather Forecast"
                subtitle="Hyperlocal AI farming weather intelligence"
                action={
                    <button onClick={fetchWeather} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50">
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Refresh
                    </button>
                }
            />

            <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span>{locationName} • Live Sensor Data</span>
            </div>

            {loading && !weatherData ? (
                <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
                    <p className="text-gray-500 animate-pulse">Fetching meteorological data...</p>
                </div>
            ) : weatherData && (
                <>
                    {/* Current Weather Hero */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                        <Card className="bg-card-gradient-green p-6 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 opacity-10 text-[180px] leading-none">{weatherData.current.icon}</div>
                            <div className="relative z-10">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-end gap-3">
                                            <span className="text-8xl font-bold font-display leading-none">{weatherData.current.temp}°</span>
                                            <div className="mb-3">
                                                <p className="text-white/80 text-xl">{weatherData.current.condition}</p>
                                                <p className="text-white/60 text-sm">Feels like {weatherData.current.feelsLike}°C</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 mt-4 text-sm text-white/70">
                                            <span className="flex items-center gap-1.5"><Wind className="w-4 h-4" /> {weatherData.current.wind} km/h</span>
                                            <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4" /> {weatherData.current.humidity}%</span>
                                            <span className="flex items-center gap-1.5"><CloudRain className="w-4 h-4" /> {weatherData.current.rain} mm</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* AI Advisory */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
                        <Card className="p-6 border border-primary-100 dark:border-primary-900/50 bg-primary-50/50 dark:bg-primary-900/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-primary-500" />
                                <h2 className="font-bold text-gray-900 dark:text-white">What should the farmer do today?</h2>
                                {isGenerating && <Loader2 className="w-4 h-4 text-primary-400 animate-spin ml-2" />}
                            </div>

                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                {advisoryStream ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{advisoryStream}</ReactMarkdown>
                                ) : (
                                    <p className="text-gray-400 italic">Analyzing meteorological data to formulate advisory...</p>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    <div className="grid lg:grid-cols-12 gap-6">
                        {/* Hourly Forecast */}
                        <div className="lg:col-span-8">
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                                <h2 className="section-title mb-3">Hourly Forecast</h2>
                                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                    {weatherData.hourly.map((h, i) => (
                                        <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl border w-24 bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-700 dark:text-gray-300">
                                            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{h.time}</p>
                                            <span className="text-3xl">{h.icon}</span>
                                            <p className="font-bold text-lg">{h.temp}°</p>
                                            <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">💧 {h.rain}%</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* 7-Day Forecast */}
                        <div className="lg:col-span-4">
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <h2 className="section-title mb-3">7-Day Forecast</h2>
                                <Card className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {weatherData.daily.map((day, i) => (
                                        <div key={i} onClick={() => setActiveDay(i)} className={cn('flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors', activeDay === i ? 'bg-primary-50 dark:bg-primary-900/10' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50')}>
                                            <p className={cn('w-12 text-sm font-medium', activeDay === i ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400')}>{day.day}</p>
                                            <span className="text-2xl flex-shrink-0">{day.icon}</span>
                                            <div className="flex items-center gap-1.5 text-xs text-blue-500 flex-1 justify-end">
                                                <Droplets className="w-3 h-3" />
                                                <span>{day.rain}%</span>
                                            </div>
                                            <div className="flex items-center gap-2 ml-2 w-16 justify-end">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{day.high}°</span>
                                                <span className="text-sm text-gray-400">{day.low}°</span>
                                            </div>
                                        </div>
                                    ))}
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
