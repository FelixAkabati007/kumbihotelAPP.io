import { useEffect, useState, memo } from "react";
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
type AuditLog = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  details: string | null;
  createdAt: string;
  actorUserId: string | null;
};

const formatDetails = (d: unknown) => {
  if (d == null) return "";
  if (typeof d === "string") return d;
  try {
    return JSON.stringify(d);
  } catch {
    return "[details]";
  }
};

const BookingItem = memo(function BookingItem({
  booking,
  role,
  onUpdateStatus,
}: {
  booking: Booking;
  role: string;
  onUpdateStatus: (
    id: string,
    status: "confirmed" | "checked_in" | "checked_out" | "cancelled",
  ) => void;
}) {
  return (
    <li
      key={booking.id}
      className="flex justify-between items-center border rounded p-2"
    >
      <div>
        <p>ID: {booking.id}</p>
        <p>Status: {booking.status}</p>
        <p>Total: GHS {booking.totalAmount}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          aria-label="Confirm booking"
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={() => onUpdateStatus(booking.id, "confirmed")}
        >
          Confirm
        </button>
        {["admin", "manager", "receptionist"].includes(role) && (
          <>
            <button
              type="button"
              aria-label="Check-in booking"
              className="bg-blue-600 text-white px-3 py-1 rounded"
              onClick={() => onUpdateStatus(booking.id, "checked_in")}
            >
              Check-in
            </button>
            <button
              type="button"
              aria-label="Check-out booking"
              className="bg-indigo-600 text-white px-3 py-1 rounded"
              onClick={() => onUpdateStatus(booking.id, "checked_out")}
            >
              Check-out
            </button>
            <button
              type="button"
              aria-label="Cancel booking"
              className="bg-red-600 text-white px-3 py-1 rounded"
              onClick={() => onUpdateStatus(booking.id, "cancelled")}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </li>
  );
});

const RoomItem = memo(function RoomItem({ room }: { room: Room }) {
  return (
    <li
      key={room.id}
      className="flex justify-between items-center border rounded p-2"
    >
      <div>
        <p>Room {room.roomNumber}</p>
        <p>Status: {room.status}</p>
      </div>
    </li>
  );
});

const LogsList = memo(function LogsList({ logs }: { logs: AuditLog[] }) {
  const items = logs.slice(0, 3);
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded shadow p-4 md:col-span-3">
      <h2 className="text-xl font-bold mb-3">Recent Logs</h2>
      <ul className="space-y-2">
        {items.map((log) => (
          <li key={log.id} className="border rounded p-2 flex justify-between">
            <div>
              <p className="font-medium">{log.action}</p>
              <p className="text-sm text-gray-700">
                {log.entityType} • {log.entityId}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
            {log.details && (
              <div className="text-sm text-gray-600 max-w-xs break-words">
                {formatDetails(log.details as unknown)}
              </div>
            )}
          </li>
        ))}
        {logs.length === 0 && <li className="text-gray-600">No recent logs</li>}
      </ul>
    </div>
  );
});

export default function AdminDashboard() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const role = user?.role || "";
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const headers = { Authorization: token ? `Bearer ${token}` : "" };
    let active = true;
    (async () => {
      try {
        const [bRes, rRes] = await Promise.all([
          fetch("/api/bookings", { headers }),
          fetch("/api/rooms"),
        ]);
        if (bRes.ok) {
          const bJson = await bRes.json();
          if (active) setBookings(bJson.data || bJson);
        }
        if (rRes.ok) {
          const rJson = await rRes.json();
          if (active) setRooms(rJson.data || rJson);
        }
        if (role === "admin" || role === "manager") {
          const lRes = await fetch("/api/audit-logs?limit=3", { headers });
          if (lRes.ok) {
            const lJson = await lRes.json();
            if (active) setLogs(lJson.data || lJson);
          }
        }
      } catch {
        if (active) setError("Failed to load dashboard data");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [token, role]);

  const updateBookingStatus = async (
    id: string,
    status: "confirmed" | "checked_in" | "checked_out" | "cancelled",
  ) => {
    await fetch(`/api/bookings/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ status }),
    });
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b)),
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 text-red-700 p-3">
          {error}
        </div>
      )}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="bg-white/60 backdrop-blur-sm rounded shadow p-4">
            <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded shadow p-4">
            <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded shadow p-4">
            <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-sm rounded shadow p-4">
            <h2 className="text-xl font-bold mb-3">Bookings</h2>
            <ul className="space-y-2">
              {bookings.map((b) => (
                <BookingItem
                  key={b.id}
                  booking={b}
                  role={role}
                  onUpdateStatus={updateBookingStatus}
                />
              ))}
            </ul>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded shadow p-4">
            <h2 className="text-xl font-bold mb-3">Rooms</h2>
            <ul className="space-y-2">
              {rooms.map((r) => (
                <RoomItem key={r.id} room={r} />
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
              {["admin", "manager"].includes(user?.role || "") && (
                <li>
                  <Link
                    className="text-yellow-700 hover:underline"
                    to="/admin/settings"
                  >
                    Settings
                  </Link>
                </li>
              )}
            </ul>
          </div>
          {(role === "admin" || role === "manager") && <LogsList logs={logs} />}
        </div>
      )}
    </div>
  );
}
