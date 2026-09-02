"use client";

type Props = {
  irAlChat?: () => void;
};

export default function Biblioteca({
  irAlChat,
}: Props) {
  const materias = [
    {
      titulo: "🔢 Matemática",
      descripcion:
        "Álgebra, geometría, porcentajes, funciones y preparación PAES.",
    },
    {
      titulo: "📖 Lenguaje",
      descripcion:
        "Comprensión lectora, gramática, escritura y preparación PAES.",
    },
    {
      titulo: "🌎 Historia",
      descripcion:
        "Historia de Chile, historia universal, ciudadanía y preparación PAES.",
    },
    {
      titulo: "🧬 Ciencias",
      descripcion:
        "Biología, Física, Química y contenidos de preparación PAES.",
    },
    {
      titulo: "🇬🇧 Inglés",
      descripcion:
        "Vocabulario, gramática, comprensión lectora, escritura y conversación.",
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">
          📚 Biblioteca
        </h2>

        <p className="mt-2 text-slate-600">
          Explora contenidos y materiales de estudio disponibles
          en TutorIA.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {materias.map((materia) => (
          <div
            key={materia.titulo}
            className="flex flex-col rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="mb-3 text-2xl font-bold text-slate-900">
              {materia.titulo}
            </h3>

            <p className="flex-1 text-slate-600">
              {materia.descripcion}
            </p>

            <button
              type="button"
              className="mt-6 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Ver contenido →
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-6">
        <h3 className="text-xl font-bold text-slate-900">
          🤖 ¿No encuentras lo que necesitas?
        </h3>

        <p className="mb-4 mt-2 text-slate-600">
          Pregúntale directamente a TutorIA y recibe una
          explicación personalizada.
        </p>

        <button
          type="button"
          onClick={irAlChat}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          💬 Preguntar a TutorIA
        </button>
      </div>
    </div>
  );
}