"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Estadistica = {
  materia: string;
  total: number;
  correctas: number;
  porcentaje: number;
};

export default function ProgresoPage() {
  const router = useRouter();

  const [estadisticas, setEstadisticas] = useState<Estadistica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        router.replace("/login");
        return;
      }

      try {
        const referencia = collection(
          db,
          "usuarios",
          usuario.uid,
          "resultados"
        );

        const snapshot = await getDocs(referencia);

        const materias: Record<
          string,
          {
            total: number;
            correctas: number;
          }
        > = {};

        snapshot.forEach((documento) => {
          const datos = documento.data();

          const materia =
            typeof datos.materia === "string"
              ? datos.materia
              : "General";

          if (!materias[materia]) {
            materias[materia] = {
              total: 0,
              correctas: 0,
            };
          }

          materias[materia].total += 1;

          if (datos.correcta === true) {
            materias[materia].correctas += 1;
          }
        });

        const resultado = Object.entries(materias).map(
          ([materia, datos]) => ({
            materia,
            total: datos.total,
            correctas: datos.correctas,

            porcentaje:
              datos.total > 0
                ? Math.round(
                    (datos.correctas / datos.total) * 100
                  )
                : 0,
          })
        );

        setEstadisticas(resultado);
      } catch (error) {
        console.error(
          "Error cargando progreso:",
          error
        );
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const totalEjercicios = estadisticas.reduce(
    (total, materia) => total + materia.total,
    0
  );

  const totalCorrectas = estadisticas.reduce(
    (total, materia) => total + materia.correctas,
    0
  );

  const porcentajeGeneral =
    totalEjercicios > 0
      ? Math.round(
          (totalCorrectas / totalEjercicios) * 100
        )
      : 0;

  function emojiMateria(materia: string) {
    switch (materia) {
      case "Matemática":
        return "🔢";

      case "Lenguaje":
        return "📖";

      case "Historia":
        return "🌎";

      case "Ciencias":
        return "🧬";

      case "Programación":
        return "💻";

      default:
        return "📚";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xl">
          Cargando tu progreso... 📊
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        {/* ENCABEZADO */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-4xl font-bold">
              📊 Mi progreso
            </h1>

            <p className="text-gray-600 mt-2">
              Revisa tus resultados y mejora cada día.
            </p>
          </div>

          <Link
            href="/panel"
            className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100"
          >
            ← Volver al panel
          </Link>

        </div>

        {/* RESUMEN GENERAL */}

        <div className="grid md:grid-cols-3 gap-5 mb-10">

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 mb-2">
              Ejercicios realizados
            </p>

            <p className="text-4xl font-bold">
              {totalEjercicios}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 mb-2">
              Respuestas correctas
            </p>

            <p className="text-4xl font-bold">
              {totalCorrectas}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 mb-2">
              Rendimiento general
            </p>

            <p className="text-4xl font-bold">
              {porcentajeGeneral}%
            </p>
          </div>

        </div>

        {/* SIN RESULTADOS */}

        {estadisticas.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-10 text-center">

            <div className="text-6xl mb-4">
              📝
            </div>

            <h2 className="text-2xl font-bold mb-3">
              Todavía no tienes resultados
            </h2>

            <p className="text-gray-600 mb-6">
              Haz algunos ejercicios y TutorIA
              comenzará a registrar tu progreso.
            </p>

            <Link
              href="/panel/ejercicios"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Hacer ejercicios
            </Link>

          </div>
        )}

        {/* PROGRESO POR MATERIA */}

        {estadisticas.length > 0 && (
          <div>

            <h2 className="text-2xl font-bold mb-5">
              Progreso por materia
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              {estadisticas.map((item) => (
                <div
                  key={item.materia}
                  className="bg-white rounded-2xl shadow p-6"
                >

                  <div className="flex justify-between items-center mb-4">

                    <h3 className="text-xl font-bold">
                      {emojiMateria(item.materia)}{" "}
                      {item.materia}
                    </h3>

                    <span className="font-bold text-lg">
                      {item.porcentaje}%
                    </span>

                  </div>

                  {/* BARRA */}

                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">

                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all"
                      style={{
                        width: `${item.porcentaje}%`,
                      }}
                    />

                  </div>

                  <div className="flex justify-between mt-4 text-sm text-gray-600">

                    <span>
                      {item.correctas} correctas
                    </span>

                    <span>
                      {item.total} realizadas
                    </span>

                  </div>

                </div>
              ))}

            </div>

          </div>
        )}

      </div>
    </main>
  );
}