import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./SignUp";
import LoginPage from "./Login";
import ProfileSetUp from "./ProfileSetUp";
import Dashboard from "./Dashboard";
import PrivateRoute from "./components/PrivateRoute"; // 👈 new file

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<SignupPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ProfileSetUp" element={<ProfileSetUp />} />

          {/* Protected route */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
