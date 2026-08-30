import Link from "next/link";

export default function HistoriaPage() {
  const temas = [
    {
      emoji: "🇨🇱",
      titulo: "Historia de Chile",
      descripcion:
        "Repasa procesos históricos de Chile, desde la Independencia hasta la actualidad.",
    },
    {
      emoji: "🌍",
      titulo: "Historia universal",
      descripcion:
        "Estudia revoluciones, guerras mundiales, cambios políticos, sociales y económicos.",
    },
    {
      emoji: "🏛️",
      titulo: "Ciudadanía",
      descripcion:
        "Comprende democracia, Estado, derechos, deberes y participación ciudadana.",
    },
    {
      emoji: "💰",
      titulo: "Economía y sociedad",
      descripcion:
        "Aprende conceptos básicos de economía, desarrollo, desigualdad y transformaciones sociales.",
    },
    {
      emoji: "🗺️",
      titulo: "Territorio y geografía",
      descripcion:
        "Analiza territorio, población, recursos naturales y fenómenos geográficos.",
    },
    {
      emoji: "🎓",
      titulo: "Preparación PAES",
      descripcion:
        "Practica habilidades y contenidos de Historia y Ciencias Sociales para la PAES.",
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
            🌎 Historia
          </h1>

          <p className="text-lg text-gray-600 mt-3">
            Explora procesos históricos, ciudadanía y sociedad junto a TutorIA.
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
                href={`/panel/chat?materia=Historia&tema=${encodeURIComponent(
                  tema.titulo
                )}`}
                className="mt-6 inline-block bg-amber-600 text-white px-5 py-3 rounded-lg hover:bg-amber-700 transition"
              >
                🤖 Estudiar con TutorIA
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-amber-50 border border-amber-100 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-2">
            🎯 Practica Historia
          </h2>

          <p className="text-gray-600 mb-5">
            Refuerza tus conocimientos con ejercicios y explicaciones
            personalizadas de TutorIA.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/panel/ejercicios"
              className="px-5 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition"
            >
              📝 Practicar ejercicios
            </Link>

            <Link
              href="/panel/chat"
              className="px-5 py-3 bg-white border border-amber-200 text-amber-700 font-semibold rounded-xl hover:bg-amber-50 transition"
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