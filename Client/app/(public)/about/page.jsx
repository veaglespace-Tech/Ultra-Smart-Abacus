import Navbar from "../../../components/shared/Navbar";
import Footer from "../../../components/shared/Footer";
export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
  
      {/* Header */}
       <section className="py-16 px-8 bg-white rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-4xl font-bold mb-8 text-blue-900">About Smart Abacus</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-gray-700 text-lg mb-4">
                Smart Abacus is a leading education platform dedicated to unlocking the mathematical potential in every child. With over 15 years of excellence, we have empowered thousands of students to achieve extraordinary computational abilities and academic success.
              </p>
              <p className="text-gray-700 text-lg mb-4">
                Our comprehensive curriculum combines traditional Abacus methodology with modern educational techniques, ensuring students develop not just calculation skills but also enhanced memory, focus, and problem-solving abilities.
              </p>
              <p className="text-gray-700 text-lg">
                We believe every child deserves access to world-class mathematics education. Our mission is to make excellence achievable for all.
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-blue-50 p-8 rounded-2xl border border-blue-100/50">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Our Promise</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-pink-600 font-bold text-xl mr-3">✓</span>
                  <span className="text-gray-700">Personalized learning paths for every student</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 font-bold text-xl mr-3">✓</span>
                  <span className="text-gray-700">Expert guidance from certified instructors</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 font-bold text-xl mr-3">✓</span>
                  <span className="text-gray-700">Proven results in 6-12 months</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 font-bold text-xl mr-3">✓</span>
                  <span className="text-gray-700">Interactive and engaging learning experience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 font-bold text-xl mr-3">✓</span>
                  <span className="text-gray-700">Lifetime support and community access</span>
                </li>
              </ul>
            </div>
          </div>
        </section>


      <Footer />
    </div>
    
  );
}

