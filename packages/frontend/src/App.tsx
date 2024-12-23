import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import SignUpForm from './components/SignUp/SignUpForm'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex items-center text-xl font-bold text-indigo-600">
                  CryptoApp
                </Link>
              </div>
              <div className="flex items-center">
                <Link
                  to="/signup"
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/signup" element={<SignUpForm />} />
            <Route
              path="/"
              element={
                <div>
                  <div>
                    <a href="https://vite.dev" target="_blank">
                      <img src={viteLogo} className="logo" alt="Vite logo" />
                    </a>
                    <a href="https://react.dev" target="_blank">
                      <img src={reactLogo} className="logo react" alt="React logo" />
                    </a>
                  </div>
                  <h1>Vite + React</h1>
                  <div className="card">
                    <button onClick={() => setCount((count) => count + 1)}>
                      count is {count}
                    </button>
                    <p>
                      Edit <code>src/App.tsx</code> and save to test HMR
                    </p>
                  </div>
                  <p className="read-the-docs">
                    Click on the Vite and React logos to learn more
                  </p>
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to CryptoApp</h1>
                    <p className="text-lg text-gray-600">Get started by creating an account</p>
                    <Link
                      to="/signup"
                      className="mt-4 inline-block px-6 py-3 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Sign Up Now
                    </Link>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
