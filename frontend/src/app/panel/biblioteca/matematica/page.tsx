import Link from "next/link";

export default function MatematicaPage() {
  const temas = [
    {
      emoji: "🔢",
      titulo: "Números",
      descripcion:
        "Números enteros, fracciones, decimales, razones, proporciones y porcentajes.",
    },
    {
      emoji: "✖️",
      titulo: "Álgebra",
      descripcion:
        "Expresiones algebraicas, ecuaciones, sistemas y resolución de problemas.",
    },
    {
      emoji: "📈",
      titulo: "Funciones",
      descripcion:
        "Funciones lineales, afines y cuadráticas, tablas y gráficos.",
    },
    {
      emoji: "📐",
      titulo: "Geometría",
      descripcion:
        "Ángulos, perímetros, áreas, volúmenes, semejanza y geometría.",
    },
    {
      emoji: "🎲",
      titulo: "Probabilidad y estadística",
      descripcion:
        "Probabilidad, gráficos, tablas, promedio, mediana y análisis de datos.",
    },
    {
      emoji: "🎓",
      titulo: "Preparación PAES M1",
      descripcion:
        "Repasa contenidos y practica habilidades para Matemática M1.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <Link
            href="/panel/biblioteca"
            className="text-blue-600 hover:underline"
          >
            ← Volver a Biblioteca
          </Link>

          <h1 className="text-4xl font-bold mt-5">
            🔢 Matemática
          </h1>

          <p className="text-lg text-gray-600 mt-3">
            Elige un tema para comenzar a estudiar y practicar.
          </p>
        </div>

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
                href={`/panel/chat?materia=Matemática&tema=${encodeURIComponent(
                  tema.titulo
                )}`}
                className="mt-6 inline-block bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                🤖 Estudiar con TutorIA
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-2">
            🎯 Practica Matemática
          </h2>

          <p className="text-gray-600 mb-5">
            También puedes practicar con ejercicios generados automáticamente
            y revisar tu progreso.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/panel/ejercicios"
              className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              📝 Practicar ejercicios
            </Link>

            <Link
              href="/panel/chat"
              className="px-5 py-3 bg-white border border-blue-200 text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition"
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