import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import logoUrl from "@assets/IMG-20260728-WA0015_1785304473912.jpg";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(data: LoginFormValues) {
    login.mutate({ data }, {
      onSuccess: () => {
        toast({
          title: "Admin Login Successful",
          description: "Welcome to the Admin Panel.",
        });
        setLocation("/admin");
        window.location.reload();
      },
      onError: () => {
        toast({
          title: "Login Failed",
          description: "Invalid admin credentials.",
          variant: "destructive",
        });
      },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="h-1 bg-secondary w-full relative z-10" />

      {/* Back link */}
      <div className="relative z-10 p-4">
        <Link href="/login" className="inline-flex items-center gap-2 text-primary-foreground/60 hover:text-secondary transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Back to Student Login
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16 relative z-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <img
                src={logoUrl}
                alt="Logo"
                className="w-20 h-20 mx-auto rounded-full border-4 border-secondary shadow-xl object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-1 shadow">
                <ShieldCheck className="w-4 h-4 text-secondary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold uppercase tracking-tight text-white mb-2">
              Admin Portal
            </h1>
            <p className="text-primary-foreground/60">
              Sign in to manage portal content
            </p>
          </div>

          {/* Form */}
          <Card className="border-t-4 border-t-secondary shadow-2xl bg-card">
            <CardContent className="pt-6 pb-8 px-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-primary">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="admin@example.com"
                            {...field}
                            className="bg-muted/50"
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-primary">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="bg-muted/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full font-bold tracking-wide"
                    size="lg"
                    disabled={login.isPending}
                  >
                    {login.isPending ? "AUTHENTICATING..." : "SIGN IN"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
