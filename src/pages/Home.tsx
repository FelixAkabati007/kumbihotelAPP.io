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
    <div
      className="flex flex-col items-center w-full min-h-screen bg-fixed bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/front-view-hotel.jpg')",
      }}
    >
      {/* Global Dark Overlay for contrast */}
      <div className="absolute inset-0 bg-black/50 fixed z-0" />

      {/* Hero Section */}
      <div className="w-full relative h-[600px] flex items-center justify-center text-white z-10">
        <div className="container mx-auto px-4 text-center">
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
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto drop-shadow-md">
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
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white font-bold py-4 px-8 rounded-full transition duration-300 flex items-center justify-center gap-2"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Amenities Section - Transparent */}
      <div className="container mx-auto py-16 px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-md">
            World-Class Amenities
          </h2>
          <p className="text-gray-200 max-w-2xl mx-auto drop-shadow">
            We provide everything you need for a comfortable and memorable stay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Wifi className="w-8 h-8 text-yellow-500" />,
              title: "Free High-Speed WiFi",
              desc: "Stay connected throughout the property.",
            },
            {
              icon: <Utensils className="w-8 h-8 text-yellow-500" />,
              title: "Fine Dining",
              desc: "Local and international delicacies.",
            },
            {
              icon: <Shield className="w-8 h-8 text-yellow-500" />,
              title: "24/7 Security",
              desc: "Your safety is our top priority.",
            },
            {
              icon: <Car className="w-8 h-8 text-yellow-500" />,
              title: "Free Parking",
              desc: "Ample and secure parking space.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group hover:bg-black/50"
            >
              <div className="p-3 bg-white/10 rounded-full mb-4 group-hover:bg-white/20 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-300 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Rooms Section - Transparent */}
      <div className="w-full py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">
                Featured Rooms
              </h2>
              <p className="text-gray-200 drop-shadow">
                Hand-picked for your comfort.
              </p>
            </div>
            <Link
              to="/rooms"
              className="text-yellow-400 font-semibold hover:text-yellow-300 hidden md:flex items-center gap-1 transition-colors"
            >
              View All Rooms <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-white/10 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredRooms.map((room, index) => (
                <div
                  key={room.id}
                  className="bg-black/40 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-white/10 group hover:shadow-2xl transition-all duration-300 hover:bg-black/50"
                >
                  <div className="h-48 bg-gray-700 relative overflow-hidden">
                    <img
                      src={
                        [
                          "/standard-room-6-view-2.jpg",
                          "/standard-room-5-view-3.jpg",
                          "/standard-room-5-view-1.jpg",
                        ][index % 3]
                      }
                      alt={`Room ${room.roomNumber}`}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800";
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-md">
                      {room.roomType}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white">
                        Room {room.roomNumber}
                      </h3>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-yellow-400">
                          ₵{room.pricePerNight}
                        </span>
                        <span className="text-gray-400 text-sm">/night</span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-300 mb-6">
                      <div className="flex items-center gap-1">
                        <Coffee size={16} className="text-yellow-500" />{" "}
                        Breakfast
                      </div>
                      <div className="flex items-center gap-1">
                        <Wifi size={16} className="text-yellow-500" /> Free Wifi
                      </div>
                    </div>
                    <Link
                      to={`/rooms/${room.id}`}
                      className="block w-full text-center bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md"
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
              className="text-yellow-400 font-semibold hover:text-yellow-300 inline-flex items-center gap-1"
            >
              View All Rooms <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials / Social Proof - Transparent */}
      <div className="container mx-auto py-16 px-4 relative z-10">
        <h2 className="text-3xl font-bold text-center text-white mb-12 drop-shadow-md">
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
              className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg hover:bg-black/50 transition-colors"
            >
              <div className="flex gap-1 text-yellow-400 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-300 italic mb-4">"{t.text}"</p>
              <p className="font-bold text-white">- {t.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Map / Location Snippet - Semi-Transparent Dark */}
      <div className="w-full bg-black/80 text-white py-16 relative z-10 backdrop-blur-md">
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
          <div className="flex-1 h-64 bg-white/10 rounded-lg border border-white/10 overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.039660419615!2d-1.736580126491017!3d7.1214021159296985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfda532df5a85d41%3A0x8d2f6e8926a18c60!2sKUMBISALY%20HERITAGE%20HOTEL%20AND%20RESTAURANT!5e0!3m2!1sen!2sgh!4v1769227373317!5m2!1sen!2sgh"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
