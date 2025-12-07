import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useAuthStore from '../store/authStore';

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { forgotPassword, isLoading } = useAuthStore();

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data.email);
      toast.success('Password reset email sent. Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Request failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Reset your password</h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">Enter your account email and we'll send instructions.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              {...register('email', { required: 'Email is required' })}
              error={errors.email?.message}
            />
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={isLoading}>Send reset email</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
