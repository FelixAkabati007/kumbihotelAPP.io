import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

type Booking = {
  id: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: string;
  status: string;
};

export default function MyBookings() {
  const token = useAuthStore((s) => s.token);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const headers = { Authorization: token ? `Bearer ${token}` : "" };
    fetch("/api/bookings/my-bookings", { headers })
      .then((r) => r.json())
      .then(setBookings)
      .catch((err) => {
        console.error(err);
        setError("Failed to load your bookings.");
      });
  }, [token]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">My Bookings</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white rounded shadow p-4">
            <p className="font-semibold">Booking ID: {b.id}</p>
            <p>Room: {b.roomId}</p>
            <p>Check-in: {new Date(b.checkInDate).toLocaleDateString()}</p>
            <p>Check-out: {new Date(b.checkOutDate).toLocaleDateString()}</p>
            <p>Total: GHS {parseFloat(b.totalAmount).toFixed(2)}</p>
            <p>Status: {b.status}</p>
          </div>
        ))}
        {bookings.length === 0 && <p>No bookings yet.</p>}
      </div>
    </div>
  );
}

