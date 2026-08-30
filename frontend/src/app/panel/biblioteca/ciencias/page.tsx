import Link from "next/link";

export default function CienciasPage() {
  const temas = [
    {
      emoji: "🧬",
      titulo: "Biología",
      descripcion:
        "Estudia células, genética, evolución, organismos y funcionamiento de los seres vivos.",
    },
    {
      emoji: "🫀",
      titulo: "Cuerpo humano",
      descripcion:
        "Conoce los principales sistemas del cuerpo humano y cómo funcionan.",
    },
    {
      emoji: "⚗️",
      titulo: "Química",
      descripcion:
        "Aprende sobre átomos, elementos, enlaces, reacciones químicas y materia.",
    },
    {
      emoji: "⚡",
      titulo: "Física",
      descripcion:
        "Estudia movimiento, fuerza, energía, electricidad, ondas y fenómenos físicos.",
    },
    {
      emoji: "🌱",
      titulo: "Ecología y medio ambiente",
      descripcion:
        "Comprende ecosistemas, biodiversidad, cadenas alimentarias y medio ambiente.",
    },
    {
      emoji: "🎓",
      titulo: "Preparación PAES Ciencias",
      descripcion:
        "Practica contenidos y habilidades de Biología, Física y Química para la PAES.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* ENCABEZADO */}
        <div className="mb-10">
          <Link
            href="/panel/biblioteca"
            className="text-blue-600 hover:underline"
          >
            ← Volver a Biblioteca
          </Link>

          <h1 className="text-4xl font-bold mt-5">
            🧬 Ciencias
          </h1>

          <p className="text-lg text-gray-600 mt-3">
            Explora Biología, Física, Química y ciencias naturales junto a
            TutorIA.
          </p>
        </div>

        {/* TEMAS */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {temas.map((tema) => (
            <div
              key={tema.titulo}
              className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">
                {tema.emoji}
              </div>

              <h2 className="text-xl font-bold mb-3">
                {tema.titulo}
              </h2>

              <p className="text-gray-600">
                {tema.descripcion}
              </p>

              <Link
                href={`/panel/chat?materia=Ciencias&tema=${encodeURIComponent(
                  tema.titulo
                )}`}
                className="mt-6 inline-block bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition"
              >
                🤖 Estudiar con TutorIA
              </Link>
            </div>
          ))}
        </div>

        {/* ZONA DE PRÁCTICA */}
        <div className="mt-10 bg-green-50 border border-green-100 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-2">
            🔬 Practica Ciencias
          </h2>

          <p className="text-gray-600 mb-5">
            Refuerza tus conocimientos con ejercicios de Biología, Física y
            Química generados por TutorIA.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/panel/ejercicios"
              className="px-5 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
            >
              📝 Practicar ejercicios
            </Link>

            <Link
              href="/panel/chat?materia=Ciencias"
              className="px-5 py-3 bg-white border border-green-200 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition"
            >
              🤖 Estudiar con TutorIA
            </Link>

            <Link
              href="/panel/progreso"
              className="px-5 py-3 bg-white border rounded-xl hover:bg-gray-100 transition"
            >
              📊 Ver mi progreso
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}