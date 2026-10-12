"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";
import { getHomeForRole } from "@/lib/auth";
import { PasswordInput } from "@/components/ui/password-input";
import { inputClassName } from "@/components/ui/input";
import { RoleSelector } from "@/components/ui/role-selector";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["CUSTOMER", "PROVIDER"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Values = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login, status, role } = useAuth();

  // Already have an account? Leave the register page immediately.
  useEffect(() => {
    if (status === "authenticated" && role) {
      router.replace(getHomeForRole(role));
    }
  }, [status, role, router]);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "CUSTOMER" },
  });

  const onSubmit = async (v: Values) => {
    try {
      const auth = await authService.register({
        name: v.name,
        email: v.email,
        password: v.password,
        role: v.role,
      });
      login(auth);
      toast.success("Account created! Welcome to GearUp.");
      router.replace(getHomeForRole(v.role));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const err = (m?: string) => (m ? <p className="mt-1 text-xs text-red-500">{m}</p> : null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6 py-10">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join GearUp as a customer or a provider.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              className={`${inputClassName} mt-1`}
              aria-invalid={errors.name ? "true" : "false"}
              {...register("name")}
            />
            {err(errors.name?.message)}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`${inputClassName} mt-1`}
              aria-invalid={errors.email ? "true" : "false"}
              {...register("email")}
            />
            {err(errors.email?.message)}
          </div>

          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <RoleSelector value={field.value} onChange={field.onChange} error={errors.role?.message} />
            )}
          />

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <div className="mt-1">
              <PasswordInput
                id="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                aria-invalid={errors.password ? "true" : "false"}
                {...register("password")}
              />
            </div>
            {err(errors.password?.message)}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm password
            </label>
            <div className="mt-1">
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                {...register("confirmPassword")}
              />
            </div>
            {err(errors.confirmPassword?.message)}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}