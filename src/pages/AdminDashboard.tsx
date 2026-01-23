import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

type Booking = {
  id: string;
  status: string;
  totalAmount: string;
};
type Room = {
  id: string;
  roomNumber: string;
  status: string;
};

export default function AdminDashboard() {
  const token = useAuthStore((s) => s.token);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const headers = { Authorization: token ? `Bearer ${token}` : "" };
    fetch("/api/bookings", { headers })
      .then((r) => r.json())
      .then((json) => setBookings(json.data || json));
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((json) => setRooms(json.data || json));
  }, [token]);

  const confirmBooking = async (id: string) => {
    await fetch(`/api/bookings/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ status: "confirmed" }),
    });
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "confirmed" } : b)),
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/60 backdrop-blur-sm rounded shadow p-4">
          <h2 className="text-xl font-bold mb-3">Bookings</h2>
          <ul className="space-y-2">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="flex justify-between items-center border rounded p-2"
              >
                <div>
                  <p>ID: {b.id}</p>
                  <p>Status: {b.status}</p>
                  <p>Total: GHS {b.totalAmount}</p>
                </div>
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => confirmBooking(b.id)}
                >
                  Confirm
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded shadow p-4">
          <h2 className="text-xl font-bold mb-3">Rooms</h2>
          <ul className="space-y-2">
            {rooms.map((r) => (
              <li
                key={r.id}
                className="flex justify-between items-center border rounded p-2"
              >
                <div>
                  <p>Room {r.roomNumber}</p>
                  <p>Status: {r.status}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded shadow p-4">
          <h2 className="text-xl font-bold mb-3">Management</h2>
          <ul className="space-y-2">
            <li>
              <Link
                className="text-yellow-700 hover:underline"
                to="/admin/rate-plans"
              >
                Rate Plans
              </Link>
            </li>
            <li>
              <Link
                className="text-yellow-700 hover:underline"
                to="/admin/addons"
              >
                Add-ons
              </Link>
            </li>
            <li>
              <Link
                className="text-yellow-700 hover:underline"
                to="/admin/reports"
              >
                Reports
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
