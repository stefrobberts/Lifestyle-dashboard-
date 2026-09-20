"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/app/login/actions";

type FormState = { status: "idle" | "error"; message?: string };

const initialState: FormState = { status: "idle" };

async function submitLogin(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await signIn(formData);

  if (!result.success) {
    return { status: "error", message: result.error };
  }

  return { status: "idle" };
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    submitLogin,
    initialState
  );

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

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Wachtwoord</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
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
        {isPending ? "Bezig met inloggen…" : "Inloggen"}
      </Button>
    </form>
  );
}
