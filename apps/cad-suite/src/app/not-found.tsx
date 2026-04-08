import Link from "next/link";

export default function NotFound() {
  return (
    <section className="scheme-page flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      <p className="typ-label mb-4 scheme-text-brand">404</p>
      <h1 className="typ-section scheme-text-strong text-balance">
        Page not found
      </h1>
      <p className="typ-lead mt-5 max-w-md scheme-text-body">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
        <Link href="/products" className="btn-outline">
          Browse products
        </Link>
      </div>
    </section>
  );
}
