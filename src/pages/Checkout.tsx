import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import BackButton from "../components/BackButton";

type Addon = { id: string; name: string; price: string; taxable: number };
type Room = {
  id: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: string;
  capacity: number;
};

export default function Checkout() {
  const [params] = useSearchParams();
  const roomId = params.get("roomId") || "";
  const paramCheckIn = params.get("checkIn") || "";
  const paramCheckOut = params.get("checkOut") || "";

  const [checkInDate, setCheckInDate] = useState<string>(paramCheckIn);
  const [checkOutDate, setCheckOutDate] = useState<string>(paramCheckOut);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [room, setRoom] = useState<Room | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  // Fetch Room Details
  useEffect(() => {
    if (!roomId) return;
    setLoadingRoom(true);
    fetch(`/api/rooms/${roomId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load room details");
        return res.json();
      })
      .then((data: Room) => setRoom(data))
      .catch((err) => {
        console.error(err);
        setRoomError("Could not load room information.");
      })
      .finally(() => setLoadingRoom(false));
  }, [roomId]);

  // Fetch Addons
  useEffect(() => {
    fetch("/api/addons")
      .then((r) => r.json())
      .then((json: Addon[]) => setAddons(json))
      .catch((err) => {
        console.error("Failed to load addons:", err);
      });
  }, []);

  const totalAddons = useMemo(() => {
    return addons.reduce(
      (sum, a) => sum + (selected[a.id] || 0) * parseFloat(a.price),
      0,
    );
  }, [addons, selected]);

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = end.getTime() - start.getTime();
    const days = diff / (1000 * 3600 * 24);
    return days > 0 ? Math.ceil(days) : 0;
  }, [checkInDate, checkOutDate]);

  const roomTotal = useMemo(() => {
    if (!room || nights <= 0) return 0;
    return parseFloat(room.pricePerNight) * nights;
  }, [room, nights]);

  const grandTotal = roomTotal + totalAddons;

  const onCheckout = async () => {
    if (!checkInDate || !checkOutDate) {
      alert("Please select check-in and check-out dates.");
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const items = Object.entries(selected)
        .filter(([, qty]) => qty > 0)
        .map(([addonId, qty]) => ({ addonId, qty }));
      const payload = {
        roomId,
        checkInDate,
        checkOutDate,
        addons: items,
        currency: "GHS",
        method: "card",
        idempotencyKey: crypto.randomUUID(),
      };
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok) {
        alert("Checkout complete. Invoice issued.");
        navigate("/bookings");
      } else {
        alert(json.error || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!roomId) {
    return <div className="p-6 text-red-600">No Room ID provided.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white/60 backdrop-blur-sm rounded shadow my-8">
      <BackButton className="mb-4" />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Checkout</h1>

      {loadingRoom && <p className="text-gray-500">Loading room details...</p>}
      {roomError && <p className="text-red-500">{roomError}</p>}

      {room && (
        <div className="bg-white/50 p-4 rounded mb-6 border">
          <h2 className="text-xl font-bold text-gray-700">Room Details</h2>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-sm text-gray-500">Room Number</p>
              <p className="font-semibold">{room.roomNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-semibold capitalize">{room.roomType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price Per Night</p>
              <p className="font-semibold">
                GHS {parseFloat(room.pricePerNight).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Capacity</p>
              <p className="font-semibold">{room.capacity} Person(s)</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Booking Dates</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="check-in-date"
                className="block text-sm font-medium mb-1"
              >
                Check-in
              </label>
              <input
                id="check-in-date"
                className="w-full border rounded p-2"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="check-out-date"
                className="block text-sm font-medium mb-1"
              >
                Check-out
              </label>
              <input
                id="check-out-date"
                className="w-full border rounded p-2"
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>
          </div>
          {nights > 0 && (
            <p className="text-green-600 font-medium">
              Total Stay: {nights} Night(s)
            </p>
          )}

          <h3 className="text-lg font-semibold mt-6">Add-ons</h3>
          {addons.length === 0 ? (
            <p className="text-gray-500">No addons available.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded">
              {addons.map((addon) => (
                <div
                  key={addon.id}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium">{addon.name}</p>
                    <p className="text-sm text-gray-500">
                      GHS {parseFloat(addon.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() =>
                        setSelected((prev) => ({
                          ...prev,
                          [addon.id]: Math.max(0, (prev[addon.id] || 0) - 1),
                        }))
                      }
                    >
                      -
                    </button>
                    <span className="w-6 text-center">
                      {selected[addon.id] || 0}
                    </span>
                    <button
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() =>
                        setSelected((prev) => ({
                          ...prev,
                          [addon.id]: (prev[addon.id] || 0) + 1,
                        }))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/50 p-6 rounded border h-fit">
          <h3 className="text-xl font-bold mb-4">Payment Summary</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Room Charges ({nights} nights)</span>
              <span>GHS {roomTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Add-ons Total</span>
              <span>GHS {totalAddons.toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total</span>
              <span>GHS {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCheckout}
            disabled={
              isSubmitting || !checkInDate || !checkOutDate || nights <= 0
            }
            className={`w-full py-3 rounded text-white font-bold text-lg ${
              isSubmitting || !checkInDate || !checkOutDate || nights <= 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700"
            }`}
          >
            {isSubmitting ? "Processing..." : "Complete Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
