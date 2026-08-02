import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { api, getErrorMessage } from '@/lib/api';
import { CheckCircle2 } from 'lucide-react';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    try {
      await api.post('/auth/forgot-password', values);
      setSent(true);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a secure reset link.">
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-forest-50 px-6 py-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-forest-600" />
          <p className="text-sm text-ink">If an account exists for that email, a reset link is on its way.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" placeholder="you@company.com" {...register('email')} error={errors.email?.message} />
          {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink-faint">
        <Link to="/login" className="font-medium text-forest-700 hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
