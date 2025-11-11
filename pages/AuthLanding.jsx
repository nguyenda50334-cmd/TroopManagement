import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- Jsonbin.io helpers ---
const fetchJSONBin = async () => {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${import.meta.env.VITE_JSONBIN_ID}`, {
    headers: {
      "X-Master-Key": import.meta.env.VITE_JSONBIN_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch from Jsonbin.io");
  const data = await res.json();
  return data.record;
};

const updateJSONBin = async (updatedBin) => {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${import.meta.env.VITE_JSONBIN_ID}`, {
    method: "PUT",
    headers: {
      "X-Master-Key": import.meta.env.VITE_JSONBIN_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedBin),
  });
  if (!res.ok) throw new Error("Failed to update Jsonbin.io");
  return res.json();
};

export default function AuthLanding() {
  const navigate = useNavigate();
  const [view, setView] = useState("landing"); // landing, login, signup-role, signup-troop, signup-form
  const [userType, setUserType] = useState(null); // scout or leader
  const [selectedTroop, setSelectedTroop] = useState(null); // 714 or 5714
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  });

  // --- Signup handler ---
  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      const binData = await fetchJSONBin();
      const users = binData.users || [];

      // Prevent duplicate emails
      if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
        alert("Email already exists!");
        return;
      }

      const newUser = {
        id: crypto.randomUUID(),
        email: formData.email,
        password: formData.password, // In production, hash this!
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: userType,
        troop: selectedTroop,
        approved: false,
        pendingApproval: true,
        createdAt: new Date().toISOString()
      };

      const updatedBin = { ...binData, users: [...users, newUser] };
      await updateJSONBin(updatedBin);

      alert("Account created! Please wait for admin approval.");
      setView("login");
      setFormData({ email: "", password: "", confirmPassword: "", firstName: "", lastName: "" });
    } catch (err) {
      console.error(err);
      alert("Error creating account. Please try again.");
    }
  };

  // --- Login handler ---
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const binData = await fetchJSONBin();
      const users = binData.users || [];

      const user = users.find(u =>
        u.email.toLowerCase().trim() === formData.email.toLowerCase().trim() &&
        u.password === formData.password
      );

      if (!user) {
        alert("Invalid email or password!");
        return;
      }

      if (!user.approved && user.pendingApproval) {
        navigate(`/waiting-approval?type=Admin`);
        return;
      }

      // Set active troop
      if (user.userType === 'admin') {
        localStorage.setItem('activeTroop', '714');
      } else {
        localStorage.setItem('activeTroop', user.troop || '714');
      }

      localStorage.setItem('currentUser', JSON.stringify(user));
      window.location.href = '/app/dashboard';
    } catch (err) {
      console.error(err);
      alert("Error logging in. Please try again.");
    }
  };

  // --- Landing View ---
  if (view === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl">
              <span className="text-4xl">🏕️</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-2">Troop 714</h1>
            <p className="text-xl text-blue-200">Management System</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-4">
            <Button
              onClick={() => setView("login")}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg py-6 shadow-lg"
            >
              Login
            </Button>
            <Button
              onClick={() => setView("signup-role")}
              variant="outline"
              className="w-full border-2 border-blue-600 text-blue-700 hover:bg-blue-50 text-lg py-6"
            >
              Sign Up
            </Button>
          </div>
          <p className="text-center text-blue-200 mt-6 text-sm">
            Official portal for BSA Troop 714 & 5714
          </p>
        </div>
      </div>
    );
  }

  // --- Login View ---
  if (view === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setView("landing")}
            className="text-white mb-6 flex items-center gap-2 hover:text-blue-200 transition-colors"
          >
            ← Back
          </button>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Welcome Back</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-6 text-lg shadow-lg mt-6"
              >
                Login
              </Button>
            </form>

            <p className="text-center text-slate-600 mt-6 text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => setView("signup-role")}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Signup Role View ---
  if (view === "signup-role") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setView("landing")}
            className="text-white mb-6 flex items-center gap-2 hover:text-blue-200 transition-colors"
          >
            ← Back
          </button>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Leader Registration</h2>
            <p className="text-slate-600 text-center mb-8">This portal is for troop leaders only</p>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  setUserType("leader");
                  setView("signup-troop");
                }}
                className="w-full p-8 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="text-5xl mb-3">👨‍🏫</div>
                <div className="font-bold text-2xl text-slate-900 mb-2">Continue as Leader</div>
                <div className="text-sm text-slate-600">Register as a troop leader or adult volunteer</div>
              </button>
            </div>
            
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-slate-700">
                <strong>Note:</strong> This management system is for troop leaders only. 
                Scouts will be added to the roster by leaders after approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Signup Troop View ---
  if (view === "signup-troop") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setView("signup-role")}
            className="text-white mb-6 flex items-center gap-2 hover:text-blue-200 transition-colors"
          >
            ← Back
          </button>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Select Your Troop</h2>
            <p className="text-slate-600 text-center mb-8">Which troop are you part of?</p>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  setSelectedTroop("714");
                  setView("signup-form");
                }}
                className="w-full p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="font-bold text-2xl text-slate-900 mb-1">Troop 714</div>
                <div className="text-sm text-slate-600">Boys Troop</div>
              </button>

              <button
                onClick={() => {
                  setSelectedTroop("5714");
                  setView("signup-form");
                }}
                className="w-full p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="font-bold text-2xl text-slate-900 mb-1">Troop 5714</div>
                <div className="text-sm text-slate-600">Girls Troop</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Signup Form View ---
  if (view === "signup-form") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setView("signup-troop")}
            className="text-white mb-6 flex items-center gap-2 hover:text-blue-200 transition-colors"
          >
            ← Back
          </button>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Complete Registration</h2>
            <p className="text-slate-600 text-center mb-6">
              Leader • Troop {selectedTroop}
            </p>
            
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="signupEmail">Email</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="signupPassword">Password</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 py-6 text-lg shadow-lg mt-6"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-slate-700">
                <strong>Note:</strong> Your account will need to be approved by an admin before you can access the system.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
