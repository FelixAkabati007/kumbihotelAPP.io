import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full bg-cover bg-center h-96 flex items-center justify-center text-white" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)' }}>
        <div className="bg-black bg-opacity-50 p-8 rounded-lg text-center">
          <h1 className="text-4xl font-bold mb-4 text-yellow-500">Welcome to Kumbisaly Heritage Hotel</h1>
          <p className="text-xl mb-6">Experience the best hospitality in Offinso Abofour, Ashanti, Ghana.</p>
          <Link to="/rooms" className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
            Book a Room
          </Link>
        </div>
      </div>
      
      <div className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-yellow-800">Our Amenities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-bold mb-2">Luxury Rooms</h3>
            <p className="text-gray-600">Spacious and elegant rooms designed for your comfort.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-bold mb-2">24/7 Service</h3>
            <p className="text-gray-600">Our staff is always available to assist you.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-bold mb-2">Serene Environment</h3>
            <p className="text-gray-600">Relax in our peaceful and beautiful surroundings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
