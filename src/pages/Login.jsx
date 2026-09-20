import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessagesSquare, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiErr } from "@/lib/api";

function AuthShell({ children }) {
  return (
    <div className="min-h-screen sc-mesh bg-[#07090E] flex items-center justify-center p-4">
      <div className="w-full max-w-md sc-fade-up">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <MessagesSquare size={22} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl">SyncChat</span>
        </div>
        <p className="text-center text-gray-400 text-sm mb-8">All Your Conversations. One Smart Space.</p>
        <div className="sc-glass rounded-2xl p-8">{children}</div>
      </div>
    </div>
  );
}

export function Field({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      <input
        {...props}
        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent transition-all"
      />
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("demo@syncchat.app");
  const [password, setPassword] = useState("Demo@1234");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      nav("/");
    } catch (err) {
      toast.error(apiErr(err.response?.data?.detail) || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="text-2xl font-display font-bold mb-1">Sign in</h1>
      <p className="text-sm text-gray-400 mb-6">Continue to your unified workspace.</p>
      <form onSubmit={submit} className="space-y-4">
        <Field icon={Mail} data-testid="login-email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field icon={Lock} data-testid="login-password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button
          data-testid="login-submit"
          disabled={loading}
          className="sc-glow-btn w-full rounded-xl py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"} {!loading && <ArrowRight size={16} />}
        </button>
      </form>
      <div className="mt-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-4 py-3 text-xs text-indigo-200">
        Demo account is pre-filled — just click <b>Sign in</b>.
      </div>
      <p className="text-sm text-gray-400 mt-6 text-center">
        New to SyncChat?{" "}
        <Link to="/register" data-testid="go-register" className="text-indigo-400 hover:text-indigo-300 font-medium">Create an account</Link>
      </p>
    </AuthShell>
  );
}
