export default function Features() {
  return (
    <section className="p-10">
      <h2 className="text-3xl font-bold text-center mb-8">
        ¿Qué puedes hacer con EduKids IA?
      </h2>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="p-6 rounded-xl shadow bg-white">
          <h3 className="text-xl font-bold">
            🤖 Asistente IA
          </h3>
          <p>
            Resuelve dudas, explica contenidos y ayuda a aprender.
          </p>
        </div>

        <div className="p-6 rounded-xl shadow bg-white">
          <h3 className="text-xl font-bold">
            📚 Material educativo
          </h3>
          <p>
            Accede a recursos para mejorar tus estudios.
          </p>
        </div>

        <div className="p-6 rounded-xl shadow bg-white">
          <h3 className="text-xl font-bold">
            📊 Seguimiento
          </h3>
          <p>
            Observa tu avance y mejora tus resultados.
          </p>
        </div>

      </div>
    </section>
  );
}