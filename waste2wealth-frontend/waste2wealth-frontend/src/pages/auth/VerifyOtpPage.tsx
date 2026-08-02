import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { api, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resent, setResent] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await api.post('/auth/verify-email', { otp });
      await refreshUser();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await api.post('/auth/resend-otp');
      setResent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle="Enter the 6-digit code we sent to your inbox.">
      <form onSubmit={handleVerify} className="space-y-4">
        <Input
          label="Verification code"
          placeholder="123456"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {resent && <p className="rounded-lg bg-forest-50 px-3 py-2 text-sm text-forest-700">Code resent. Check your inbox.</p>}
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Verify email
        </Button>
      </form>
      <button onClick={handleResend} className="mt-4 w-full text-center text-sm font-medium text-forest-700 hover:underline">
        Resend code
      </button>
    </AuthLayout>
  );
}
