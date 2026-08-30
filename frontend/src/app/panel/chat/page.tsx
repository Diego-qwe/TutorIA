"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

type Mensaje = {
  autor: "Tú" | "TutorIA";
  texto: string;
};

export default function ChatPage() {
  const [mensaje, setMensaje] = useState("");
  const [materia, setMateria] = useState("General");
  const [escribiendo, setEscribiendo] = useState(false);

  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      autor: "TutorIA",
      texto:
        "¡Hola! 👋 Soy **TutorIA**, tu compañero de estudio. Elige una materia y pregúntame lo que necesites.",
    },
  ]);

  const finalChatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    finalChatRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [mensajes, escribiendo]);

  async function enviarMensaje(e?: FormEvent) {
    e?.preventDefault();

    const pregunta = mensaje.trim();

    if (!pregunta || escribiendo) return;

    setMensajes((prev) => [
      ...prev,
      {
        autor: "Tú",
        texto: pregunta,
      },
    ]);

    setMensaje("");
    setEscribiendo(true);

    try {
      const respuesta = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `
Materia seleccionada: ${materia}

Pregunta del estudiante:
${pregunta}
          `.trim(),
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          data.error || "Error al consultar TutorIA"
        );
      }

      setMensajes((prev) => [
        ...prev,
        {
          autor: "TutorIA",
          texto:
            data.reply ||
            "No pude generar una respuesta.",
        },
      ]);
    } catch (error) {
      console.error("Error:", error);

      setMensajes((prev) => [
        ...prev,
        {
          autor: "TutorIA",
          texto:
            "⚠️ No pude conectarme con la inteligencia artificial. Inténtalo nuevamente.",
        },
      ]);
    } finally {
      setEscribiendo(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-5xl mx-auto min-h-screen flex flex-col">

        {/* ENCABEZADO */}
        <header className="bg-white border-b p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-10">

          <div>
            <h1 className="text-3xl font-bold">
              🤖 TutorIA
            </h1>

            <p className="text-gray-500">
              Tu asistente inteligente de estudio
            </p>
          </div>

          <Link
            href="/panel"
            className="self-start md:self-auto px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            ← Volver al panel
          </Link>
        </header>

        {/* MATERIAS */}
        <section className="bg-white border-b p-4">

          <p className="font-semibold mb-3">
            Materia:
          </p>

          <div className="flex flex-wrap gap-2">

            {[
              "General",
              "Matemática",
              "Lenguaje",
              "Historia",
              "Ciencias",
              "Ingles",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMateria(item)}
                className={`px-4 py-2 rounded-full border transition ${
                  materia === item
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            ))}

          </div>
        </section>

        {/* CHAT */}
        <section className="flex-1 p-4 md:p-6 overflow-y-auto">

          <div className="space-y-6">

            {mensajes.map((msg, index) => {
              const esUsuario = msg.autor === "Tú";

              return (
                <div
                  key={index}
                  className={`flex ${
                    esUsuario
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                      esUsuario
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white text-gray-900 rounded-bl-md"
                    }`}
                  >

                    <p className="font-bold mb-2">
                      {esUsuario
                        ? "Tú"
                        : "🤖 TutorIA"}
                    </p>

                    {esUsuario ? (
                      <p className="whitespace-pre-wrap">
                        {msg.texto}
                      </p>
                    ) : (
                      <div className="prose prose-slate max-w-none">
                        <ReactMarkdown>
                          {msg.texto}
                        </ReactMarkdown>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {escribiendo && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">

                  <p className="font-bold mb-2">
                    🤖 TutorIA
                  </p>

                  <p className="text-gray-500">
                    Pensando...
                  </p>

                </div>
              </div>
            )}

            <div ref={finalChatRef} />

          </div>
        </section>

        {/* CAJA DE MENSAJE */}
        <form
          onSubmit={enviarMensaje}
          className="bg-white border-t p-4 sticky bottom-0"
        >

          <div className="flex gap-3 max-w-4xl mx-auto">

            <textarea
              value={mensaje}
              onChange={(e) =>
                setMensaje(e.target.value)
              }
              placeholder={`Pregunta sobre ${materia}...`}
              disabled={escribiendo}
              rows={1}
              className="flex-1 resize-none border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();

                  if (
                    mensaje.trim() &&
                    !escribiendo
                  ) {
                    enviarMensaje();
                  }
                }
              }}
            />

            <button
              type="submit"
              disabled={
                escribiendo ||
                !mensaje.trim()
              }
              className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {escribiendo
                ? "..."
                : "Enviar"}
            </button>

          </div>

          <p className="text-xs text-gray-400 text-center mt-2">
            Enter para enviar · Shift + Enter para nueva línea
          </p>

        </form>

      </div>
    </main>
  );
}