import { PublicHeader } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mx-auto">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                New Version 2.0 Available
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.2] text-foreground">
                Revolutionizing <span className="text-primary">Cervical Health</span> for Every Woman.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Proactive screening, expert support, and seamless results—all in one secure app. Empowering healthcare providers and patients with state-of-the-art technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                <Button size="lg" className="h-14 px-10 text-lg font-bold group" asChild>
                  <Link href="/download">
                    Download App
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold" asChild>
                  <Link href="/docs">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-primary font-bold uppercase tracking-widest text-sm">
                Features
              </h2>
              <p className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                Built for reliability, security, and impact.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Smartphone,
                  title: "Mobile First",
                  description:
                    "Designed specifically for mobile devices, ensuring healthcare workers can use it anywhere, even offline.",
                },
                {
                  icon: Shield,
                  title: "HIPAA Compliant",
                  description:
                    "Your data is encrypted and stored securely, following all international healthcare data standards.",
                },
                {
                  icon: Zap,
                  title: "Instant Reports",
                  description:
                    "Generate and share screening reports instantly with patients and referral facilities.",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-3xl bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl"></div>

              <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                  Ready to make an impact?
                </h2>
                <p className="text-xl text-primary-foreground/80 leading-relaxed">
                  Join thousands of healthcare providers using SCREEN-IT to
                  improve cervical cancer outcomes globally.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-14 px-10 text-lg font-bold"
                    asChild
                  >
                    <Link href="/download">Get the App Now</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-8 pt-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    <span className="text-sm font-medium">Free to use</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    <span className="text-sm font-medium">
                      No credit card required
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    <span className="text-sm font-medium">24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center">
              <Image
                src="/logo.jpeg"
                alt="SCREEN-IT Logo"
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </div>

            <div className="flex gap-8 text-sm font-medium text-muted-foreground">
              <Link href="/download" className="hover:text-primary">
                Download
              </Link>
              <Link href="/docs" className="hover:text-primary">
                Documentation
              </Link>
              <Link href="/privacy" className="hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary">
                Terms of Service
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()}
              SCREEN-IT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
