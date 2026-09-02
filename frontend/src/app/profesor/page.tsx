"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth, db } from "@/lib/firebase";

import Alumnos from "@/components/tutoria/profesor/Alumnos";
import ProgresoAlumnos from "@/components/tutoria/profesor/ProgresoAlumnos";
import ActividadesProfesor from "@/components/tutoria/profesor/ActividadesProfesor";

type SeccionProfesor =
  | "inicio"
  | "alumnos"
  | "actividades"
  | "resultados"
  | "progreso"
  | "apoyo"
  | "asistente"
  | "perfil";

type DatosProfesor = {
  nombre?: string;
  correo?: string;
  rol?: string;
  curso?: string;
  establecimientoId?: string;
  daemId?: string;
  autorizado?: boolean;
  activo?: boolean;
};

const ESTABLECIMIENTOS: Record<string, string> = {
  antares: "Colegio Antares",
  "liceo-pelarco": "Liceo de Pelarco",
  "san-sebastian": "San Sebastián",
  "wilibaldo-nunez": "Wilibaldo Núñez",
  centinela: "Centinela",
  "hernan-ciudad-inostroza": "Hernán Ciudad Inostroza",
  "pablo-correa-montt": "Pablo Correa Montt",
  "pangue-arriba": "Escuela Pangue Arriba",
};

function obtenerNombreEstablecimiento(
  establecimientoId?: string
) {
  if (!establecimientoId) {
    return "Establecimiento no asignado";
  }

  return (
    ESTABLECIMIENTOS[establecimientoId] ||
    establecimientoId
  );
}

export default function ProfesorPage() {
  const router = useRouter();

  const [seccion, setSeccion] =
    useState<SeccionProfesor>("inicio");

  const [profesor, setProfesor] =
    useState<DatosProfesor | null>(null);

  const [cargandoPerfil, setCargandoPerfil] =
    useState(true);

  function volverInicio() {
    setSeccion("inicio");
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (usuario) => {
        try {
          setCargandoPerfil(true);

          if (!usuario) {
            setProfesor(null);
            setCargandoPerfil(false);
            return;
          }

          const referencia = doc(
            db,
            "usuarios",
            usuario.uid
          );

          const documento =
            await getDoc(referencia);

          if (documento.exists()) {
            setProfesor(
              documento.data() as DatosProfesor
            );
          } else {
            setProfesor(null);

            console.error(
              "No existe el perfil del profesor en Firestore."
            );
          }

        } catch (error) {
          console.error(
            "Error cargando perfil del profesor:",
            error
          );

          setProfesor(null);
        } finally {
          setCargandoPerfil(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  async function cerrarSesion() {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error(
        "Error cerrando sesión:",
        error
      );
    }
  }

  const nombreProfesor =
    profesor?.nombre ||
    auth.currentUser?.displayName ||
    "Profesor";

  const correoProfesor =
    profesor?.correo ||
    auth.currentUser?.email ||
    "No registrado";

  const nombreEstablecimiento =
    obtenerNombreEstablecimiento(
      profesor?.establecimientoId
    );

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl text-white">
              🤖
            </div>

            <div>

              <h1 className="text-xl font-bold text-slate-900">
                TutorIA
              </h1>

              <p className="text-sm text-slate-500">
                Plataforma Educativa Comunal
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 sm:block">
              👨‍🏫 Profesor
            </div>

            <button
              type="button"
              onClick={cerrarSesion}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Cerrar sesión
            </button>

          </div>

        </div>

      </header>

      {/* =====================================
          CONTENIDO
      ===================================== */}

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* =====================================
            INICIO
        ===================================== */}

        {seccion === "inicio" && (
          <div>

            {/* BIENVENIDA */}

            <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-sm">

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <div className="mb-3 inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold">
                    👨‍🏫 Panel docente
                  </div>

                  <h2 className="text-3xl font-bold md:text-4xl">
                    ¡Bienvenido, {nombreProfesor}! 👋
                  </h2>

                  <p className="mt-3 max-w-2xl text-lg text-blue-100">
                    Administra tus estudiantes,
                    crea actividades, revisa su progreso
                    y utiliza TutorIA como apoyo
                    para tus clases.
                  </p>

                </div>

                <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">

                  <p className="text-sm text-blue-100">
                    🏫 Establecimiento
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {cargandoPerfil
                      ? "Cargando..."
                      : nombreEstablecimiento}
                  </p>

                  <p className="mt-2 text-sm text-blue-100">
                    Plataforma Educativa Comunal
                  </p>

                </div>

              </div>

            </div>

            {/* INFORMACIÓN */}

            <div className="mb-10 grid gap-4 md:grid-cols-3">

              <Info
                emoji="🏫"
                titulo="Establecimiento"
                valor={
                  cargandoPerfil
                    ? "Cargando..."
                    : nombreEstablecimiento
                }
              />

              <Info
                emoji="👨‍🏫"
                titulo="Perfil"
                valor="Profesor"
              />

              <Info
                emoji="🏛️"
                titulo="Administración"
                valor={
                  profesor?.daemId === "pelarco"
                    ? "DAEM Pelarco"
                    : "TutorIA"
                }
              />

            </div>

            {/* HERRAMIENTAS */}

            <div className="mb-10">

              <div className="mb-6">

                <h2 className="text-2xl font-bold text-slate-900">
                  Herramientas docentes
                </h2>

                <p className="mt-1 text-slate-500">
                  Gestiona y revisa el aprendizaje
                  de tus estudiantes desde un solo lugar.
                </p>

              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                <Tarjeta
                  emoji="👥"
                  titulo="Mis alumnos"
                  descripcion="Revisa los estudiantes registrados, sus cursos y su información."
                  textoBoton="Ver alumnos →"
                  color="blue"
                  onClick={() =>
                    setSeccion("alumnos")
                  }
                />

                <Tarjeta
                  emoji="📝"
                  titulo="Actividades"
                  descripcion="Crea y administra actividades educativas para tus estudiantes."
                  textoBoton="Administrar actividades →"
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
                  descripcion="Visualiza ejercicios, aciertos y rendimiento académico."
                  textoBoton="Ver progreso →"
                  color="purple"
                  onClick={() =>
                    setSeccion("progreso")
                  }
                />

                <Tarjeta
                  emoji="⚠️"
                  titulo="Necesitan apoyo"
                  descripcion="Identifica estudiantes que podrían necesitar reforzamiento."
                  textoBoton="Revisar estudiantes →"
                  color="red"
                  onClick={() =>
                    setSeccion("apoyo")
                  }
                />

                <Tarjeta
                  emoji="🤖"
                  titulo="Asistente docente IA"
                  descripcion="Usa inteligencia artificial como apoyo para preparar tus clases."
                  textoBoton="Abrir asistente →"
                  color="cyan"
                  onClick={() =>
                    setSeccion("asistente")
                  }
                />

              </div>

            </div>

            {/* BLOQUE DESTACADO */}

            <div className="mb-10 rounded-3xl bg-slate-900 p-8 text-white">

              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">
                    Seguimiento académico
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    📚 Conoce el avance de tus estudiantes
                  </h3>

                  <p className="mt-2 max-w-3xl text-slate-300">
                    Revisa su progreso y detecta
                    rápidamente las materias que
                    necesitan reforzar.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSeccion("progreso")
                  }
                  className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Revisar progreso
                </button>

              </div>

            </div>

            {/* PERFIL */}

            <button
              type="button"
              onClick={() =>
                setSeccion("perfil")
              }
              className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                  👤
                </div>

                <div>

                  <h3 className="font-bold text-slate-900">
                    Mi perfil
                  </h3>

                  <p className="text-sm text-slate-500">
                    Consulta la información asociada
                    a tu cuenta docente.
                  </p>

                </div>

              </div>

            </button>

          </div>
        )}

        {/* =====================================
            MIS ALUMNOS
        ===================================== */}

        {seccion === "alumnos" && (
          <Seccion volverInicio={volverInicio}>
            <Alumnos />
          </Seccion>
        )}

        {/* =====================================
            ACTIVIDADES
        ===================================== */}

        {seccion === "actividades" && (
          <Seccion volverInicio={volverInicio}>
            <ActividadesProfesor />
          </Seccion>
        )}

        {/* =====================================
            RESULTADOS
        ===================================== */}

        {seccion === "resultados" && (
          <Seccion volverInicio={volverInicio}>

            <Placeholder
              emoji="📊"
              titulo="Resultados"
              descripcion="Consulta los resultados de tus estudiantes."
              mensaje="Cuando conectemos las actividades con los alumnos, aquí aparecerán sus respuestas y resultados."
            />

          </Seccion>
        )}

        {/* =====================================
            PROGRESO
        ===================================== */}

        {seccion === "progreso" && (
          <Seccion volverInicio={volverInicio}>
            <ProgresoAlumnos />
          </Seccion>
        )}

        {/* =====================================
            NECESITAN APOYO
        ===================================== */}

        {seccion === "apoyo" && (
          <Seccion volverInicio={volverInicio}>

            <div className="mb-8">

              <div className="mb-3 inline-flex rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700">
                ⚠️ Seguimiento
              </div>

              <h2 className="text-3xl font-bold text-slate-900">
                Estudiantes que necesitan apoyo
              </h2>

              <p className="mt-2 max-w-3xl text-slate-600">
                Revisa el progreso para detectar
                estudiantes que podrían necesitar
                reforzamiento académico.
              </p>

            </div>

            <ProgresoAlumnos />

          </Seccion>
        )}

        {/* =====================================
            ASISTENTE IA
        ===================================== */}

        {seccion === "asistente" && (
          <Seccion volverInicio={volverInicio}>

            <div className="mb-8">

              <div className="mb-3 inline-flex rounded-full bg-cyan-100 px-4 py-1.5 text-sm font-semibold text-cyan-700">
                🤖 Inteligencia Artificial
              </div>

              <h2 className="text-3xl font-bold text-slate-900">
                Asistente docente TutorIA
              </h2>

              <p className="mt-2 max-w-3xl text-slate-600">
                Herramientas pensadas para apoyar
                al profesor en la preparación de
                material educativo.
              </p>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <MiniHerramienta
                emoji="📝"
                titulo="Crear ejercicios"
                descripcion="Prepara ideas de ejercicios y actividades para tus estudiantes."
              />

              <MiniHerramienta
                emoji="💡"
                titulo="Explicar contenidos"
                descripcion="Busca distintas formas de explicar un contenido."
              />

              <MiniHerramienta
                emoji="📚"
                titulo="Material de apoyo"
                descripcion="Prepara material complementario para tus clases."
              />

              <MiniHerramienta
                emoji="🎯"
                titulo="Reforzamiento"
                descripcion="Diseña actividades enfocadas en contenidos que necesitan mayor apoyo."
              />

            </div>

            <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-6">

              <h3 className="font-bold text-cyan-900">
                🤖 Asistente docente
              </h3>

              <p className="mt-2 text-sm text-cyan-800">
                Próximamente podemos conectar aquí
                directamente la inteligencia
                artificial de TutorIA.
              </p>

            </div>

          </Seccion>
        )}

        {/* =====================================
            PERFIL
        ===================================== */}

        {seccion === "perfil" && (
          <Seccion volverInicio={volverInicio}>

            <div className="mb-8">

              <h2 className="text-3xl font-bold text-slate-900">
                👤 Mi perfil
              </h2>

              <p className="mt-2 text-slate-600">
                Información asociada a tu cuenta
                docente.
              </p>

            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

              <div className="border-b border-slate-100 bg-slate-50 p-6">

                <div className="flex items-center gap-4">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl">
                    👨‍🏫
                  </div>

                  <div>

                    <h3 className="text-xl font-bold text-slate-900">
                      {nombreProfesor}
                    </h3>

                    <p className="text-slate-500">
                      Profesor TutorIA
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-6">

                <PerfilDato
                  titulo="Nombre"
                  valor={nombreProfesor}
                />

                <PerfilDato
                  titulo="Correo electrónico"
                  valor={correoProfesor}
                />

                <PerfilDato
                  titulo="Rol"
                  valor="Profesor"
                />

                <PerfilDato
                  titulo="Establecimiento"
                  valor={
                    cargandoPerfil
                      ? "Cargando..."
                      : nombreEstablecimiento
                  }
                />

                <PerfilDato
                  titulo="Administración"
                  valor={
                    profesor?.daemId === "pelarco"
                      ? "DAEM Pelarco"
                      : "TutorIA"
                  }
                />

              </div>

            </div>

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
        className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        ← Volver al inicio
      </button>

      {children}

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
    | "slate"
    | "cyan";

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

    cyan: {
      fondo: "bg-cyan-100",
      texto: "text-cyan-600",
    },
  };

  const estilo = colores[color];

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

/* =========================================
   INFORMACIÓN
========================================= */

function Info({
  emoji,
  titulo,
  valor,
}: {
  emoji: string;
  titulo: string;
  valor: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">

      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
          {emoji}
        </div>

        <div className="min-w-0">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {titulo}
          </p>

          <p className="mt-1 truncate font-bold text-slate-900">
            {valor}
          </p>

        </div>

      </div>

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
  mensaje,
}: {
  emoji: string;
  titulo: string;
  descripcion: string;
  mensaje: string;
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
          Módulo en preparación
        </h3>

        <p className="mx-auto mt-2 max-w-xl text-slate-500">
          {mensaje}
        </p>

      </div>

    </div>
  );
}

/* =========================================
   MINI HERRAMIENTA
========================================= */

function MiniHerramienta({
  emoji,
  titulo,
  descripcion,
}: {
  emoji: string;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-2xl">
        {emoji}
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {titulo}
      </h3>

      <p className="mt-2 text-sm text-slate-600">
        {descripcion}
      </p>

    </div>
  );
}

/* =========================================
   PERFIL
========================================= */

function PerfilDato({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="border-b border-slate-100 py-4 last:border-b-0">

      <p className="text-sm font-semibold text-slate-500">
        {titulo}
      </p>

      <p className="mt-1 text-lg font-medium text-slate-900">
        {valor}
      </p>

    </div>
  );
}