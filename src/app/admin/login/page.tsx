import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      <header className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-medium underline-offset-4 hover:underline">
          Back to site
        </Link>
        <ThemeToggle />
      </header>
      <main id="main" className="flex flex-1 items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>
              <h1 className="text-xl">Admin sign in</h1>
            </CardTitle>
            <CardDescription>
              Manage the projects, experience and skills on your site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* useSearchParams needs a Suspense boundary under Cache Components. */}
            <Suspense>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
