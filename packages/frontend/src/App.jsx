import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { Home } from "./pages/home/Home";
import { Login } from "./pages/login/Login";
import { Logout } from "./pages/logout/Logout";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { AuthRoute } from "./components/AuthRoute";
import SignUpForm from "./pages/signup/SignUpForm";
import { queryClient } from "./lib/query-client";
import { Toaster } from "./components/ui/toaster";
import { BuyBitcoin } from "./pages/buy-bitcoin/BuyBitcoin";
import { Header } from "./components/Header";
import { UserProvider } from "./contexts/UserContext";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router>
          <div className="min-h-screen">
            <Header />
            <div className="container mx-auto">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route element={<AuthRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path={"/buy-bitcoin"} element={<BuyBitcoin />} />
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          </div>
        </Router>
        <Toaster />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
