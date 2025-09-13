"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import IconButton from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signInSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
  rememberMe: z.boolean(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const SignInForm = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const router = useRouter();

  const form = useForm<SignInFormValues>({
    resolver: standardSchemaResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function handleSubmit({
    email,
    password,
    rememberMe,
  }: SignInFormValues) {
    const { data, error } = await authClient.signIn.email(
      {
        email,
        password,
        rememberMe,
        callbackURL: "/dashboard",
      },
      {
        onRequest: (ctx) => {
          setIsLoading(true);
        },
        onSuccess: (ctx) => {
          setIsLoading(false);
          router.push("/overview");
        },
        onError: (ctx) => {
          setIsLoading(false);
          form.setError("root", {
            type: "manual",
            message: ctx.error.message,
          });
        },
      }
    );
  }

  return (
    <Card className={cn("mx-auto max-w-sm p-6")}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-balance text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="m@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <a
                      href="/forgot-password"
                      className="text-sm text-muted-foreground underline hover:text-primary"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      Remember me
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <IconButton type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </IconButton>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <a href="/sign-up" className="underline hover:text-primary">
            Sign up
          </a>
        </div>
      </div>
    </Card>
  );
};

export default SignInForm;
