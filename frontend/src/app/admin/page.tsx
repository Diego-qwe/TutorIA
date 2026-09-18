"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth, db } from "@/lib/firebase";

type Rol = "alumno" | "profesor";

type Usuario = {
  id: string;
  nombre?: string;
  correo?: string;
  autorizado?: boolean;
  activo?: boolean;
  rol?: string;
  curso?: string;
  establecimientoId?: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarUsuarios() {
    try {
      setError("");

      const snapshot = await getDocs(collection(db, "usuarios"));

      const lista: Usuario[] = snapshot.docs
        .map((documento) => ({
          id: documento.id,
          ...(documento.data() as Omit<Usuario, "id">),
        }))
        .filter((usuario) => {
          if (usuario.rol === "admin") {
            return false;
          }

          return (
            !usuario.establecimientoId ||
            usuario.establecimientoId === "colegio-antares"
          );
        });

      lista.sort((a, b) =>
        (a.nombre || "").localeCompare(b.nombre || "", "es")
      );

      setUsuarios(lista);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los usuarios del Colegio Antares.");
    }
  }

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        router.replace("/login");
        return;
      }

      try {
        const adminRef = doc(db, "usuarios", usuario.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
          router.replace("/panel");
          return;
        }

        const datos = adminSnap.data();

        if (
          datos.rol !== "admin" ||
          datos.autorizado !== true ||
          datos.activo === false
        ) {
          router.replace("/panel");
          return;
        }

        await cargarUsuarios();
        setCargando(false);
      } catch (err) {
        console.error(err);
        router.replace("/panel");
      }
    });

    return () => cancelar();
  }, [router]);

  async function cambiarAutorizacion(
    uid: string,
    autorizado: boolean
  ) {
    try {
      setProcesando(uid);
      setError("");
      setMensaje("");

      await updateDoc(doc(db, "usuarios", uid), {
        autorizado,
      });

      setUsuarios((actuales) =>
        actuales.map((usuario) =>
          usuario.id === uid
            ? { ...usuario, autorizado }
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
      setError("No se pudo modificar la autorización del usuario.");
    } finally {
      setProcesando(null);
    }
  }

  async function cambiarRol(uid: string, nuevoRol: Rol) {
    try {
      setProcesando(uid);
      setError("");
      setMensaje("");

      await updateDoc(doc(db, "usuarios", uid), {
        rol: nuevoRol,
        establecimientoId: "colegio-antares",
      });

      setUsuarios((actuales) =>
        actuales.map((usuario) =>
          usuario.id === uid
            ? {
                ...usuario,
                rol: nuevoRol,
                establecimientoId: "colegio-antares",
              }
            : usuario
        )
      );

      setMensaje(
        nuevoRol === "profesor"
          ? "👨‍🏫 El usuario ahora es profesor."
          : "🎓 El usuario ahora es alumno."
      );
    } catch (err) {
      console.error(err);
      setError("No se pudo cambiar el rol del usuario.");
    } finally {
      setProcesando(null);
    }
  }

  async function cambiarEstado(uid: string, activo: boolean) {
    try {
      setProcesando(uid);
      setError("");
      setMensaje("");

      await updateDoc(doc(db, "usuarios", uid), {
        activo,
      });

      setUsuarios((actuales) =>
        actuales.map((usuario) =>
          usuario.id === uid ? { ...usuario, activo } : usuario
        )
      );

      setMensaje(
        activo
          ? "✅ Cuenta activada correctamente."
          : "⛔ Cuenta desactivada correctamente."
      );
    } catch (err) {
      console.error(err);
      setError("No se pudo cambiar el estado del usuario.");
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
      setError("No se pudo cerrar la sesión.");
    }
  }

  const pendientes = useMemo(
    () => usuarios.filter((usuario) => usuario.autorizado !== true),
    [usuarios]
  );

  const autorizados = useMemo(
    () => usuarios.filter((usuario) => usuario.autorizado === true),
    [usuarios]
  );

  const profesores = useMemo(
    () => usuarios.filter((usuario) => usuario.rol === "profesor"),
    [usuarios]
  );

  const alumnos = useMemo(
    () =>
      usuarios.filter(
        (usuario) => (usuario.rol || "alumno") === "alumno"
      ),
    [usuarios]
  );

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">🏫</div>
          <p className="text-xl font-semibold text-slate-800">
            Verificando acceso administrativo...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
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
                Colegio Antares
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
        <div className="mb-8">
          <div className="mb-2 inline-flex rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
            🛡️ Administración
          </div>

          <h2 className="text-4xl font-bold text-slate-900">
            Panel Colegio Antares
          </h2>

          <p className="mt-2 max-w-3xl text-lg text-slate-600">
            Administra estudiantes, profesores y solicitudes de acceso
            a TutorIA.
          </p>
        </div>

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Resumen emoji="👥" titulo="Usuarios" valor={usuarios.length} />
          <Resumen emoji="🎓" titulo="Alumnos" valor={alumnos.length} />
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

        <section className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <h3 className="text-xl font-bold text-blue-900">
            🏫 Colegio Antares
          </h3>
          <p className="mt-2 text-blue-800">
            Este panel administra las cuentas de estudiantes y
            profesores de TutorIA para el Colegio Antares.
          </p>
        </section>

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

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              ⏳ Solicitudes pendientes
            </h2>
            <p className="mt-1 text-slate-500">
              Usuarios que todavía necesitan autorización para ingresar.
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
                  cambiarAutorizacion={cambiarAutorizacion}
                  cambiarEstado={cambiarEstado}
                />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              ✅ Usuarios autorizados
            </h2>
            <p className="mt-1 text-slate-500">
              Gestiona estudiantes y profesores del Colegio Antares.
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
                  cambiarAutorizacion={cambiarAutorizacion}
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
      <div className="text-3xl">{emoji}</div>
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
  cambiarRol: (uid: string, nuevoRol: Rol) => Promise<void>;
  cambiarAutorizacion: (
    uid: string,
    autorizado: boolean
  ) => Promise<void>;
  cambiarEstado: (uid: string, activo: boolean) => Promise<void>;
}) {
  const estaProcesando = procesando === usuario.id;
  const rolActual = usuario.rol || "alumno";
  const activo = usuario.activo !== false;

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
            🏫 Colegio Antares
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
              onClick={() => cambiarRol(usuario.id, "profesor")}
              disabled={estaProcesando}
              className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
            >
              👨‍🏫 Hacer profesor
            </button>
          )}

          {rolActual === "profesor" && (
            <button
              type="button"
              onClick={() => cambiarRol(usuario.id, "alumno")}
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
                cambiarAutorizacion(usuario.id, false)
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
                cambiarAutorizacion(usuario.id, true)
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
              onClick={() => cambiarEstado(usuario.id, false)}
              disabled={estaProcesando}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              ⛔ Desactivar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => cambiarEstado(usuario.id, true)}
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
