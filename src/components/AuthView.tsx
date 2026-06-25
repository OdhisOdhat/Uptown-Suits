import React, { useState } from "react";
import { motion } from "motion/react";
import { User, Mail, Lock, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

interface AuthViewProps {
  onAuthSuccess: (user: { id: string; name: string; email: string; role: "customer" | "admin" }) => void;
  onClose?: () => void;
}

export default function AuthView({ onAuthSuccess, onClose }: AuthViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "admin">("customer");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister ? { name, email, password, role } : { email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Please check credentials.");
      }

      onAuthSuccess(data.user);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: "customer" | "admin") => {
    setLoading(true);
    setError(null);
    const body = {
      email: demoRole === "admin" ? "tailor@uptown.com" : "fodhis1@gmail.com",
      password: demoRole === "admin" ? "admin" : "password",
    };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Demo login failed.");
      }

      onAuthSuccess(data.user);
    } catch (err: any) {
      setError(err.message || "Something went wrong during demo login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white border border-stone-200 shadow-xl rounded-xl overflow-hidden"
      >
        {/* Banner */}
        <div className="bg-stone-900 px-6 py-8 text-center text-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(197,160,89,0.15),rgba(255,255,255,0))]" />
          <h2 className="font-serif text-2xl tracking-wider font-semibold">
            UPTOWN SUITS
          </h2>
          <p className="text-stone-400 text-xs tracking-widest uppercase mt-2">
            {isRegister ? "Bespoke Membership Enrollment" : "Bespoke Lounge Access"}
          </p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-atelier-accent" />
            <div className="w-8 h-0.5 self-center bg-stone-700" />
            <div className="w-1.5 h-1.5 rounded-full bg-atelier-accent" />
          </div>
        </div>

        {/* Auth Box */}
        <div className="p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-[10px] tracking-wider uppercase text-stone-500 font-semibold mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="E.g. Fodhis O."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-atelier-accent focus:bg-white transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] tracking-wider uppercase text-stone-500 font-semibold mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-atelier-accent focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] tracking-wider uppercase text-stone-500 font-semibold mb-1">
                Secure Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-atelier-accent focus:bg-white transition-colors"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-[10px] tracking-wider uppercase text-stone-500 font-semibold mb-2">
                  Select Salon Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("customer")}
                    className={`py-2 text-xs font-semibold rounded-lg border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      role === "customer"
                        ? "bg-stone-900 border-stone-900 text-white"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Customer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`py-2 text-xs font-semibold rounded-lg border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      role === "admin"
                        ? "bg-stone-900 border-stone-900 text-white"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Tailor / Admin</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-atelier-accent hover:bg-amber-600 disabled:bg-stone-400 text-white text-xs tracking-widest uppercase font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{loading ? "Establishing Connection..." : isRegister ? "Create Bespoke Account" : "Access Lounge"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Switch Screen Trigger */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-stone-500 hover:text-atelier-accent underline decoration-stone-300 hover:decoration-atelier-accent cursor-pointer transition-colors"
            >
              {isRegister
                ? "Already have an account? Sign in here"
                : "New to Uptown Suits? Request an enrollment here"}
            </button>
          </div>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-8 pt-6 border-t border-stone-100">
            <p className="text-center text-[10px] tracking-widest text-stone-400 uppercase font-bold mb-3 flex items-center justify-center space-x-1">
              <Sparkles className="w-3 h-3 text-atelier-accent" />
              <span>Instant Dashboard Previews</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("customer")}
                className="py-2 px-3 text-[11px] font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer"
              >
                <span className="text-stone-900 font-bold font-serif">Customer Lounge</span>
                <span className="text-[9px] text-stone-400">View Closet & AI Stylist</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("admin")}
                className="py-2 px-3 text-[11px] font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer"
              >
                <span className="text-stone-900 font-bold font-serif">Tailor Workspace</span>
                <span className="text-[9px] text-stone-400">Manage Orders & Shop</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
