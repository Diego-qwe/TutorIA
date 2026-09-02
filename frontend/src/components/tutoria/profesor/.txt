"use client";

import { useState } from "react";

import Alumnos from "@/components/tutoria/profesor/Alumnos";
import ProgresoAlumnos from "@/components/tutoria/profesor/ProgresoAlumnos";

type SeccionProfesor =
  | "inicio"
  | "alumnos"
  | "actividades"
  | "resultados"
  | "progreso"
  | "perfil";

export default function ProfesorPage() {
  const [seccion, setSeccion] =
    useState<SeccionProfesor>("inicio");

  function volverInicio() {
    setSeccion("inicio");
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ENCABEZADO */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl">
              🤖
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                TutorIA
              </h1>

              <p className="text-sm text-slate-500">
                Panel del Profesor
              </p>
            </div>

          </div>

          <div className="rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700">
            👨‍🏫 Profesor
          </div>

        </div>

      </header>

      {/* CONTENIDO */}

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* INICIO */}

        {seccion === "inicio" && (
          <div>

            <div className="mb-10">

              <h2 className="text-4xl font-bold text-slate-900">
                Bienvenido, profesor 👨‍🏫
              </h2>

              <p className="mt-3 max-w-3xl text-lg text-slate-600">
                Administra tus alumnos y revisa su aprendizaje desde TutorIA.
              </p>

            </div>

            {/* TARJETAS */}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

              <Tarjeta
                emoji="👥"
                titulo="Mis alumnos"
                descripcion="Revisa los estudiantes registrados, sus cursos y rendimiento."
                textoBoton="Ver alumnos →"
                color="blue"
                onClick={() =>
                  setSeccion("alumnos")
                }
              />

              <Tarjeta
                emoji="📝"
                titulo="Actividades"
                descripcion="Crea ejercicios y actividades para tus estudiantes."
                textoBoton="Administrar →"
                color="green"
                onClick={() =>
                  setSeccion("actividades")
                }
              />

              <Tarjeta
                emoji="📊"
                titulo="Resultados"
                descripcion="Consulta los resultados obtenidos por tus estudiantes."
                textoBoton="Ver resultados →"
                color="orange"
                onClick={() =>
                  setSeccion("resultados")
                }
              />

              <Tarjeta
                emoji="📈"
                titulo="Progreso"
                descripcion="Visualiza ejercicios, aciertos y rendimiento por materia."
                textoBoton="Ver progreso →"
                color="purple"
                onClick={() =>
                  setSeccion("progreso")
                }
              />

              <Tarjeta
                emoji="⚠️"
                titulo="Necesitan apoyo"
                descripcion="Identifica alumnos con un rendimiento inferior al 60%."
                textoBoton="Revisar alumnos →"
                color="red"
                onClick={() =>
                  setSeccion("progreso")
                }
              />

              <Tarjeta
                emoji="👤"
                titulo="Mi perfil"
                descripcion="Revisa la información de tu cuenta de profesor."
                textoBoton="Ver perfil →"
                color="slate"
                onClick={() =>
                  setSeccion("perfil")
                }
              />

            </div>

            {/* BLOQUE DESTACADO */}

            <div className="mt-10 rounded-2xl bg-blue-600 p-8 text-white">

              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                <div>

                  <h3 className="text-2xl font-bold">
                    📚 Seguimiento de estudiantes
                  </h3>

                  <p className="mt-2 max-w-3xl text-blue-100">
                    Revisa el progreso de tus alumnos y detecta rápidamente las materias que necesitan reforzar.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSeccion("progreso")
                  }
                  className="rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Revisar progreso
                </button>

              </div>

            </div>

          </div>
        )}

        {/* MIS ALUMNOS */}

        {seccion === "alumnos" && (
          <Seccion
            volverInicio={volverInicio}
          >
            <Alumnos />
          </Seccion>
        )}

        {/* ACTIVIDADES */}

        {seccion === "actividades" && (
          <Seccion
            volverInicio={volverInicio}
          >

            <Placeholder
              emoji="📝"
              titulo="Actividades"
              descripcion="Aquí podrás crear y administrar actividades para tus alumnos."
            />

          </Seccion>
        )}

        {/* RESULTADOS */}

        {seccion === "resultados" && (
          <Seccion
            volverInicio={volverInicio}
          >

            <Placeholder
              emoji="📊"
              titulo="Resultados"
              descripcion="Aquí podrás revisar los resultados obtenidos por tus alumnos."
            />

          </Seccion>
        )}

        {/* PROGRESO */}

        {seccion === "progreso" && (
          <Seccion
            volverInicio={volverInicio}
          >
            <ProgresoAlumnos />
          </Seccion>
        )}

        {/* PERFIL */}

        {seccion === "perfil" && (
          <Seccion
            volverInicio={volverInicio}
          >

            <Placeholder
              emoji="👤"
              titulo="Mi perfil"
              descripcion="Aquí aparecerá la información de la cuenta del profesor."
            />

          </Seccion>
        )}

      </div>

    </main>
  );
}

/* =========================================
   SECCIÓN
========================================= */

function Seccion({
  children,
  volverInicio,
}: {
  children: React.ReactNode;
  volverInicio: () => void;
}) {
  return (
    <div>

      <button
        type="button"
        onClick={volverInicio}
        className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
      >
        ← Inicio
      </button>

      {children}

    </div>
  );
}

/* =========================================
   PLACEHOLDER
========================================= */

function Placeholder({
  emoji,
  titulo,
  descripcion,
}: {
  emoji: string;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div>

      <div className="mb-8">

        <h2 className="text-3xl font-bold text-slate-900">
          {emoji} {titulo}
        </h2>

        <p className="mt-2 text-slate-600">
          {descripcion}
        </p>

      </div>

      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

        <div className="text-6xl">
          {emoji}
        </div>

        <h3 className="mt-5 text-xl font-bold text-slate-900">
          Próximamente
        </h3>

        <p className="mt-2 text-slate-500">
          Estamos preparando esta sección de TutorIA.
        </p>

      </div>

    </div>
  );
}

/* =========================================
   TARJETAS
========================================= */

function Tarjeta({
  emoji,
  titulo,
  descripcion,
  textoBoton,
  color,
  onClick,
}: {
  emoji: string;
  titulo: string;
  descripcion: string;
  textoBoton: string;

  color:
    | "blue"
    | "green"
    | "orange"
    | "purple"
    | "red"
    | "slate";

  onClick: () => void;
}) {
  const colores = {
    blue: {
      fondo: "bg-blue-100",
      texto: "text-blue-600",
    },

    green: {
      fondo: "bg-green-100",
      texto: "text-green-600",
    },

    orange: {
      fondo: "bg-orange-100",
      texto: "text-orange-600",
    },

    purple: {
      fondo: "bg-purple-100",
      texto: "text-purple-600",
    },

    red: {
      fondo: "bg-red-100",
      texto: "text-red-600",
    },

    slate: {
      fondo: "bg-slate-100",
      texto: "text-slate-600",
    },
  };

  const estilo =
    colores[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >

      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-3xl ${estilo.fondo}`}
      >
        {emoji}
      </div>

      <h3 className="text-xl font-bold text-slate-900">
        {titulo}
      </h3>

      <p className="mt-2 text-slate-600">
        {descripcion}
      </p>

      <p
        className={`mt-5 font-semibold ${estilo.texto}`}
      >
        {textoBoton}
      </p>

    </button>
  );
}