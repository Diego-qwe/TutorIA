"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase";

export default function RegisterPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [establecimiento, setEstablecimiento] = useState("");
  const [curso, setCurso] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (
      !nombre.trim() ||
      !email.trim() ||
      !password.trim() ||
      !establecimiento ||
      !curso
    ) {
      setError("Debes completar todos los campos.");
      return;
    }

    if (password.length < 6) {
      setError(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    setLoading(true);

    try {
      // 1. Crear cuenta en Firebase Authentication
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const usuario = userCredential.user;

      // 2. Guardar nombre
      await updateProfile(usuario, {
        displayName: nombre.trim(),
      });

      // 3. Crear perfil en Firestore
      await setDoc(
        doc(db, "usuarios", usuario.uid),
        {
          nombre: nombre.trim(),
          correo: email.trim().toLowerCase(),

          rol: "alumno",

          // Organización
          daemId: "pelarco",
          establecimientoId: establecimiento,

          curso: curso,

          // Autorización
          autorizado: false,
          activo: true,

          creadoEn: serverTimestamp(),
        }
      );

      // 4. Cerrar sesión mientras espera autorización
      await signOut(auth);

      // 5. Ir a página de cuenta pendiente
      router.push("/pendiente");

    } catch (err: unknown) {
      console.error(
        "Error al crear cuenta:",
        err
      );

      const firebaseError = err as {
        code?: string;
      };

      switch (firebaseError.code) {

        case "auth/email-already-in-use":
          setError(
            "Ese correo electrónico ya tiene una cuenta."
          );
          break;

        case "auth/invalid-email":
          setError(
            "El correo electrónico no es válido."
          );
          break;

        case "auth/weak-password":
          setError(
            "La contraseña es demasiado débil."
          );
          break;

        case "auth/operation-not-allowed":
          setError(
            "El registro con correo y contraseña no está habilitado en Firebase."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "No se pudo conectar con Firebase. Revisa tu conexión a Internet."
          );
          break;

        case "permission-denied":
        case "firestore/permission-denied":
          setError(
            "La cuenta fue creada, pero Firestore no permitió guardar la solicitud de acceso."
          );
          break;

        default:
          setError(
            "No se pudo crear la cuenta. Inténtalo nuevamente."
          );
      }

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4">

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

        {/* ENCABEZADO */}

        <div className="text-center mb-6">

          <div className="text-5xl mb-2">
            🤖
          </div>

          <h1 className="text-3xl font-bold">
            TutorIA
          </h1>

          <p className="text-blue-600 font-medium mt-2">
            Plataforma Educativa Comunal
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Solicita acceso a TutorIA
          </p>

        </div>

        {/* FORMULARIO */}

        <form
          onSubmit={handleRegister}
          className="space-y-4"
        >

          {/* NOMBRE */}

          <div>
            <label className="block mb-2 font-medium">
              Nombre completo
            </label>

            <input
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              autoComplete="name"
              required
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* CORREO */}

          <div>
            <label className="block mb-2 font-medium">
              Correo electrónico
            </label>

            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
              required
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ESTABLECIMIENTO */}

          <div>
            <label className="block mb-2 font-medium">
              🏫 Establecimiento
            </label>

            <select
              value={establecimiento}
              onChange={(e) =>
                setEstablecimiento(e.target.value)
              }
              required
              className="w-full border rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Selecciona tu establecimiento
              </option>

              <option value="antares">
                Colegio Antares
              </option>

              <option value="liceo-pelarco">
                Liceo de Pelarco
              </option>

              <option value="san-sebastian">
                San Sebastián
              </option>

              <option value="wilibaldo-nunez">
                Wilibaldo Núñez
              </option>

              <option value="centinela">
                Centinela
              </option>

              <option value="hernan-ciudad-inostroza">
                Hernán Ciudad Inostroza
              </option>

              <option value="pablo-correa-montt">
                Pablo Correa Montt
              </option>

              <option value="pangue-arriba">
                Escuela Pangue Arriba
              </option>

            </select>
          </div>

          {/* CURSO */}

          <div>
            <label className="block mb-2 font-medium">
              📚 Curso
            </label>

            <select
              value={curso}
              onChange={(e) =>
                setCurso(e.target.value)
              }
              required
              className="w-full border rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Selecciona tu curso
              </option>

              <option value="1° Básico">
                1° Básico
              </option>

              <option value="2° Básico">
                2° Básico
              </option>

              <option value="3° Básico">
                3° Básico
              </option>

              <option value="4° Básico">
                4° Básico
              </option>

              <option value="5° Básico">
                5° Básico
              </option>

              <option value="6° Básico">
                6° Básico
              </option>

              <option value="7° Básico">
                7° Básico
              </option>

              <option value="8° Básico">
                8° Básico
              </option>

              <option value="1° Medio">
                1° Medio
              </option>

              <option value="2° Medio">
                2° Medio
              </option>

              <option value="3° Medio">
                3° Medio
              </option>

              <option value="4° Medio">
                4° Medio
              </option>

            </select>
          </div>

          {/* CONTRASEÑA */}

          <div>
            <label className="block mb-2 font-medium">
              Contraseña
            </label>

            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              minLength={6}
              autoComplete="new-password"
              required
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="text-xs text-gray-500 mt-1">
              Debe contener al menos 6 caracteres.
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* BOTÓN */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Enviando solicitud..."
              : "Solicitar acceso"}
          </button>

        </form>

        {/* INFORMACIÓN */}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">

          <p className="text-sm text-blue-800 text-center">
            🏫 Selecciona tu establecimiento.
            Tu solicitud deberá ser autorizada
            antes de poder utilizar TutorIA.
          </p>

        </div>

        {/* LOGIN */}

        <p className="mt-6 text-center">
          ¿Ya tienes una cuenta?{" "}

          <Link
            href="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Inicia sesión
          </Link>
        </p>

        {/* VOLVER */}

        <p className="mt-3 text-center">

          <Link
            href="/"
            className="text-gray-500 hover:underline"
          >
            ← Volver a TutorIA
          </Link>

        </p>

      </div>

    </main>
  );
}