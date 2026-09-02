"use client";

import { useEffect, useState } from "react";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "@/lib/firebase";

type MateriaProgreso = {
  ejercicios?: number;
  correctos?: number;
  incorrectos?: number;
};

type Alumno = {
  id: string;
  nombre: string;
  correo: string;
  curso: string;
  autorizado: boolean;

  ejerciciosRealizados: number;
  correctos: number;
  incorrectos: number;

  materias: Record<
    string,
    MateriaProgreso
  >;
};

export default function ProgresoAlumnos() {
  const [alumnos, setAlumnos] =
    useState<Alumno[]>([]);

  const [alumnoSeleccionado, setAlumnoSeleccionado] =
    useState<Alumno | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [busqueda, setBusqueda] =
    useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (usuario) => {
        try {
          setLoading(true);
          setError("");

          if (!usuario) {
            setAlumnos([]);
            setError(
              "Debes iniciar sesión para consultar el progreso."
            );
            return;
          }

          const profesorRef = doc(
            db,
            "usuarios",
            usuario.uid
          );

          const profesorDoc = await getDoc(
            profesorRef
          );

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
              "Tu cuenta no tiene un establecimiento asignado."
            );
            return;
          }

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
            )
          );

          const resultado = await getDocs(
            consulta
          );

          const lista: Alumno[] =
            resultado.docs
              .filter((documento) => {
                const rol = String(
                  documento.data().rol ?? ""
                ).toLowerCase();

                return (
                  rol === "alumno" ||
                  rol === "estudiante"
                );
              })
              .map((documento) => {
                const datos =
                  documento.data();

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

                  materias:
                    datos.materias ??
                    {},
                };
              });

          lista.sort(
            (a, b) =>
              a.nombre.localeCompare(
                b.nombre,
                "es"
              )
          );

          setAlumnos(lista);

        } catch (err) {
          console.error(
            "Error cargando progreso de alumnos:",
            err
          );

          setAlumnos([]);

          setError(
            "No se pudo cargar el progreso de los alumnos."
          );

        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  function calcularRendimiento(
    alumno: Alumno
  ) {
    if (
      alumno.ejerciciosRealizados === 0
    ) {
      return 0;
    }

    return Math.round(
      (alumno.correctos /
        alumno.ejerciciosRealizados) *
        100
    );
  }

  function nombreMateria(
    clave: string
  ) {
    const nombres: Record<
      string,
      string
    > = {
      matematica:
        "Matemática",

      lenguaje:
        "Lenguaje",

      historia:
        "Historia",

      ciencias:
        "Ciencias",

      ingles:
        "Inglés",
    };

    return (
      nombres[clave] ||
      clave
    );
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

    return (
      emojis[clave] ||
      "📚"
    );
  }

  const alumnosFiltrados =
    alumnos.filter(
      (alumno) => {
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
          alumno.curso
            .toLowerCase()
            .includes(texto) ||
          alumno.correo
            .toLowerCase()
            .includes(texto)
        );
      }
    );

  const alumnosConActividad =
    alumnos.filter(
      (alumno) =>
        alumno.ejerciciosRealizados >
        0
    );

  const promedioGeneral =
    alumnosConActividad.length >
    0
      ? Math.round(
          alumnosConActividad.reduce(
            (acumulado, alumno) =>
              acumulado +
              calcularRendimiento(
                alumno
              ),
            0
          ) /
            alumnosConActividad.length
        )
      : 0;

  const necesitanApoyo =
    alumnosConActividad.filter(
      (alumno) =>
        calcularRendimiento(
          alumno
        ) < 60
    ).length;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">

        <div className="text-center">

          <div className="mb-4 text-6xl">
            📈
          </div>

          <p className="text-lg font-semibold text-slate-700">
            Cargando progreso de los alumnos...
          </p>

        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
        ⚠️ {error}
      </div>
    );
  }

  /*
   * DETALLE DEL ALUMNO
   */

  if (alumnoSeleccionado) {
    const alumno =
      alumnoSeleccionado;

    const total =
      alumno.ejerciciosRealizados;

    const correctos =
      alumno.correctos;

    const incorrectos =
      alumno.incorrectos;

    const porcentaje =
      calcularRendimiento(
        alumno
      );

    const materias =
      Object.entries(
        alumno.materias
      );

    return (
      <div>

        {/* VOLVER */}

        <button
          type="button"
          onClick={() =>
            setAlumnoSeleccionado(
              null
            )
          }
          className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          ← Volver a alumnos
        </button>

        {/* ALUMNO */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-slate-900">
            👨‍🎓 {alumno.nombre}
          </h2>

          <p className="mt-2 text-slate-600">
            {alumno.curso}
            {alumno.correo
              ? ` · ${alumno.correo}`
              : ""}
          </p>

        </div>

        {/* RESUMEN */}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          <Resumen
            emoji="📝"
            titulo="Ejercicios"
            valor={total}
          />

          <Resumen
            emoji="✅"
            titulo="Correctos"
            valor={correctos}
            tipo="correcto"
          />

          <Resumen
            emoji="❌"
            titulo="Incorrectos"
            valor={incorrectos}
            tipo="incorrecto"
          />

          <Resumen
            emoji="🎯"
            titulo="Rendimiento"
            valor={`${porcentaje}%`}
            tipo={
              porcentaje < 60
                ? "incorrecto"
                : "rendimiento"
            }
          />

        </div>

        {/* ESTADO */}

        {total > 0 && (
          <div
            className={`mt-8 rounded-2xl border p-6 ${
              porcentaje < 60
                ? "border-orange-200 bg-orange-50"
                : "border-green-200 bg-green-50"
            }`}
          >

            <h3
              className={`text-xl font-bold ${
                porcentaje < 60
                  ? "text-orange-800"
                  : "text-green-800"
              }`}
            >
              {porcentaje < 60
                ? "⚠️ Puede necesitar apoyo"
                : "✅ Buen progreso"}
            </h3>

            <p
              className={`mt-2 ${
                porcentaje < 60
                  ? "text-orange-700"
                  : "text-green-700"
              }`}
            >
              {porcentaje < 60
                ? "El rendimiento actual está bajo el 60%. Conviene revisar las materias con más dificultades."
                : "El alumno presenta un rendimiento general igual o superior al 60%."}
            </p>

          </div>
        )}

        {/* RENDIMIENTO GENERAL */}

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

            <div className="h-4 overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{
                  width: `${porcentaje}%`,
                }}
              />

            </div>

            <p className="mt-3 text-sm text-slate-500">
              Ha respondido correctamente{" "}
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
              Sin actividad todavía
            </h3>

            <p className="mt-2 text-slate-600">
              Este alumno todavía no ha realizado ejercicios en TutorIA.
            </p>

          </div>
        )}

        {/* MATERIAS */}

        {materias.length >
          0 && (
          <div className="mt-10">

            <h3 className="mb-5 text-2xl font-bold text-slate-900">
              📚 Rendimiento por materia
            </h3>

            <div className="grid gap-6 md:grid-cols-2">

              {materias.map(
                ([
                  clave,
                  progreso,
                ]) => {
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
                      key={
                        clave
                      }
                      className="rounded-2xl bg-white p-6 shadow-sm"
                    >

                      <div className="flex items-center justify-between gap-4">

                        <h4 className="text-xl font-bold text-slate-900">
                          {emojiMateria(
                            clave
                          )}{" "}
                          {nombreMateria(
                            clave
                          )}
                        </h4>

                        <span
                          className={`text-xl font-bold ${
                            rendimiento <
                            60
                              ? "text-orange-600"
                              : "text-blue-600"
                          }`}
                        >
                          {
                            rendimiento
                          }
                          %
                        </span>

                      </div>

                      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">

                        <div
                          className={`h-full rounded-full ${
                            rendimiento <
                            60
                              ? "bg-orange-500"
                              : "bg-blue-600"
                          }`}
                          style={{
                            width: `${rendimiento}%`,
                          }}
                        />

                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-3 text-center">

                        <MiniResumen
                          valor={
                            ejercicios
                          }
                          titulo="Realizados"
                        />

                        <MiniResumen
                          valor={
                            buenas
                          }
                          titulo="Correctos"
                          tipo="correcto"
                        />

                        <MiniResumen
                          valor={
                            malas
                          }
                          titulo="Incorrectos"
                          tipo="incorrecto"
                        />

                      </div>

                      {ejercicios >
                        0 &&
                        rendimiento <
                          60 && (
                          <div className="mt-4 rounded-xl bg-orange-50 p-3 text-sm font-medium text-orange-700">
                            ⚠️ Recomendamos reforzar esta materia.
                          </div>
                        )}

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

  /*
   * LISTA GENERAL
   */

  return (
    <div>

      {/* TÍTULO */}

      <div className="mb-8">

        <h2 className="text-3xl font-bold text-slate-900">
          📈 Progreso de alumnos
        </h2>

        <p className="mt-2 text-slate-600">
          Revisa el rendimiento de tus estudiantes y detecta quién puede necesitar apoyo.
        </p>

      </div>

      {/* RESUMEN DEL CURSO */}

      <div className="mb-8 grid gap-5 md:grid-cols-3">

        <Resumen
          emoji="👨‍🎓"
          titulo="Alumnos"
          valor={alumnos.length}
        />

        <Resumen
          emoji="🎯"
          titulo="Promedio general"
          valor={
            alumnosConActividad.length >
            0
              ? `${promedioGeneral}%`
              : "--"
          }
          tipo="rendimiento"
        />

        <Resumen
          emoji="⚠️"
          titulo="Necesitan apoyo"
          valor={necesitanApoyo}
          tipo={
            necesitanApoyo > 0
              ? "incorrecto"
              : "correcto"
          }
        />

      </div>

      {/* BUSCADOR */}

      {alumnos.length > 0 && (
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

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
            placeholder="Busca por nombre, curso o correo..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />

        </div>
      )}

      {/* SIN ALUMNOS */}

      {alumnos.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            👨‍🎓
          </div>

          <h3 className="mt-5 text-2xl font-bold text-slate-900">
            No hay alumnos
          </h3>

          <p className="mt-2 text-slate-600">
            Todavía no existen alumnos registrados en TutorIA.
          </p>

        </div>
      )}

      {/* LISTA */}

      {alumnos.length > 0 && (
        <div className="space-y-4">

          {alumnosFiltrados.map(
            (alumno) => {
              const porcentaje =
                calcularRendimiento(
                  alumno
                );

              return (
                <div
                  key={
                    alumno.id
                  }
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* DATOS */}

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-xl font-bold text-slate-900">
                          👨‍🎓{" "}
                          {
                            alumno.nombre
                          }
                        </h3>

                        {alumno.ejerciciosRealizados >
                          0 &&
                          porcentaje <
                            60 && (
                            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                              ⚠️ Necesita apoyo
                            </span>
                          )}

                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        📚{" "}
                        {
                          alumno.curso
                        }
                        {alumno.correo
                          ? ` · ${alumno.correo}`
                          : ""}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm">

                        <span className="text-slate-600">
                          📝{" "}
                          <strong>
                            {
                              alumno.ejerciciosRealizados
                            }
                          </strong>{" "}
                          ejercicios
                        </span>

                        <span className="text-green-600">
                          ✅{" "}
                          <strong>
                            {
                              alumno.correctos
                            }
                          </strong>
                        </span>

                        <span className="text-red-500">
                          ❌{" "}
                          <strong>
                            {
                              alumno.incorrectos
                            }
                          </strong>
                        </span>

                        {alumno.ejerciciosRealizados >
                          0 && (
                          <span className="font-bold text-blue-600">
                            🎯{" "}
                            {
                              porcentaje
                            }
                            %
                          </span>
                        )}

                      </div>

                    </div>

                    {/* BOTÓN */}

                    <button
                      type="button"
                      onClick={() =>
                        setAlumnoSeleccionado(
                          alumno
                        )
                      }
                      className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                      Ver progreso →
                    </button>

                  </div>

                </div>
              );
            }
          )}

          {alumnosFiltrados.length ===
            0 && (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

              <p className="font-semibold text-slate-600">
                🔎 No encontramos alumnos con esa búsqueda.
              </p>

            </div>
          )}

        </div>
      )}

    </div>
  );
}

function Resumen({
  emoji,
  titulo,
  valor,
  tipo = "normal",
}: {
  emoji: string;
  titulo: string;
  valor: number | string;
  tipo?:
    | "normal"
    | "correcto"
    | "incorrecto"
    | "rendimiento";
}) {
  const color =
    tipo === "correcto"
      ? "text-green-600"
      : tipo === "incorrecto"
        ? "text-orange-600"
        : tipo === "rendimiento"
          ? "text-blue-600"
          : "text-slate-900";

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">

      <div className="text-3xl">
        {emoji}
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">
        {titulo}
      </p>

      <p
        className={`mt-1 text-4xl font-bold ${color}`}
      >
        {valor}
      </p>

    </div>
  );
}

function MiniResumen({
  valor,
  titulo,
  tipo = "normal",
}: {
  valor: number;
  titulo: string;
  tipo?:
    | "normal"
    | "correcto"
    | "incorrecto";
}) {
  const estilo =
    tipo === "correcto"
      ? "bg-green-50 text-green-600"
      : tipo === "incorrecto"
        ? "bg-red-50 text-red-500"
        : "bg-slate-50 text-slate-900";

  return (
    <div
      className={`rounded-xl p-3 ${estilo}`}
    >

      <p className="text-xl font-bold">
        {valor}
      </p>

      <p className="mt-1 text-xs">
        {titulo}
      </p>

    </div>
  );
}