import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 py-12 safe-top safe-bottom">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <span className="font-heading text-2xl font-bold">D</span>
          </div>
          <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Log in om verder te gaan.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
