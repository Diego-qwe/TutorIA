"use client";

import { useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type Alumno = {
  id: string;
  nombre: string;
  correo: string;
  curso: string;
  autorizado: boolean;

  ejerciciosRealizados: number;
  correctos: number;
  incorrectos: number;
};

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (usuarioActual) => {
        try {
          setLoading(true);
          setError("");

          // =========================================
          // 1. COMPROBAR PROFESOR CONECTADO
          // =========================================

          if (!usuarioActual) {
            setAlumnos([]);
            setError(
              "Debes iniciar sesión como profesor."
            );
            return;
          }

          // =========================================
          // 2. OBTENER PERFIL DEL PROFESOR
          // =========================================

          const profesorRef = doc(
            db,
            "usuarios",
            usuarioActual.uid
          );

          const profesorDoc =
            await getDoc(profesorRef);

          if (!profesorDoc.exists()) {
            setAlumnos([]);
            setError(
              "No encontramos el perfil del profesor."
            );
            return;
          }

          const profesor = profesorDoc.data();

          const establecimientoId =
            profesor.establecimientoId;

          if (!establecimientoId) {
            setAlumnos([]);
            setError(
              "Tu cuenta de profesor no tiene un establecimiento asignado."
            );
            return;
          }

          // =========================================
          // 3. CONSULTAR SOLO ALUMNOS
          //    DEL MISMO ESTABLECIMIENTO
          // =========================================

          const usuariosRef = collection(
            db,
            "usuarios"
          );

          const consulta = query(
            usuariosRef,
            where(
              "establecimientoId",
              "==",
              establecimientoId
            ),
            where(
              "rol",
              "==",
              "alumno"
            )
          );

          const resultado =
            await getDocs(consulta);

          // =========================================
          // 4. CONVERTIR RESULTADOS
          // =========================================

          const lista: Alumno[] =
            resultado.docs.map((documento) => {
              const datos = documento.data();

              return {
                id: documento.id,

                nombre:
                  datos.nombre ||
                  "Sin nombre",

                correo:
                  datos.correo ||
                  "",

                curso:
                  datos.curso ||
                  "Sin curso",

                autorizado:
                  datos.autorizado ??
                  false,

                ejerciciosRealizados:
                  datos.ejerciciosRealizados ??
                  0,

                correctos:
                  datos.correctos ??
                  0,

                incorrectos:
                  datos.incorrectos ??
                  0,
              };
            });

          lista.sort((a, b) =>
            a.nombre.localeCompare(
              b.nombre,
              "es"
            )
          );

          setAlumnos(lista);

        } catch (err) {
          console.error(
            "Error cargando alumnos:",
            err
          );

          setAlumnos([]);
          setError(
            "No se pudieron cargar los alumnos desde Firebase."
          );

        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // =========================================
  // BUSCADOR
  // =========================================

  const alumnosFiltrados =
    alumnos.filter((alumno) => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      if (!texto) {
        return true;
      }

      return (
        alumno.nombre
          .toLowerCase()
          .includes(texto) ||

        alumno.correo
          .toLowerCase()
          .includes(texto) ||

        alumno.curso
          .toLowerCase()
          .includes(texto)
      );
    });

  // =========================================
  // ESTADÍSTICAS
  // =========================================

  const alumnosActivos =
    alumnos.filter(
      (alumno) =>
        alumno.autorizado
    ).length;

  const alumnosPendientes =
    alumnos.length -
    alumnosActivos;

  return (
    <div className="w-full">

      {/* =====================================
          TÍTULO
      ===================================== */}

      <div className="mb-8">

        <h2 className="text-3xl font-bold text-slate-900">
          👥 Mis alumnos
        </h2>

        <p className="mt-2 text-slate-600">
          Revisa los estudiantes registrados
          en tu establecimiento.
        </p>

      </div>

      {/* =====================================
          RESUMEN
      ===================================== */}

      {!loading && !error && (
        <div className="mb-8 grid gap-5 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              👨‍🎓 Alumnos
            </p>

            <p className="mt-2 text-4xl font-bold text-slate-900">
              {alumnos.length}
            </p>

          </div>

          <div className="rounded-2xl bg-green-50 p-6">

            <p className="text-sm font-medium text-green-700">
              ✅ Activos
            </p>

            <p className="mt-2 text-4xl font-bold text-green-700">
              {alumnosActivos}
            </p>

          </div>

          <div className="rounded-2xl bg-yellow-50 p-6">

            <p className="text-sm font-medium text-yellow-700">
              ⏳ Pendientes
            </p>

            <p className="mt-2 text-4xl font-bold text-yellow-700">
              {alumnosPendientes}
            </p>

          </div>

        </div>
      )}

      {/* =====================================
          CARGANDO
      ===================================== */}

      {loading && (
        <div className="rounded-2xl bg-white p-8 shadow-sm">

          <div className="text-center">

            <div className="mb-4 text-5xl">
              👨‍🎓
            </div>

            <p className="font-semibold text-slate-700">
              Cargando alumnos...
            </p>

          </div>

        </div>
      )}

      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 font-medium text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* =====================================
          SIN ALUMNOS
      ===================================== */}

      {!loading &&
        !error &&
        alumnos.length === 0 && (

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            👨‍🎓
          </div>

          <h3 className="mt-5 text-2xl font-bold text-slate-900">
            No hay alumnos registrados
          </h3>

          <p className="mt-3 text-slate-600">
            Cuando un alumno de este establecimiento
            cree una cuenta, aparecerá aquí.
          </p>

        </div>
      )}

      {/* =====================================
          LISTADO
      ===================================== */}

      {!loading &&
        !error &&
        alumnos.length > 0 && (

        <div>

          {/* BUSCADOR */}

          <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              🔎 Buscar alumno
            </label>

            <input
              type="text"
              value={busqueda}
              onChange={(e) =>
                setBusqueda(
                  e.target.value
                )
              }
              placeholder="Busca por nombre, correo o curso..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />

          </div>

          {/* TABLA */}

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Alumno
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Curso
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Ejercicios
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Rendimiento
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Estado
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {alumnosFiltrados.map(
                    (alumno) => {

                      const porcentaje =
                        alumno.ejerciciosRealizados > 0
                          ? Math.round(
                              (
                                alumno.correctos /
                                alumno.ejerciciosRealizados
                              ) * 100
                            )
                          : 0;

                      return (

                        <tr
                          key={alumno.id}
                          className="border-t border-slate-200 transition hover:bg-slate-50"
                        >

                          {/* ALUMNO */}

                          <td className="px-6 py-4">

                            <div className="font-semibold text-slate-900">
                              {alumno.nombre}
                            </div>

                            <div className="mt-1 text-sm text-slate-500">
                              {alumno.correo}
                            </div>

                          </td>

                          {/* CURSO */}

                          <td className="px-6 py-4 text-slate-600">
                            {alumno.curso}
                          </td>

                          {/* EJERCICIOS */}

                          <td className="px-6 py-4">

                            <span className="font-semibold text-slate-900">
                              {alumno.ejerciciosRealizados}
                            </span>

                          </td>

                          {/* RENDIMIENTO */}

                          <td className="px-6 py-4">

                            {alumno.ejerciciosRealizados > 0 ? (

                              <div className="min-w-[120px]">

                                <div className="mb-2 flex items-center justify-between">

                                  <span className="text-sm font-semibold text-slate-700">
                                    {porcentaje}%
                                  </span>

                                  <span className="text-xs text-slate-500">
                                    {alumno.correctos}/
                                    {alumno.ejerciciosRealizados}
                                  </span>

                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-200">

                                  <div
                                    className="h-full rounded-full bg-blue-600"
                                    style={{
                                      width: `${porcentaje}%`,
                                    }}
                                  />

                                </div>

                              </div>

                            ) : (

                              <span className="text-sm text-slate-400">
                                Sin actividad
                              </span>

                            )}

                          </td>

                          {/* ESTADO */}

                          <td className="px-6 py-4">

                            {alumno.autorizado ? (

                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                ● Activo
                              </span>

                            ) : (

                              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                                ● Pendiente
                              </span>

                            )}

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

            {alumnosFiltrados.length === 0 && (

              <div className="border-t border-slate-200 p-8 text-center">

                <p className="font-semibold text-slate-700">
                  🔎 No encontramos alumnos con esa búsqueda.
                </p>

              </div>

            )}

          </div>

        </div>
      )}

    </div>
  );
}