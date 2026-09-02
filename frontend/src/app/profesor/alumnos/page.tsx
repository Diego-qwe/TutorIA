"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

type Alumno = {
  id: string;
  nombre: string;
  correo: string;
  curso: string;
  autorizado: boolean;
};

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarAlumnos() {
      try {
        setLoading(true);
        setError("");

        const usuariosRef = collection(db, "usuarios");

        const consulta = query(
          usuariosRef,
          where("rol", "==", "alumno")
        );

        const resultado = await getDocs(consulta);

        const lista: Alumno[] = resultado.docs.map((documento) => {
          const datos = documento.data();

          return {
            id: documento.id,
            nombre: datos.nombre || "Sin nombre",
            correo: datos.correo || "",
            curso: datos.curso || "Sin curso",
            autorizado: datos.autorizado ?? false,
          };
        });

        setAlumnos(lista);
      } catch (err) {
        console.error("Error cargando alumnos:", err);

        setError(
          "No se pudieron cargar los alumnos desde Firebase."
        );
      } finally {
        setLoading(false);
      }
    }

    cargarAlumnos();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              TutorIA
            </h1>

            <p className="text-sm text-slate-500">
              Mis alumnos
            </p>
          </div>

          <Link
            href="/profesor"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Volver al panel
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            👥 Mis alumnos
          </h2>

          <p className="mt-2 text-slate-600">
            Estudiantes registrados en TutorIA.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-slate-600">
              Cargando alumnos...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && alumnos.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <div className="text-5xl">
              👨‍🎓
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-900">
              No hay alumnos registrados
            </h3>

            <p className="mt-2 text-slate-600">
              Cuando un alumno cree una cuenta, aparecerá aquí.
            </p>
          </div>
        )}

        {!loading && !error && alumnos.length > 0 && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">

                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Nombre
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Curso
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Correo
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Estado
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {alumnos.map((alumno) => (
                    <tr
                      key={alumno.id}
                      className="border-t border-slate-200"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {alumno.nombre}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {alumno.curso}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {alumno.correo}
                      </td>

                      <td className="px-6 py-4">
                        {alumno.autorizado ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Activo
                          </span>
                        ) : (
                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                            Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}