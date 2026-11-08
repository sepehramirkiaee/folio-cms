import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-8">
        <p>
          Built with{" "}
          <a
            href="https://github.com/sepehramirkiaee/folio-cms"
            className="text-foreground underline underline-offset-4"
          >
            folio-cms
          </a>
          , a Next.js portfolio and admin.
        </p>
        <Link href="/admin" className="text-foreground underline underline-offset-4">
          Admin sign in
        </Link>
      </div>
    </footer>
  );
}
