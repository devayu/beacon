import SignUpForm from "@/components/sign-up-form";

export default async function SignUpPage() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-sidebar">
        <div className="w-full max-w-lg">
          <div className=" mb-8">
            <h1 className="text-4xl font-semibold mb-4 font-serif">
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
