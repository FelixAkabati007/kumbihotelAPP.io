import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

type Room = {
  id: string;
  roomNumber: string;
  roomType: "single" | "double" | "suite" | "deluxe";
  capacity: number;
  pricePerNight: string;
  status: "available" | "occupied" | "maintenance";
};

type RoomResponse = {
  data: Room[];
};

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomType, setRoomType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams();
    if (roomType) params.set("roomType", roomType);
    if (status) params.set("status", status);

    setIsLoading(true);
    setError(null);

    fetch(`/api/rooms?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: Room[] | RoomResponse) => {
        if (isMounted) {
          setRooms(Array.isArray(json) ? json : json?.data || []);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to load rooms. Please try again later.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [roomType, status]);

  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-100";
      case "occupied":
        return "text-red-600 bg-red-100";
      case "maintenance":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <BackButton to="/" label="Back to Home" />
      <h1 className="text-3xl font-bold mb-4">Rooms</h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          aria-label="Filter by Room Type"
          className="border rounded p-2"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="suite">Suite</option>
          <option value="deluxe">Deluxe</option>
        </select>
        <select
          aria-label="Filter by Status"
          className="border rounded p-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Any Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-10 border rounded bg-white/60 backdrop-blur-sm">
          <p className="text-gray-500 text-lg">
            No rooms found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((r) => (
            <div
              key={r.id}
              className="border rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow bg-white/60 backdrop-blur-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-gray-800">
                  <Link to={`/rooms/${r.id}`} className="hover:underline">
                    Room {r.roomNumber}
                  </Link>
                </h2>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full uppercase ${getStatusColor(r.status)}`}
                >
                  {r.status}
                </span>
              </div>
              <div className="space-y-1 text-gray-600 mb-4">
                <p className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium capitalize">{r.roomType}</span>
                </p>
                <p className="flex justify-between">
                  <span>Capacity:</span>
                  <span className="font-medium">
                    {r.capacity} Guest{r.capacity > 1 ? "s" : ""}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Price per night:</span>
                  <span className="font-bold text-gray-900">
                    GHS {parseFloat(r.pricePerNight).toFixed(2)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/checkout?roomId=${r.id}`)}
                disabled={r.status !== "available"}
                className={`w-full py-2 px-4 rounded font-bold text-white transition-colors ${
                  r.status === "available"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {r.status === "available" ? "Book Now" : "Unavailable"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
