import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WasteCard } from '@/components/shared/WasteCard';
import { Input, Select } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { EmptyState, Spinner } from '@/components/ui/Primitives';
import { api } from '@/lib/api';
import type { WasteListing } from '@/types';

const categories = ['Metal', 'Plastic', 'Paper', 'Textile', 'Chemical', 'Wood', 'Glass', 'Rubber', 'E-Waste', 'Organic', 'Construction', 'Other'];

export default function MarketplacePage() {
  const [waste, setWaste] = useState<WasteListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchListings = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    params.set('sortBy', sortBy);
    params.set('limit', '24');

    api.get(`/waste/marketplace?${params.toString()}`)
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data.data?.waste || data.data || data.waste || []);
        // Transform Python model fields to JS camelCase if needed
        const formatted = list.map((w: any) => ({
          _id: String(w.id || w._id),
          wasteName: w.waste_name || w.wasteName,
          category: w.category,
          materialType: w.material_type || w.materialType,
          description: w.description,
          quantity: w.quantity,
          unit: w.unit || 'tons',
          qualityGrade: w.quality_grade || w.qualityGrade || 'A',
          moisturePercentage: w.moisture_percentage || w.moisturePercentage || 5,
          hazardous: w.hazardous ?? false,
          images: typeof w.images === 'string' ? [w.images] : (w.images || ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80']),
          price: w.price,
          availability: true,
          pickupLocation: { city: w.pickup_location || w.pickupLocation?.city || 'Pune', state: w.state || 'Maharashtra' },
          status: w.status || 'active',
          views: w.views || 45,
          user: w.owner ? { _id: String(w.owner.id), companyName: w.owner.company_name, industryType: w.owner.industry_type, rating: 4.8, city: w.owner.city } : { companyName: 'Industrial Metals Corp', city: 'Pune' }
        }));
        setWaste(formatted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, sortBy, minPrice, maxPrice]);

  useEffect(() => {
    const t = setTimeout(fetchListings, 300);
    return () => clearTimeout(t);
  }, [fetchListings]);

  return (
    <DashboardLayout title="Industrial Waste Marketplace">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            placeholder="Search materials, steel slag, fly ash, HDPE, chemicals..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      {showFilters && (
        <div className="mt-4 grid gap-4 rounded-2xl border border-ink/[0.06] bg-white p-4 sm:grid-cols-4">
          <Select
            label="Category"
            placeholder="All categories"
            options={categories.map((c) => ({ value: c, label: c }))}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Input label="Min price (₹)" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <Input label="Max price (₹)" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          <Select
            label="Sort by"
            options={[
              { value: '-createdAt', label: 'Newest first' },
              { value: 'price', label: 'Price: low to high' },
              { value: '-price', label: 'Price: high to low' },
              { value: '-quantity', label: 'Quantity: high to low' },
            ]}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          />
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-24"><Spinner /></div>
        ) : waste.length === 0 ? (
          <EmptyState title="No matching listings" description="Try widening your filters or search terms." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {waste.map((w) => <WasteCard key={w._id} waste={w} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
