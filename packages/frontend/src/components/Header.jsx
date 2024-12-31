import { Link } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";

export function Header() {
  const user = useCurrentUser();
  return (
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b-2 border-x-gray-500 mb-2">
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
          {!user?.id ? (
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
    </nav>
  );
}
