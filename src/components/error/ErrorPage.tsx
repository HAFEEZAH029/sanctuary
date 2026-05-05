import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong";

  const description = isRouteErrorResponse(error)
    ? "The page you requested could not be reached."
    : "Sanctuary hit an unexpected problem while loading this view.";

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <section className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <p className="text-green-600 text-xs font-semibold uppercase tracking-widest">
          Secure session interrupted
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">
          {title}
        </h1>
        <p className="mt-3 text-sm text-gray-500 leading-6">
          {description}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Go to dashboard
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-white transition"
          >
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}
