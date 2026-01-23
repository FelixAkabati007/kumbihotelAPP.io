import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center text-white relative z-10">
        <div className="relative z-10 bg-black bg-opacity-70 p-8 rounded-lg text-center max-w-3xl mx-4 border border-yellow-600 shadow-2xl">
          <img
            src="/logo.png"
            alt="Kumbisaly Heritage Logo"
            className="h-40 w-40 md:h-56 md:w-56 mx-auto mb-4 rounded-full border-2 border-yellow-500"
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-yellow-500">
            Welcome to Kumbisaly Heritage
          </h1>
          <div className="flex items-center justify-center gap-2 mb-6 text-gray-200">
            <img
              src="/Flag-of-Ghana-08.png"
              alt="Ghana Flag"
              className="h-6 w-auto"
            />
            <p className="text-xl">
              Experience the best hospitality in Offinso Abofour, Ashanti,
              Ghana.
            </p>
            <img
              src="/Flag-of-Ghana-08.png"
              alt="Ghana Flag"
              className="h-6 w-auto"
            />
          </div>
          <Link
            to="/rooms"
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 inline-block"
          >
            Book a Room
          </Link>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-8 text-yellow-500">
          Our Amenities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/60 p-6 rounded-lg shadow-md text-center backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-2">Luxury Rooms</h3>
            <p className="text-gray-800 font-medium">
              Spacious and elegant rooms designed for your comfort.
            </p>
          </div>
          <div className="bg-white/60 p-6 rounded-lg shadow-md text-center backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-2">24/7 Service</h3>
            <p className="text-gray-800 font-medium">
              Our staff is always available to assist you.
            </p>
          </div>
          <div className="bg-white/60 p-6 rounded-lg shadow-md text-center backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-2">Serene Environment</h3>
            <p className="text-gray-800 font-medium">
              Relax in our peaceful and beautiful surroundings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
