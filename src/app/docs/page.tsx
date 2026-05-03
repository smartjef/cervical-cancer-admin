"use client";
import { PublicHeader } from "@/components/public-header";
import {
  Search,
  Book,
  Smartphone,
  Shield,
  ChevronRight,
  FileText,
  CheckCircle2,
  AlertCircle,
  Layout,
  Database,
  ArrowRight,
  Download,
  Lock,
  UserPlus,
  Filter,
  Eye,
  Settings,
  Fingerprint,
  Moon,
  Users,
  Plus,
  Stethoscope,
  Navigation,
  MapPin,
  ClipboardCheck,
  Calendar,
  Hospital,
  GitBranch,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";

const Callout = ({ children, type = "default", title }: { children: React.ReactNode, type?: "default" | "info" | "warning" | "error", title?: string }) => {
  const styles = {
    default: "bg-muted/50 border-border",
    info: "bg-primary/5 border-primary/20 text-primary-foreground",
    warning: "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400",
    error: "bg-destructive/5 border-destructive/20 text-destructive",
  };
  const icons = {
    default: <FileText className="h-5 w-5" />,
    info: <CheckCircle2 className="h-5 w-5 text-primary" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
    error: <AlertCircle className="h-5 w-5 text-destructive" />,
  };

  return (
    <div className={`p-4 my-6 rounded-xl border flex gap-3 ${styles[type]}`}>
      <div className="shrink-0 mt-0.5">{icons[type]}</div>
      <div className="space-y-1">
        {title && <div className="font-bold text-sm uppercase tracking-wider">{title}</div>}
        <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </div>
  );
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("installation");
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = [
    {
      title: "Getting Started",
      items: [
        { id: "installation", title: "Installation", icon: Download },
        { id: "authentication", title: "Authentication", icon: Lock },
        { id: "configuration", title: "App Configuration", icon: Settings },
      ]
    },
    {
      title: "Client Management",
      items: [
        { id: "registration", title: "Registering Clients", icon: UserPlus },
        { id: "client-list", title: "Managing the List", icon: Users },
        { id: "client-detail", title: "Client Insights", icon: Eye },
      ]
    },
    {
      title: "Clinical Workflow",
      items: [
        { id: "screening-journey", title: "Screening Journey", icon: Stethoscope },
        { id: "referral-process", title: "Referral Process", icon: Hospital },
        { id: "followup-management", title: "Follow-up Care", icon: Calendar },
      ]
    }
  ];

  const flatItems = useMemo(() => navigation.flatMap(g => g.items), []);
  
  const filteredItems = useMemo(() => {
    if (!searchQuery) return [];
    return flatItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, flatItems]);

  const currentIndex = flatItems.findIndex(item => item.id === activeSection);
  const prevItem = currentIndex > 0 ? flatItems[currentIndex - 1] : null;
  const nextItem = currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null;

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <PublicHeader />

      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 border-r border-border h-[calc(100vh-80px)] sticky top-20 pt-10 overflow-y-auto pr-6">
            <div className="space-y-8">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  className="h-10 pl-9 rounded-lg border-border bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/20"
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-background border border-border rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                    {filteredItems.length > 0 ? filteredItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          scrollTo(item.id);
                          setSearchQuery("");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg text-sm transition-colors flex items-center gap-2"
                      >
                        <item.icon className="h-4 w-4 text-primary" />
                        {item.title}
                      </button>
                    )) : (
                      <div className="px-3 py-4 text-xs text-center text-muted-foreground">No results found</div>
                    )}
                  </div>
                )}
              </div>

              {navigation.map((group) => (
                <div key={group.title} className="space-y-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-3">
                    {group.title}
                  </h3>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollTo(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium text-sm hover:bg-muted group ${
                          activeSection === item.id ? "bg-primary/5 text-primary" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 py-10 lg:py-20 min-w-0 text-foreground">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">Documentation</span>
            </div>

            <article className="prose prose-slate dark:prose-invert max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Documentation</h1>
              <p className="text-xl text-muted-foreground mb-12">
                The complete operational guide for SCREEN-IT healthcare providers.
              </p>

              <hr className="my-10 border-border" />

              {/* Section: Installation */}
              <section id="installation" className="scroll-mt-32 mb-20">
                <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                  <Download className="h-8 w-8 text-primary" />
                  Installation Guide
                </h2>
                <div className="space-y-6">
                  <p>Follow this standard flow to get SCREEN-IT running on your Android device:</p>
                  <div className="bg-muted/30 p-8 rounded-2xl border border-border my-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      {["Download", "Allow Sources", "Install File", "Open SCREENIT"].map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{idx + 1}</div>
                          <span className="text-[10px] font-bold uppercase tracking-widest">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ul className="space-y-4 list-disc list-inside text-sm">
                    <li>Download the APK from the <Link href="/download" className="text-primary font-bold hover:underline">/download</Link> page.</li>
                    <li>Allow installation from <strong>Chrome</strong> or <strong>Unknown Sources</strong> in settings.</li>
                    <li>Open the file, click <strong>Install</strong>, and launch <strong>SCREENIT</strong> from your app drawer.</li>
                  </ul>
                </div>
              </section>

              {/* Section: Authentication */}
              <section id="authentication" className="scroll-mt-32 mb-20">
                <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                  <Lock className="h-8 w-8 text-primary" />
                  Authentication
                </h2>
                <p>Launch the app and enter the <strong>username and password</strong> provided by your administrator.</p>
                <div className="my-10 p-2 rounded-2xl bg-muted border border-border shadow-inner max-w-sm mx-auto overflow-hidden">
                  <Image src="/app/login.jpeg" alt="Login Screen" width={400} height={800} className="w-full h-auto rounded-xl" />
                </div>
              </section>

              {/* Section: Configuration */}
              <section id="configuration" className="scroll-mt-32 mb-20">
                <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                  <Settings className="h-8 w-8 text-primary" />
                  Initial Configuration
                </h2>
                <div className="grid md:grid-cols-3 gap-6 my-8">
                  {[
                    { icon: Fingerprint, title: "Local Auth", desc: "Enable Biometrics or set a PIN in Settings." },
                    { icon: Lock, title: "Password", desc: "Update your credentials periodically." },
                    { icon: Moon, title: "Theme", desc: "Toggle between Light and Dark modes." },
                  ].map((item, idx) => (
                    <div key={idx} className="p-6 rounded-xl border border-border bg-card">
                      <item.icon className="h-6 w-6 text-primary mb-4" />
                      <h4 className="font-bold text-sm mb-2">{item.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <hr className="my-20 border-border" />

              {/* Section: Registration */}
              <section id="registration" className="scroll-mt-32 mb-20">
                <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                  <UserPlus className="h-8 w-8 text-primary" />
                  Registering Clients
                </h2>
                <Callout type="warning" title="Search First Rule">
                  Before registering, <strong>always</strong> use the search bar to verify the client isn't already in the database.
                </Callout>
                <div className="grid md:grid-cols-2 gap-10 items-start my-12">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold">Registration Steps</h3>
                    <ul className="space-y-4">
                      <li><strong>Personal:</strong> Name and Date of Birth.</li>
                      <li><strong>Contact:</strong> Phone, County, Sub-county, Ward.</li>
                      <li><strong>Identity:</strong> National ID and Marital Status.</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border-8 border-muted shadow-2xl overflow-hidden">
                    <Image src="/app/add-client.jpeg" alt="Add Client Form" width={600} height={1200} className="w-full h-auto" />
                  </div>
                </div>
              </section>

              {/* Section: Screening Journey */}
              <section id="screening-journey" className="scroll-mt-32 mb-20">
                <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                  <Stethoscope className="h-8 w-8 text-primary" />
                  Screening Journey
                </h2>
                <div className="space-y-12">
                  <div className="p-8 rounded-[2rem] bg-muted/30 border border-border space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Prerequisites</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Ensure <strong>GPS is enabled</strong> and app permissions are granted. The app auto-fetches your location to suggest nearby facilities.
                    </p>
                    <Callout type="info">Must obtain <strong>Informed Consent</strong> before proceeding.</Callout>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { title: "Health Metrics", items: ["Partners count", "Age at first intercourse"] },
                      { title: "Diagnosis", items: ["HIV, HPV, or STI (Yes/No/Maybe)"] },
                      { title: "Obstetrics", items: ["Parity (Times given birth)"] },
                      { title: "History", items: ["Previous screenings", "Relative with cancer"] },
                    ].map((step, idx) => (
                      <div key={idx} className="p-6 rounded-2xl border border-border bg-card">
                        <h4 className="font-bold text-xs text-primary uppercase tracking-widest mb-3">{step.title}</h4>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {step.items.map(i => <li key={i}>• {i}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/20">
                    <h3 className="text-xl font-bold mb-4">Results & Interpretation</h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex justify-between text-xs font-bold text-green-700 uppercase">
                        <span>Low Risk</span><span>Follow up in 5 years</span>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between text-xs font-bold text-amber-700 uppercase">
                        <span>Moderate Risk</span><span>Follow up in 6 months</span>
                      </div>
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex justify-between text-xs font-bold text-red-700 uppercase">
                        <span>High Risk</span><span>Refer Client</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section: Referral Process */}
              <section id="referral-process" className="scroll-mt-32 mb-20">
                <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                  <Hospital className="h-8 w-8 text-primary" />
                  Referral Process
                </h2>
                <p>Referrals are critical for patients identified as High Risk. The system streamlines this through automated data pre-filling.</p>
                
                <div className="bg-card rounded-2xl border border-border p-8 my-8 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm uppercase tracking-wider text-primary">Creating a Referral</h4>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex gap-2"><ArrowRight className="h-4 w-4 shrink-0 text-primary" /> <strong>Client:</strong> Automatically pre-selected.</li>
                        <li className="flex gap-2"><ArrowRight className="h-4 w-4 shrink-0 text-primary" /> <strong>Screening:</strong> Pre-filled from current session or manually selected from the client detail page.</li>
                        <li className="flex gap-2"><ArrowRight className="h-4 w-4 shrink-0 text-primary" /> <strong>Facility:</strong> Defaults to facilities within the client's **Sub-county**. Use the search feature to query the entire database if the desired facility isn't listed.</li>
                      </ul>
                    </div>
                    <div className="space-y-4 text-sm text-muted-foreground">
                      <p>Once you select an <strong>Appointment Date</strong> and add optional <strong>Clinical Notes</strong>, click submit to finalize the referral.</p>
                      <Image src="/app/referal-detail.jpeg" alt="Referral Detail" width={400} height={200} className="rounded-xl border border-border" />
                    </div>
                  </div>
                </div>

                <div className="my-12 p-8 rounded-[2rem] bg-muted/20 border border-border space-y-8">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Referral Status Lifecycle
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { status: "Pending", desc: "Set immediately upon creation." },
                      { status: "Visited", desc: "Patient reached facility; awaiting results." },
                      { status: "Completed", desc: "Finalized with diagnosis and test results." },
                      { status: "Cancelled", desc: "Referral was aborted or is no longer valid." },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-background border border-border">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-primary px-2 py-0.5 bg-primary/10 rounded mb-2 inline-block">{item.status}</span>
                        <p className="text-[10px] text-muted-foreground leading-tight">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <Callout type="info" title="Roles & Permissions">
                    Only the <strong>Community Health Provider (CHP)</strong> who initiated the screening has the authority to update or complete a referral. This ensures data integrity and clinical accountability.
                  </Callout>
                </div>
              </section>

              {/* Section: Follow-up Management */}
              <section id="followup-management" className="scroll-mt-32 mb-20">
                <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-primary" />
                  Follow-up Care & Outreach
                </h2>
                <p>Follow-ups ensure patients remain in the care loop, whether for routine 5-year checks or urgent 6-month reviews.</p>

                <div className="grid md:grid-cols-2 gap-8 my-8">
                  <div className="p-8 rounded-3xl bg-muted/30 border border-border space-y-4">
                    <h4 className="font-bold text-lg">Scheduling Follow-ups</h4>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li><strong>Dates:</strong> Start and End dates are auto-filled by the system (can be adjusted manually).</li>
                      <li><strong>Priority:</strong> Automatically pre-selected based on screening results.</li>
                      <li><strong>Category:</strong> Auto-categorized by the clinical engine.</li>
                    </ul>
                  </div>
                  <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 space-y-4">
                    <h4 className="font-bold text-lg flex items-center gap-2"><GitBranch className="h-5 w-5 text-primary" /> Referral Linkage</h4>
                    <p className="text-sm text-muted-foreground">
                      Follow-ups can be tied directly to referrals. From the <strong>Referral Detail</strong> page, you can create a follow-up to track patient arrival and clinical outcomes.
                    </p>
                  </div>
                </div>

                <div className="space-y-12 my-12">
                  <div className="p-8 rounded-[2rem] bg-card border border-border space-y-8">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                      <Smartphone className="h-5 w-5 text-primary" />
                      Recording Outreach Actions
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      On the **Follow-up Detail** page, you can record specific outreach actions to track your interaction with the patient:
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Outreach Data</h4>
                        <ul className="space-y-3 text-xs text-muted-foreground">
                          <li className="flex gap-2"><strong>Action Type:</strong> Facility Verification, Home Visit, Phone Call, or SMS.</li>
                          <li className="flex gap-2"><strong>Outcomes:</strong> Patient Visited Facility, Barrier Identified, Refused Care, etc.</li>
                          <li className="flex gap-2"><strong>Context:</strong> Record Date, Duration (Time Spent), and optional Location.</li>
                          <li className="flex gap-2"><strong>Planning:</strong> Set a <strong>Next Planned Date</strong> for continued tracking.</li>
                        </ul>
                      </div>
                      <div className="p-6 rounded-2xl bg-muted/20 border border-border">
                        <h4 className="font-bold text-sm mb-4">Evidence & Barriers</h4>
                        <p className="text-xs text-muted-foreground mb-4">For **Facility Verification**, you can attach a photo of the hospital register as evidence.</p>
                        <Callout type="info">Identify barriers such as cost, transport, or fear during the outreach to inform clinical support.</Callout>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-8 rounded-[2rem] border border-border space-y-4">
                      <h3 className="text-lg font-bold text-foreground">Completing a Follow-up</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        When the follow-up objective is met (e.g., patient successfully screened), click <strong>Complete</strong>.
                      </p>
                      <Callout type="info">If the follow-up was for a **Re-screening Recall**, completing it will automatically direct you to the screening launchpad.</Callout>
                    </div>
                    <div className="p-8 rounded-[2rem] border border-border space-y-4">
                      <h3 className="text-lg font-bold text-foreground text-destructive">Cancelling a Follow-up</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        If a follow-up is no longer viable, select <strong>Cancel</strong>. You must provide a reason (e.g., Deceased, Moved Out of Area) and additional notes.
                      </p>
                      <Callout type="warning">Once completed or cancelled, all pending actions for this follow-up will be removed from the Referral Detail page.</Callout>
                    </div>
                  </div>
                </div>
              </section>

            </article>

            {/* Footer Navigation */}
            <div className="mt-20 pt-10 border-t border-border flex justify-between">
              {prevItem ? (
                <button onClick={() => scrollTo(prevItem.id)} className="flex flex-col items-start gap-1 group text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Previous</span>
                  <span className="font-bold text-primary flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                    <ChevronRight className="h-4 w-4 rotate-180" /> {prevItem.title}
                  </span>
                </button>
              ) : <div></div>}
              {nextItem ? (
                <button onClick={() => scrollTo(nextItem.id)} className="flex flex-col items-end gap-1 group text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Next</span>
                  <span className="font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {nextItem.title} <ChevronRight className="h-4 w-4" />
                  </span>
                </button>
              ) : <div></div>}
            </div>
          </main>

          {/* Right Sidebar - TOC */}
          <aside className="hidden xl:block w-64 shrink-0 h-[calc(100vh-80px)] sticky top-20 pt-10 pl-6 border-l border-border/50">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">On This Page</h3>
            <nav className="space-y-3">
              {flatItems.map((item) => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className={`block text-xs font-medium transition-colors truncate hover:text-primary ${activeSection === item.id ? "text-primary font-bold" : "text-muted-foreground"}`}>
                  {item.title}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
}
