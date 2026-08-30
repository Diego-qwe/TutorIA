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
      !password.trim()
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

      // 2. Guardar nombre en Firebase Authentication
      await updateProfile(usuario, {
        displayName: nombre.trim(),
      });

      // 3. Crear usuario en Firestore como PENDIENTE
      await setDoc(
        doc(db, "usuarios", usuario.uid),
        {
          nombre: nombre.trim(),
          correo: email.trim(),
          autorizado: false,
          rol: "usuario",
          creadoEn: serverTimestamp(),
        }
      );

      // 4. Cerrar sesión.
      // Todavía NO está autorizado.
      await signOut(auth);

      // 5. Enviarlo a la página de espera
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

        <h1 className="text-3xl font-bold text-center mb-2">
          🤖 Crear cuenta
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Solicita acceso a TutorIA
        </p>

        <form
          onSubmit={handleRegister}
          className="space-y-4"
        >

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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

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

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">

          <p className="text-sm text-yellow-800 text-center">
            🔒 Las cuentas nuevas necesitan ser
            autorizadas por el administrador de TutorIA
            antes de poder ingresar.
          </p>

        </div>

        <p className="mt-6 text-center">
          ¿Ya tienes una cuenta?{" "}

          <Link
            href="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Inicia sesión
          </Link>
        </p>

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