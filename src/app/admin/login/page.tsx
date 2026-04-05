export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="max-w-lg rounded-2xl border border-stone-200 bg-white p-10 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-stone-500">
          Admin
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-stone-900">
          Login placeholder
        </h1>
        <p className="mt-4 text-base leading-7 text-stone-600">
          The UI is intentionally deferred. Use the backend route
          <code className="mx-1 rounded bg-stone-100 px-2 py-1 text-sm">
            /api/admin/login
          </code>
          to create an admin session.
        </p>
      </div>
    </main>
  );
}
