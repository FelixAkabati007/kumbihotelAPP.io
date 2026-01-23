import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

type Room = {
  id: string;
  roomNumber: string;
  roomType: "single" | "double" | "suite" | "deluxe";
  capacity: number;
  pricePerNight: string;
  status: "available" | "occupied" | "maintenance";
  amenities?: string[];
  images?: string[];
  description?: string | null;
};

export default function RoomDetails() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/rooms/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch room");
        return r.json();
      })
      .then(setRoom)
      .catch((err) => {
        console.error(err);
        setError("Unable to load room details.");
      });
  }, [id]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading...</p>
      </div>
    );
  }

  const toCheckout = () => {
    navigate(`/checkout?roomId=${room.id}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Room {room.roomNumber}</h1>
        <Link to="/rooms" className="text-yellow-700 hover:underline">Back to Rooms</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded p-4 shadow">
          <h2 className="text-xl font-semibold mb-2 capitalize">{room.roomType}</h2>
          <p className="mb-2">Capacity: {room.capacity}</p>
          <p className="mb-2 font-bold">GHS {parseFloat(room.pricePerNight).toFixed(2)} per night</p>
          <p className="mb-4">{room.description || "Comfortable and elegant room."}</p>
          <div className="flex gap-2 flex-wrap">
            {(room.amenities ?? []).map((a, i) => (
              <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">{a}</span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">Gallery</h2>
          <div className="grid grid-cols-2 gap-2">
            {(room.images ?? []).slice(0, 4).map((src, i) => (
              <img key={i} src={src} alt={`Room ${room.roomNumber} ${i+1}`} className="rounded object-cover h-32 w-full" />
            ))}
            {(room.images ?? []).length === 0 && <div className="text-gray-500">No images available</div>}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button onClick={toCheckout} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

