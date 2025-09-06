"use client";

import { registerRoute } from "@/app/actions/route/register-route";
import { scheduleScan } from "@/app/actions/scan/schedule-scan";
import RouteList from "@/components/routes-list";
import { Button } from "@/components/ui/button";
import IconButton from "@/components/ui/icon-button";
import { useScanStatus } from "@/hooks/useScanStatus";
import { authClient } from "@/lib/auth-client";
import { isActionError } from "@/lib/error";
import { Route } from "@beacon/db";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { ProgressDisplay } from "../dashboard/progress-display";
import { Input } from "../ui/input";

export default function Dashboard({ routes }: { routes: Route[] }) {
  const [state, formAction, isPending] = useActionState(
    registerRoute,
    undefined
  );
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [registerUrl, setRegisterUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Use the scan status hook
  const { status, isLoading, error, startPolling, stopPolling, isPolling } =
    useScanStatus();

  useEffect(() => {
    if (isActionError(state)) {
      toast.error(state.error);
    } else if (state?.id && state?.registerdUrl) {
      toast.success("Route registered successfully!");
    }
  }, [state]);

  const handleScan = async () => {
    if (!url.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsScanning(true);

    try {
      const res = await scheduleScan(url);

      if (isActionError(res)) {
        toast.error(res.error);
        setIsScanning(false);
      } else {
        toast.success("Scan started successfully!");
        // Start polling with the returned statusId
        startPolling(res?.statusId!);
      }
    } catch (err) {
      toast.error("Failed to start scan");
      setIsScanning(false);
    }
  };

  // Stop scanning when polling stops
  useEffect(() => {
    if (!isPolling && isScanning) {
      setIsScanning(false);
    }
  }, [isPolling, isScanning]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2 font-serif">Dashboard</h1>
      </div>

      <div className="mb-6">
        <Button
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/sign-in");
                },
              },
            });
          }}
        >
          Signout
        </Button>
      </div>

      {/* Route Registration Form */}
      <form action={formAction} className="flex gap-4 items-center mb-6">
        <Input
          type="url"
          name="url"
          placeholder="Enter URL to register"
          required
          disabled={isPending}
          className="flex-1 w-full"
        />
        <IconButton
          className="min-w-[100px]"
          variant="destructive"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Registering..." : "Register"}
        </IconButton>
      </form>

      <RouteList routes={routes}></RouteList>
    </div>
  );
}
