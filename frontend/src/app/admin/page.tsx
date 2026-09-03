"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth, db } from "@/lib/firebase";

type Rol =
  | "alumno"
  | "profesor"
  | "admin"
  | "admin_daem";

type Usuario = {
  id: string;
  nombre?: string;
  correo?: string;
  autorizado?: boolean;
  activo?: boolean;
  rol?: string;
  curso?: string;
  daemId?: string;
  establecimientoId?: string;
};

const ESTABLECIMIENTOS = [
  {
    id: "antares",
    nombre: "Colegio Antares",
  },
  {
    id: "liceo-pelarco",
    nombre: "Liceo de Pelarco",
  },
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
];

function obtenerNombreEstablecimiento(
  establecimientoId?: string
) {
  if (!establecimientoId) {
    return "Sin establecimiento";
  }

  const establecimiento =
    ESTABLECIMIENTOS.find(
      (item) => item.id === establecimientoId
    );

  return establecimiento?.nombre || establecimientoId;
}

export default function AdminPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [usuarios, setUsuarios] =
    useState<Usuario[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [procesando, setProcesando] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [
    establecimientoSeleccionado,
    setEstablecimientoSeleccionado,
  ] = useState("todos");

  async function cargarUsuarios(
    rolAdministrador: string,
    daemId?: string
  ) {
    try {
      setError("");

      const usuariosRef = collection(
        db,
        "usuarios"
      );

      // Firestore exige que la consulta del DAEM incluya
      // el mismo filtro que establecen las reglas de seguridad.
      const consultaUsuarios =
        rolAdministrador === "admin"
          ? usuariosRef
          : query(
              usuariosRef,
              where(
                "daemId",
                "==",
                daemId || "pelarco"
              )
            );

      const snapshot = await getDocs(
        consultaUsuarios
      );

      const lista: Usuario[] =
        snapshot.docs.map(
          (documento) => ({
            id: documento.id,
            ...documento.data(),
          })
        );

      lista.sort((a, b) =>
        (a.nombre || "").localeCompare(
          b.nombre || "",
          "es"
        )
      );

      setUsuarios(lista);

    } catch (err) {
      console.error(err);

      setError(
        "No se pudieron cargar los usuarios."
      );
    }
  }

  useEffect(() => {
    const cancelar =
      onAuthStateChanged(
        auth,
        async (usuario) => {
          if (!usuario) {
            router.replace("/login");
            return;
          }

          try {
            const adminRef = doc(
              db,
              "usuarios",
              usuario.uid
            );

            const adminSnap =
              await getDoc(adminRef);

            if (!adminSnap.exists()) {
              router.replace("/panel");
              return;
            }

            const datos =
              adminSnap.data();

            const esRutaAdmin =
              pathname.startsWith("/admin");

            const tieneAcceso = esRutaAdmin
              ? datos.rol === "admin"
              : datos.rol === "admin" ||
                datos.rol === "admin_daem";

            if (
              !tieneAcceso ||
              datos.autorizado !== true ||
              datos.activo === false
            ) {
              router.replace(
                datos.rol === "admin_daem"
                  ? "/daem"
                  : "/panel"
              );
              return;
            }

            await cargarUsuarios(
              datos.rol,
              datos.daemId
            );

            setCargando(false);

          } catch (err) {
            console.error(err);

            router.replace("/panel");
          }
        }
      );

    return () => cancelar();
  }, [pathname, router]);

  async function cambiarAutorizacion(
    uid: string,
    autorizado: boolean
  ) {
    try {
      setProcesando(uid);
      setError("");
      setMensaje("");

      const usuarioRef = doc(
        db,
        "usuarios",
        uid
      );

      await updateDoc(usuarioRef, {
        autorizado,
      });

      setUsuarios((actuales) =>
        actuales.map((usuario) =>
          usuario.id === uid
            ? {
                ...usuario,
                autorizado,
              }
            : usuario
        )
      );

      setMensaje(
        autorizado
          ? "✅ Usuario autorizado correctamente."
          : "🔒 Usuario bloqueado correctamente."
      );

    } catch (err) {
      console.error(err);

      setError(
        "No se pudo modificar la autorización del usuario."
      );

    } finally {
      setProcesando(null);
    }
  }

  async function cambiarRol(
    uid: string,
    nuevoRol: Rol
  ) {
    try {
      setProcesando(uid);
      setError("");
      setMensaje("");

      const usuarioRef = doc(
        db,
        "usuarios",
        uid
      );

      await updateDoc(usuarioRef, {
        rol: nuevoRol,
      });

      setUsuarios((actuales) =>
        actuales.map((usuario) =>
          usuario.id === uid
            ? {
                ...usuario,
                rol: nuevoRol,
              }
            : usuario
        )
      );

      if (nuevoRol === "profesor") {
        setMensaje(
          "👨‍🏫 El usuario ahora es profesor."
        );

      } else if (
        nuevoRol === "alumno"
      ) {
        setMensaje(
          "🎓 El usuario ahora es alumno."
        );

      } else if (
        nuevoRol === "admin_daem"
      ) {
        setMensaje(
          "🏛️ El usuario ahora es administrador DAEM."
        );

      } else {
        setMensaje(
          "🛡️ El usuario ahora es administrador."
        );
      }

    } catch (err) {
      console.error(err);

      setError(
        "No se pudo cambiar el rol del usuario."
      );

    } finally {
      setProcesando(null);
    }
  }

  async function cambiarEstado(
    uid: string,
    activo: boolean
  ) {
    try {
      setProcesando(uid);
      setError("");
      setMensaje("");

      const usuarioRef = doc(
        db,
        "usuarios",
        uid
      );

      await updateDoc(usuarioRef, {
        activo,
      });

      setUsuarios((actuales) =>
        actuales.map((usuario) =>
          usuario.id === uid
            ? {
                ...usuario,
                activo,
              }
            : usuario
        )
      );

      setMensaje(
        activo
          ? "✅ Cuenta activada correctamente."
          : "⛔ Cuenta desactivada correctamente."
      );

    } catch (err) {
      console.error(err);

      setError(
        "No se pudo cambiar el estado del usuario."
      );

    } finally {
      setProcesando(null);
    }
  }

  async function cerrarSesion() {
    try {
      await signOut(auth);
      router.replace("/login");

    } catch (err) {
      console.error(err);

      setError(
        "No se pudo cerrar la sesión."
      );
    }
  }

  const usuariosDaem = useMemo(
    () =>
      usuarios.filter(
        (usuario) =>
          !usuario.daemId ||
          usuario.daemId === "pelarco"
      ),
    [usuarios]
  );

  const usuariosFiltrados =
    useMemo(() => {
      if (
        establecimientoSeleccionado ===
        "todos"
      ) {
        return usuariosDaem;
      }

      return usuariosDaem.filter(
        (usuario) =>
          usuario.establecimientoId ===
          establecimientoSeleccionado
      );
    }, [
      usuariosDaem,
      establecimientoSeleccionado,
    ]);

  const usuariosNormales =
    usuariosFiltrados.filter(
      (usuario) =>
        usuario.rol !== "admin" &&
        usuario.rol !== "admin_daem"
    );

  const pendientes =
    usuariosNormales.filter(
      (usuario) =>
        usuario.autorizado !== true
    );

  const autorizados =
    usuariosNormales.filter(
      (usuario) =>
        usuario.autorizado === true
    );

  const profesores =
    usuariosFiltrados.filter(
      (usuario) =>
        usuario.rol === "profesor"
    );

  const alumnos =
    usuariosFiltrados.filter(
      (usuario) =>
        usuario.rol === "alumno"
    );

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">
            🏛️
          </div>

          <p className="text-xl font-semibold text-slate-800">
            Verificando acceso administrativo...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

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

          <button
            type="button"
            onClick={cerrarSesion}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Cerrar sesión
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* TITULO */}

        <div className="mb-8">
          <div className="mb-2 inline-flex rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
            🏛️ Administración DAEM
          </div>

          <h2 className="text-4xl font-bold text-slate-900">
            Panel Educativo Comunal
          </h2>

          <p className="mt-2 max-w-3xl text-lg text-slate-600">
            Administra estudiantes, docentes,
            establecimientos y solicitudes
            de acceso desde una sola plataforma.
          </p>
        </div>

        {/* RESUMEN */}

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <Resumen
            emoji="👥"
            titulo="Usuarios"
            valor={usuariosNormales.length}
          />

          <Resumen
            emoji="🎓"
            titulo="Alumnos"
            valor={alumnos.length}
          />

          <Resumen
            emoji="👨‍🏫"
            titulo="Profesores"
            valor={profesores.length}
          />

          <Resumen
            emoji="⏳"
            titulo="Pendientes"
            valor={pendientes.length}
          />

        </div>

        {/* ESTABLECIMIENTOS */}

        <section className="mb-8">

          <div className="mb-5">

            <h2 className="text-2xl font-bold text-slate-900">
              🏫 Establecimientos de la comuna
            </h2>

            <p className="mt-1 text-slate-500">
              Resumen de usuarios por establecimiento.
            </p>

          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            {ESTABLECIMIENTOS.map((establecimiento) => {

              const usuariosEstablecimiento =
                usuariosDaem.filter(
                  (usuario) =>
                    usuario.establecimientoId ===
                    establecimiento.id
                );

              const alumnosEstablecimiento =
                usuariosEstablecimiento.filter(
                  (usuario) =>
                    usuario.rol === "alumno"
                );

              const profesoresEstablecimiento =
                usuariosEstablecimiento.filter(
                  (usuario) =>
                    usuario.rol === "profesor"
                );

              const pendientesEstablecimiento =
                usuariosEstablecimiento.filter(
                  (usuario) =>
                    usuario.autorizado !== true
                );

              return (
                <button
                  key={establecimiento.id}
                  type="button"
                  onClick={() =>
                    setEstablecimientoSeleccionado(
                      establecimiento.id
                    )
                  }
                  className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  <div className="mb-4 flex items-start justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                      🏫
                    </div>

                    {pendientesEstablecimiento.length > 0 && (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                        ⏳ {pendientesEstablecimiento.length}
                      </span>
                    )}

                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {establecimiento.nombre}
                  </h3>

                  <div className="mt-5 space-y-2 text-sm text-slate-600">

                    <p>
                      👥 Usuarios:{" "}
                      <strong className="text-slate-900">
                        {usuariosEstablecimiento.length}
                      </strong>
                    </p>

                    <p>
                      🎓 Alumnos:{" "}
                      <strong className="text-slate-900">
                        {alumnosEstablecimiento.length}
                      </strong>
                    </p>

                    <p>
                      👨‍🏫 Profesores:{" "}
                      <strong className="text-slate-900">
                        {profesoresEstablecimiento.length}
                      </strong>
                    </p>

                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-sm font-semibold text-blue-600">
                      Ver establecimiento →
                    </p>
                  </div>

                </button>
              );
            })}

          </div>

        </section>

        {/* FILTRO */}

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <h3 className="text-xl font-bold text-slate-900">
                🏫 Filtrar por establecimiento
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Visualiza los usuarios de un
                establecimiento específico.
              </p>

            </div>

            <select
              value={establecimientoSeleccionado}
              onChange={(e) =>
                setEstablecimientoSeleccionado(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white p-3 md:w-80"
            >
              <option value="todos">
                Todos los establecimientos
              </option>

              {ESTABLECIMIENTOS.map(
                (establecimiento) => (
                  <option
                    key={establecimiento.id}
                    value={establecimiento.id}
                  >
                    {establecimiento.nombre}
                  </option>
                )
              )}

            </select>

          </div>

        </section>

        {/* MENSAJES */}

        {mensaje && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 font-medium text-green-700">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* SOLICITUDES PENDIENTES */}

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-slate-900">
              ⏳ Solicitudes pendientes
            </h2>

            <p className="mt-1 text-slate-500">
              Usuarios que todavía necesitan
              autorización para ingresar.
            </p>

          </div>

          {pendientes.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-5 text-slate-500">
              No hay solicitudes pendientes.
            </p>
          ) : (
            <div className="space-y-4">

              {pendientes.map((usuario) => (
                <UsuarioCard
                  key={usuario.id}
                  usuario={usuario}
                  procesando={procesando}
                  cambiarRol={cambiarRol}
                  cambiarAutorizacion={
                    cambiarAutorizacion
                  }
                  cambiarEstado={cambiarEstado}
                />
              ))}

            </div>
          )}

        </section>

        {/* USUARIOS AUTORIZADOS */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-slate-900">
              ✅ Usuarios autorizados
            </h2>

            <p className="mt-1 text-slate-500">
              Gestiona alumnos, profesores y
              cuentas activas.
            </p>

          </div>

          {autorizados.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-5 text-slate-500">
              Todavía no hay usuarios autorizados.
            </p>
          ) : (
            <div className="space-y-4">

              {autorizados.map((usuario) => (
                <UsuarioCard
                  key={usuario.id}
                  usuario={usuario}
                  procesando={procesando}
                  cambiarRol={cambiarRol}
                  cambiarAutorizacion={
                    cambiarAutorizacion
                  }
                  cambiarEstado={cambiarEstado}
                />
              ))}

            </div>
          )}

        </section>

      </div>

    </main>
  );
}

function Resumen({
  emoji,
  titulo,
  valor,
}: {
  emoji: string;
  titulo: string;
  valor: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">

      <div className="text-3xl">
        {emoji}
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-500">
        {titulo}
      </p>

      <p className="mt-1 text-4xl font-bold text-slate-900">
        {valor}
      </p>

    </div>
  );
}

function UsuarioCard({
  usuario,
  procesando,
  cambiarRol,
  cambiarAutorizacion,
  cambiarEstado,
}: {
  usuario: Usuario;
  procesando: string | null;

  cambiarRol: (
    uid: string,
    nuevoRol: Rol
  ) => Promise<void>;

  cambiarAutorizacion: (
    uid: string,
    autorizado: boolean
  ) => Promise<void>;

  cambiarEstado: (
    uid: string,
    activo: boolean
  ) => Promise<void>;
}) {
  const estaProcesando =
    procesando === usuario.id;

  const rolActual =
    usuario.rol || "alumno";

  const activo =
    usuario.activo !== false;

  return (
    <div className="rounded-xl border border-slate-200 p-5">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <p className="text-lg font-bold text-slate-900">
            👤 {usuario.nombre || "Sin nombre"}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            📧 {usuario.correo || "Sin correo"}
          </p>

          <p className="mt-1 text-sm font-medium text-slate-700">
            🏫{" "}
            {obtenerNombreEstablecimiento(
              usuario.establecimientoId
            )}
          </p>

          {usuario.curso && (
            <p className="mt-1 text-sm text-slate-600">
              📚 Curso: {usuario.curso}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">

            {rolActual === "profesor" ? (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                👨‍🏫 Profesor
              </span>
            ) : (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                🎓 Alumno
              </span>
            )}

            {usuario.autorizado ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                ● Autorizado
              </span>
            ) : (
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                ● Pendiente
              </span>
            )}

            {activo ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                ● Cuenta activa
              </span>
            ) : (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                ● Desactivada
              </span>
            )}

          </div>

        </div>

        <div className="flex flex-wrap gap-3">

          {rolActual !== "profesor" && (
            <button
              type="button"
              onClick={() =>
                cambiarRol(
                  usuario.id,
                  "profesor"
                )
              }
              disabled={estaProcesando}
              className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
            >
              👨‍🏫 Hacer profesor
            </button>
          )}

          {rolActual === "profesor" && (
            <button
              type="button"
              onClick={() =>
                cambiarRol(
                  usuario.id,
                  "alumno"
                )
              }
              disabled={estaProcesando}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              🎓 Hacer alumno
            </button>
          )}

          {usuario.autorizado ? (
            <button
              type="button"
              onClick={() =>
                cambiarAutorizacion(
                  usuario.id,
                  false
                )
              }
              disabled={estaProcesando}
              className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
            >
              🔒 Bloquear acceso
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                cambiarAutorizacion(
                  usuario.id,
                  true
                )
              }
              disabled={estaProcesando}
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              ✅ Autorizar
            </button>
          )}

          {activo ? (
            <button
              type="button"
              onClick={() =>
                cambiarEstado(
                  usuario.id,
                  false
                )
              }
              disabled={estaProcesando}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              ⛔ Desactivar
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                cambiarEstado(
                  usuario.id,
                  true
                )
              }
              disabled={estaProcesando}
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              ✅ Reactivar
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
