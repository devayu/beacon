import SignUpForm from "@/components/sign-up-form";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/sign-up")({
  component: SignUpPage,
});
function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 items-center justify-center p-8 bg-sidebar hidden lg:flex">
        <div className="w-full max-w-lg">
          <div className=" mb-8">
            <h1 className="text-2xl md:text-4xl font-semibold mb-4 font-serif">
              Accessibility Scanning Made Simple
            </h1>
            <p className="text-muted-foreground mb-6 font-sans">
              Beacon scans your website for hidden accessibility issues,
              highlights them visually, and gives clear, actionable fixes — all
              in one place. Start improving accessibility in minutes.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <SignUpForm />
      </div>
    </div>
  );
}
