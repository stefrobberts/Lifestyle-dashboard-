import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const heeftOngeldigeLink = searchParams.fout === "ongeldige-link";

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 py-12 safe-top safe-bottom">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <span className="font-heading text-2xl font-bold">D</span>
          </div>
          <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Log in met een magic link om verder te gaan.
          </p>
        </div>

        {heeftOngeldigeLink && (
          <p
            role="alert"
            className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
          >
            Deze inloglink is verlopen of ongeldig. Vraag hieronder een
            nieuwe aan.
          </p>
        )}

        <LoginForm />
      </div>
    </main>
  );
}
