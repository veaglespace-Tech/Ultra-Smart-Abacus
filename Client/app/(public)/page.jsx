export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gray-100 text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-pink-600">
          Smart Abacus  
        </h1>

        <p className="mt-4 text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
          Empowering young minds through Abacus and Mental Arithmetic.
        </p>

        <button className="mt-6 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition">
          Join Now
        </button>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            About Us
          </h2>

          <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
            Smart Abacus helps children improve concentration,
            memory, creativity, and calculation speed through
            innovative learning techniques.
          </p>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Our Courses
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white shadow-md rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">
                Beginner Level
              </h3>
              <p className="text-gray-600">
                Introduction to Abacus and basic calculations.
              </p>
            </div>

            <div className="p-6 bg-white shadow-md rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">
                Intermediate Level
              </h3>
              <p className="text-gray-600">
                Advanced calculations and mental arithmetic.
              </p>
            </div>

            <div className="p-6 bg-white shadow-md rounded-lg hover:shadow-lg transition sm:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-semibold mb-2">
                Expert Level
              </h3>
              <p className="text-gray-600">
                High-speed calculation and competition training.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}