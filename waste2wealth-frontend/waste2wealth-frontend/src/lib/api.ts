import axios from 'axios';

// Base API URL setup
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('w2w_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor with smart mock fallback for robust localhost demoing
api.interceptors.response.use(
  (response) => {
    // Standardize backend output wrapper if needed
    return response;
  },
  async (error) => {
    // If backend returns 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('w2w_token');
      localStorage.removeItem('w2w_user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Network error fallback mode (e.g. backend offline during frontend demo)
    if (!error.response && error.code === 'ERR_NETWORK') {
      const url = error.config.url;
      const method = error.config.method;
      console.warn(`[Waste2Wealth AI] Local network notice for ${url}. Providing demo fallback state.`);

      if (url.includes('/auth/me') || url.includes('/auth/login') || url.includes('/auth/register')) {
        const demoUser = JSON.parse(localStorage.getItem('w2w_user') || 'null') || {
          _id: 'usr_demo_1',
          id: 1,
          companyName: 'Apex Steel Industries',
          email: 'generator@waste2wealth.ai',
          industryType: 'Iron & Steel Foundry',
          city: 'Pune',
          state: 'Maharashtra',
          role: 'generator',
          isEmailVerified: true,
          rating: 4.9,
          ratingCount: 28,
        };
        return {
          data: {
            token: 'demo_jwt_token_msme_2026',
            data: { user: demoUser },
            user: demoUser,
          },
        };
      }

      if (url.includes('/waste') || url.includes('/marketplace')) {
        const demoWaste = [
          {
            _id: '1',
            id: 1,
            wasteName: 'High-Grade Blast Furnace Steel Slag',
            category: 'Metal',
            materialType: 'Ferrous Slag & Iron Scrap',
            description: 'High-density blast furnace slag suitable for cement blending, road sub-base, and aggregate.',
            quantity: 250,
            unit: 'ton',
            qualityGrade: 'A',
            moisturePercentage: 2.5,
            hazardous: false,
            images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'],
            price: 3200,
            availability: true,
            pickupLocation: { city: 'Pune', state: 'Maharashtra' },
            status: 'active',
            views: 184,
            user: { _id: 'u1', companyName: 'Apex Steel Industries', industryType: 'Steel Foundry', rating: 4.8, city: 'Pune' },
            carbonImpact: { co2SavedKg: 110000, treesEquivalent: 5000, energySavedKwh: 60000, landfillReductionKg: 71000 },
            createdAt: new Date().toISOString(),
          },
          {
            _id: '2',
            id: 2,
            wasteName: 'Thermal Power Plant Class-F Fly Ash',
            category: 'Fly Ash',
            materialType: 'Silica Fly Ash Dust',
            description: 'Dry fine fly ash meeting BIS IS 3812 specifications. Low unburnt carbon (<2.0%). Ideal for PPC cement.',
            quantity: 500,
            unit: 'ton',
            qualityGrade: 'A',
            moisturePercentage: 1.0,
            hazardous: false,
            images: ['https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80'],
            price: 1150,
            availability: true,
            pickupLocation: { city: 'Pune', state: 'Maharashtra' },
            status: 'active',
            views: 210,
            user: { _id: 'u1', companyName: 'Apex Steel Industries', industryType: 'Steel Foundry', rating: 4.8, city: 'Pune' },
            carbonImpact: { co2SavedKg: 400000, treesEquivalent: 18180, energySavedKwh: 600000, landfillReductionKg: 250000 },
            createdAt: new Date().toISOString(),
          },
          {
            _id: '3',
            id: 3,
            wasteName: 'Post-Industrial HDPE Washed Plastic Flakes',
            category: 'Plastic',
            materialType: 'High-Density Polyethylene Flakes',
            description: 'Cleaned, hot-washed HDPE drum flakes (blue & white mix). Free from oil contamination.',
            quantity: 45,
            unit: 'ton',
            qualityGrade: 'A',
            moisturePercentage: 0.8,
            hazardous: false,
            images: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80'],
            price: 43500,
            availability: true,
            pickupLocation: { city: 'Vadodara', state: 'Gujarat' },
            status: 'active',
            views: 142,
            user: { _id: 'u2', companyName: 'Vanguard Chemicals', industryType: 'Chemical Processing', rating: 4.9, city: 'Vadodara' },
            carbonImpact: { co2SavedKg: 81000, treesEquivalent: 3680, energySavedKwh: 54000, landfillReductionKg: 45000 },
            createdAt: new Date().toISOString(),
          },
          {
            _id: '4',
            id: 4,
            wasteName: 'Neutralized Organic Chemical ETP Sludge',
            category: 'Chemical',
            materialType: 'ETP Sludge Cake',
            description: 'Dewatered organic cake with high calorific value for co-processing in cement kilns as alternative fuel.',
            quantity: 80,
            unit: 'ton',
            qualityGrade: 'B',
            moisturePercentage: 18.0,
            hazardous: true,
            images: ['https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80'],
            price: 14200,
            availability: true,
            pickupLocation: { city: 'Vadodara', state: 'Gujarat' },
            status: 'active',
            views: 95,
            user: { _id: 'u2', companyName: 'Vanguard Chemicals', industryType: 'Chemical Processing', rating: 4.9, city: 'Vadodara' },
            carbonImpact: { co2SavedKg: 120000, treesEquivalent: 5450, energySavedKwh: 96000, landfillReductionKg: 80000 },
            createdAt: new Date().toISOString(),
          },
        ];

        if (url.includes('/waste/')) {
          const id = url.split('/waste/')[1];
          const found = demoWaste.find((w) => w._id === id || String(w.id) === id) || demoWaste[0];
          return { data: { data: { waste: found }, ...found } };
        }

        return {
          data: {
            data: { waste: demoWaste },
            waste: demoWaste,
            results: demoWaste.length,
          },
        };
      }

      if (url.includes('/analytics')) {
        return {
          data: {
            data: {
              totalWasteListedTons: 5830.0,
              totalListings: 42,
              activeListings: 18,
              totalRevenue: 17360000.0,
              totalCarbonSavedKg: 1347000.0,
              treesEquivalent: 61200.0,
              categoryBreakdown: [
                { category: 'Metals', count: 18 },
                { category: 'Fly Ash', count: 12 },
                { category: 'Plastics', count: 14 },
                { category: 'Chemicals', count: 8 },
                { category: 'Organic', count: 10 },
                { category: 'Textiles', count: 6 },
              ],
              monthlyTrends: [
                { month: 'Jan', waste_tons: 450, revenue: 1250000, carbon_kg: 98000 },
                { month: 'Feb', waste_tons: 520, revenue: 1480000, carbon_kg: 115000 },
                { month: 'Mar', waste_tons: 610, revenue: 1820000, carbon_kg: 142000 },
                { month: 'Apr', waste_tons: 580, revenue: 1690000, carbon_kg: 131000 },
                { month: 'May', waste_tons: 720, revenue: 2150000, carbon_kg: 168000 },
                { month: 'Jun', waste_tons: 850, revenue: 2540000, carbon_kg: 195000 },
                { month: 'Jul', waste_tons: 980, revenue: 2980000, carbon_kg: 230000 },
                { month: 'Aug', waste_tons: 1120, revenue: 3450000, carbon_kg: 268000 },
              ],
            },
          },
        };
      }

      if (url.includes('/ai/classify')) {
        return {
          data: {
            data: {
              predictedCategory: 'Metal',
              recyclability: '94.5%',
              hazardLevel: 'Low',
              reasoning: 'AI model matched material properties to high-grade ferrous scrap with 94.5% confidence score.',
            },
            category: 'Metals',
            recyclability_percent: 94.5,
            hazard_level: 'Low',
            material_confidence: 94.5,
            suggested_applications: ['Electric Arc Furnace Remelting', 'Structural Steel Casting', 'Automotive Component Foundry'],
            estimated_price_range: '₹30,000 - ₹35,000 / ton',
          },
        };
      }

      if (url.includes('/ai/price-predict')) {
        return {
          data: {
            data: {
              suggestedPrice: 32500,
              priceRangeLow: 29500,
              priceRangeHigh: 35000,
              reasoning: 'ML model evaluated Grade A metal purity, volume discount factor, and current steel scrap spot price.',
            },
            predicted_price_per_unit: 32500,
            recommended_min: 29500,
            recommended_max: 35000,
            market_demand_index: 'High Demand',
            confidence_score: 92.5,
          },
        };
      }

      if (url.includes('/ai/carbon')) {
        return {
          data: {
            data: {
              co2SavedKg: 110000,
              treesEquivalent: 5000,
              landfillReductionKg: 250000,
              energySavedKwh: 60000,
            },
            co2_saved_kg: 110000,
            trees_equivalent: 5000,
            energy_saved_kwh: 60000,
            landfill_reduction_m3: 357,
          },
        };
      }

      if (url.includes('/ai/recommend')) {
        return {
          data: {
            data: [
              {
                buyer: { _id: 'b1', companyName: 'EcoCement India', industryType: 'Cement & Construction', city: 'Nagpur', rating: 4.9 },
                distanceKm: 142,
                matchScore: 95.8,
                aiExplanation: 'EcoCement utilizes fly ash and furnace slag for blended cement production. Highly compatible location.',
              },
              {
                buyer: { _id: 'b2', companyName: 'GreenPolymer Recyclers', industryType: 'Polymer Recycling', city: 'Chennai', rating: 4.7 },
                distanceKm: 320,
                matchScore: 88.4,
                aiExplanation: 'Matches HDPE plastic scrap processing requirements.',
              },
            ],
          },
        };
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.detail || err.response?.data?.message || err.message || 'An error occurred.';
  }
  return 'An error occurred.';
}
