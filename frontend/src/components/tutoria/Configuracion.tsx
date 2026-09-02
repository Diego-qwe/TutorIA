"use client";

import { useEffect, useState } from "react";

type TamanoTexto = "pequeno" | "normal" | "grande";

export default function Configuracion() {
  const [modoOscuro, setModoOscuro] = useState(false);

  const [tamanoTexto, setTamanoTexto] =
    useState<TamanoTexto>("normal");

  const [materiaFavorita, setMateriaFavorita] =
    useState("Matemática");

  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    const configuracionGuardada =
      localStorage.getItem(
        "tutoria-configuracion"
      );

    if (!configuracionGuardada) {
      return;
    }

    try {
      const configuracion =
        JSON.parse(configuracionGuardada);

      setModoOscuro(
        configuracion.modoOscuro ??
          false
      );

      setTamanoTexto(
        configuracion.tamanoTexto ??
          "normal"
      );

      setMateriaFavorita(
        configuracion.materiaFavorita ??
          "Matemática"
      );
    } catch (error) {
      console.error(
        "Error cargando configuración:",
        error
      );
    }
  }, []);

  function guardarConfiguracion() {
    const configuracion = {
      modoOscuro,
      tamanoTexto,
      materiaFavorita,
    };

    localStorage.setItem(
      "tutoria-configuracion",
      JSON.stringify(configuracion)
    );

    setGuardado(true);

    setTimeout(() => {
      setGuardado(false);
    }, 2500);
  }

  function restablecerConfiguracion() {
    setModoOscuro(false);
    setTamanoTexto("normal");
    setMateriaFavorita("Matemática");

    localStorage.removeItem(
      "tutoria-configuracion"
    );

    setGuardado(false);
  }

  return (
    <div className="mx-auto w-full max-w-4xl">

      {/* TÍTULO */}

      <div className="mb-8">

        <h2 className="text-3xl font-bold text-slate-900">
          ⚙️ Configuración
        </h2>

        <p className="mt-2 text-slate-600">
          Personaliza algunas opciones de TutorIA.
        </p>

      </div>

      <div className="space-y-6">

        {/* APARIENCIA */}

        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <div className="mb-6">

            <h3 className="text-xl font-bold text-slate-900">
              🎨 Apariencia
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Elige cómo quieres visualizar TutorIA.
            </p>

          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-5">

            <div>

              <p className="font-semibold text-slate-900">
                🌙 Modo oscuro
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Reduce el brillo de la interfaz.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setModoOscuro(
                  !modoOscuro
                )
              }
              className={`relative h-7 w-12 rounded-full transition ${
                modoOscuro
                  ? "bg-blue-600"
                  : "bg-slate-300"
              }`}
            >

              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  modoOscuro
                    ? "left-6"
                    : "left-1"
                }`}
              />

            </button>

          </div>

          <p className="mt-3 text-sm text-slate-500">
            {modoOscuro
              ? "Modo oscuro seleccionado."
              : "Modo claro seleccionado."}
          </p>

        </div>

        {/* TAMAÑO DE TEXTO */}

        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <h3 className="text-xl font-bold text-slate-900">
            🔤 Tamaño del texto
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Elige el tamaño de texto que te resulte más cómodo.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">

            <button
              type="button"
              onClick={() =>
                setTamanoTexto(
                  "pequeno"
                )
              }
              className={`rounded-xl border p-4 transition ${
                tamanoTexto ===
                "pequeno"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="text-sm font-semibold">
                Pequeño
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setTamanoTexto(
                  "normal"
                )
              }
              className={`rounded-xl border p-4 transition ${
                tamanoTexto ===
                "normal"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="text-base font-semibold">
                Normal
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setTamanoTexto(
                  "grande"
                )
              }
              className={`rounded-xl border p-4 transition ${
                tamanoTexto ===
                "grande"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="text-xl font-semibold">
                Grande
              </span>
            </button>

          </div>

        </div>

        {/* MATERIA FAVORITA */}

        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <h3 className="text-xl font-bold text-slate-900">
            📚 Materia favorita
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Selecciona la materia que utilizas con mayor frecuencia.
          </p>

          <select
            value={materiaFavorita}
            onChange={(e) =>
              setMateriaFavorita(
                e.target.value
              )
            }
            className="mt-6 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
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

        {/* INFORMACIÓN */}

        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <h3 className="text-xl font-bold text-slate-900">
            🤖 Acerca de TutorIA
          </h3>

          <div className="mt-5 space-y-4">

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">

              <span className="text-slate-500">
                Aplicación
              </span>

              <span className="font-semibold text-slate-900">
                TutorIA
              </span>

            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">

              <span className="text-slate-500">
                Tipo
              </span>

              <span className="font-semibold text-slate-900">
                Asistente educativo
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-500">
                Estado
              </span>

              <span className="font-semibold text-green-600">
                🟢 Activo
              </span>

            </div>

          </div>

        </div>

        {/* BOTONES */}

        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <button
              type="button"
              onClick={
                restablecerConfiguracion
              }
              className="rounded-xl border border-red-200 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50"
            >
              ↩️ Restablecer
            </button>

            <button
              type="button"
              onClick={
                guardarConfiguracion
              }
              className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              💾 Guardar configuración
            </button>

          </div>

          {guardado && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-center font-semibold text-green-700">
              ✅ Configuración guardada correctamente.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}