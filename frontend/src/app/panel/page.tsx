"use client";

import { useState } from "react";

import Chat from "@/components/tutoria/Chat";
import Biblioteca from "@/components/tutoria/Biblioteca";
import Ejercicios from "@/components/tutoria/Ejercicios";
import Progreso from "@/components/tutoria/Progreso";
import Perfil from "@/components/tutoria/Perfil";
import Configuracion from "@/components/tutoria/Configuracion";
import ActividadesAlumno from "@/components/tutoria/ActividadesAlumno";

type Seccion =
  | "inicio"
  | "chat"
  | "biblioteca"
  | "ejercicios"
  | "actividades"
  | "progreso"
  | "perfil"
  | "configuracion";

export default function PanelPage() {
  const [seccion, setSeccion] =
    useState<Seccion>("inicio");

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
                Tu asistente educativo
              </p>

            </div>

          </div>

          <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            🎓 Estudiante
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
                ¡Bienvenido a TutorIA! 👋
              </h2>

              <p className="mt-3 max-w-2xl text-lg text-slate-600">
                Aprende, practica y mejora tus conocimientos con ayuda de inteligencia artificial.
              </p>

            </div>

            {/* TARJETAS */}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

              {/* CHAT */}

              <button
                type="button"
                onClick={() =>
                  setSeccion("chat")
                }
                className="group rounded-2xl bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-3xl">
                  💬
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  Preguntar a TutorIA
                </h3>

                <p className="mt-2 text-slate-600">
                  Haz preguntas y recibe explicaciones sobre tus materias.
                </p>

                <p className="mt-5 font-semibold text-blue-600">
                  Comenzar →
                </p>

              </button>

              {/* BIBLIOTECA */}

              <button
                type="button"
                onClick={() =>
                  setSeccion("biblioteca")
                }
                className="group rounded-2xl bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-3xl">
                  📚
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  Biblioteca
                </h3>

                <p className="mt-2 text-slate-600">
                  Encuentra contenidos y material educativo organizado por materia.
                </p>

                <p className="mt-5 font-semibold text-purple-600">
                  Explorar →
                </p>

              </button>

              {/* EJERCICIOS */}

              <button
                type="button"
                onClick={() =>
                  setSeccion("ejercicios")
                }
                className="group rounded-2xl bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-3xl">
                  📝
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  Ejercicios
                </h3>

                <p className="mt-2 text-slate-600">
                  Practica con ejercicios generados especialmente para ti.
                </p>

                <p className="mt-5 font-semibold text-green-600">
                  Practicar →
                </p>

              </button>

              {/* MIS ACTIVIDADES */}

              <button
                type="button"
                onClick={() =>
                  setSeccion("actividades")
                }
                className="group rounded-2xl bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 text-3xl">
                  📋
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  Mis actividades
                </h3>

                <p className="mt-2 text-slate-600">
                  Revisa las actividades asignadas por tus profesores.
                </p>

                <p className="mt-5 font-semibold text-indigo-600">
                  Ver actividades →
                </p>
              </button>

              {/* PROGRESO */}

              <button
                type="button"
                onClick={() =>
                  setSeccion("progreso")
                }
                className="group rounded-2xl bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-3xl">
                  📊
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  Mi progreso
                </h3>

                <p className="mt-2 text-slate-600">
                  Revisa tus ejercicios, respuestas correctas y rendimiento.
                </p>

                <p className="mt-5 font-semibold text-orange-600">
                  Ver progreso →
                </p>

              </button>

              {/* PERFIL */}

              <button
                type="button"
                onClick={() =>
                  setSeccion("perfil")
                }
                className="group rounded-2xl bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-100 text-3xl">
                  👤
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  Mi perfil
                </h3>

                <p className="mt-2 text-slate-600">
                  Revisa la información de tu cuenta de TutorIA.
                </p>

                <p className="mt-5 font-semibold text-cyan-600">
                  Ver perfil →
                </p>

              </button>

              {/* CONFIGURACIÓN */}

              <button
                type="button"
                onClick={() =>
                  setSeccion(
                    "configuracion"
                  )
                }
                className="group rounded-2xl bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-3xl">
                  ⚙️
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  Configuración
                </h3>

                <p className="mt-2 text-slate-600">
                  Personaliza las opciones de TutorIA.
                </p>

                <p className="mt-5 font-semibold text-slate-600">
                  Configurar →
                </p>

              </button>

            </div>

            {/* AYUDA */}

            <div className="mt-10 rounded-2xl bg-blue-600 p-8 text-white">

              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                <div>

                  <h3 className="text-2xl font-bold">
                    ¿Necesitas ayuda con una materia? 🤖
                  </h3>

                  <p className="mt-2 text-blue-100">
                    Pregúntale a TutorIA y recibe una explicación paso a paso.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSeccion("chat")
                  }
                  className="rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Preguntar ahora
                </button>

              </div>

            </div>

          </div>
        )}

        {/* CHAT */}

        {seccion === "chat" && (
          <div>

            <button
              type="button"
              onClick={volverInicio}
              className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              ← Inicio
            </button>

            <Chat />

          </div>
        )}

        {/* BIBLIOTECA */}

        {seccion === "biblioteca" && (
          <div>

            <button
              type="button"
              onClick={volverInicio}
              className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              ← Inicio
            </button>

            <Biblioteca
              irAlChat={() =>
                setSeccion("chat")
              }
            />

          </div>
        )}

        {/* EJERCICIOS */}

        {seccion === "ejercicios" && (
          <div>

            <button
              type="button"
              onClick={volverInicio}
              className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              ← Inicio
            </button>

            <Ejercicios />

          </div>
        )}

        {/* ACTIVIDADES */}

        {seccion === "actividades" && (
          <div>
            <button
              type="button"
              onClick={volverInicio}
              className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              ← Inicio
            </button>

            <ActividadesAlumno />
          </div>
        )}

        {/* PROGRESO */}

        {seccion === "progreso" && (
          <div>

            <button
              type="button"
              onClick={volverInicio}
              className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              ← Inicio
            </button>

            <Progreso />

          </div>
        )}

        {/* PERFIL */}

        {seccion === "perfil" && (
          <div>

            <button
              type="button"
              onClick={volverInicio}
              className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              ← Inicio
            </button>

            <Perfil />

          </div>
        )}

        {/* CONFIGURACIÓN */}

        {seccion ===
          "configuracion" && (
          <div>

            <button
              type="button"
              onClick={volverInicio}
              className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              ← Inicio
            </button>

            <Configuracion />

          </div>
        )}

      </div>

    </main>
  );
}