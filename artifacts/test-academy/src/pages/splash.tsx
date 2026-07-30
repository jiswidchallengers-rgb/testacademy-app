import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, BookOpen, Award } from "lucide-react";
import logoUrl from "@assets/IMG-20260728-WA0015_1785304473912.jpg";

export function Splash() {
  return (
    <div className="min-h-screen flex flex-col bg-primary text-primary-foreground overflow-hidden relative">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Gold accent bar at top */}
      <div className="h-1 bg-secondary w-full relative z-10" />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative z-10 text-center">
        {/* Logo */}
        <div className="relative mb-8">
          <div className="w-36 h-36 rounded-full border-4 border-secondary shadow-2xl overflow-hidden mx-auto">
            <img
              src={logoUrl}
              alt="Test Academy Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-secondary rounded-full p-2 shadow-lg">
            <Shield className="w-5 h-5 text-secondary-foreground" />
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <p className="text-secondary font-bold tracking-[0.3em] uppercase text-sm mb-3">
            Government of Pakistan
          </p>
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tight text-white mb-4">
            Test Academy
          </h1>
          <div className="w-24 h-1 bg-secondary mx-auto mb-6" />
          <p className="text-primary-foreground/75 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            The official structured preparation platform for Civil Service Exams.
            Sindh Police · FIA · FBR · Customs · ASF · Jail Police
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { icon: BookOpen, label: "100 MCQ Levels" },
            { icon: Award, label: "Final Test" },
            { icon: Shield, label: "Physical Guidelines" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-4 py-2 text-sm text-primary-foreground/80"
            >
              <Icon className="w-4 h-4 text-secondary" />
              {label}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-lg px-10 py-6 shadow-xl shadow-secondary/20 rounded-xl group"
          >
            <Link href="/login">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <p className="text-primary-foreground/40 text-sm">
            Already an admin?{" "}
            <Link href="/admin-login" className="text-secondary hover:underline font-semibold">
              Admin Login
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 py-6 text-center border-t border-primary-foreground/10">
        <p className="text-primary-foreground/30 text-xs tracking-widest uppercase">
          © {new Date().getFullYear()} Test Academy · All Rights Reserved
        </p>
      </div>
    </div>
  );
}
