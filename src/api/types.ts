export interface UserProfile {
  id: string;
  auth_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  // Farm details
  farm_name: string | null;
  farm_area_acres: number | null;
  soil_type: string | null;
  primary_crops: string[] | null;
  village: string | null;
  district: string | null;
  state: string | null;
  kcc_number: string | null;
  farming_experience_years: number | null;
  // App
  preferred_language: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface CropReport {
  id: string;
  user_id: string;
  crop_name: string;
  disease_detected: string | null;
  confidence_score: number | null;
  recommendations: string | null;
  image_url: string | null;
  created_at: string;
}

export interface WeatherData {
  id: string;
  user_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  weather_data: any; // JSON
  forecast_data: any; // JSON
  last_fetched_at: string;
}

export interface MarketPrice {
  id: string;
  crop_name: string;
  market_name: string;
  state: string;
  district: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  price_date: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface CropGuide {
  id: string;
  name: string;
  scientific_name: string | null;
  description: string | null;
  sowing_season: string | null;
  harvesting_season: string | null;
  soil_type: string | null;
  water_requirement: string | null;
  common_diseases: string[] | null;
  image_url: string | null;
  created_at: string;
}

export interface Language {
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
}
