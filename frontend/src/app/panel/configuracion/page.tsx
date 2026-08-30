"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ConfiguracionPage() {
  const [materia, setMateria] = useState("General");
  const [respuesta, setRespuesta] = useState("Normal");
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    const materiaGuardada =
      localStorage.getItem("tutoria_materia");

    const respuestaGuardada =
      localStorage.getItem("tutoria_respuesta");

    if (materiaGuardada) {
      setMateria(materiaGuardada);
    }

    if (respuestaGuardada) {
      setRespuesta(respuestaGuardada);
    }
  }, []);

  function guardarConfiguracion() {
    localStorage.setItem(
      "tutoria_materia",
      materia
    );

    localStorage.setItem(
      "tutoria_respuesta",
      respuesta
    );

    setGuardado(true);

    setTimeout(() => {
      setGuardado(false);
    }, 2500);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">

        <Link
          href="/panel"
          className="text-blue-600 hover:underline"
        >
          ← Volver al panel
        </Link>

        <div className="bg-white rounded-2xl shadow p-8 mt-6">
          <h1 className="text-3xl font-bold mb-2">
            ⚙️ Configuración
          </h1>

          <p className="text-gray-600 mb-8">
            Personaliza cómo quieres utilizar TutorIA.
          </p>

          <div className="space-y-7">

            <div>
              <label className="block font-bold mb-2">
                📚 Materia predeterminada
              </label>

              <select
                value={materia}
                onChange={(e) =>
                  setMateria(e.target.value)
                }
                className="w-full border rounded-xl p-3"
              >
                <option>General</option>
                <option>Matemática</option>
                <option>Lenguaje</option>
                <option>Historia</option>
                <option>Ciencias</option>
                <option>Inglés</option>
              </select>

              <p className="text-sm text-gray-500 mt-2">
                Será la materia seleccionada por defecto
                al utilizar TutorIA.
              </p>
            </div>

            <div>
              <label className="block font-bold mb-2">
                🤖 Tipo de respuestas
              </label>

              <select
                value={respuesta}
                onChange={(e) =>
                  setRespuesta(e.target.value)
                }
                className="w-full border rounded-xl p-3"
              >
                <option>Corta</option>
                <option>Normal</option>
                <option>Detallada</option>
              </select>

              <p className="text-sm text-gray-500 mt-2">
                Decide cuánto detalle quieres en las
                explicaciones de TutorIA.
              </p>
            </div>

            <button
              onClick={guardarConfiguracion}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
            >
              💾 Guardar configuración
            </button>

            {guardado && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center">
                ✅ Configuración guardada correctamente.
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}