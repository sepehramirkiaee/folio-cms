import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-8">
      <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        This page does not exist, or the project is no longer published.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded font-medium text-brand underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Go to the home page
      </Link>
    </div>
  );
}
