import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStudentLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import logoUrl from "@assets/IMG-20260728-WA0015_1785304473912.jpg";

const loginSchema = z.object({
  name: z.string().min(1, "Please enter your name").max(100, "Name is too long"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const studentLogin = useStudentLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { name: "" },
  });

  function onSubmit(data: LoginFormValues) {
    studentLogin.mutate({ data: { name: data.name.trim() } }, {
      onSuccess: () => {
        toast({
          title: "Welcome!",
          description: `Good luck with your preparation, ${data.name.trim()}!`,
        });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      },
      onError: () => {
        toast({
          title: "Login Failed",
          description: "Something went wrong. Please try again.",
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
        <Link href="/" className="inline-flex items-center gap-2 text-primary-foreground/60 hover:text-secondary transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16 relative z-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src={logoUrl}
              alt="Logo"
              className="w-20 h-20 mx-auto rounded-full border-4 border-secondary shadow-xl mb-4 object-cover"
            />
            <h1 className="text-3xl font-display font-bold uppercase tracking-tight text-white mb-2">
              Student Login
            </h1>
            <p className="text-primary-foreground/60">
              Enter your name to access your study materials
            </p>
          </div>

          {/* Form */}
          <Card className="border-t-4 border-t-secondary shadow-2xl bg-card">
            <CardContent className="pt-6 pb-8 px-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-primary">Your Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Muhammad Ali"
                            {...field}
                            className="bg-muted/50 text-lg py-5"
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full font-bold tracking-wide text-base py-5"
                    size="lg"
                    disabled={studentLogin.isPending}
                  >
                    {studentLogin.isPending ? "ENTERING..." : "CONTINUE →"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Admin link */}
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-foreground/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-primary text-primary-foreground/50">Admin Access</span>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/admin-login"
                className="text-secondary hover:text-secondary/80 font-semibold text-sm underline-offset-4 hover:underline transition-colors"
              >
                Admin Login →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
