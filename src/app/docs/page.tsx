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
  MessageSquare,
  HelpCircle,
  History,
  Cpu,
  HardDrive,
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
    },
    {
      title: "Support & Audit",
      items: [
        { id: "ai-assistant", title: "AI Clinical Support", icon: MessageSquare },
        { id: "audit-logs", title: "Activity & Audit", icon: History },
        { id: "help-faq", title: "Help & FAQ", icon: HelpCircle },
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
                  placeholder="Search documentation..."
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
                          activeSection === item.id ? "bg-primary/5 text-primary font-bold border-l-2 border-primary rounded-l-none" : "text-muted-foreground hover:text-foreground border-l-2 border-transparent"
                        }`}
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${activeSection === item.id ? "text-primary" : "text-muted-foreground"}`} />
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
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">User Guide</h1>
              <p className="text-xl text-muted-foreground mb-12">
                Your end-to-end companion for delivering superior cervical health care with SCREEN-IT.
              </p>

              <hr className="my-10 border-border" />

              <div className="space-y-32">
                
                {/* 1. Installation */}
                <section id="installation" className="scroll-mt-32">
                  <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                    <Download className="h-8 w-8 text-primary" />
                    1. Installation
                  </h2>
                  <div className="space-y-6">
                    <p>Begin by downloading the SCREEN-IT Android application. Ensure you are on a secure network before starting the installation.</p>
                    <div className="bg-muted/30 p-8 rounded-2xl border border-border my-8">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {["Download APK", "Allow Unknown Sources", "Install File", "Launch SCREEN-IT"].map((step, idx) => (
                          <div key={idx} className="flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">{idx + 1}</div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4 my-8">
                      {[
                        { icon: Smartphone, label: "Android OS", value: "Version 10.0+" },
                        { icon: Cpu, label: "Memory (RAM)", value: "Minimum 4GB" },
                        { icon: HardDrive, label: "Storage", value: "500MB Free Space" },
                      ].map((req, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-border bg-card text-center">
                          <req.icon className="h-4 w-4 text-primary mx-auto mb-2" />
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{req.label}</h4>
                          <p className="text-xs font-bold">{req.value}</p>
                        </div>
                      ))}
                    </div>

                    <Callout type="info" title="Pro Tip">
                      If your device blocks the install, go to <strong>Settings &gt; Security</strong> and toggle on "Allow installation from this source" for your browser.
                    </Callout>
                  </div>
                </section>

                {/* 2. Authentication */}
                <section id="authentication" className="scroll-mt-32">
                  <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                    <Lock className="h-8 w-8 text-primary" />
                    2. Authentication
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Open the app and log in using the unique credentials provided to you. These credentials link your clinical activity to your provider profile.
                  </p>
                  <div className="max-w-sm mx-auto p-2 rounded-2xl bg-muted border border-border shadow-inner overflow-hidden">
                    <Image src="/app/login.jpeg" alt="Login Screen" width={400} height={800} className="w-full h-auto rounded-xl" />
                  </div>
                </section>

                {/* 3. Configuration */}
                <section id="configuration" className="scroll-mt-32">
                  <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                    <Settings className="h-8 w-8 text-primary" />
                    3. Personalized Setup
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { icon: Fingerprint, title: "Biometric Login", desc: "Toggle Fingerprint/Face ID for instant access." },
                      { icon: Lock, title: "Device PIN", desc: "Set a local PIN backup for biometrics." },
                      { icon: Moon, title: "Dark Mode", desc: "Reduce eye strain in low-light environments." },
                    ].map((item, idx) => (
                      <div key={idx} className="p-6 rounded-xl border border-border bg-card">
                        <item.icon className="h-6 w-6 text-primary mb-4" />
                        <h4 className="font-bold text-sm mb-2">{item.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center">
                    <p className="text-sm font-medium mb-4">Setup complete? Let's start managing your patients.</p>
                    <Button onClick={() => scrollTo("registration")} variant="outline" className="gap-2">
                      Patient Onboarding <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </section>

                <hr className="border-border" />

                {/* 4. Registration */}
                <section id="registration" className="scroll-mt-32">
                  <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                    <UserPlus className="h-8 w-8 text-primary" />
                    4. Patient Registration
                  </h2>
                  <Callout type="warning" title="Anti-Duplicate Rule">
                    Always search by National ID or Phone Number <strong>before</strong> creating a new record.
                  </Callout>
                  <div className="grid md:grid-cols-2 gap-10 items-start my-12">
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Data Requirements</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                          <li className="flex gap-2 font-medium"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> <strong>Personal:</strong> Name and Date of Birth.</li>
                          <li className="flex gap-2 font-medium"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> <strong>Contact:</strong> Phone, County, Sub-county, Ward.</li>
                          <li className="flex gap-2 font-medium"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> <strong>Identity:</strong> National ID and Marital Status.</li>
                        </ul>
                      </div>
                    </div>
                    <div className="rounded-2xl border-8 border-muted shadow-2xl overflow-hidden">
                      <Image src="/app/add-client.jpeg" alt="Add Client Form" width={600} height={1200} className="w-full h-auto" />
                    </div>
                  </div>
                </section>

                {/* 5. Client List */}
                <section id="client-list" className="scroll-mt-32">
                  <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    5. Managing Your Patients
                  </h2>
                  <div className="my-10 p-2 rounded-2xl bg-muted border border-border shadow-inner overflow-hidden">
                    <Image src="/app/client-list.jpeg" alt="Client List" width={800} height={400} className="w-full h-auto rounded-xl" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border border-border bg-card">
                      <h4 className="font-bold flex items-center gap-2 mb-2"><Filter className="h-4 w-4 text-primary" /> Smart Filters</h4>
                      <p className="text-xs text-muted-foreground">Switch between <strong>My Clients</strong> and <strong>All Clients</strong>, or filter by <strong>Risk Level</strong>.</p>
                    </div>
                    <div className="p-6 rounded-2xl border border-border bg-card">
                      <h4 className="font-bold flex items-center gap-2 mb-2"><Search className="h-4 w-4 text-primary" /> Rapid Search</h4>
                      <p className="text-xs text-muted-foreground">Instantly find any record using a National ID, Phone Number, or System ID.</p>
                    </div>
                  </div>
                </section>

                {/* 6. Client Detail */}
                <section id="client-detail" className="scroll-mt-32">
                  <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                    <Eye className="h-8 w-8 text-primary" />
                    6. Deep Clinical Insights
                  </h2>
                  <div className="my-10 p-2 rounded-2xl bg-muted border border-border shadow-inner overflow-hidden">
                    <Image src="/app/client-detail.jpeg" alt="Client Detail" width={800} height={400} className="w-full h-auto rounded-xl" />
                  </div>
                  <div className="mt-12 p-8 rounded-[2rem] bg-secondary/5 border border-secondary/20 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                      <p className="text-sm font-bold">Ready to begin a clinical assessment?</p>
                      <p className="text-xs text-muted-foreground">Launch the screening journey directly from the client profile.</p>
                    </div>
                    <Button onClick={() => scrollTo("screening-journey")} className="gap-2 font-bold h-12 px-8">
                      Start Screening <Stethoscope className="h-5 w-5" />
                    </Button>
                  </div>
                </section>

                <hr className="border-border" />

                {/* 7. Screening Journey */}
                <section id="screening-journey" className="scroll-mt-32">
                  <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                    <Stethoscope className="h-8 w-8 text-primary" />
                    7. Screening Journey
                  </h2>
                  <div className="space-y-12">
                    <div className="p-8 rounded-[2rem] bg-muted/30 border border-border space-y-6">
                      <h3 className="text-xl font-bold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Step 1: Preparation</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Ensure <strong>GPS</strong> is enabled and <strong>Informed Consent</strong> is obtained. The app will auto-detect your location to facilitate future referrals.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xl font-bold">Step 2: Clinical Assessment</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { title: "Health", items: ["Partners", "Age at first sex"] },
                          { title: "Diagnosis", items: ["HIV/HPV/STI Status"] },
                          { title: "Obstetrics", items: ["Total Births (Parity)"] },
                          { title: "Lifestyle", items: ["Smoking & Family History"] },
                        ].map((step, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-border bg-card">
                            <h5 className="font-bold text-xs text-primary uppercase mb-2">{step.title}</h5>
                            <p className="text-[10px] text-muted-foreground">{step.items.join(" • ")}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/20 space-y-6">
                      <h3 className="text-xl font-bold text-foreground">Step 3: AI Stratification</h3>
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex justify-between text-xs font-bold text-green-700 uppercase">
                          <span>Low Risk</span><span>Follow-up: 5 Years</span>
                        </div>
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between text-xs font-bold text-amber-700 uppercase">
                          <span>Moderate Risk</span><span>Follow-up: 6 Months</span>
                        </div>
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex justify-between text-xs font-bold text-red-700 uppercase">
                          <span>High Risk</span><span>Action: Urgent Referral</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 8. Referral Process */}
                <section id="referral-process" className="scroll-mt-32">
                  <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                    <Hospital className="h-8 w-8 text-primary" />
                    8. The Referral Process
                  </h2>
                  <div className="bg-card rounded-2xl border border-border p-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <ul className="space-y-4 text-sm text-muted-foreground">
                        <li className="flex gap-3"><ArrowRight className="h-5 w-5 text-primary shrink-0" /> <strong>Select Facility:</strong> List defaults to Sub-county; use search for global access.</li>
                        <li className="flex gap-3"><ArrowRight className="h-5 w-5 text-primary shrink-0" /> <strong>Schedule Date:</strong> Choose the primary appointment time.</li>
                        <li className="flex gap-3"><ArrowRight className="h-5 w-5 text-primary shrink-0" /> <strong>Clinical Notes:</strong> Add vital info for the receiving facility.</li>
                      </ul>
                      <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-muted/30 border border-border">
                          <h5 className="font-bold text-xs mb-2">Referral Lifecycle</h5>
                          <div className="flex gap-2 flex-wrap">
                            {["Pending", "Visited", "Completed", "Cancelled"].map(s => (
                              <span key={s} className="px-2 py-0.5 rounded bg-background border border-border text-[8px] font-black uppercase">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 9. Follow-up Care */}
                <section id="followup-management" className="scroll-mt-32">
                  <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-primary" />
                    9. Follow-up & Outreach
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                      <h4 className="font-bold">Outreach Actions</h4>
                      <p className="text-xs text-muted-foreground">Record phone calls, home visits, or facility verifications. Track duration, outcome, and planning for the next contact.</p>
                    </div>
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                      <h4 className="font-bold text-destructive">Management</h4>
                      <p className="text-xs text-muted-foreground">Complete follow-ups to clear them from your queue, or cancel them with a clinical reason to maintain audit integrity.</p>
                    </div>
                  </div>
                </section>

                <hr className="border-border" />

                {/* 10. AI Assistant */}
                <section id="ai-assistant" className="scroll-mt-32">
                  <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    10. AI Clinical Support
                  </h2>
                  <div className="p-8 rounded-[2rem] bg-card border border-border space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                      SCREEN-IT features a built-in <strong>AI Assistant</strong> to support clinical decision-making. You can query the bot for real-time advice on screening guidelines, risk interpretations, and referral protocols.
                    </p>
                    <div className="flex gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 items-center">
                      <MessageSquare className="h-6 w-6 text-primary" />
                      <div>
                        <h5 className="font-bold text-sm">Interactive Consultations</h5>
                        <p className="text-xs text-muted-foreground font-medium">Accessible via the floating chat icon anywhere in the app.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 11. Audit Logs */}
                <section id="audit-logs" className="scroll-mt-32">
                  <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                    <History className="h-8 w-8 text-primary" />
                    11. Activity & Audit Trails
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    To maintain clinical accountability, every action performed within the app is recorded in the <strong>Activity Log</strong>.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      { action: "Registration", desc: "Tracks when and who added a new patient record." },
                      { action: "Screening", desc: "Logs the timestamp and location of every assessment." },
                      { action: "Referral", desc: "Records the status transitions from Pending to Completed." },
                      { action: "Outreach", desc: "Documents every home visit and facility verification." },
                    ].map((log, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-muted/10">
                        <History className="h-4 w-4 text-primary shrink-0 mt-1" />
                        <div>
                          <h5 className="font-bold text-xs">{log.action} Logs</h5>
                          <p className="text-[10px] text-muted-foreground">{log.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 12. Help & FAQ */}
                <section id="help-faq" className="scroll-mt-32">
                  <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                    <HelpCircle className="h-8 w-8 text-primary" />
                    12. Help & FAQ Center
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Access our integrated Help Center for quick answers to common technical and clinical questions.
                  </p>
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl border border-border bg-card">
                      <h4 className="font-bold text-sm mb-4">Common Topics</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {["Syncing Issues", "Resetting PIN", "Registration Errors", "Referral Facilities", "AI Interpretation", "Offline Support"].map(t => (
                          <div key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <ChevronRight className="h-3 w-3 text-primary" /> {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

              </div>
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
                <button key={item.id} onClick={() => scrollTo(item.id)} className={`block text-xs font-medium transition-colors truncate hover:text-primary ${activeSection === item.id ? "text-primary font-bold border-l-2 border-primary pl-3" : "text-muted-foreground pl-3 border-l-2 border-transparent"}`}>
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
