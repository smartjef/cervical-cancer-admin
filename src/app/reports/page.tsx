import { Metadata } from "next";
import ReportsClient from "./reports-client";
export const metadata: Metadata = { title: "Reports" };
import { Suspense } from "react";

export default function ReportsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportsClient />
    </Suspense>
  );
}
