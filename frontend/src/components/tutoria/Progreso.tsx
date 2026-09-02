"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type MateriaProgreso = {
  ejercicios?: number;
  correctos?: number;
  incorrectos?: number;
};

type DatosUsuario = {
  ejerciciosRealizados?: number;
  correctos?: number;
  incorrectos?: number;

  materias?: Record<
    string,
    MateriaProgreso
  >;
};

export default function Progreso() {
  const [datos, setDatos] =
    useState<DatosUsuario | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (usuario) => {
          if (!usuario) {
            setDatos(null);
            setLoading(false);
            return;
          }

          try {
            const usuarioRef = doc(
              db,
              "usuarios",
              usuario.uid
            );

            const snapshot =
              await getDoc(usuarioRef);

            if (snapshot.exists()) {
              setDatos(
                snapshot.data() as DatosUsuario
              );
            } else {
              setDatos({});
            }
          } catch (error) {
            console.error(
              "Error cargando progreso:",
              error
            );

            setDatos({});
          } finally {
            setLoading(false);
          }
        }
      );

    return () => unsubscribe();
  }, []);

  function nombreMateria(
    clave: string
  ) {
    const nombres: Record<
      string,
      string
    > = {
      matematica: "Matemática",
      lenguaje: "Lenguaje",
      historia: "Historia",
      ciencias: "Ciencias",
      ingles: "Inglés",
    };

    return nombres[clave] || clave;
  }

  function emojiMateria(
    clave: string
  ) {
    const emojis: Record<
      string,
      string
    > = {
      matematica: "🔢",
      lenguaje: "📖",
      historia: "🌎",
      ciencias: "🧬",
      ingles: "🇬🇧",
    };

    return emojis[clave] || "📚";
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">

          <div className="mb-4 text-5xl">
            📊
          </div>

          <p className="text-lg font-semibold text-slate-700">
            Cargando tu progreso...
          </p>

        </div>
      </div>
    );
  }

  const total =
    datos?.ejerciciosRealizados || 0;

  const correctos =
    datos?.correctos || 0;

  const incorrectos =
    datos?.incorrectos || 0;

  const porcentaje =
    total > 0
      ? Math.round(
          (correctos / total) * 100
        )
      : 0;

  const materias =
    datos?.materias
      ? Object.entries(
          datos.materias
        )
      : [];

  return (
    <div className="w-full">

      {/* TÍTULO */}

      <div className="mb-8">

        <h2 className="text-3xl font-bold text-slate-900">
          📊 Mi progreso
        </h2>

        <p className="mt-2 text-slate-600">
          Revisa tus resultados y descubre cuánto has avanzado.
        </p>

      </div>

      {/* RESUMEN */}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="text-3xl">
            📝
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            Ejercicios realizados
          </p>

          <p className="mt-1 text-4xl font-bold text-slate-900">
            {total}
          </p>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="text-3xl">
            ✅
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            Respuestas correctas
          </p>

          <p className="mt-1 text-4xl font-bold text-green-600">
            {correctos}
          </p>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="text-3xl">
            ❌
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            Respuestas incorrectas
          </p>

          <p className="mt-1 text-4xl font-bold text-red-500">
            {incorrectos}
          </p>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="text-3xl">
            🎯
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            Rendimiento general
          </p>

          <p className="mt-1 text-4xl font-bold text-blue-600">
            {porcentaje}%
          </p>

        </div>

      </div>

      {/* BARRA GENERAL */}

      {total > 0 && (
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-3 flex items-center justify-between">

            <h3 className="font-bold text-slate-900">
              Rendimiento general
            </h3>

            <span className="font-bold text-blue-600">
              {porcentaje}%
            </span>

          </div>

          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">

            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${porcentaje}%`,
              }}
            />

          </div>

          <p className="mt-3 text-sm text-slate-500">
            Has respondido correctamente{" "}
            {correctos} de {total} ejercicios.
          </p>

        </div>
      )}

      {/* SIN ACTIVIDAD */}

      {total === 0 && (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            📝
          </div>

          <h3 className="mt-5 text-2xl font-bold text-slate-900">
            Todavía no tienes resultados
          </h3>

          <p className="mx-auto mt-3 max-w-lg text-slate-600">
            Haz algunos ejercicios y TutorIA comenzará a registrar aquí tu progreso.
          </p>

        </div>
      )}

      {/* MATERIAS */}

      {materias.length > 0 && (
        <div className="mt-10">

          <h3 className="mb-5 text-2xl font-bold text-slate-900">
            📚 Progreso por materia
          </h3>

          <div className="grid gap-6 md:grid-cols-2">

            {materias.map(
              ([clave, progreso]) => {
                const ejercicios =
                  progreso.ejercicios ||
                  0;

                const buenas =
                  progreso.correctos ||
                  0;

                const malas =
                  progreso.incorrectos ||
                  0;

                const rendimiento =
                  ejercicios > 0
                    ? Math.round(
                        (buenas /
                          ejercicios) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={clave}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                  >

                    <div className="flex items-center justify-between">

                      <h4 className="text-xl font-bold text-slate-900">
                        {emojiMateria(
                          clave
                        )}{" "}
                        {nombreMateria(
                          clave
                        )}
                      </h4>

                      <span className="text-xl font-bold text-blue-600">
                        {rendimiento}%
                      </span>

                    </div>

                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">

                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{
                          width: `${rendimiento}%`,
                        }}
                      />

                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3 text-center">

                      <div className="rounded-xl bg-slate-50 p-3">

                        <p className="text-xl font-bold text-slate-900">
                          {ejercicios}
                        </p>

                        <p className="text-xs text-slate-500">
                          Realizados
                        </p>

                      </div>

                      <div className="rounded-xl bg-green-50 p-3">

                        <p className="text-xl font-bold text-green-600">
                          {buenas}
                        </p>

                        <p className="text-xs text-green-700">
                          Correctos
                        </p>

                      </div>

                      <div className="rounded-xl bg-red-50 p-3">

                        <p className="text-xl font-bold text-red-500">
                          {malas}
                        </p>

                        <p className="text-xs text-red-700">
                          Incorrectos
                        </p>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>
      )}

    </div>
  );
}