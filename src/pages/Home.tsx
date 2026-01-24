import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Wifi,
  Coffee,
  Shield,
  Star,
  MapPin,
  Phone,
  ArrowRight,
  Utensils,
  Car,
} from "lucide-react";

type Room = {
  id: string;
  roomNumber: string;
  roomType: "single" | "double" | "suite" | "deluxe";
  capacity: number;
  pricePerNight: string;
  status: "available" | "occupied" | "maintenance";
  images?: string[];
};

export default function Home() {
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rooms?limit=3")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch");
      })
      .then((data) => {
        setFeaturedRooms(Array.isArray(data) ? data : data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col items-center w-full bg-gray-50">
      {/* Hero Section */}
      <div className="w-full relative h-[600px] flex items-center justify-center text-white overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('/hotel-hero.jpg')", // Placeholder, fallback to color if missing
            backgroundColor: "#1a1a1a",
          }}
        />

        <div className="relative z-20 container mx-auto px-4 text-center">
          <div className="mb-6 flex justify-center">
            <img
              src="/logo.png"
              alt="Kumbisaly Heritage Logo"
              className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-yellow-500 shadow-xl"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
            Kumbisaly Heritage Hotel
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Experience luxury, comfort, and the best hospitality in Offinso
            Abofour, Ashanti, Ghana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/rooms"
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-8 rounded-full transition duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              Book Your Stay <ArrowRight size={20} />
            </Link>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white hover:bg-white/10 text-white font-bold py-4 px-8 rounded-full transition duration-300 flex items-center justify-center gap-2"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Amenities Section */}
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            World-Class Amenities
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide everything you need for a comfortable and memorable stay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Wifi className="w-8 h-8 text-yellow-600" />,
              title: "Free High-Speed WiFi",
              desc: "Stay connected throughout the property.",
            },
            {
              icon: <Utensils className="w-8 h-8 text-yellow-600" />,
              title: "Fine Dining",
              desc: "Local and international delicacies.",
            },
            {
              icon: <Shield className="w-8 h-8 text-yellow-600" />,
              title: "24/7 Security",
              desc: "Your safety is our top priority.",
            },
            {
              icon: <Car className="w-8 h-8 text-yellow-600" />,
              title: "Free Parking",
              desc: "Ample and secure parking space.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col items-center text-center group"
            >
              <div className="p-3 bg-yellow-50 rounded-full mb-4 group-hover:bg-yellow-100 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Rooms Section */}
      <div className="w-full bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Featured Rooms
              </h2>
              <p className="text-gray-600">Hand-picked for your comfort.</p>
            </div>
            <Link
              to="/rooms"
              className="text-yellow-600 font-semibold hover:text-yellow-700 hidden md:flex items-center gap-1"
            >
              View All Rooms <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 group hover:shadow-2xl transition-all duration-300"
                >
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <img
                      src={
                        room.images?.[0] ||
                        `/room-placeholder-${(parseInt(room.roomNumber) % 3) + 1}.jpg`
                      }
                      alt={`Room ${room.roomNumber}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800";
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      {room.roomType}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        Room {room.roomNumber}
                      </h3>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-yellow-600">
                          ₵{room.pricePerNight}
                        </span>
                        <span className="text-gray-500 text-sm">/night</span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 mb-6">
                      <div className="flex items-center gap-1">
                        <Coffee size={16} /> Breakfast
                      </div>
                      <div className="flex items-center gap-1">
                        <Wifi size={16} /> Free Wifi
                      </div>
                    </div>
                    <Link
                      to={`/rooms/${room.id}`}
                      className="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/rooms"
              className="text-yellow-600 font-semibold hover:text-yellow-700 inline-flex items-center gap-1"
            >
              View All Rooms <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials / Social Proof */}
      <div className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          What Our Guests Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Kwame A.",
              text: "The serenity of Kumbisaly is unmatched. The staff treated us like royalty!",
              rating: 5,
            },
            {
              name: "Sarah J.",
              text: "Best local dishes I've had in Ashanti region. Highly recommended.",
              rating: 5,
            },
            {
              name: "David O.",
              text: "Clean rooms, stable WiFi, and very secure. Perfect for my business trip.",
              rating: 4,
            },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow border border-gray-100"
            >
              <div className="flex gap-1 text-yellow-400 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-600 italic mb-4">"{t.text}"</p>
              <p className="font-bold text-gray-800">- {t.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Map / Location Snippet */}
      <div className="w-full bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-6">Visit Us</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="text-yellow-500 mt-1" />
                <p>Offinso Abofour, Ashanti Region, Ghana</p>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="text-yellow-500" />
                <p>+233 53 597 5422</p>
              </div>
              <div className="mt-8">
                <Link
                  to="/contact"
                  className="text-yellow-500 hover:text-yellow-400 underline"
                >
                  Get Directions
                </Link>
              </div>
            </div>
          </div>
          <div className="flex-1 h-64 bg-gray-800 rounded-lg flex items-center justify-center">
            {/* Placeholder for Map */}
            <p className="text-gray-400">Google Map Integration</p>
          </div>
        </div>
      </div>
    </div>
  );
}
