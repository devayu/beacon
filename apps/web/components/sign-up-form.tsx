"use client";

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
import { toast } from "sonner";
import { z } from "zod";

const signUpSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: standardSchemaResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function handleSubmit({ email, name, password }: SignUpFormValues) {
    const { data, error } = await authClient.signUp.email(
      {
        email,
        password,
        name,
        callbackURL: "/dashboard",
      },
      {
        onRequest: (ctx) => {
          setIsLoading(true);
        },
        onSuccess: (ctx) => {
          setIsLoading(false);
          toast.success("Signed up successfully");
          router.push("/dashboard");
        },
        onError: (ctx) => {
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
        <h1 className="text-3xl font-bold mb-2">Sign Up</h1>
        <p className="text-muted-foreground">
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
          Sign up with GitHub
        </IconButton>

        <IconButton
          type="button"
          onClick={() => {
            // TODO: Implement Google OAuth
            console.log("Google OAuth");
          }}
        >
          <Mail size={20} />
          Sign up with Google
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your full name"
                    type="text"
                    autoCapitalize="words"
                    autoComplete="name"
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
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
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
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
            className="w-full h-12"
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </IconButton>
        </form>
      </Form>

      <div className="text-center text-sm mt-6">
        Already have an account?{" "}
        <a href="/sign-in" className="text-muted-foreground underline">
          Sign in
        </a>
      </div>
    </div>
  );
};

export default SignUpForm;
