export const dynamic = "force-dynamic";

import { getAPKs } from "@/lib/apk-actions";
import ApkClient from "./apk-client";

export const metadata = {
  title: "App Management | SCREEN-IT",
};

export default async function ApkManagementPage() {
  const apks = await getAPKs();

  return <ApkClient initialApks={apks} />;
}
