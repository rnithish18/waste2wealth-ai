import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Avatar, Badge } from '@/components/ui/Primitives';
import { Input, Textarea } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { api, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface ProfileForm {
  companyName: string;
  industryType: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  gstNumber: string;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProfileForm>({
    defaultValues: {
      companyName: user?.companyName,
      industryType: user?.industryType,
      phone: user?.phone,
      address: user?.address,
      city: user?.city,
      state: user?.state,
      gstNumber: user?.gstNumber,
    },
  });

  const onSubmit = async (values: ProfileForm) => {
    setError('');
    setSuccess(false);
    try {
      await api.put('/users/profile', values);
      await refreshUser();
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout title="Profile & settings">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center text-center lg:col-span-1">
          <Avatar name={user.companyName} src={user.avatar} size={72} />
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">{user.companyName}</h2>
          <p className="text-sm text-ink-faint">{user.industryType}</p>
          <div className="mt-3 flex gap-2">
            <Badge tone="forest" className="capitalize">{user.role}</Badge>
            {user.isEmailVerified && <Badge tone="indigo">Verified</Badge>}
          </div>
          <div className="mt-5 w-full space-y-2 border-t border-ink/[0.06] pt-4 text-left text-sm">
            <p className="text-ink-faint">Email</p>
            <p className="font-medium text-ink">{user.email}</p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-ink">Company details</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <Input label="Company name" {...register('companyName')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Industry type" {...register('industryType')} />
              <Input label="GST number" {...register('gstNumber')} />
            </div>
            <Textarea label="Address" {...register('address')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" {...register('city')} />
              <Input label="State" {...register('state')} />
            </div>
            <Input label="Phone" {...register('phone')} />

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {success && <p className="rounded-lg bg-forest-50 px-3 py-2 text-sm text-forest-700">Profile updated.</p>}

            <Button type="submit" isLoading={isSubmitting}>Save changes</Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
