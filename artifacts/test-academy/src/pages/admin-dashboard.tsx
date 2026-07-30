import { Link } from "wouter";
import { useGetDashboardStats, useGetMe } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ClipboardCheck, Dumbbell, Award, FileQuestion, Users, BookOpen, Layers, Globe } from "lucide-react";
import { Redirect } from "wouter";
import logoUrl from "@assets/IMG-20260728-WA0015_1785304473912.jpg";

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="overflow-hidden border-t-4 shadow-md" style={{ borderTopColor: color }}>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
            <p className="text-4xl font-black text-primary">{value}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const { data: user } = useGetMe();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();

  if (user && user.role !== "admin") {
    return <Redirect to="/" />;
  }

  const steps = [
    {
      num: 1,
      title: "Eligibility",
      path: "/eligibility",
      desc: "Review and manage eligibility criteria.",
      icon: ClipboardCheck,
      count: stats?.eligibilityCount,
    },
    {
      num: 2,
      title: "MCQs Preparation",
      path: "/mcqs",
      desc: "Manage 100 levels of knowledge checks.",
      icon: FileQuestion,
      count: stats?.mcqLevelsWithQuestions,
      countLabel: "levels with questions",
    },
    {
      num: 3,
      title: "Essay Preparation",
      path: "/essays",
      desc: "Add and publish essay guides.",
      icon: FileText,
      count: stats?.essayCount,
    },
    {
      num: 4,
      title: "Physical Guidelines",
      path: "/physical",
      desc: "Manage fitness and health standards.",
      icon: Dumbbell,
      count: stats?.physicalCount,
    },
    {
      num: 5,
      title: "Final Test",
      path: "/final-test",
      desc: "Create and manage the final assessment.",
      icon: Award,
      count: stats?.finalTestQuestionCount,
      countLabel: "questions",
    },
  ];

  return (
    <div className="flex-1 bg-muted/10 pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16 mb-8 border-b-4 border-secondary">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <img src={logoUrl} alt="Logo" className="w-14 h-14 rounded-full border-2 border-secondary object-cover shadow-lg" />
            <div>
              <p className="text-secondary font-bold tracking-widest uppercase text-xs mb-1">Admin Panel</p>
              <h1 className="text-4xl font-display font-bold uppercase tracking-tight">Dashboard</h1>
              <p className="text-primary-foreground/70 text-sm mt-1">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-muted/50 animate-pulse" />
            ))
          ) : (
            <>
              <StatCard
                label="Total Students"
                value={stats?.totalStudents ?? 0}
                icon={Users}
                color="hsl(222 47% 30%)"
              />
              <StatCard
                label="Active Students"
                value={stats?.activeStudents ?? 0}
                icon={Globe}
                color="hsl(43 74% 49%)"
              />
              <StatCard
                label="Published Content"
                value={stats?.publishedContent ?? 0}
                icon={BookOpen}
                color="hsl(142 71% 45%)"
              />
              <StatCard
                label="Total MCQ Levels"
                value={stats?.totalLevels ?? 0}
                icon={Layers}
                color="hsl(262 80% 60%)"
              />
            </>
          )}
        </div>

        {/* Section heading */}
        <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-wider border-b-2 border-secondary pb-2 mb-6 inline-block">
          Content Management
        </h2>

        {/* Curriculum cards with admin actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => (
            <Card key={step.num} className="overflow-hidden border-b-4 border-b-secondary/30 hover:border-b-secondary shadow-md hover:shadow-lg transition-all duration-200">
              <div className="bg-secondary/10 px-5 py-4 border-b flex items-center justify-between">
                <span className="font-display font-bold text-secondary text-sm tracking-widest uppercase">Step {step.num}</span>
                <step.icon className="w-5 h-5 text-primary opacity-80" />
              </div>
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-lg text-primary font-display">{step.title}</CardTitle>
                <CardDescription className="text-sm">{step.desc}</CardDescription>
                {step.count !== undefined && (
                  <p className="text-xs text-muted-foreground font-semibold pt-1">
                    {step.count} {step.countLabel ?? "items"}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pb-4">
                <Button asChild className="w-full font-bold" size="sm">
                  <Link href={step.path}>
                    Manage Content →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Final test results */}
        {stats && stats.finalTestResultCount > 0 && (
          <div className="mt-10 p-5 bg-card border rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-primary text-lg">Final Test Results</h3>
                <p className="text-muted-foreground text-sm">{stats.finalTestResultCount} students have submitted the final test.</p>
              </div>
              <Button asChild variant="outline" size="sm" className="font-semibold">
                <Link href="/final-test">View Test →</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
