import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
          Iniciar sesión
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Accede con tu correo y contraseña.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
