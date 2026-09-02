"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import { onAuthStateChanged } from "firebase/auth";

import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type Mensaje = {
  autor: "Tú" | "TutorIA";
  texto: string;
};

type MensajeGuardado = {
  autor?: "Tú" | "TutorIA";
  texto?: string;
};

const saludoInicial: Mensaje = {
  autor: "TutorIA",
  texto:
    "¡Hola! 👋 Soy **TutorIA**, tu compañero de estudio. Elige una materia y pregúntame lo que necesites.",
};

export default function Chat() {
  const [mensaje, setMensaje] = useState("");
  const [materia, setMateria] = useState("General");

  const [escribiendo, setEscribiendo] =
    useState(false);

  const [cargandoHistorial, setCargandoHistorial] =
    useState(true);

  const [usuarioId, setUsuarioId] =
    useState<string | null>(null);

  const [conversacionId, setConversacionId] =
    useState("principal");

  const [mensajes, setMensajes] =
    useState<Mensaje[]>([saludoInicial]);

  const finalChatRef =
    useRef<HTMLDivElement | null>(null);

  async function cargarConversacion(
    uid: string,
    idConversacion: string
  ) {
    try {
      setCargandoHistorial(true);

      const mensajesRef = collection(
        db,
        "usuarios",
        uid,
        "conversaciones",
        idConversacion,
        "mensajes"
      );

      const consulta = query(
        mensajesRef,
        orderBy("createdAt", "asc")
      );

      const resultado =
        await getDocs(consulta);

      const mensajesGuardados: Mensaje[] =
        resultado.docs
          .map((documento) => {
            const data =
              documento.data() as MensajeGuardado;

            if (
              !data.autor ||
              !data.texto
            ) {
              return null;
            }

            if (
              data.autor !== "Tú" &&
              data.autor !== "TutorIA"
            ) {
              return null;
            }

            return {
              autor: data.autor,
              texto: data.texto,
            };
          })
          .filter(
            (
              item
            ): item is Mensaje =>
              item !== null
          );

      if (mensajesGuardados.length > 0) {
        setMensajes([
          saludoInicial,
          ...mensajesGuardados,
        ]);
      } else {
        setMensajes([
          saludoInicial,
        ]);
      }
    } catch (error) {
      console.error(
        "Error cargando conversación:",
        error
      );

      setMensajes([
        saludoInicial,
      ]);
    } finally {
      setCargandoHistorial(false);
    }
  }

  useEffect(() => {
    const cancelar =
      onAuthStateChanged(
        auth,
        async (usuario) => {
          if (!usuario) {
            setUsuarioId(null);

            setConversacionId(
              "principal"
            );

            setMensajes([
              saludoInicial,
            ]);

            setCargandoHistorial(false);

            return;
          }

          setUsuarioId(
            usuario.uid
          );

          const clave =
            `tutoria_conversacion_${usuario.uid}`;

          const conversacionGuardada =
            localStorage.getItem(
              clave
            );

          const id =
            conversacionGuardada ||
            "principal";

          setConversacionId(id);

          await cargarConversacion(
            usuario.uid,
            id
          );
        }
      );

    return () =>
      cancelar();
  }, []);

  useEffect(() => {
    finalChatRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [
    mensajes,
    escribiendo,
  ]);

  async function guardarMensaje(
    nuevoMensaje: Mensaje,
    idConversacion: string
  ) {
    if (!usuarioId) return;

    const mensajesRef = collection(
      db,
      "usuarios",
      usuarioId,
      "conversaciones",
      idConversacion,
      "mensajes"
    );

    await addDoc(
      mensajesRef,
      {
        autor:
          nuevoMensaje.autor,

        texto:
          nuevoMensaje.texto,

        createdAt:
          serverTimestamp(),
      }
    );
  }

  function nuevaConversacion() {
    if (
      escribiendo ||
      cargandoHistorial
    ) {
      return;
    }

    const nuevoId =
      `chat_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

    setConversacionId(
      nuevoId
    );

    if (usuarioId) {
      const clave =
        `tutoria_conversacion_${usuarioId}`;

      localStorage.setItem(
        clave,
        nuevoId
      );
    }

    setMensajes([
      saludoInicial,
    ]);

    setMensaje("");

    setMateria(
      "General"
    );
  }

  async function enviarMensaje(
    e?: FormEvent
  ) {
    e?.preventDefault();

    const pregunta =
      mensaje.trim();

    if (
      !pregunta ||
      escribiendo ||
      cargandoHistorial
    ) {
      return;
    }

    const historial =
      mensajes
        .slice(1)
        .map((msg) => ({
          role:
            msg.autor === "Tú"
              ? "user"
              : "assistant",

          content:
            msg.texto,
        }));

    const mensajeUsuario: Mensaje =
      {
        autor: "Tú",
        texto: pregunta,
      };

    const chatActual =
      conversacionId;

    setMensajes(
      (prev) => [
        ...prev,
        mensajeUsuario,
      ]
    );

    setMensaje("");

    setEscribiendo(true);

    try {
      await guardarMensaje(
        mensajeUsuario,
        chatActual
      );
    } catch (error) {
      console.error(
        "No se pudo guardar la pregunta:",
        error
      );
    }

    try {
      const respuesta =
        await fetch(
          "/api/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                message:
                  pregunta,

                materia,

                history:
                  historial,
              }),
          }
        );

      const data =
        await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          data.error ||
            "Error al consultar TutorIA"
        );
      }

      const mensajeTutor: Mensaje =
        {
          autor: "TutorIA",

          texto:
            data.reply ||
            "No pude generar una respuesta.",
        };

      setMensajes(
        (prev) => [
          ...prev,
          mensajeTutor,
        ]
      );

      try {
        await guardarMensaje(
          mensajeTutor,
          chatActual
        );
      } catch (error) {
        console.error(
          "No se pudo guardar la respuesta:",
          error
        );
      }
    } catch (error) {
      console.error(
        "Error:",
        error
      );

      const mensajeError =
        error instanceof Error
          ? error.message
          : "Error desconocido";

      setMensajes(
        (prev) => [
          ...prev,
          {
            autor: "TutorIA",
            texto:
              `⚠️ Error de conexión: ${mensajeError}`,
          },
        ]
      );
    } finally {
      setEscribiendo(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-150px)] min-h-[600px] flex-col overflow-hidden rounded-2xl bg-slate-100 shadow-sm">

      {/* ENCABEZADO DEL CHAT */}

      <div className="flex flex-col gap-4 border-b bg-white p-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            💬 Preguntar a TutorIA
          </h2>

          <p className="text-sm text-slate-500">
            Tu asistente inteligente de estudio
          </p>
        </div>

        <button
          type="button"
          onClick={
            nuevaConversacion
          }
          disabled={
            escribiendo ||
            cargandoHistorial
          }
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          ➕ Nueva conversación
        </button>

      </div>

      {/* MATERIAS */}

      <div className="border-b bg-white p-4">

        <p className="mb-3 font-semibold">
          Materia:
        </p>

        <div className="flex flex-wrap gap-2">

          {[
            "General",
            "Matemática",
            "Lenguaje",
            "Historia",
            "Ciencias",
            "Inglés",
          ].map((item) => (

            <button
              key={item}
              type="button"
              onClick={() =>
                setMateria(item)
              }
              disabled={
                escribiendo ||
                cargandoHistorial
              }
              className={`rounded-full border px-4 py-2 transition disabled:opacity-50 ${
                materia === item
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {item}
            </button>

          ))}

        </div>
      </div>

      {/* MENSAJES */}

      <div className="flex-1 overflow-y-auto p-4 md:p-6">

        <div className="space-y-6">

          {cargandoHistorial && (
            <div className="text-center text-gray-500">
              📚 Cargando conversación...
            </div>
          )}

          {!cargandoHistorial &&
            mensajes.map(
              (
                msg,
                index
              ) => {

                const esUsuario =
                  msg.autor === "Tú";

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
                      className={`max-w-[90%] rounded-2xl px-5 py-4 shadow-sm md:max-w-[75%] ${
                        esUsuario
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md bg-white text-gray-900"
                      }`}
                    >

                      <p className="mb-2 font-bold">
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

                          <ReactMarkdown
                            remarkPlugins={[
                              remarkMath,
                            ]}
                            rehypePlugins={[
                              rehypeKatex,
                            ]}
                          >
                            {msg.texto}
                          </ReactMarkdown>

                        </div>

                      )}

                    </div>
                  </div>
                );
              }
            )}

          {escribiendo && (

            <div className="flex justify-start">

              <div className="rounded-2xl rounded-bl-md bg-white px-5 py-4 shadow-sm">

                <p className="mb-2 font-bold">
                  🤖 TutorIA
                </p>

                <p className="text-gray-500">
                  Pensando...
                </p>

              </div>

            </div>

          )}

          <div
            ref={
              finalChatRef
            }
          />

        </div>

      </div>

      {/* CAJA DE MENSAJE */}

      <form
        onSubmit={
          enviarMensaje
        }
        className="border-t bg-white p-4"
      >

        <div className="mx-auto flex max-w-4xl gap-3">

          <textarea
            value={
              mensaje
            }
            onChange={(e) =>
              setMensaje(
                e.target.value
              )
            }
            placeholder={
              cargandoHistorial
                ? "Cargando conversación..."
                : `Pregunta sobre ${materia}...`
            }
            disabled={
              escribiendo ||
              cargandoHistorial
            }
            rows={1}
            className="flex-1 resize-none rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"

            onKeyDown={(e) => {

              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {

                e.preventDefault();

                if (
                  mensaje.trim() &&
                  !escribiendo &&
                  !cargandoHistorial
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
              cargandoHistorial ||
              !mensaje.trim()
            }
            className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
          >

            {escribiendo
              ? "..."
              : "Enviar"}

          </button>

        </div>

        <p className="mt-2 text-center text-xs text-gray-400">
          Enter para enviar · Shift + Enter para nueva línea
        </p>

      </form>

    </div>
  );
}