import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../store/authStore";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phoneNumber: z.string().min(7).optional(),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const setAuth = useAuthStore((s) => s.setAuth);

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.ok) {
      setAuth(json.user, json.token);
    } else {
      alert(json.error || "Register failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)]">
      <div className="w-full max-w-md p-8 bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
            <input
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
              type="text"
              placeholder="John Doe"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
            <input
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
              type="email"
              placeholder="john@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
            <input
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number</label>
            <input
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
              type="tel"
              placeholder="+233..."
              {...register("phoneNumber")}
            />
            {errors.phoneNumber && (
              <p className="text-red-600 text-sm mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>
          <button
            disabled={isSubmitting}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02]"
          >
            {isSubmitting ? "Creating..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
