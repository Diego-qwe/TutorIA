"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
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

export default function ChatPage() {
  const [mensaje, setMensaje] =
    useState("");

  const [materia, setMateria] =
    useState("General");

  const [escribiendo, setEscribiendo] =
    useState(false);

  const [
    cargandoHistorial,
    setCargandoHistorial,
  ] = useState(true);

  const [usuarioId, setUsuarioId] =
    useState<string | null>(null);

  const [
    conversacionId,
    setConversacionId,
  ] = useState("principal");

  const [mensajes, setMensajes] =
    useState<Mensaje[]>([
      saludoInicial,
    ]);

  const finalChatRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * CARGAR HISTORIAL DE UNA CONVERSACIÓN
   */
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

      if (
        mensajesGuardados.length > 0
      ) {
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

  /*
   * DETECTAR USUARIO Y CARGAR
   * SU CONVERSACIÓN ACTUAL
   */
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

            setCargandoHistorial(
              false
            );

            return;
          }

          setUsuarioId(
            usuario.uid
          );

          /*
           * Guardamos la conversación activa
           * en el navegador.
           *
           * La clave incluye el UID para que
           * cada usuario tenga su propio chat.
           */
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

  /*
   * SCROLL AUTOMÁTICO
   */
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

  /*
   * GUARDAR MENSAJE
   */
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

  /*
   * CREAR NUEVA CONVERSACIÓN
   */
  function nuevaConversacion() {
    if (
      escribiendo ||
      cargandoHistorial
    ) {
      return;
    }

    /*
     * Creamos un ID único.
     */
    const nuevoId =
      `chat_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

    setConversacionId(
      nuevoId
    );

    /*
     * Guardamos cuál es el chat actual.
     */
    if (usuarioId) {
      const clave =
        `tutoria_conversacion_${usuarioId}`;

      localStorage.setItem(
        clave,
        nuevoId
      );
    }

    /*
     * Reiniciamos solamente
     * lo que aparece en pantalla.
     *
     * NO borramos Firestore.
     */
    setMensajes([
      saludoInicial,
    ]);

    setMensaje("");

    setMateria(
      "General"
    );
  }

  /*
   * ENVIAR MENSAJE
   */
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

    /*
     * Solo usamos el historial
     * de ESTA conversación.
     *
     * Quitamos el saludo inicial.
     */
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

    /*
     * Guardamos una copia del ID.
     *
     * Así, aunque cambie algún estado,
     * la respuesta seguirá perteneciendo
     * al chat correcto.
     */
    const chatActual =
      conversacionId;

    /*
     * Mostrar mensaje inmediatamente
     */
    setMensajes(
      (prev) => [
        ...prev,
        mensajeUsuario,
      ]
    );

    setMensaje("");

    setEscribiendo(true);

    /*
     * Guardar pregunta
     */
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
      /*
       * Preguntar a TutorIA
       */
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

      if (
        !respuesta.ok
      ) {
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

      /*
       * Mostrar respuesta
       */
      setMensajes(
        (prev) => [
          ...prev,
          mensajeTutor,
        ]
      );

      /*
       * Guardar respuesta
       */
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

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={
                nuevaConversacion
              }
              disabled={
                escribiendo ||
                cargandoHistorial
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              ➕ Nueva conversación
            </button>

            <Link
              href="/panel"
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              ← Volver al panel
            </Link>

          </div>

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
              "Inglés",
            ].map(
              (item) => (

                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setMateria(
                      item
                    )
                  }
                  disabled={
                    escribiendo ||
                    cargandoHistorial
                  }
                  className={`px-4 py-2 rounded-full border transition disabled:opacity-50 ${
                    materia ===
                    item
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {item}
                </button>

              )
            )}

          </div>

        </section>

        {/* CHAT */}

        <section className="flex-1 p-4 md:p-6 overflow-y-auto">

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
                    msg.autor ===
                    "Tú";

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

            <div
              ref={
                finalChatRef
              }
            />

          </div>

        </section>

        {/* CAJA DE MENSAJE */}

        <form
          onSubmit={
            enviarMensaje
          }
          className="bg-white border-t p-4 sticky bottom-0"
        >

          <div className="flex gap-3 max-w-4xl mx-auto">

            <textarea
              value={
                mensaje
              }
              onChange={(
                e
              ) =>
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
              className="flex-1 resize-none border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"

              onKeyDown={(
                e
              ) => {

                if (
                  e.key ===
                    "Enter" &&
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