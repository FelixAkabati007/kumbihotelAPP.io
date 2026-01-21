import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phoneNumber: z.string().min(7).optional(),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const setAuth = useAuthStore((s) => s.setAuth);

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.ok) {
      setAuth(json.user, json.token);
    } else {
      alert(json.error || 'Register failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Create Account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Full Name</label>
          <input className="w-full border rounded p-2" type="text" {...register('fullName')} />
          {errors.fullName && <p className="text-red-600 text-sm">{errors.fullName.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input className="w-full border rounded p-2" type="email" {...register('email')} />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input className="w-full border rounded p-2" type="password" {...register('password')} />
          {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Phone Number</label>
          <input className="w-full border rounded p-2" type="tel" {...register('phoneNumber')} />
          {errors.phoneNumber && <p className="text-red-600 text-sm">{errors.phoneNumber.message}</p>}
        </div>
        <button disabled={isSubmitting} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
          {isSubmitting ? 'Creating...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
