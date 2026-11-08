import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoBanner } from "@/components/demo/demo-banner";
import { LoginForm } from "@/features/auth/components/login-form";
import { env, isDemoMode } from "@/lib/env";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

/**
 * In demo mode the demo login is public, so it is shown and prefilled to make
 * trying the admin a single click. Read at request time, like the banner.
 */
async function LoginFormWithDemo() {
  await connection();
  if (!isDemoMode()) return <LoginForm />;
  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = env();
  return (
    <div className="space-y-4">
      <p className="rounded-md bg-muted p-3 text-sm">
        Demo login: <span className="font-medium">{email}</span> with password{" "}
        <span className="font-medium">{password}</span>. It is filled in for you.
      </p>
      <LoginForm defaultValues={{ email, password }} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      <DemoBanner />
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
            {/* Request-time data (search params, demo mode) needs a Suspense boundary. */}
            <Suspense>
              <LoginFormWithDemo />
            </Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
