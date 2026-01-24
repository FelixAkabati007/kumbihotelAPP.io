import { useForm } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useLocation } from "react-router-dom";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname
    ? location.state.from.pathname + location.state.from.search
    : "/";

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.ok) {
      setAuth(json.user, json.token);
      navigate(from, { replace: true });
    } else {
      alert(json.error || "Login failed");
    }
  };

  const onGoogleStart = () => {
    window.location.href = "/api/auth/google/start";
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)]">
      <div className="w-full max-w-md p-8 bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Login
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                className="w-full border border-gray-300 rounded-xl p-3 pr-10 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            disabled={isSubmitting}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02]"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="flex items-center my-4">
          <div className="h-px bg-gray-300 flex-grow" />
          <span className="px-2 text-gray-500 text-sm">or</span>
          <div className="h-px bg-gray-300 flex-grow" />
        </div>
        <button
          type="button"
          onClick={onGoogleStart}
          aria-label="Continue with Google"
          className="w-full bg-white text-gray-700 font-semibold py-3 px-4 rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-5 w-5"
          >
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.4 0 19-8.4 19-18.8 0-1.2-.1-2.1-.4-3.7z"
            ></path>
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.4 16 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 6.1 29.1 4 24 4 15.6 4 8.5 8.7 6.3 14.7z"
            ></path>
            <path
              fill="#4CAF50"
              d="M24 44c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.4-4.7 2.3-7.1 2.3-5.2 0-9.6-3.6-11.2-8.4l-6.6 5.1C8.5 39.3 15.6 44 24 44z"
            ></path>
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.4-6 8-11.3 8-5.2 0-9.6-3.6-11.2-8.4l-6.6 5.1C8.5 39.3 15.6 44 24 44c10.4 0 19-8.4 19-18.8 0-1.2-.1-2.1-.4-3.7z"
            ></path>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
