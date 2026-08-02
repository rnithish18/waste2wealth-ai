import { Link } from 'react-router-dom';
import { MapPin, Weight, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/Primitives';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { WasteListing } from '@/types';

const gradeTone = { A: 'forest', B: 'brass', C: 'neutral', Unrated: 'neutral' } as const;

export function WasteCard({ waste }: { waste: WasteListing }) {
  const seller = typeof waste.user === 'object' ? waste.user : null;
  const image = waste.images?.[0];

  return (
    <Link to={`/waste/${waste._id}`} className="card-surface group overflow-hidden transition-shadow hover:shadow-soft">
      <div className="relative h-44 w-full overflow-hidden bg-forest-50">
        {image ? (
          <img src={image} alt={waste.wasteName} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-forest-300">
            <Leaf className="h-10 w-10" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge tone="neutral" className="bg-white/90 backdrop-blur">{waste.category}</Badge>
          {waste.hazardous && <Badge tone="red" className="bg-white/90 backdrop-blur">Hazardous</Badge>}
        </div>
        <div className="absolute right-3 top-3">
          <Badge tone={gradeTone[waste.qualityGrade]} className="bg-white/90 backdrop-blur">Grade {waste.qualityGrade}</Badge>
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 font-display text-base font-semibold text-ink">{waste.wasteName}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-faint">{waste.description}</p>

        <div className="mt-3 flex items-center gap-4 font-mono text-xs text-ink-soft">
          <span className="flex items-center gap-1">
            <Weight className="h-3.5 w-3.5" /> {formatNumber(waste.quantity)} {waste.unit}
          </span>
          {waste.pickupLocation?.city && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {waste.pickupLocation.city}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-ink/[0.06] pt-3">
          <span className="font-display text-lg font-semibold text-forest-700">
            {formatCurrency(waste.price)}
            <span className="text-xs font-normal text-ink-faint"> /{waste.unit}</span>
          </span>
          {seller && <span className="line-clamp-1 max-w-[40%] text-xs text-ink-faint">{seller.companyName}</span>}
        </div>
      </div>
    </Link>
  );
}
