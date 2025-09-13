"use client";
import BeaconIcon from "@/components/beacon-icon";
import IconButton from "@/components/ui/icon-button";
import { authClient } from "@/lib/auth-client";
import { CheckCircle, Eye, Lightbulb, Zap } from "lucide-react";
import Link from "next/link";

export default function HomeClient() {
  const { data: session } = authClient.useSession();
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <BeaconIcon fill="transparent" stroke="#ff2d2d" />
              <span className="text-xl font-bold">Beacon</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#features"
                className="text-sm font-medium hover:text-primary"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium hover:text-primary"
              >
                Pricing
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium hover:text-primary"
              >
                About
              </Link>
            </nav>

            {/* Auth Buttons */}
            {session ? (
              <Link href="/overview">
                <IconButton variant="default" size="sm">
                  Dashboard
                </IconButton>
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/sign-in"
                  className="text-sm font-medium hover:text-primary"
                >
                  Sign in
                </Link>
                <Link href="/sign-up">
                  <IconButton variant="default" size="sm">
                    Get started
                  </IconButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Accessibility
              <span className="text-primary"> Scanning </span>
              Made Simple
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Beacon scans your website for hidden accessibility issues,
              highlights them visually, and gives clear, actionable fixes — all
              in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need for accessibility
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive accessibility scanning with visual feedback and
              actionable insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Visual Highlighting
              </h3>
              <p className="text-muted-foreground">
                See exactly where accessibility issues are on your pages with
                our visual overlay system.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Smart Recommendations
              </h3>
              <p className="text-muted-foreground">
                Get clear, actionable advice on how to fix each accessibility
                issue found on your site.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Scanning</h3>
              <p className="text-muted-foreground">
                Comprehensive accessibility audits completed in minutes, not
                hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  Why choose Beacon?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Comprehensive WCAG 2.1 compliance checking</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Visual highlighting of issues directly on your pages</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Clear, actionable fix recommendations</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Track progress over time with detailed reports</p>
                  </div>
                </div>
              </div>

              <div className="lg:pl-8">
                <div className="bg-muted rounded-lg p-8">
                  <BeaconIcon
                    size={64}
                    fill="hsl(var(--accent-foreground))"
                    stroke="white"
                  />
                  <h3 className="text-xl font-semibold mt-4 mb-2">
                    Start improving today
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Join hundreds of websites already using Beacon to improve
                    their accessibility.
                  </p>
                  <Link href="/sign-up">
                    <IconButton>Try it now</IconButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <BeaconIcon fill="transparent" stroke="#ff2d2d" />
              <span className="font-bold">Beacon</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-primary">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-primary">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            {`© ${new Date().getFullYear()}  Beacon. Making the web accessible for everyone.`}
          </div>
        </div>
      </footer>
    </div>
  );
}
