import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, ClipboardCheck, Dumbbell, Award, FileQuestion } from "lucide-react";
import logoUrl from "@assets/IMG-20260728-WA0015_1785304473912.jpg";

export function Home() {
  const steps = [
    { num: 1, title: "Eligibility", path: "/eligibility", desc: "Review the strict requirements before applying.", icon: ClipboardCheck },
    { num: 2, title: "MCQs Preparation", path: "/mcqs", desc: "Master the 100 levels of knowledge checks.", icon: FileQuestion },
    { num: 3, title: "Essay Preparation", path: "/essays", desc: "Structured writing and argumentation guides.", icon: FileText },
    { num: 4, title: "Physical Guidelines", path: "/physical", desc: "Fitness and health standards for service.", icon: Dumbbell },
    { num: 5, title: "Final Test", path: "/final-test", desc: "Comprehensive final assessment module.", icon: Award },
  ];

  return (
    <div className="flex-1 bg-muted/20">
      <div className="bg-primary text-primary-foreground py-20 pb-32 border-b-[6px] border-secondary relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(currentColor 2px, transparent 2px)", backgroundSize: "30px 30px" }}></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <img src={logoUrl} alt="Logo" className="w-32 h-32 rounded-full border-4 border-secondary shadow-2xl mb-8 object-cover" />
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight uppercase mb-4 text-white">Test Academy</h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl font-medium">
            The official structured preparation platform for Civil Service Exams in Pakistan. Follow the 5-step curriculum to ensure your readiness.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 -mt-16 relative z-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step) => (
            <Link key={step.num} href={step.path} className="block group">
              <Card className="h-full border-b-4 border-b-transparent hover:border-b-secondary transition-all duration-300 hover:-translate-y-2 shadow-lg bg-card overflow-hidden">
                <div className="bg-secondary/10 px-5 py-4 border-b flex items-center justify-between">
                  <span className="font-display font-bold text-secondary text-sm tracking-widest uppercase">Step {step.num}</span>
                  <step.icon className="w-5 h-5 text-primary opacity-80" />
                </div>
                <CardHeader className="p-6">
                  <CardTitle className="text-lg leading-tight group-hover:text-secondary transition-colors">{step.title}</CardTitle>
                  <CardDescription className="text-sm mt-3 text-muted-foreground">{step.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="mt-24 max-w-4xl mx-auto bg-white border rounded-lg p-8 shadow-sm text-center">
          <h2 className="text-2xl font-display font-bold text-primary mb-4">Why Test Academy?</h2>
          <p className="text-muted-foreground mb-6">
            Designed specifically for aspirants of Sindh Police, FIA, FBR, Customs, ASF, and Jail Police. We provide authoritative material that matches exactly what examiners expect from successful candidates.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-semibold text-primary">
            <div className="p-4 bg-muted/50 rounded-md">Verified Content</div>
            <div className="p-4 bg-muted/50 rounded-md">Structured Path</div>
            <div className="p-4 bg-muted/50 rounded-md">Real-time Testing</div>
            <div className="p-4 bg-muted/50 rounded-md">Progress Tracking</div>
          </div>
        </div>
      </div>
    </div>
  );
}
