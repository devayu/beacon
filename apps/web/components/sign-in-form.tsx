"use client";

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
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Github, Mail } from "lucide-react";
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
        callbackURL: "/overview",
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
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold  mb-2 font-serif">Sign In</h1>
        <p className="text-muted-foreground font-sans">
          Get started now. No credit card required.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <IconButton
          type="button"
          onClick={() => {
            // TODO: Implement GitHub OAuth
            console.log("GitHub OAuth");
          }}
        >
          <Github size={20} />
          Sign in with GitHub
        </IconButton>

        <IconButton
          type="button"
          onClick={() => {
            // TODO: Implement Google OAuth
            console.log("Google OAuth");
          }}
        >
          <Mail size={20} />
          Sign in with Google
        </IconButton>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <hr className="flex-1 border-gray-600" />
        <span className="text-gray-400 text-sm">or</span>
        <hr className="flex-1 border-gray-600" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                    className="text-sm text-muted-foreground underline"
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
                    className="border-gray-600 data-[state=checked]:bg-white data-[state=checked]:text-black"
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
            <p className="text-sm text-red-400">
              {form.formState.errors.root.message}
            </p>
          )}

          <IconButton
            type="submit"
            disabled={isLoading}
            className="w-full h-12"
            variant="destructive"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </IconButton>
        </form>
      </Form>

      <div className="text-center text-sm mt-6">
        Don&apos;t have an account?{" "}
        <a href="/sign-up" className="text-muted-foreground underline">
          Sign up
        </a>
      </div>
    </div>
  );
};

export default SignInForm;
