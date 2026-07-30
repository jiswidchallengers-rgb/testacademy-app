import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import logoUrl from "@assets/IMG-20260728-WA0015_1785304473912.jpg";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetMe();
  const logout = useLogout();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        window.location.reload();
      }
    });
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      <header className="border-b border-primary/20 bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src={logoUrl} alt="Test Academy Logo" className="h-10 w-10 rounded-full border-2 border-secondary object-cover" />
            <span className="font-display font-bold text-xl tracking-tight text-white uppercase">Test Academy</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/", label: "Home" },
              { href: "/eligibility", label: "Eligibility" },
              { href: "/mcqs", label: "MCQs" },
              { href: "/essays", label: "Essays" },
              { href: "/physical", label: "Physical" },
              { href: "/final-test", label: "Final Test" }
            ].map(link => (
              <Link key={link.href} href={link.href} className="px-3 py-2 rounded-md text-sm font-semibold text-primary-foreground/90 hover:text-secondary hover:bg-primary-foreground/5 transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isLoading ? null : user ? (
              <div className="flex items-center gap-3">
                {user.role === "admin" && (
                  <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex text-secondary-foreground font-bold shadow-sm">
                    <Link href="/admin">Dashboard</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground/80 hover:text-white hover:bg-primary-foreground/10 font-semibold">
                  Logout
                </Button>
              </div>
            ) : (
              <Button asChild variant="secondary" size="sm" className="font-bold text-secondary-foreground shadow-sm">
                <Link href="/admin-login">Admin Login</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="bg-primary text-primary-foreground/60 py-12 border-t-4 border-secondary mt-auto">
        <div className="container mx-auto px-4 text-center text-sm flex flex-col items-center">
          <img src={logoUrl} alt="Test Academy Logo" className="h-12 w-12 rounded-full border border-primary-foreground/20 object-cover mb-4 opacity-50 grayscale" />
          <p className="font-display font-bold uppercase tracking-[0.2em] text-primary-foreground/40 mb-2">Government of Pakistan</p>
          <p className="max-w-md mx-auto text-primary-foreground/50 mb-4">Official preparation portal for Civil Service Exams. Sindh Police, FIA, FBR, Customs, ASF, Jail Police.</p>
          <p>&copy; {new Date().getFullYear()} Test Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
