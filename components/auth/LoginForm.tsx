"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestMagicLink } from "@/app/login/actions";

type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  email?: string;
};

const initialState: FormState = { status: "idle" };

async function submitMagicLink(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const result = await requestMagicLink(formData);

  if (result.success) {
    return { status: "success", email };
  }

  return { status: "error", message: result.error };
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    submitMagicLink,
    initialState
  );

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
          <Mail className="size-6" />
        </div>
        <h2 className="font-heading text-lg font-semibold">
          Check je e-mail
        </h2>
        <p className="text-sm text-muted-foreground">
          We hebben een inloglink gestuurd naar{" "}
          <span className="text-foreground">{state.email}</span>. Open je
          mail op deze telefoon en tik op de link om in te loggen.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mailadres</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="jij@voorbeeld.nl"
          required
          className="h-11 rounded-[12px] text-base"
        />
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-[12px] text-base"
      >
        {isPending ? "Bezig met versturen…" : "Stuur inloglink"}
      </Button>
    </form>
  );
}
