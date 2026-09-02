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

type DatosAlumno = {
  nombre?: string;
  curso?: string;
  establecimientoId?: string;
};

type Actividad = {
  id: string;
  titulo: string;
  materia: string;
  curso: string;
  instrucciones: string;
  profesorId: string;
  profesorNombre: string;
  establecimientoId?: string;
  activa: boolean;
  creadoEn?: any;
};

const ESTABLECIMIENTOS: Record<string, string> = {
  antares: "Colegio Antares",
  "liceo-pelarco": "Liceo de Pelarco",
  "san-sebastian": "San Sebastián",
  "wilibaldo-nunez": "Wilibaldo Núñez",
  centinela: "Centinela",
  "hernan-ciudad-inostroza":
    "Hernán Ciudad Inostroza",
  "pablo-correa-montt":
    "Pablo Correa Montt",
  "pangue-arriba":
    "Escuela Pangue Arriba",
};

export default function ActividadesAlumno() {
  const [alumno, setAlumno] =
    useState<DatosAlumno | null>(null);

  const [actividades, setActividades] =
    useState<Actividad[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (usuario) => {
          if (!usuario) {
            setCargando(false);
            return;
          }

          try {
            setCargando(true);
            setError("");

            /*
            ================================
            1. CARGAR PERFIL DEL ALUMNO
            ================================
            */

            const usuarioRef = doc(
              db,
              "usuarios",
              usuario.uid
            );

            const usuarioSnap =
              await getDoc(usuarioRef);

            if (!usuarioSnap.exists()) {
              setError(
                "No encontramos tu perfil de estudiante."
              );

              setCargando(false);
              return;
            }

            const datosAlumno =
              usuarioSnap.data() as DatosAlumno;

            setAlumno(datosAlumno);

            /*
            ================================
            2. REVISAR DATOS NECESARIOS
            ================================
            */

            if (
              !datosAlumno.establecimientoId ||
              !datosAlumno.curso
            ) {
              setActividades([]);

              setCargando(false);

              return;
            }

            /*
            ================================
            3. BUSCAR ACTIVIDADES
            DEL MISMO ESTABLECIMIENTO
            ================================
            */

            const actividadesRef =
              collection(
                db,
                "actividades"
              );

            const consulta = query(
              actividadesRef,
              where(
                "establecimientoId",
                "==",
                datosAlumno.establecimientoId
              )
            );

            const snapshot =
              await getDocs(consulta);

            /*
            ================================
            4. FILTRAR POR CURSO
            Y ACTIVIDADES ACTIVAS
            ================================
            */

            const lista: Actividad[] =
              snapshot.docs
                .map((documento) => ({
                  id: documento.id,

                  ...(documento.data() as Omit<
                    Actividad,
                    "id"
                  >),
                }))

                .filter(
                  (actividad) =>
                    actividad.curso ===
                      datosAlumno.curso &&
                    actividad.activa === true
                );

            /*
            ================================
            5. ORDENAR MÁS RECIENTES
            PRIMERO
            ================================
            */

            lista.sort((a, b) => {
              const fechaA =
                a.creadoEn?.seconds || 0;

              const fechaB =
                b.creadoEn?.seconds || 0;

              return fechaB - fechaA;
            });

            setActividades(lista);

          } catch (err) {
            console.error(
              "Error cargando actividades:",
              err
            );

            setError(
              "No se pudieron cargar tus actividades."
            );
          } finally {
            setCargando(false);
          }
        }
      );

    return () => unsubscribe();
  }, []);

  function nombreEstablecimiento() {
    if (!alumno?.establecimientoId) {
      return "Sin establecimiento asignado";
    }

    return (
      ESTABLECIMIENTOS[
        alumno.establecimientoId
      ] ||
      alumno.establecimientoId
    );
  }

  if (cargando) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

        <div className="text-5xl">
          📚
        </div>

        <p className="mt-4 font-semibold text-slate-600">
          Cargando tus actividades...
        </p>

      </div>
    );
  }

  return (
    <div className="w-full">

      {/* ================================
          TÍTULO
      ================================= */}

      <div className="mb-8">

        <div className="mb-3 inline-flex rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700">
          👨‍🏫 Actividades docentes
        </div>

        <h2 className="text-3xl font-bold text-slate-900">
          📚 Mis actividades
        </h2>

        <p className="mt-2 max-w-3xl text-slate-600">
          Aquí encontrarás las actividades
          asignadas por tus profesores.
        </p>

      </div>

      {/* ================================
          INFORMACIÓN DEL ALUMNO
      ================================= */}

      <div className="mb-8 grid gap-4 md:grid-cols-2">

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            🏫 Establecimiento
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {nombreEstablecimiento()}
          </p>

        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            🎓 Curso
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {alumno?.curso ||
              "Sin curso asignado"}
          </p>

        </div>

      </div>

      {/* ================================
          ERROR
      ================================= */}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* ================================
          SIN DATOS ACADÉMICOS
      ================================= */}

      {(!alumno?.establecimientoId ||
        !alumno?.curso) && (

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">

          <div className="text-5xl">
            🏫
          </div>

          <h3 className="mt-4 text-xl font-bold text-amber-900">
            Falta información académica
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-amber-800">
            Tu cuenta todavía no tiene
            establecimiento o curso asignado.
          </p>

        </div>
      )}

      {/* ================================
          SIN ACTIVIDADES
      ================================= */}

      {alumno?.establecimientoId &&
        alumno?.curso &&
        actividades.length === 0 && (

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            ✅
          </div>

          <h3 className="mt-5 text-xl font-bold text-slate-900">
            No tienes actividades pendientes
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-slate-500">
            Cuando un profesor publique una
            actividad para tu curso,
            aparecerá aquí automáticamente.
          </p>

        </div>
      )}

      {/* ================================
          LISTA DE ACTIVIDADES
      ================================= */}

      {actividades.length > 0 && (

        <div>

          <div className="mb-5 flex items-center justify-between gap-4">

            <div>

              <h3 className="text-xl font-bold text-slate-900">
                Actividades asignadas
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Tienes {actividades.length}{" "}
                {actividades.length === 1
                  ? "actividad disponible"
                  : "actividades disponibles"}.
              </p>

            </div>

            <div className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">
              {actividades.length}
            </div>

          </div>

          <div className="grid gap-5">

            {actividades.map(
              (actividad) => (

                <div
                  key={actividad.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
                >

                  <div className="p-6">

                    {/* ETIQUETAS */}

                    <div className="mb-4 flex flex-wrap gap-2">

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        📚 {actividad.materia}
                      </span>

                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                        🎓 {actividad.curso}
                      </span>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        ● Disponible
                      </span>

                    </div>

                    {/* TÍTULO */}

                    <h3 className="text-2xl font-bold text-slate-900">
                      {actividad.titulo}
                    </h3>

                    {/* PROFESOR */}

                    <p className="mt-2 text-sm font-medium text-slate-500">
                      👨‍🏫{" "}
                      {actividad.profesorNombre ||
                        "Profesor"}
                    </p>

                    {/* INSTRUCCIONES */}

                    <div className="mt-6 rounded-xl bg-slate-50 p-5">

                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Instrucciones
                      </p>

                      <p className="whitespace-pre-wrap text-slate-700">
                        {
                          actividad.instrucciones
                        }
                      </p>

                    </div>

                    {/* ESTADO */}

                    <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <p className="text-sm font-semibold text-slate-700">
                          📌 Actividad asignada
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Próximamente podrás
                          responder directamente
                          desde TutorIA.
                        </p>

                      </div>

                      <div className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                        Pendiente
                      </div>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}