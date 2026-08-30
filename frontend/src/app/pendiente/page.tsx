import Link from "next/link";

export default function PendientePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4">

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 text-center">

        <div className="text-6xl mb-5">
          🔒
        </div>

        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          Solicitud enviada
        </h1>

        <p className="text-gray-600 mb-6">
          Tu cuenta fue creada correctamente, pero todavía
          necesita autorización para acceder a TutorIA.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6">

          <p className="font-semibold text-yellow-800 mb-2">
            ⏳ Cuenta pendiente
          </p>

          <p className="text-sm text-yellow-700">
            El administrador de TutorIA debe aprobar tu cuenta
            antes de que puedas iniciar sesión.
          </p>

        </div>

        <p className="text-sm text-gray-500 mb-6">
          Una vez que tu cuenta sea autorizada, podrás iniciar
          sesión normalmente con tu correo y contraseña.
        </p>

        <Link
          href="/login"
          className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Volver al inicio de sesión
        </Link>

        <Link
          href="/"
          className="block mt-4 text-gray-500 hover:underline"
        >
          ← Volver a TutorIA
        </Link>

      </div>

    </main>
  );
}