import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessagesSquare, Mail, Lock, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiErr } from "@/lib/api";
import { Field } from "@/pages/Login";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created!");
      nav("/");
    } catch (err) {
      toast.error(apiErr(err.response?.data?.detail) || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen sc-mesh bg-[#07090E] flex items-center justify-center p-4">
      <div className="w-full max-w-md sc-fade-up">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <MessagesSquare size={22} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl">SyncChat</span>
        </div>
        <div className="sc-glass rounded-2xl p-8">
          <h1 className="text-2xl font-display font-bold mb-1">Create account</h1>
          <p className="text-sm text-gray-400 mb-6">Start unifying your conversations.</p>
          <form onSubmit={submit} className="space-y-4">
            <Field icon={User} data-testid="register-name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Field icon={Mail} data-testid="register-email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Field icon={Lock} data-testid="register-password" type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button
              data-testid="register-submit"
              disabled={loading}
              className="sc-glow-btn w-full rounded-xl py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create account"} {!loading && <ArrowRight size={16} />}
            </button>
          </form>
          <p className="text-sm text-gray-400 mt-6 text-center">
            Already have an account?{" "}
            <Link to="/login" data-testid="go-login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
