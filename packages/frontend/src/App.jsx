import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { Home } from "./pages/home/Home";
import { Login } from "./pages/login/Login";
import { Logout } from "./pages/logout/Logout";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { AuthRoute } from "./components/AuthRoute";
import SignUpForm from "./pages/signup/SignUpForm";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  const token = localStorage.getItem("token");

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center">
                  <Link
                    to="/"
                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Home
                  </Link>
                </div>
                <div className="flex items-center">
                  {!token ? (
                    <>
                      <Link
                        to="/signup"
                        className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Sign Up
                      </Link>
                      <Link
                        to="/login"
                        className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Login
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/dashboard"
                        className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/logout"
                        className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Logout
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<SignUpForm />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route element={<AuthRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
