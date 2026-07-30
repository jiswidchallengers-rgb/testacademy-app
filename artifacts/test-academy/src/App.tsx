import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { Layout } from './components/layout';
import { Home } from './pages/home';
import { Eligibility } from './pages/eligibility';
import { Essays } from './pages/essays';
import { Physical } from './pages/physical';
import { Login } from './pages/login';
import { AdminLogin } from './pages/admin-login';
import { Splash } from './pages/splash';
import { Mcqs } from './pages/mcqs';
import { FinalTest } from './pages/final-test';
import { AdminDashboard } from './pages/admin-dashboard';
import { useGetMe } from '@workspace/api-client-react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-center text-primary-foreground">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary font-semibold tracking-widest uppercase text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function Router() {
  const { data: user, isLoading } = useGetMe();

  return (
    <Switch>
      {/* Root: Splash if not logged in, Home if logged in */}
      <Route path="/">
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center bg-primary">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : user ? (
          <Layout>
            <Home />
          </Layout>
        ) : (
          <Splash />
        )}
      </Route>

      {/* Auth routes - redirect to home if already logged in */}
      <Route path="/login">
        {user ? <Redirect to="/" /> : <Login />}
      </Route>

      <Route path="/admin-login">
        {user ? <Redirect to={user.role === 'admin' ? '/admin' : '/'} /> : <AdminLogin />}
      </Route>

      {/* Protected content routes */}
      <Route path="/eligibility">
        <AuthGate>
          <Layout><Eligibility /></Layout>
        </AuthGate>
      </Route>

      <Route path="/mcqs">
        <AuthGate>
          <Layout><Mcqs /></Layout>
        </AuthGate>
      </Route>

      <Route path="/essays">
        <AuthGate>
          <Layout><Essays /></Layout>
        </AuthGate>
      </Route>

      <Route path="/physical">
        <AuthGate>
          <Layout><Physical /></Layout>
        </AuthGate>
      </Route>

      <Route path="/final-test">
        <AuthGate>
          <Layout><FinalTest /></Layout>
        </AuthGate>
      </Route>

      <Route path="/admin">
        <AuthGate>
          <Layout><AdminDashboard /></Layout>
        </AuthGate>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
