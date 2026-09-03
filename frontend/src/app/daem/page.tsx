"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  curso: string;
  establecimientoId: string;
  daemId: string;
  activo?: boolean;
  autorizado?: boolean;
  ejerciciosRealizados?: number;
  correctos?: number;
  incorrectos?: number;
};

type Establecimiento = {
  id: string;
  nombre: string;
};

type VistaDetalle = "inicio" | "estudiantes" | "profesores";

export default function PanelDaemPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] =
    useState<Establecimiento | null>(null);

  const [vistaDetalle, setVistaDetalle] =
    useState<VistaDetalle>("inicio");

  const establecimientos: Establecimiento[] = [
    {
      id: "san-sebastian",
      nombre: "San Sebastián",
    },
    {
      id: "wilibaldo-nunez",
      nombre: "Wilibaldo Núñez",
    },
    {
      id: "centinela",
      nombre: "Centinela",
    },
    {
      id: "hernan-ciudad-inostroza",
      nombre: "Hernán Ciudad Inostroza",
    },
    {
      id: "pablo-correa-montt",
      nombre: "Pablo Correa Montt",
    },
    {
      id: "pangue-arriba",
      nombre: "Escuela Pangue Arriba",
    },
    {
      id: "antares",
      nombre: "Colegio Antares",
    },
    {
      id: "liceo-pelarco",
      nombre: "Liceo de Pelarco",
    },
  ];

  useEffect(() => {
    async function cargarUsuarios() {
      try {
        setCargando(true);
        setError("");

        const consulta = query(
          collection(db, "usuarios"),
          where("daemId", "==", "pelarco")
        );

        const snapshot = await getDocs(consulta);

        const lista: Usuario[] = snapshot.docs.map((documento) => {
          const datos = documento.data();

          return {
            id: documento.id,
            nombre: datos.nombre ?? "Sin nombre",
            correo: datos.correo ?? "",
            rol: String(datos.rol ?? "").toLowerCase(),
            curso: datos.curso ?? "",
            establecimientoId: datos.establecimientoId ?? "",
            daemId: datos.daemId ?? "",
            activo: datos.activo,
            autorizado: datos.autorizado,
            ejerciciosRealizados:
              Number(datos.ejerciciosRealizados ?? 0),
            correctos:
              Number(datos.correctos ?? 0),
            incorrectos:
              Number(datos.incorrectos ?? 0),
          };
        });

        setUsuarios(lista);
      } catch (err) {
        console.error("Error cargando usuarios:", err);

        setError(
          "No se pudieron cargar los usuarios desde Firebase."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarUsuarios();
  }, []);

  const estudiantesTotales = useMemo(() => {
    return usuarios.filter(
      (usuario) =>
        usuario.rol === "estudiante" ||
        usuario.rol === "alumno"
    ).length;
  }, [usuarios]);

  const profesoresTotales = useMemo(() => {
    return usuarios.filter(
      (usuario) => usuario.rol === "profesor"
    ).length;
  }, [usuarios]);

  const alumnos = useMemo(() => {
    return usuarios.filter(
      (usuario) =>
        usuario.rol === "estudiante" ||
        usuario.rol === "alumno"
    );
  }, [usuarios]);

  const ejerciciosTotales = useMemo(() => {
    return alumnos.reduce(
      (total, alumno) =>
        total + (alumno.ejerciciosRealizados ?? 0),
      0
    );
  }, [alumnos]);

  const respuestasCorrectasTotales = useMemo(() => {
    return alumnos.reduce(
      (total, alumno) =>
        total + (alumno.correctos ?? 0),
      0
    );
  }, [alumnos]);

  const rendimientoGeneral = useMemo(() => {
    if (ejerciciosTotales === 0) {
      return 0;
    }

    return Math.round(
      (respuestasCorrectasTotales /
        ejerciciosTotales) *
        100
    );
  }, [
    ejerciciosTotales,
    respuestasCorrectasTotales,
  ]);

  const establecimientosConUsuarios = useMemo(() => {
    const ids = new Set(
      usuarios
        .map((usuario) => usuario.establecimientoId)
        .filter(Boolean)
    );

    return ids.size;
  }, [usuarios]);

  const usuariosAutorizados = useMemo(() => {
    return usuarios.filter(
      (usuario) =>
        usuario.autorizado === true &&
        usuario.activo !== false
    ).length;
  }, [usuarios]);

  function usuariosDelEstablecimiento(
    establecimientoId: string
  ) {
    return usuarios.filter(
      (usuario) =>
        usuario.establecimientoId === establecimientoId
    );
  }

  function cantidadEstudiantes(
    establecimientoId: string
  ) {
    return usuariosDelEstablecimiento(establecimientoId).filter(
      (usuario) =>
        usuario.rol === "estudiante" ||
        usuario.rol === "alumno"
    ).length;
  }

  function cantidadProfesores(
    establecimientoId: string
  ) {
    return usuariosDelEstablecimiento(establecimientoId).filter(
      (usuario) => usuario.rol === "profesor"
    ).length;
  }

  function abrirEstablecimiento(
    establecimiento: Establecimiento
  ) {
    setEstablecimientoSeleccionado(establecimiento);
    setVistaDetalle("inicio");
  }

  function volverPanelDaem() {
    setEstablecimientoSeleccionado(null);
    setVistaDetalle("inicio");
  }

  if (establecimientoSeleccionado) {
    const usuariosColegio = usuariosDelEstablecimiento(
      establecimientoSeleccionado.id
    );

    const estudiantes = usuariosColegio.filter(
      (usuario) =>
        usuario.rol === "estudiante" ||
        usuario.rol === "alumno"
    );

    const profesores = usuariosColegio.filter(
      (usuario) => usuario.rol === "profesor"
    );

    return (
      <main className="min-h-screen bg-slate-100">
        <header className="bg-blue-900 text-white shadow-lg">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-blue-200">
                  TutorIA • DAEM Pelarco
                </p>

                <h1 className="text-2xl font-bold">
                  Panel de establecimiento
                </h1>
              </div>

              <button
                onClick={volverPanelDaem}
                className="rounded-xl bg-white px-5 py-2 font-semibold text-blue-900 transition hover:bg-blue-100"
              >
                ← Volver al Panel DAEM
              </button>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8 rounded-3xl bg-white p-8 shadow-md">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-4xl">
                🏫
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
                  Establecimiento
                </p>

                <h2 className="text-3xl font-bold text-slate-900">
                  {establecimientoSeleccionado.nombre}
                </h2>

                <p className="mt-3 text-slate-600">
                  Información registrada en TutorIA para este establecimiento.
                </p>
              </div>
            </div>
          </div>

          {vistaDetalle === "inicio" && (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                <TarjetaEstadistica
                  titulo="Estudiantes"
                  valor={estudiantes.length}
                  texto="Estudiantes registrados"
                  icono="🎓"
                />

                <TarjetaEstadistica
                  titulo="Profesores"
                  valor={profesores.length}
                  texto="Profesores registrados"
                  icono="👨‍🏫"
                />

                <TarjetaEstadistica
                  titulo="Usuarios"
                  valor={usuariosColegio.length}
                  texto="Usuarios totales"
                  icono="👥"
                />
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl bg-white p-7 shadow-md">
                  <h3 className="mb-5 text-xl font-bold text-slate-900">
                    Gestión del establecimiento
                  </h3>

                  <div className="space-y-3">
                    <BotonPanel
                      texto="Ver estudiantes"
                      icono="🎓"
                      onClick={() =>
                        setVistaDetalle("estudiantes")
                      }
                    />

                    <BotonPanel
                      texto="Ver profesores"
                      icono="👨‍🏫"
                      onClick={() =>
                        setVistaDetalle("profesores")
                      }
                    />
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-7 shadow-md">
                  <h3 className="text-xl font-bold text-slate-900">
                    Estado de TutorIA
                  </h3>

                  <div className="mt-6 rounded-2xl bg-green-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-green-500" />

                      <div>
                        <p className="font-semibold text-green-800">
                          Plataforma operativa
                        </p>

                        <p className="text-sm text-green-700">
                          TutorIA está disponible para este establecimiento.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                    <p className="font-semibold text-blue-900">
                      Datos conectados con Firebase
                    </p>

                    <p className="mt-1 text-sm text-blue-800">
                      Las cantidades mostradas corresponden a usuarios
                      encontrados en Firestore.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {vistaDetalle === "estudiantes" && (
            <ListaUsuarios
              titulo={`Estudiantes de ${establecimientoSeleccionado.nombre}`}
              usuarios={estudiantes}
              volver={() => setVistaDetalle("inicio")}
            />
          )}

          {vistaDetalle === "profesores" && (
            <ListaUsuarios
              titulo={`Profesores de ${establecimientoSeleccionado.nombre}`}
              usuarios={profesores}
              volver={() => setVistaDetalle("inicio")}
            />
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="text-sm font-medium text-blue-200">
            TutorIA • Administración
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Panel DAEM Pelarco
          </h1>

          <p className="mt-2 text-blue-100">
            Supervisión general de establecimientos educacionales
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {cargando && (
          <div className="mb-7 rounded-2xl bg-blue-50 p-5 text-blue-800">
            🔄 Cargando información desde Firebase...
          </div>
        )}

        {error && (
          <div className="mb-7 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            ⚠️ {error}
          </div>
        )}

        <div className="mb-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                📊 Resumen comunal
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Vista general de TutorIA
              </h2>

              <p className="mt-2 text-slate-600">
                Indicadores generales registrados para el DAEM de Pelarco.
              </p>
            </div>

            <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              ● Plataforma operativa
            </div>
          </div>
        </div>

        <div className="mb-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <TarjetaEstadistica
            titulo="Establecimientos"
            valor={establecimientos.length}
            texto={`${establecimientosConUsuarios} con usuarios registrados`}
            icono="🏫"
          />

          <TarjetaEstadistica
            titulo="Estudiantes"
            valor={estudiantesTotales}
            texto="Registrados actualmente"
            icono="🎓"
          />

          <TarjetaEstadistica
            titulo="Profesores"
            valor={profesoresTotales}
            texto="Registrados actualmente"
            icono="👨‍🏫"
          />

          <TarjetaEstadistica
            titulo="Ejercicios realizados"
            valor={ejerciciosTotales}
            texto="Actividad acumulada de estudiantes"
            icono="📝"
          />

          <TarjetaEstadistica
            titulo="Rendimiento general"
            valor={
              ejerciciosTotales > 0
                ? `${rendimientoGeneral}%`
                : "—"
            }
            texto="Respuestas correctas sobre ejercicios realizados"
            icono="📈"
          />

          <TarjetaEstadistica
            titulo="Usuarios habilitados"
            valor={usuariosAutorizados}
            texto="Autorizados y activos en la plataforma"
            icono="✅"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Establecimientos educacionales
          </h2>

          <p className="mt-2 text-slate-600">
            Selecciona un establecimiento para revisar sus usuarios.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {establecimientos.map((establecimiento) => {
            const estudiantes = cantidadEstudiantes(
              establecimiento.id
            );

            const profesores = cantidadProfesores(
              establecimiento.id
            );

            return (
              <button
                key={establecimiento.id}
                onClick={() =>
                  abrirEstablecimiento(establecimiento)
                }
                className="group rounded-3xl bg-white p-6 text-left shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                    🏫
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Activo
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {establecimiento.nombre}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Comuna de Pelarco
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">
                      Estudiantes
                    </p>

                    <p className="text-xl font-bold text-slate-900">
                      {estudiantes}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">
                      Profesores
                    </p>

                    <p className="text-xl font-bold text-slate-900">
                      {profesores}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                  <span className="text-sm font-semibold text-blue-700">
                    Ver establecimiento
                  </span>

                  <span className="text-xl text-blue-700 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl border border-blue-100 bg-blue-50 p-6">
          <h3 className="font-bold text-blue-900">
            Panel administrativo TutorIA
          </h3>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            Los datos de estudiantes y profesores son obtenidos desde
            Firestore mediante una consulta limitada al DAEM de Pelarco.
          </p>
        </div>
      </section>
    </main>
  );
}

function TarjetaEstadistica({
  titulo,
  valor,
  texto,
  icono,
}: {
  titulo: string;
  valor: number | string;
  texto: string;
  icono: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
          {icono}
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500">
            {titulo}
          </p>

          <p className="text-3xl font-bold text-slate-900">
            {valor}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {texto}
      </p>
    </div>
  );
}

function BotonPanel({
  texto,
  icono,
  onClick,
}: {
  texto: string;
  icono: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-5 py-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
    >
      <span className="flex items-center gap-3">
        <span className="text-xl">{icono}</span>

        <span className="font-semibold text-slate-700">
          {texto}
        </span>
      </span>

      <span className="text-blue-700">→</span>
    </button>
  );
}

function ListaUsuarios({
  titulo,
  usuarios,
  volver,
}: {
  titulo: string;
  usuarios: Usuario[];
  volver: () => void;
}) {
  return (
    <div className="rounded-3xl bg-white p-7 shadow-md">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">
            {titulo}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {usuarios.length} usuario
            {usuarios.length !== 1 ? "s" : ""} registrado
            {usuarios.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={volver}
          className="rounded-xl bg-blue-100 px-4 py-2 font-semibold text-blue-800 transition hover:bg-blue-200"
        >
          ← Volver
        </button>
      </div>

      {usuarios.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-8 text-center">
          <div className="text-4xl">📭</div>

          <p className="mt-3 font-semibold text-slate-700">
            No hay usuarios registrados
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Cuando se registren usuarios aparecerán automáticamente aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {usuarios.map((usuario) => (
            <div
              key={usuario.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-bold text-slate-900">
                  {usuario.nombre}
                </p>

                {usuario.curso && (
                  <p className="mt-1 text-sm text-slate-500">
                    Curso: {usuario.curso}
                  </p>
                )}
              </div>

              <div>
                {usuario.autorizado === false ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    Pendiente
                  </span>
                ) : (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Autorizado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
