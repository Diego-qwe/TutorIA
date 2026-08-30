import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <section className="p-10 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Aprende con tu asistente inteligente
        </h2>

        <p className="text-lg">
          TutorIA te ayuda a prepararte para la PAES con explicaciones,
          ejercicios y apoyo personalizado.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="p-6 rounded-xl shadow">
            📚
            <h3 className="text-xl font-bold">
              Preparación PAES
            </h3>
            <p>
              Practica Matemática, Lenguaje, Historia y Ciencias.
            </p>
          </div>

          <div className="p-6 rounded-xl shadow">
            🤖
            <h3 className="text-xl font-bold">
              Tutor IA
            </h3>
            <p>
              Resuelve dudas con ayuda de inteligencia artificial.
            </p>
          </div>

          <div className="p-6 rounded-xl shadow">
            📊
            <h3 className="text-xl font-bold">
              Tu progreso
            </h3>
            <p>
              Revisa tus avances y mejora cada día.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}