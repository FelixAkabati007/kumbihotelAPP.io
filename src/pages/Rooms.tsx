import { useEffect, useState } from "react";

type Room = {
  id: string;
  roomNumber: string;
  roomType: "single" | "double" | "suite" | "deluxe";
  capacity: number;
  pricePerNight: string;
  status: "available" | "occupied" | "maintenance";
};

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomType, setRoomType] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (roomType) params.set("roomType", roomType);
    if (status) params.set("status", status);
    fetch(`/api/rooms?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => setRooms(Array.isArray(json) ? json : json.data));
  }, [roomType, status]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Rooms</h1>
      <div className="flex gap-4 mb-6">
        <select
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rooms.map((r) => (
          <div key={r.id} className="border rounded p-4 shadow">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">Room {r.roomNumber}</h2>
              <span className="text-sm">{r.roomType}</span>
            </div>
            <p>Capacity: {r.capacity}</p>
            <p>Price per night: GHS {r.pricePerNight}</p>
            <p>Status: {r.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
