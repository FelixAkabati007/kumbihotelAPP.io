import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../store/authStore";
import BackButton from "../components/BackButton";

const schema = z.object({
  roomId: z.string().min(1),
  checkInDate: z.string().min(10),
  checkOutDate: z.string().min(10),
  specialRequests: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Bookings() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const token = useAuthStore((s) => s.token);

  const checkIn = watch("checkInDate");
  const checkOut = watch("checkOutDate");
  const nights =
    checkIn && checkOut
      ? Math.max(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24),
          0,
        )
      : 0;
  const pricePerNight = 200; // sample; could fetch from room
  const totalAmount = (nights * pricePerNight).toFixed(2);

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ ...data, totalAmount }),
    });
    const json = await res.json();
    if (res.ok) {
      alert(`Booking created. Total: GHS ${totalAmount}`);
    } else {
      alert(json.error || "Booking failed");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <BackButton />
      <h1 className="text-2xl font-bold mb-4">Book a Room</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Room ID</label>
          <input
            className="w-full border rounded p-2"
            type="text"
            {...register("roomId")}
          />
          {errors.roomId && (
            <p className="text-red-600 text-sm">{errors.roomId.message}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Check-in Date</label>
            <input
              className="w-full border rounded p-2"
              type="date"
              {...register("checkInDate")}
            />
            {errors.checkInDate && (
              <p className="text-red-600 text-sm">
                {errors.checkInDate.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1">Check-out Date</label>
            <input
              className="w-full border rounded p-2"
              type="date"
              {...register("checkOutDate")}
            />
            {errors.checkOutDate && (
              <p className="text-red-600 text-sm">
                {errors.checkOutDate.message}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="block mb-1">Special Requests</label>
          <textarea
            className="w-full border rounded p-2"
            {...register("specialRequests")}
          />
        </div>
        <div className="bg-yellow-50 border rounded p-3">
          <p>Nights: {nights}</p>
          <p>Price per night: GHS {pricePerNight.toFixed(2)}</p>
          <p className="font-bold">Total: GHS {totalAmount}</p>
        </div>
        <button
          disabled={isSubmitting}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
        >
          {isSubmitting ? "Booking..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}
