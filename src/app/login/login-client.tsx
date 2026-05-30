"use client";
import React, { useState, useEffect } from "react";
import { Shield, Loader2, Lock as LockIcon, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const result = await signIn.email(
      {
        email,
        password,
      },
      {
        onError: (ctx: any) => {
          setError(ctx.error.message || "Invalid credentials");
        },
      },
    );

    // better-auth returns the token in the response body when cross-origin
    // (the backend Set-Cookie header won't apply to the frontend domain).
    // We manually write it so our middleware and API calls can read it.
    if (result?.data?.token) {
      Cookies.set("better-auth.session_token", result.data.token, {
        expires: 7,       // 7 days
        sameSite: "lax",
        path: "/",
      });
      router.push("/dashboard");
    }

    setIsLoading(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-card p-4 transition-colors">
      <div className="w-full max-w-[1000px] flex flex-col md:flex-row overflow-hidden rounded-none border border-border">
        {/* Branding Section */}
        <div className="w-full md:w-1/2 bg-primary dark:bg-primary/20 p-8 md:p-12 flex flex-col justify-between text-white dark:text-foreground">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="p-1 bg-white/10 dark:bg-white/5 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src="/logo.jpeg"
                  alt="SCREEN-IT Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white/90 tracking-tighter uppercase leading-none mb-2">
                SCREEN-IT
              </h1>
            </div>
            <p className="text-white/60 text-xs md:text-sm font-bold uppercase tracking-widest max-w-[280px]">
              Cervical Cancer Screening & Management
            </p>
            <p className="text-white/80 dark:text-muted-foreground text-lg mb-8 leading-relaxed">
              Access our integrated platform for screening analytics, and
              real-time reporting.
            </p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="w-full md:w-1/2 bg-white dark:bg-card p-8 md:p-12 relative transition-colors">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 hover:bg-muted text-muted-foreground transition-colors rounded-lg"
            >
              {mounted &&
                (theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                ))}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mb-10">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Secure Access</h2>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-none mb-6 text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="name@screen-it.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-muted/50 border-none focus-visible:ring-primary text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Password
                </label>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-muted/50 border-none focus-visible:ring-primary text-foreground"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all active:scale-[0.98] mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Login to Dashboard"
              )}
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              © {new Date().getFullYear()}
              SCREEN-IT
            </div>
            <div className="flex gap-4">
              <Shield className="h-4 w-4 text-muted-foreground/30" />
              <LockIcon className="h-4 w-4 text-muted-foreground/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
