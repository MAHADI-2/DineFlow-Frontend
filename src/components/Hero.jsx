
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div className="space-y-6 text-center md:text-left">
          <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-semibold inline-block">
            100% Fresh & Tasty
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Discover the True Taste of <span className="text-orange-500">Delicious Food</span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            Amra apnader jonno niye asi shera maner khabar ebong druto delivery service. Aaj-i apnar pochhonder khabar order korun!
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <Link
              to="/menu"
              className="bg-orange-500 text-white font-medium px-8 py-3 rounded-lg shadow-lg hover:bg-orange-600 transition text-center"
            >
              Explore Menu
            </Link>
            <a
              href="#contact"
              className="border border-gray-300 text-gray-700 font-medium px-8 py-3 rounded-lg hover:bg-gray-100 transition text-center"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop"
            alt="Delicious Food"
            className="rounded-2xl shadow-2xl w-full max-w-md md:max-w-full object-cover h-[350px] sm:h-[450px]"
          />
        </div>

      </div>
    </section>
  );
};

export default Hero;