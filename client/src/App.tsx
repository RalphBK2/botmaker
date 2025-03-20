import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Chatbots from "@/pages/chatbots";
import Templates from "@/pages/templates";
import Analytics from "@/pages/analytics";
import Billing from "@/pages/billing";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import { useAuth } from "@/context/auth-context";

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, path: string }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/">
        {() => <ProtectedRoute component={Dashboard} path="/" />}
      </Route>
      <Route path="/chatbots">
        {() => <ProtectedRoute component={Chatbots} path="/chatbots" />}
      </Route>
      <Route path="/templates">
        {() => <ProtectedRoute component={Templates} path="/templates" />}
      </Route>
      <Route path="/analytics">
        {() => <ProtectedRoute component={Analytics} path="/analytics" />}
      </Route>
      <Route path="/billing">
        {() => <ProtectedRoute component={Billing} path="/billing" />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} path="/profile" />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={Settings} path="/settings" />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
