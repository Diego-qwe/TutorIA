export default function HowItWorks() {
  return (
    <section className="p-10 text-center">
      <h2 className="text-3xl font-bold mb-8">
        ¿Cómo funciona TutorIA? 🤖
      </h2>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold">
            1️⃣ Pregunta
          </h3>
          <p>
            Escribe tus dudas o temas que quieras aprender.
          </p>
        </div>

        <div className="p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold">
            2️⃣ Aprende
          </h3>
          <p>
            TutorIA explica los contenidos de forma sencilla.
          </p>
        </div>

        <div className="p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold">
            3️⃣ Mejora
          </h3>
          <p>
            Practica y avanza con ayuda personalizada.
          </p>
        </div>

      </div>
    </section>
  );
}