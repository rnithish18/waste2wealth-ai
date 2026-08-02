import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Badge } from '@/components/ui/Primitives';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { api, getErrorMessage } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const categories = ['Metal', 'Plastic', 'Paper', 'Textile', 'Chemical', 'Wood', 'Glass', 'Rubber', 'E-Waste', 'Organic', 'Construction', 'Other'];
const units = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'ton', label: 'Tons' },
  { value: 'litre', label: 'Litres' },
  { value: 'piece', label: 'Pieces' },
  { value: 'cubic_meter', label: 'Cubic meters' },
];

const schema = z.object({
  wasteName: z.string().min(2, 'Required'),
  category: z.string().min(1, 'Required'),
  materialType: z.string().min(2, 'Required'),
  description: z.string().min(10, 'Give at least a short description'),
  quantity: z.coerce.number().positive('Must be greater than 0'),
  unit: z.string().min(1, 'Required'),
  price: z.coerce.number().positive('Must be greater than 0'),
  qualityGrade: z.string().optional(),
  pickupCity: z.string().min(1, 'Required'),
  pickupState: z.string().min(1, 'Required'),
  pickupAddress: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function UploadWastePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [aiClassification, setAiClassification] = useState<any>(null);
  const [aiPrice, setAiPrice] = useState<any>(null);
  const [carbon, setCarbon] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { qualityGrade: 'Unrated' },
  });

  const runAIAssist = async () => {
    const values = getValues();
    if (!values.description || !values.materialType || !values.category || !values.quantity || !values.unit) return;
    setAiLoading(true);
    try {
      const [classifyRes, priceRes, carbonRes] = await Promise.all([
        api.post('/ai/classify', { description: values.description, materialType: values.materialType }),
        api.post('/ai/price-predict', { category: values.category, materialType: values.materialType, quantity: values.quantity, unit: values.unit }),
        api.post('/ai/carbon', { category: values.category, quantity: values.quantity, unit: values.unit }),
      ]);
      setAiClassification(classifyRes.data.data);
      setAiPrice(priceRes.data.data);
      setCarbon(carbonRes.data.data);
    } catch (err) {
      // AI assist is optional - fail silently, form remains usable
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    try {
      const { data } = await api.post('/waste', values);
      const wasteId = data.data.waste._id;
      if (carbon) {
        // persist the previously-computed carbon preview onto the created listing
        await api.put(`/waste/${wasteId}`, { carbonImpact: carbon }).catch(() => {});
      }
      navigate(`/waste/${wasteId}`);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout title="List waste">
      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 lg:col-span-2">
          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">Material details</h2>
            <div className="mt-4 space-y-4">
              <Input label="Waste / material name" placeholder="e.g. Cotton fabric cutting waste" {...register('wasteName')} error={errors.wasteName?.message} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Category" placeholder="Select category" options={categories.map((c) => ({ value: c, label: c }))} {...register('category')} error={errors.category?.message} />
                <Input label="Material type" placeholder="e.g. Cotton scrap" {...register('materialType')} error={errors.materialType?.message} />
              </div>
              <Textarea label="Description" placeholder="Describe condition, contamination, source process..." {...register('description')} error={errors.description?.message} />
              <div className="grid grid-cols-3 gap-4">
                <Input label="Quantity" type="number" step="any" {...register('quantity')} error={errors.quantity?.message} />
                <Select label="Unit" options={units} {...register('unit')} error={errors.unit?.message} />
                <Select label="Quality grade" options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'Unrated', label: 'Unrated' }]} {...register('qualityGrade')} />
              </div>
              <Input label="Price (₹ per unit)" type="number" step="any" {...register('price')} error={errors.price?.message} />
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">Pickup location</h2>
            <div className="mt-4 grid gap-4">
              <Input label="Address" placeholder="Plot / street / industrial estate" {...register('pickupAddress')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" {...register('pickupCity')} error={errors.pickupCity?.message} />
                <Input label="State" {...register('pickupState')} error={errors.pickupState?.message} />
              </div>
            </div>
          </Card>

          {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}

          <Button type="submit" size="lg" isLoading={isSubmitting}>Publish listing</Button>
        </form>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brass-500" />
              <h2 className="font-display text-base font-semibold text-ink">AI assist</h2>
            </div>
            <p className="mt-2 text-sm text-ink-faint">
              Fill in category, material type, quantity, and description, then run AI assist to preview
              classification, suggested pricing, and carbon impact before you publish.
            </p>
            <Button variant="outline" className="mt-4 w-full" onClick={runAIAssist} isLoading={aiLoading} type="button">
              Run AI assist
            </Button>

            {aiClassification && (
              <div className="mt-4 space-y-2 rounded-xl bg-indigo-50 p-3.5 text-sm text-indigo-900">
                <p className="font-medium">Classification</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="indigo">{aiClassification.predictedCategory}</Badge>
                  <Badge tone="indigo">{aiClassification.recyclability} recyclability</Badge>
                  <Badge tone="indigo">Hazard: {aiClassification.hazardLevel}</Badge>
                </div>
                <p className="text-xs text-indigo-700">{aiClassification.reasoning}</p>
              </div>
            )}

            {aiPrice && (
              <div className="mt-3 rounded-xl bg-brass-50 p-3.5 text-sm text-brass-900">
                <p className="font-medium">Suggested price</p>
                <p className="mt-1 font-display text-lg font-semibold">{formatCurrency(aiPrice.suggestedPrice)}</p>
                <p className="text-xs text-brass-700">Range: {formatCurrency(aiPrice.priceRangeLow)} – {formatCurrency(aiPrice.priceRangeHigh)}</p>
                <p className="mt-1 text-xs text-brass-700">{aiPrice.reasoning}</p>
              </div>
            )}

            {carbon && (
              <div className="mt-3 rounded-xl bg-forest-50 p-3.5 text-sm text-forest-900">
                <p className="font-medium">Carbon impact</p>
                <p className="mt-1 text-xs text-forest-700">{carbon.co2SavedKg} kg CO₂ saved · {carbon.treesEquivalent} trees equivalent</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
