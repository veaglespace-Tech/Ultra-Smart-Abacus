import Navbar from "../../../../components/shared/Navbar";
import Footer from "../../../../components/shared/Footer";

export default function ProfessionalCourse() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">Professional Course - Syllabus</h1>
        <p className="text-gray-700 mb-8">
          The Professional course prepares students to become certified instructors and masters of applied mental arithmetic. Below is the full syllabus and expectations.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Module 1 — Advanced Mental Arithmetic</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Speed techniques for large-number operations</li>
            <li>Visualization strategies and abacus imagery</li>
            <li>Advanced subtraction and multiplication shortcuts</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Module 2 — Teaching Methodology</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Lesson planning and curriculum design</li>
            <li>Assessment methods and personalized learning paths</li>
            <li>Classroom management and engagement techniques</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Module 3 — Certification &amp; Assessment</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Mock-teaching sessions and feedback</li>
            <li>Written and practical certification exams</li>
            <li>Competition coaching and professional development</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Course Logistics</h2>
          <p className="text-gray-700 mb-2">Duration: 6 months • 4 sessions/week</p>
          <p className="text-gray-700 mb-4">Prerequisites: Completion of Expert level or equivalent proficiency.</p>

          <div className="flex gap-4">
            <a href="/pages/auth/register" className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold"> Enroll now</a>
            <a href="/contact" className="px-6 py-3 border border-pink-600 text-pink-600 rounded-lg">Contact Admissions</a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
