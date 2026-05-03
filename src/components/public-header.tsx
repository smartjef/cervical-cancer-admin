"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
export function PublicHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.jpeg"
            alt="SCREEN-IT Logo"
            width={140}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>


        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/download"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Download
          </Link>
          <Link
            href="/docs"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Documentation
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/download">Get the App</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
