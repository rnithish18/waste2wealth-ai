import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {
  MapPin, Weight, Star, ShieldCheck, Leaf, TreeDeciduous, Recycle,
  MessageCircle, Sparkles, Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Badge, Spinner, Modal } from '@/components/ui/Primitives';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form';
import { api, getErrorMessage } from '@/lib/api';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import type { WasteListing, BuyerRecommendation, User } from '@/types';

export default function WasteDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [waste, setWaste] = useState<WasteListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [recommendations, setRecommendations] = useState<BuyerRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderQty, setOrderQty] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/waste/${id}`).then(({ data }) => setWaste(data.data.waste)).finally(() => setLoading(false));
  }, [id]);

  const isOwner = waste && user && typeof waste.user === 'object' && waste.user._id === user._id;
  const seller = waste && typeof waste.user === 'object' ? (waste.user as User) : null;

  const loadRecommendations = async () => {
    if (!id) return;
    setLoadingRecs(true);
    try {
      const { data } = await api.get(`/ai/recommendations/${id}`);
      setRecommendations(data.data.recommendations);
    } catch {
      // silently ignore — recommendations are a bonus feature
    } finally {
      setLoadingRecs(false);
    }
  };

  const submitOrder = async () => {
    if (!id || !waste) return;
    setOrdering(true);
    setOrderError('');
    try {
      await api.post('/transactions', { wasteId: id, quantity: Number(orderQty) });
      setOrderSuccess(true);
    } catch (err) {
      setOrderError(getErrorMessage(err));
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <DashboardLayout title="Listing"><div className="flex justify-center py-24"><Spinner /></div></DashboardLayout>;
  if (!waste) return <DashboardLayout title="Listing"><p className="py-12 text-center text-ink-faint">Listing not found.</p></DashboardLayout>;

  const coords = waste.pickupLocation?.location?.coordinates;

  return (
    <DashboardLayout title={waste.wasteName}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Gallery */}
          <Card className="p-0 overflow-hidden">
            <div className="h-72 w-full bg-forest-50 sm:h-96">
              {waste.images?.length > 0 ? (
                <img src={waste.images[activeImage]} alt={waste.wasteName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-forest-300"><Recycle className="h-16 w-16" /></div>
              )}
            </div>
            {waste.images?.length > 1 && (
              <div className="flex gap-2 p-3">
                {waste.images.map((img, i) => (
                  <button key={img} onClick={() => setActiveImage(i)} className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${i === activeImage ? 'border-forest-600' : 'border-transparent'}`}>
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Material info */}
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="forest">{waste.category}</Badge>
              <Badge tone="brass">Grade {waste.qualityGrade}</Badge>
              {waste.hazardous && <Badge tone="red">Hazardous</Badge>}
              {waste.aiClassification?.recyclability && (
                <Badge tone="indigo">{waste.aiClassification.recyclability} recyclability</Badge>
              )}
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-ink">Material information</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{waste.description}</p>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-ink/[0.06] pt-5 sm:grid-cols-4">
              <div>
                <dt className="eyebrow-tag">Quantity</dt>
                <dd className="mt-1 font-display text-base font-semibold text-ink">{formatNumber(waste.quantity)} {waste.unit}</dd>
              </div>
              <div>
                <dt className="eyebrow-tag">Material</dt>
                <dd className="mt-1 font-display text-base font-semibold text-ink">{waste.materialType}</dd>
              </div>
              <div>
                <dt className="eyebrow-tag">Moisture</dt>
                <dd className="mt-1 font-display text-base font-semibold text-ink">{waste.moisturePercentage}%</dd>
              </div>
              <div>
                <dt className="eyebrow-tag">Listed</dt>
                <dd className="mt-1 font-display text-base font-semibold text-ink">{formatDate(waste.createdAt)}</dd>
              </div>
            </dl>

            {waste.aiClassification?.confidence !== undefined && (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
                <Sparkles className="h-4 w-4 shrink-0" />
                AI classified this listing with {(waste.aiClassification.confidence * 100).toFixed(0)}% confidence
                — hazard level: {waste.aiClassification.hazardLevel}.
              </div>
            )}
          </Card>

          {/* Carbon impact */}
          {waste.carbonImpact && (
            <Card>
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-forest-600" />
                <h2 className="font-display text-lg font-semibold text-ink">Carbon impact of this exchange</h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <ImpactStat label="CO₂ saved" value={`${formatNumber(waste.carbonImpact.co2SavedKg || 0)} kg`} icon={<Leaf className="h-4 w-4" />} />
                <ImpactStat label="Trees equivalent" value={formatNumber(waste.carbonImpact.treesEquivalent || 0)} icon={<TreeDeciduous className="h-4 w-4" />} />
                <ImpactStat label="Landfill reduced" value={`${formatNumber(waste.carbonImpact.landfillReductionKg || 0)} kg`} icon={<Recycle className="h-4 w-4" />} />
                <ImpactStat label="Energy saved" value={`${formatNumber(waste.carbonImpact.energySavedKwh || 0)} kWh`} icon={<Sparkles className="h-4 w-4" />} />
              </div>
            </Card>
          )}

          {/* Map */}
          {coords && (
            <Card className="p-0 overflow-hidden">
              <div className="h-72 w-full">
                <MapContainer center={[coords[1], coords[0]]} zoom={11} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                  <Marker position={[coords[1], coords[0]]}>
                    <Popup>{waste.pickupLocation?.address || waste.pickupLocation?.city}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </Card>
          )}

          {/* AI Buyer recommendations - only useful/visible to the listing owner */}
          {isOwner && (
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brass-500" />
                  <h2 className="font-display text-lg font-semibold text-ink">AI recommended buyers</h2>
                </div>
                <Button size="sm" variant="outline" onClick={loadRecommendations} isLoading={loadingRecs}>
                  Generate matches
                </Button>
              </div>
              {recommendations.length > 0 && (
                <div className="mt-4 space-y-3">
                  {recommendations.map((r) => (
                    <div key={r.buyer._id} className="flex items-start justify-between rounded-xl border border-ink/[0.06] p-3.5">
                      <div>
                        <p className="text-sm font-medium text-ink">{r.buyer.companyName}</p>
                        <p className="text-xs text-ink-faint">{r.buyer.industryType} · {r.distanceKm ? `${r.distanceKm} km away` : 'Distance unknown'}</p>
                        <p className="mt-1 text-xs text-ink-soft">{r.aiExplanation}</p>
                      </div>
                      <Badge tone="forest">{Math.round(r.matchScore * 100)}% match</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <span className="font-display text-3xl font-semibold text-forest-700">{formatCurrency(waste.price)}</span>
            <span className="ml-1 text-sm text-ink-faint">/ {waste.unit}</span>
            {waste.negotiable && <p className="mt-1 text-xs text-ink-faint">Negotiable</p>}

            {!isOwner && user?.role === 'buyer' && waste.availability && (
              <Button className="mt-4 w-full" onClick={() => setOrderOpen(true)}>Place order</Button>
            )}
            {isOwner && (
              <Link to={`/waste/${id}/edit`} className="mt-4 block">
                <Button variant="outline" className="w-full">Edit listing</Button>
              </Link>
            )}
          </Card>

          {seller && (
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-100 font-display font-semibold text-forest-700">
                  {seller.companyName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{seller.companyName}</p>
                  <p className="text-xs text-ink-faint">{seller.industryType}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-ink-soft">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-ink-faint" /> {seller.city}, {seller.state}</p>
                <p className="flex items-center gap-2"><Star className="h-4 w-4 text-brass-500" /> {seller.rating?.toFixed(1) || 'No'} rating ({seller.ratingCount} reviews)</p>
                <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-forest-600" /> {seller.isEmailVerified ? 'Verified account' : 'Unverified'}</p>
              </div>
              {!isOwner && (
                <Link to={`/messages/${seller._id}`}>
                  <Button variant="outline" className="mt-4 w-full"><MessageCircle className="h-4 w-4" /> Contact seller</Button>
                </Link>
              )}
            </Card>
          )}
        </div>
      </div>

      <Modal open={orderOpen} onClose={() => setOrderOpen(false)} title="Place an order">
        {orderSuccess ? (
          <div className="py-4 text-center">
            <p className="text-sm text-ink">Order placed! The seller has been notified.</p>
            <Button className="mt-4" onClick={() => navigate('/transactions')}>View my orders</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label={`Quantity (${waste.unit}, max ${formatNumber(waste.quantity)})`}
              type="number"
              value={orderQty}
              onChange={(e) => setOrderQty(e.target.value)}
              max={waste.quantity}
            />
            {orderQty && Number(orderQty) > 0 && (
              <p className="text-sm text-ink-faint">Estimated total: <span className="font-medium text-ink">{formatCurrency(Number(orderQty) * waste.price)}</span></p>
            )}
            {orderError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{orderError}</p>}
            <Button className="w-full" onClick={submitOrder} isLoading={ordering} disabled={!orderQty || Number(orderQty) <= 0}>
              Confirm order
            </Button>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

function ImpactStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-forest-50 p-3.5">
      <div className="flex items-center gap-1.5 text-forest-600">{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className="mt-1.5 font-display text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
