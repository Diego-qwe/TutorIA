"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "@/lib/firebase";

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

export default function ActividadesProfesor() {
  const [titulo, setTitulo] = useState("");
  const [materia, setMateria] = useState("Matemática");
  const [curso, setCurso] = useState("8° Básico");
  const [instrucciones, setInstrucciones] = useState("");

  const [actividades, setActividades] = useState<Actividad[]>([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function cargarActividades(usuarioId?: string) {
    const uid =
      usuarioId || auth.currentUser?.uid;

    if (!uid) {
      setActividades([]);
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError("");

      const profesorRef = doc(
        db,
        "usuarios",
        uid
      );

      const profesorSnap =
        await getDoc(profesorRef);

      if (!profesorSnap.exists()) {
        setActividades([]);
        setError(
          "No encontramos el perfil del profesor."
        );
        return;
      }

      const profesor = profesorSnap.data();
      const establecimientoId =
        profesor.establecimientoId;

      if (!establecimientoId) {
        setActividades([]);
        setError(
          "Tu cuenta no tiene un establecimiento asignado."
        );
        return;
      }

      const actividadesRef = collection(
        db,
        "actividades"
      );

      const consulta = query(
        actividadesRef,
        where("profesorId", "==", uid),
        where(
          "establecimientoId",
          "==",
          establecimientoId
        )
      );

      const snapshot = await getDocs(consulta);

      const lista: Actividad[] = snapshot.docs.map(
        (documento) => ({
          id: documento.id,
          ...(documento.data() as Omit<Actividad, "id">),
        })
      );

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

      setActividades([]);
      setError(
        "No se pudieron cargar las actividades."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (usuario) => {
        if (!usuario) {
          setActividades([]);
          setCargando(false);
          return;
        }

        cargarActividades(usuario.uid);
      }
    );

    return () => unsubscribe();
  }, []);

  async function crearActividad(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const usuario = auth.currentUser;

    if (!usuario) {
      setError(
        "Debes iniciar sesión para crear actividades."
      );
      return;
    }

    if (
      !titulo.trim() ||
      !instrucciones.trim() ||
      !curso.trim()
    ) {
      setError(
        "Completa todos los campos de la actividad."
      );
      return;
    }

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      let profesorNombre =
        usuario.displayName || "Profesor";

      let establecimientoId = "";

      try {
        const profesorRef = doc(
          db,
          "usuarios",
          usuario.uid
        );

        const profesorDoc =
          await getDoc(profesorRef);

        if (profesorDoc.exists()) {
          const datos = profesorDoc.data();

          profesorNombre =
            datos.nombre ||
            usuario.displayName ||
            "Profesor";

          establecimientoId =
            datos.establecimientoId || "";
        }

      } catch (err) {
        console.error(
          "No se pudo cargar información adicional del profesor:",
          err
        );
      }

      if (!establecimientoId) {
        setError(
          "Tu cuenta no tiene un establecimiento asignado."
        );
        return;
      }

      await addDoc(
        collection(db, "actividades"),
        {
          titulo: titulo.trim(),
          materia,
          curso,
          instrucciones:
            instrucciones.trim(),

          profesorId:
            usuario.uid,

          profesorNombre,

          establecimientoId,

          activa: true,

          creadoEn:
            serverTimestamp(),
        }
      );

      setTitulo("");
      setInstrucciones("");

      setMensaje(
        "✅ Actividad creada correctamente."
      );

      await cargarActividades(usuario.uid);

    } catch (err) {
      console.error(
        "Error creando actividad:",
        err
      );

      setError(
        "No se pudo crear la actividad."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(
    actividad: Actividad
  ) {
    try {
      const referencia = doc(
        db,
        "actividades",
        actividad.id
      );

      await updateDoc(
        referencia,
        {
          activa: !actividad.activa,
        }
      );

      setActividades((actuales) =>
        actuales.map((item) =>
          item.id === actividad.id
            ? {
                ...item,
                activa: !item.activa,
              }
            : item
        )
      );

    } catch (err) {
      console.error(
        "Error cambiando estado:",
        err
      );

      setError(
        "No se pudo cambiar el estado de la actividad."
      );
    }
  }

  async function eliminarActividad(
    actividad: Actividad
  ) {
    const confirmar = window.confirm(
      `¿Eliminar la actividad "${actividad.titulo}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "actividades",
          actividad.id
        )
      );

      setActividades((actuales) =>
        actuales.filter(
          (item) =>
            item.id !== actividad.id
        )
      );

    } catch (err) {
      console.error(
        "Error eliminando actividad:",
        err
      );

      setError(
        "No se pudo eliminar la actividad."
      );
    }
  }

  return (
    <div className="w-full">

      {/* TÍTULO */}

      <div className="mb-8">

        <div className="mb-3 inline-flex rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
          📝 Gestión docente
        </div>

        <h2 className="text-3xl font-bold text-slate-900">
          Actividades
        </h2>

        <p className="mt-2 max-w-3xl text-slate-600">
          Crea actividades para tus estudiantes
          y administra las que ya has publicado.
        </p>

      </div>

      {/* FORMULARIO */}

      <form
        onSubmit={crearActividad}
        className="rounded-2xl bg-white p-7 shadow-sm"
      >

        <h3 className="mb-6 text-xl font-bold text-slate-900">
          ➕ Crear nueva actividad
        </h3>

        <div className="grid gap-5 md:grid-cols-2">

          {/* TÍTULO */}

          <div className="md:col-span-2">

            <label className="mb-2 block font-semibold text-slate-700">
              Título de la actividad
            </label>

            <input
              type="text"
              value={titulo}
              onChange={(e) =>
                setTitulo(e.target.value)
              }
              placeholder="Ejemplo: Ecuaciones de primer grado"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* MATERIA */}

          <div>

            <label className="mb-2 block font-semibold text-slate-700">
              Materia
            </label>

            <select
              value={materia}
              onChange={(e) =>
                setMateria(e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option>Matemática</option>
              <option>Lenguaje</option>
              <option>Historia</option>
              <option>Ciencias</option>
              <option>Inglés</option>
            </select>

          </div>

          {/* CURSO */}

          <div>

            <label className="mb-2 block font-semibold text-slate-700">
              Curso
            </label>

            <select
              value={curso}
              onChange={(e) =>
                setCurso(e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option>1° Básico</option>
              <option>2° Básico</option>
              <option>3° Básico</option>
              <option>4° Básico</option>
              <option>5° Básico</option>
              <option>6° Básico</option>
              <option>7° Básico</option>
              <option>8° Básico</option>

              <option>1° Medio</option>
              <option>2° Medio</option>
              <option>3° Medio</option>
              <option>4° Medio</option>
            </select>

          </div>

          {/* INSTRUCCIONES */}

          <div className="md:col-span-2">

            <label className="mb-2 block font-semibold text-slate-700">
              Instrucciones
            </label>

            <textarea
              value={instrucciones}
              onChange={(e) =>
                setInstrucciones(
                  e.target.value
                )
              }
              rows={6}
              placeholder="Escribe aquí las instrucciones, preguntas o contenido de la actividad..."
              className="w-full resize-none rounded-xl border border-slate-300 p-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            ⚠️ {error}
          </div>
        )}

        {mensaje && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            {mensaje}
          </div>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {guardando
            ? "Guardando..."
            : "📚 Crear actividad"}
        </button>

      </form>

      {/* ACTIVIDADES CREADAS */}

      <div className="mt-10">

        <div className="mb-5 flex items-center justify-between">

          <div>

            <h3 className="text-2xl font-bold text-slate-900">
              Mis actividades
            </h3>

            <p className="mt-1 text-slate-500">
              Actividades que has creado
              para tus estudiantes.
            </p>

          </div>

          <div className="rounded-full bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700">
            {actividades.length}
          </div>

        </div>

        {cargando ? (

          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

            <p className="font-semibold text-slate-600">
              Cargando actividades...
            </p>

          </div>

        ) : actividades.length === 0 ? (

          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

            <div className="text-5xl">
              📝
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-900">
              Todavía no has creado actividades
            </h3>

            <p className="mt-2 text-slate-500">
              Crea la primera actividad
              utilizando el formulario superior.
            </p>

          </div>

        ) : (

          <div className="grid gap-5">

            {actividades.map(
              (actividad) => (

                <div
                  key={actividad.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >

                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    <div className="min-w-0">

                      <div className="mb-3 flex flex-wrap gap-2">

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          📚 {actividad.materia}
                        </span>

                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                          🎓 {actividad.curso}
                        </span>

                        {actividad.activa ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            ● Activa
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            ○ Pausada
                          </span>
                        )}

                      </div>

                      <h4 className="text-xl font-bold text-slate-900">
                        {actividad.titulo}
                      </h4>

                      <p className="mt-3 whitespace-pre-wrap text-slate-600">
                        {actividad.instrucciones}
                      </p>

                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          cambiarEstado(
                            actividad
                          )
                        }
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          actividad.activa
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {actividad.activa
                          ? "⏸️ Pausar"
                          : "▶️ Activar"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          eliminarActividad(
                            actividad
                          )
                        }
                        className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200"
                      >
                        🗑️ Eliminar
                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}