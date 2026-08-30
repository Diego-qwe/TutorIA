"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import {
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export default function EjerciciosPage() {
  const [materia, setMateria] = useState("Matemática");
  const [dificultad, setDificultad] = useState("Fácil");

  const [ejercicio, setEjercicio] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [correccion, setCorreccion] = useState("");

  const [loading, setLoading] = useState(false);

  async function generarEjercicio() {
    setLoading(true);
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

Reglas:
- Entrega solamente el ejercicio.
- No entregues la respuesta.
- Debe ser claro.
- Debe ser apropiado para estudiantes.
- Puede estar orientado a preparación escolar o PAES.
          `.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Error al generar el ejercicio"
        );
      }

      setEjercicio(data.reply);
    } catch (error) {
      console.error(
        "Error generando ejercicio:",
        error
      );

      setEjercicio(
        "⚠️ No se pudo generar el ejercicio. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  function obtenerClaveMateria() {
    switch (materia) {
      case "Matemática":
        return "matematica";

      case "Lenguaje":
        return "lenguaje";

      case "Historia":
        return "historia";

      case "Ciencias":
        return "ciencias";

      case "Inglés":
        return "ingles";

      default:
        return "general";
    }
  }

  async function guardarProgreso(
    correcta: boolean
  ) {
    const usuario = auth.currentUser;

    if (!usuario) {
      console.warn(
        "No hay usuario conectado. No se guardará el progreso."
      );

      return;
    }

    const referenciaUsuario = doc(
      db,
      "usuarios",
      usuario.uid
    );

    const materiaKey = obtenerClaveMateria();

    /*
      Primero nos aseguramos de que exista
      el documento del usuario.
    */

    await setDoc(
      referenciaUsuario,
      {
        nombre:
          usuario.displayName || "Estudiante",

        correo:
          usuario.email || "",

        actualizado:
          serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    /*
      Después aumentamos sus estadísticas.
    */

    await updateDoc(
      referenciaUsuario,
      {
        ejerciciosRealizados:
          increment(1),

        correctos:
          increment(
            correcta ? 1 : 0
          ),

        incorrectos:
          increment(
            correcta ? 0 : 1
          ),

        ultimaAsignatura:
          materia,

        ultimaDificultad:
          dificultad,

        actualizado:
          serverTimestamp(),

        [`materias.${materiaKey}.ejercicios`]:
          increment(1),

        [`materias.${materiaKey}.correctos`]:
          increment(
            correcta ? 1 : 0
          ),

        [`materias.${materiaKey}.incorrectos`]:
          increment(
            correcta ? 0 : 1
          ),
      }
    );

    console.log(
      "✅ Progreso guardado en Firestore"
    );
  }

  async function corregirRespuesta(
    e: FormEvent
  ) {
    e.preventDefault();

    if (!respuesta.trim()) {
      return;
    }

    if (!ejercicio) {
      return;
    }

    setLoading(true);
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
Actúa como profesor de ${materia}.

Ejercicio:
${ejercicio}

Respuesta del estudiante:
${respuesta}

Evalúa la respuesta.

Debes:
- Comenzar EXACTAMENTE con "CORRECTA:" si la respuesta está correcta.
- Comenzar EXACTAMENTE con "INCORRECTA:" si está incorrecta.
- Después explica brevemente por qué.
- Si está incorrecta, enseña cómo llegar a la respuesta correcta.
- Usa lenguaje claro.
- No seas excesivamente largo.
            `.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Error al corregir la respuesta"
        );
      }

      const textoCorreccion =
        data.reply || "";

      setCorreccion(
        textoCorreccion
      );

      const correcta =
        textoCorreccion
          .trim()
          .toUpperCase()
          .startsWith(
            "CORRECTA:"
          );

      /*
        Guardamos el avance del usuario.
      */

      await guardarProgreso(
        correcta
      );
    } catch (error) {
      console.error(
        "Error corrigiendo respuesta:",
        error
      );

      setCorreccion(
        "⚠️ No se pudo corregir la respuesta. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* ENCABEZADO */}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              📝 Ejercicios
            </h1>

            <p className="text-gray-600 mt-2">
              Practica con ejercicios
              generados automáticamente por
              TutorIA.
            </p>
          </div>

          <Link
            href="/panel"
            className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100"
          >
            ← Volver
          </Link>
        </div>

        {/* CONFIGURACIÓN */}

        <div className="bg-white shadow rounded-2xl p-6 mb-6">

          <h2 className="text-xl font-bold mb-4">
            Configurar ejercicio
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            {/* MATERIA */}

            <div>
              <label className="block mb-2 font-medium">
                Materia
              </label>

              <select
                value={materia}
                onChange={(e) =>
                  setMateria(
                    e.target.value
                  )
                }
                className="w-full border rounded-lg p-3"
              >
                <option>
                  Matemática
                </option>

                <option>
                  Lenguaje
                </option>

                <option>
                  Historia
                </option>

                <option>
                  Ciencias
                </option>

                <option>
                  Inglés
                </option>
              </select>
            </div>

            {/* DIFICULTAD */}

            <div>
              <label className="block mb-2 font-medium">
                Dificultad
              </label>

              <select
                value={dificultad}
                onChange={(e) =>
                  setDificultad(
                    e.target.value
                  )
                }
                className="w-full border rounded-lg p-3"
              >
                <option>
                  Fácil
                </option>

                <option>
                  Media
                </option>

                <option>
                  Difícil
                </option>
              </select>
            </div>

          </div>

          <button
            type="button"
            onClick={
              generarEjercicio
            }
            disabled={loading}
            className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Generando..."
              : "🤖 Generar ejercicio"}
          </button>
        </div>

        {/* EJERCICIO */}

        {ejercicio && (
          <div className="bg-white shadow rounded-2xl p-6 mb-6">

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-2xl font-bold">
                Tu ejercicio
              </h2>

              <span className="text-sm bg-blue-100 px-3 py-1 rounded-full">
                {materia} ·{" "}
                {dificultad}
              </span>

            </div>

            <p className="whitespace-pre-wrap text-lg">
              {ejercicio}
            </p>

          </div>
        )}

        {/* RESPUESTA */}

        {ejercicio && (
          <form
            onSubmit={
              corregirRespuesta
            }
            className="bg-white shadow rounded-2xl p-6"
          >

            <h2 className="text-xl font-bold mb-4">
              ✏️ Tu respuesta
            </h2>

            <textarea
              value={respuesta}
              onChange={(e) =>
                setRespuesta(
                  e.target.value
                )
              }
              placeholder="Escribe aquí tu respuesta..."
              disabled={loading}
              className="w-full border rounded-lg p-3 min-h-32 disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={
                loading ||
                !respuesta.trim()
              }
              className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading
                ? "Revisando..."
                : "✅ Revisar respuesta"}
            </button>

          </form>
        )}

        {/* CORRECCIÓN */}

        {correccion && (
          <div className="bg-white shadow rounded-2xl p-6 mt-6">

            <h2 className="text-xl font-bold mb-3">
              🤖 Corrección de
              TutorIA
            </h2>

            <p className="whitespace-pre-wrap">
              {correccion}
            </p>

            <div className="flex flex-wrap gap-3 mt-6">

              <button
                type="button"
                onClick={
                  generarEjercicio
                }
                disabled={loading}
                className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                🔄 Otro ejercicio
              </button>

              <Link
                href="/panel/progreso"
                className="border bg-white px-5 py-3 rounded-lg hover:bg-gray-100"
              >
                📊 Ver mi progreso
              </Link>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}