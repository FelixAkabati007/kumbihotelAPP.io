import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

const schema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  phoneNumber: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Profile() {
  const { user, token, setAuth } = useAuthStore();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) {
      setValue("fullName", user.fullName);
      // user object in store might not have phoneNumber, fetch it if needed or assume it's there
      // For now, let's fetch fresh user data
      fetch(`/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.fullName) setValue("fullName", data.fullName);
          if (data.phoneNumber) setValue("phoneNumber", data.phoneNumber);
        })
        .catch(console.error);
    }
  }, [user, token, setValue]);

  const onSubmit = async (data: FormData) => {
    setMessage(null);
    try {
      if (!user) return;
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully" });
        // Update local store
        setAuth({ ...user, fullName: data.fullName }, token!); // token is verified existing
      } else {
        setMessage({
          type: "error",
          text: json.error || "Failed to update profile",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Something went wrong" });
    }
  };

  if (!user) return <div className="p-4">Please login first.</div>;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Profile</h1>

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/20">
        {message && (
          <div
            className={`p-4 rounded-xl mb-6 ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                className="w-full border border-gray-300 rounded-xl p-3 bg-gray-100 cursor-not-allowed"
                type="email"
                value={user.email}
                disabled
                aria-label="Email address"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed.
              </p>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Role
              </label>
              <input
                className="w-full border border-gray-300 rounded-xl p-3 bg-gray-100 cursor-not-allowed capitalize"
                type="text"
                value={user.role}
                disabled
                aria-label="User role"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
              type="text"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-red-600 text-sm mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
              type="tel"
              {...register("phoneNumber")}
            />
            {errors.phoneNumber && (
              <p className="text-red-600 text-sm mt-1">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02]"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
