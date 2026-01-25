import { useEffect, useState, memo } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { MoreVertical, Check, LogIn, LogOut, X } from "lucide-react";

type Booking = {
  id: string;
  status: string;
  totalAmount: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  customerName?: string;
  guestName?: string;
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
  userLabel,
}: {
  booking: Booking;
  role: string;
  onUpdateStatus: (
    id: string,
    status: "confirmed" | "checked_in" | "checked_out" | "cancelled",
  ) => void;
  userLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li
      key={booking.id}
      className="flex justify-between items-center border rounded p-3 bg-white hover:bg-gray-50 transition-colors"
    >
      <div>
        <p className="font-semibold text-gray-800">ID: {booking.id}</p>
        <p className="text-sm text-gray-600">User: {userLabel}</p>
        <p className="text-sm text-gray-600">
          Status:{" "}
          <span
            className={`font-medium ${
              booking.status === "confirmed"
                ? "text-green-600"
                : booking.status === "cancelled"
                  ? "text-red-600"
                  : "text-blue-600"
            }`}
          >
            {booking.status}
          </span>
        </p>
        <p className="text-sm text-gray-600">
          Total: GHS {booking.totalAmount}
        </p>
      </div>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          aria-label="Actions"
        >
          <MoreVertical size={20} className="text-gray-600" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-100 overflow-hidden">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => {
                  onUpdateStatus(booking.id, "confirmed");
                  setIsOpen(false);
                }}
              >
                <Check size={16} className="text-green-600" /> Confirm
              </button>
              {["admin", "manager", "receptionist"].includes(role) && (
                <>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      onUpdateStatus(booking.id, "checked_in");
                      setIsOpen(false);
                    }}
                  >
                    <LogIn size={16} className="text-blue-600" /> Check-in
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      onUpdateStatus(booking.id, "checked_out");
                      setIsOpen(false);
                    }}
                  >
                    <LogOut size={16} className="text-indigo-600" /> Check-out
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    onClick={() => {
                      onUpdateStatus(booking.id, "cancelled");
                      setIsOpen(false);
                    }}
                  >
                    <X size={16} /> Cancel
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </li>
  );
});

const RoomItem = memo(function RoomItem({ room }: { room: Room }) {
  const s = (room.status || "").toLowerCase();
  const isMaint = s.includes("maint") || s.includes("out_of_service");
  const isOccupied = s.includes("occup");
  const isUnavailable =
    s.includes("unavail") || s.includes("blocked") || s.includes("reserved");
  const color = isOccupied
    ? "text-green-600"
    : isMaint
      ? "text-red-600"
      : isUnavailable
        ? "text-yellow-600"
        : "text-gray-800";
  const containerExtra = isMaint
    ? "bg-red-50 border-red-200"
    : isUnavailable
      ? "bg-yellow-50 border-yellow-200"
      : "";
  return (
    <li
      key={room.id}
      className={`flex justify-between items-center border rounded p-2 ${containerExtra}`}
    >
      <div>
        <p>Room {room.roomNumber}</p>
        <p className="text-sm text-gray-600">
          Status: <span className={`font-medium ${color}`}>{room.status}</span>
        </p>
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

export default function ReceptionistDashboard() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const role = user?.role || "";
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usersMap, setUsersMap] = useState<
    Record<string, { fullName?: string; email?: string }>
  >({});

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
        if (role === "admin" || role === "manager" || role === "receptionist") {
          const uRes = await fetch("/api/users", { headers });
          if (uRes.ok) {
            const uJson = await uRes.json();
            const list = (uJson.data || uJson) as Array<{
              id: string;
              fullName?: string;
              email?: string;
            }>;
            const map: Record<string, { fullName?: string; email?: string }> =
              {};
            for (const u of list) {
              if (u.id) map[u.id] = { fullName: u.fullName, email: u.email };
            }
            if (active) setUsersMap(map);
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
  const getBookingUserLabel = (b: Booking): string => {
    if (b.userName && b.userName.trim()) return b.userName;
    if (b.customerName && b.customerName.trim()) return b.customerName;
    if (b.guestName && b.guestName.trim()) return b.guestName;
    if (b.userEmail && b.userEmail.trim()) return b.userEmail;
    if (b.userId && usersMap[b.userId]) {
      const entry = usersMap[b.userId];
      return entry.fullName || entry.email || b.userId;
    }
    return "Guest";
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Receptionist Dashboard</h1>
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
                  userLabel={getBookingUserLabel(b)}
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
