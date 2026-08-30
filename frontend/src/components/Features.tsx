export default function Features() {
  return (
    <section className="p-10">
      <h2 className="text-3xl font-bold text-center mb-8">
        ¿Qué puedes hacer con TutorIA?
      </h2>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold">
            🤖 Asistente IA
          </h3>
          <p>
            Resuelve dudas y aprende con ayuda inteligente.
          </p>
        </div>

        <div className="p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold">
            📚 Material educativo
          </h3>
          <p>
            Encuentra recursos para estudiar mejor.
          </p>
        </div>

        <div className="p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold">
            📊 Seguimiento
          </h3>
          <p>
            Revisa tus avances y progreso.
          </p>
        </div>

      </div>
    </section>
  );
}