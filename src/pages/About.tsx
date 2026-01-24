import { Star, MapPin, Heart, Users } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto p-4 relative z-10">
      {/* Header Section (no white background) */}
      <div className="relative h-64 md:h-80 flex items-center justify-center">
        <img
          src="/b0c3e83098f99ec5c59add18045d68b3.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain opacity-80 pointer-events-none select-none"
        />
        <div className="relative z-10 text-center px-4 mt-12 md:mt-16">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 drop-shadow-lg">
            Akwaaba!
          </h1>
          <p className="text-sm md:text-lg text-yellow-100 font-medium">
            Welcome to Kumbisaly Heritage Hotel
          </p>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden">
        {/* Content Section */}
        <div className="p-8 md:p-12">
          {/* Introduction */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              A Taste of Ghanaian Hospitality
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Nestled in the heart of Offinso Abofour in the Ashanti Region,
              Kumbisaly Heritage Hotel is more than just a place to sleep—it's a
              home away from home. We blend modern luxury with the timeless
              warmth of Ghanaian culture, offering every guest a truly royal
              experience. From our architecture to our cuisine, the spirit of
              "Akwaaba" resonates in every corner.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-100 rounded-full text-yellow-700">
                  <Heart size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Our Heritage
                  </h3>
                  <p className="text-gray-600">
                    Rooted in the rich traditions of the Ashanti Kingdom, we
                    take pride in sharing our culture. Our hotel is designed to
                    reflect the elegance and history of our people, providing a
                    serene escape from the bustle of daily life.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-100 rounded-full text-yellow-700">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Family & Community
                  </h3>
                  <p className="text-gray-600">
                    At Kumbisaly, you are family. Our dedicated staff is
                    committed to treating every guest with the utmost respect
                    and care, ensuring your stay is as comfortable as it is
                    memorable.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-100 rounded-full text-yellow-700">
                  <Star size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Local Delicacies
                  </h3>
                  <p className="text-gray-600">
                    Experience the authentic taste of Ghana at our restaurant.
                    From spicy Jollof Rice to rich Fufu and Light Soup, our
                    chefs prepare local favorites alongside continental dishes
                    to satisfy every palate.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-100 rounded-full text-yellow-700">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Prime Location
                  </h3>
                  <p className="text-gray-600">
                    Conveniently located in Offinso Abofour, we are the perfect
                    gateway to exploring the Ashanti Region. Whether you're here
                    for business or leisure, our tranquil environment is the
                    perfect base.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Section */}
          <div className="bg-yellow-50 rounded-2xl p-8 text-center border-l-4 border-yellow-600">
            <blockquote className="text-xl italic text-gray-700 mb-4">
              "The stranger who returns does not forget the hospitality of the
              host."
            </blockquote>
            <cite className="text-yellow-800 font-bold not-italic">
              — A Ghanaian Proverb
            </cite>
          </div>
        </div>
      </div>
    </div>
  );
}
