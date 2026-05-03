export const dynamic = "force-dynamic";

import { PublicHeader } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { Smartphone, Download, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getAPKs } from "@/lib/apk-actions";

export default async function DownloadPage() {
  const apks = await getAPKs();
  
  // Format the real data to match the UI needs
  const versions = apks
    .filter((apk: any) => apk.isActive)
    .map((apk: any, index: number) => ({
      id: apk.id,
      version: apk.version,
      date: new Date(apk.createdAt).toLocaleDateString(),
      size: apk.size,
      latest: index === 0, // Assuming first is latest
      filename: apk.filename,
      notes: apk.notes
    }));

  const latestApk = versions[0];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                Get the <span className="text-primary">SCREEN-IT</span> Mobile
                App.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Download the latest version of our screening app directly to
                your Android device. Simple installation, secure data, and
                offline capabilities.
              </p>

              <div className="space-y-4">
                <h3 className="font-bold text-lg">System Requirements:</h3>
                <ul className="space-y-3">
                  {[
                    "Android 10.0 or higher",
                    "Minimum 4GB RAM",
                    "500MB free storage space",
                    "Internet connection (for initial sync)",
                  ].map((req, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-muted-foreground"
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {latestApk ? (
                <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-primary uppercase tracking-widest">
                        Latest Version
                      </p>
                      <h2 className="text-2xl font-black">SCREEN-IT v{latestApk.version}</h2>
                    </div>
                    <Smartphone className="h-10 w-10 text-primary opacity-20" />
                  </div>
                  {latestApk.notes && (
                    <p className="text-sm bg-background/50 p-4 rounded-xl border border-border/50 italic">
                      "{latestApk.notes}"
                    </p>
                  )}
                  <Button
                    size="lg"
                    className="w-full h-16 text-lg font-bold shadow-lg shadow-primary/20"
                    asChild
                  >
                    <a href={`http://localhost:3001/api/apks/download/${latestApk.filename}`} download>
                      <Download className="mr-2 h-6 w-6" />
                      Download APK Now
                    </a>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Size: {latestApk.size} | Released: {latestApk.date}
                  </p>
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-muted/50 border border-border text-center">
                  <p className="text-muted-foreground">No APKs available for download at the moment.</p>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-3xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/30">
                  <h3 className="font-bold">Installation Guide</h3>
                </div>
                <div className="p-8 space-y-8">
                  {[
                    {
                      step: "01",
                      title: "Download the APK",
                      desc: "Click the download button to get the latest APK file.",
                    },
                    {
                      step: "02",
                      title: "Allow Unknown Sources",
                      desc: "Go to Settings > Security and enable 'Install from Unknown Sources'.",
                    },
                    {
                      step: "03",
                      title: "Install and Open",
                      desc: "Locate the downloaded file and tap to install. Open and log in.",
                    },
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-xl font-black text-muted-foreground">
                        {step.step}
                      </div>
                      <div>
                        <h4 className="font-bold mb-1">{step.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {versions.length > 0 && (
                <div className="bg-white rounded-3xl border border-border p-6">
                  <h3 className="font-bold mb-6">Version History</h3>
                  <div className="space-y-4">
                    {versions.map((v: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">v{v.version}</span>
                            {v.latest && (
                              <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-black uppercase">
                                Latest
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {v.date} • {v.size}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`http://localhost:3001/api/apks/download/${v.filename}`} download>
                            Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

