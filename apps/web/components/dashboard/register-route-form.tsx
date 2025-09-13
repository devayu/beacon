"use client";
import { registerRoute } from "@/app/actions/route/register-route";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import IconButton from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { isActionError } from "@/lib/error";
import {
  RegisterRouteFormValues,
  registerRouteSchema,
} from "@/lib/zod-schemas";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

const WEBSITE_TYPES = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance" },
  { value: "legal", label: "Legal/Law" },
  { value: "government", label: "Government" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "corporate", label: "Corporate" },
  { value: "media", label: "Media/News" },
  { value: "technology", label: "Technology" },
  { value: "other", label: "Other" },
];

const RegisterRouteForm = () => {
  const [isLoading, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<RegisterRouteFormValues>({
    resolver: standardSchemaResolver(registerRouteSchema),
    defaultValues: {
      url: "",
      name: "",
      type: "",
    },
  });

  async function handleSubmit(formdata: RegisterRouteFormValues) {
    startTransition(async () => {
      const data = await registerRoute(formdata);
      if (isActionError(data)) {
        form.setError("root", {
          type: "manual",
          message: data.error,
        });
      } else {
        setIsOpen(false);
      }
    });
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      // Reset form state when dialog closes
      form.reset();
      form.clearErrors();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <IconButton className="min-w-[100px]" variant="destructive">
          Register
        </IconButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Register Route</DialogTitle>
          <DialogDescription>
            Register a new route to start monitoring issues.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="Enter URL to register"
                      required
                      disabled={isLoading}
                      className="flex-1 w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website Type</FormLabel>
                  <FormDescription>
                    Adding a website type helps improve accessibility issue
                    scoring and provides more targeted recommendations.
                  </FormDescription>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select website type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WEBSITE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <IconButton variant="outline" disabled={isLoading}>
                  Cancel
                </IconButton>
              </DialogClose>
              <IconButton disabled={isLoading} type="submit">
                {isLoading ? "Registering..." : "Register"}
              </IconButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterRouteForm;
