"use client";

import { FormEvent, useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import {
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export default function Ejercicios() {
  const [materia, setMateria] = useState("Matemática");
  const [dificultad, setDificultad] = useState("Fácil");

  const [ejercicio, setEjercicio] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [correccion, setCorreccion] = useState("");

  const [generando, setGenerando] = useState(false);
  const [corrigiendo, setCorrigiendo] = useState(false);

  async function generarEjercicio() {
    setGenerando(true);
    setEjercicio("");
    setRespuesta("");
    setCorreccion("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: `
Genera UN ejercicio educativo para un estudiante de Chile.

Materia: ${materia}
Dificultad: ${dificultad}

REGLAS:
- Entrega solamente el ejercicio.
- NO entregues la respuesta.
- NO entregues la solución.
- NO entregues pistas.
- Debe ser claro y apropiado para estudiantes.
- Puede utilizar contenidos escolares o preparación PAES.

FORMATO MATEMÁTICO:
- Si necesitas escribir variables, ecuaciones u operaciones matemáticas, utiliza LaTeX.
- Para expresiones matemáticas dentro de una oración usa un solo signo de dólar al inicio y otro al final.
- Ejemplo: la variable x debe escribirse como $x$.
- Para ecuaciones separadas utiliza dos signos de dólar al inicio y dos al final.
- Ejemplo: $$5x + 15 = 60$$
- Nunca dejes un delimitador matemático sin cerrar.

DINERO:
- NUNCA utilices el símbolo $ para representar dinero.
- Si hablas de dinero chileno, escribe la palabra "pesos".
- También puedes utilizar "CLP".
- Ejemplo correcto: 3.500 pesos.
- Ejemplo correcto: CLP 3.500.
- Ejemplo incorrecto: $3.500.
- Recuerda que el símbolo $ está reservado exclusivamente para delimitar matemáticas.
`,
          materia,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "No se pudo generar el ejercicio."
        );
      }

      const texto =
        data?.reply ||
        data?.respuesta ||
        data?.message ||
        "";

      setEjercicio(texto);
    } catch (error) {
      console.error(
        "Error generando ejercicio:",
        error
      );

      setEjercicio(
        "No pude generar el ejercicio. Inténtalo nuevamente."
      );
    } finally {
      setGenerando(false);
    }
  }

  function obtenerClaveMateria() {
    return materia
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");
  }

  async function guardarProgreso(correcta: boolean) {
    const usuario = auth.currentUser;

    if (!usuario) {
      return;
    }

    try {
      const usuarioRef = doc(
        db,
        "usuarios",
        usuario.uid
      );

      await setDoc(
        usuarioRef,
        {
          nombre:
            usuario.displayName ||
            "Estudiante",

          correo:
            usuario.email || "",

          actualizadoEn:
            serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      const materiaKey =
        obtenerClaveMateria();

      await updateDoc(
        usuarioRef,
        {
          ejerciciosRealizados:
            increment(1),

          correctos: correcta
            ? increment(1)
            : increment(0),

          incorrectos: correcta
            ? increment(0)
            : increment(1),

          ultimaMateria:
            materia,

          ultimaDificultad:
            dificultad,

          actualizadoEn:
            serverTimestamp(),

          [`materias.${materiaKey}.ejercicios`]:
            increment(1),

          [`materias.${materiaKey}.correctos`]:
            correcta
              ? increment(1)
              : increment(0),

          [`materias.${materiaKey}.incorrectos`]:
            correcta
              ? increment(0)
              : increment(1),
        }
      );
    } catch (error) {
      console.error(
        "Error guardando progreso:",
        error
      );
    }
  }

  async function corregirRespuesta(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!respuesta.trim() || !ejercicio) {
      return;
    }

    setCorrigiendo(true);
    setCorreccion("");

    try {
      const response = await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message: `
Actúa como profesor y corrige la respuesta del estudiante.

MATERIA:
${materia}

EJERCICIO:
${ejercicio}

RESPUESTA DEL ESTUDIANTE:
${respuesta}

Debes comenzar tu respuesta EXACTAMENTE con una de estas dos opciones:

CORRECTA:

o

INCORRECTA:

Después:
- Explica de manera sencilla por qué.
- Si está incorrecta, muestra cómo resolverla correctamente.
- Utiliza un lenguaje educativo y fácil de comprender.
- No seas excesivamente largo.

FORMATO MATEMÁTICO:
- Las variables, ecuaciones y operaciones deben escribirse usando LaTeX.
- Para matemáticas dentro de una oración usa $...$.
- Para ecuaciones separadas usa $$...$$.
- Cierra siempre correctamente los delimitadores matemáticos.

DINERO:
- NUNCA utilices el símbolo $ para representar dinero.
- Escribe "pesos" o "CLP".
- Ejemplo: 3.500 pesos.
- Ejemplo: CLP 3.500.
- El símbolo $ debe reservarse exclusivamente para delimitar matemáticas.

IMPORTANTE:
- No preguntes si el estudiante quiere otro ejercicio.
- Limítate a corregir y explicar la respuesta.
`,
            materia,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "No se pudo corregir la respuesta."
        );
      }

      const texto =
        data?.reply ||
        data?.respuesta ||
        data?.message ||
        "";

      setCorreccion(texto);

      const correcta =
        texto
          .trim()
          .toUpperCase()
          .startsWith("CORRECTA:");

      await guardarProgreso(correcta);
    } catch (error) {
      console.error(
        "Error corrigiendo respuesta:",
        error
      );

      setCorreccion(
        "No pude corregir tu respuesta. Inténtalo nuevamente."
      );
    } finally {
      setCorrigiendo(false);
    }
  }

  return (
    <div className="w-full">

      {/* TÍTULO */}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">
          📝 Ejercicios
        </h2>

        <p className="mt-2 text-slate-600">
          Practica con ejercicios generados por TutorIA.
        </p>
      </div>

      {/* CONFIGURACIÓN */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="grid gap-5 md:grid-cols-2">

          {/* MATERIA */}

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Materia
            </label>

            <select
              value={materia}
              onChange={(e) =>
                setMateria(e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option>Matemática</option>
              <option>Lenguaje</option>
              <option>Historia</option>
              <option>Ciencias</option>
              <option>Inglés</option>
            </select>
          </div>

          {/* DIFICULTAD */}

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Dificultad
            </label>

            <select
              value={dificultad}
              onChange={(e) =>
                setDificultad(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option>Fácil</option>
              <option>Media</option>
              <option>Difícil</option>
            </select>
          </div>

        </div>

        <button
          type="button"
          onClick={generarEjercicio}
          disabled={
            generando || corrigiendo
          }
          className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generando
            ? "🤖 Generando..."
            : "🤖 Generar ejercicio"}
        </button>

      </div>

      {/* EJERCICIO */}

      {ejercicio && (
        <div className="mt-8 rounded-2xl bg-white p-7 shadow-sm">

          <h3 className="mb-5 text-2xl font-bold text-slate-900">
            📖 Tu ejercicio
          </h3>

          <div className="prose max-w-none overflow-x-auto text-lg text-slate-700">
            <ReactMarkdown
              remarkPlugins={[
                remarkMath,
              ]}
              rehypePlugins={[
                rehypeKatex,
              ]}
            >
              {ejercicio}
            </ReactMarkdown>
          </div>

        </div>
      )}

      {/* RESPUESTA */}

      {ejercicio && (
        <form
          onSubmit={
            corregirRespuesta
          }
          className="mt-8 rounded-2xl bg-white p-7 shadow-sm"
        >

          <h3 className="mb-5 text-2xl font-bold text-slate-900">
            ✏️ Tu respuesta
          </h3>

          <textarea
            value={respuesta}
            onChange={(e) =>
              setRespuesta(
                e.target.value
              )
            }
            placeholder="Escribe aquí tu respuesta..."
            rows={5}
            disabled={corrigiendo}
            className="w-full resize-none rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500 disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={
              corrigiendo ||
              !respuesta.trim()
            }
            className="mt-5 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {corrigiendo
              ? "🤖 Corrigiendo..."
              : "✅ Corregir respuesta"}
          </button>

        </form>
      )}

      {/* CORRECCIÓN */}

      {correccion && (
        <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-7">

          <h3 className="mb-4 text-2xl font-bold text-blue-900">
            🤖 Corrección de TutorIA
          </h3>

          <div className="prose max-w-none overflow-x-auto text-blue-900">
            <ReactMarkdown
              remarkPlugins={[
                remarkMath,
              ]}
              rehypePlugins={[
                rehypeKatex,
              ]}
            >
              {correccion}
            </ReactMarkdown>
          </div>

          <button
            type="button"
            onClick={generarEjercicio}
            disabled={
              generando || corrigiendo
            }
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            🔄 Otro ejercicio
          </button>

        </div>
      )}

    </div>
  );
}