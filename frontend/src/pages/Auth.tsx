import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function getPasswordIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 8) issues.push("At least 8 characters required");
  if (!/[A-Z]/.test(password))
    issues.push("At least one uppercase letter required");
  if (!/[a-z]/.test(password))
    issues.push("At least one lowercase letter required");
  if (!/[0-9]/.test(password)) issues.push("At least one number required");
  if (!/[^A-Za-z0-9]/.test(password))
    issues.push("At least one special character required");
  return issues;
}

export default function Auth() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const issues = getPasswordIssues(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isSignup && issues.length > 0) {
      setError("Please fix password issues before continuing.");
      return;
    }

    setLoading(true);

    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setSuccess("Account created! You can now log in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.message.toLowerCase().includes("invalid login"))
          setError("Incorrect email or password.");
        else if (error.message.toLowerCase().includes("email not confirmed"))
          setError("Please confirm your email before logging in.");
        else setError(error.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-slate-800 mb-6">
          {isSignup ? "Create Account" : "Login to SmartERP"}
        </h1>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="text-sm text-slate-600 block mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm text-slate-600 block mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordTouched(true);
              }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              required
            />
            {isSignup && passwordTouched && issues.length > 0 && (
              <ul className="mt-2 space-y-1">
                {issues.map((issue, i) => (
                  <li
                    key={i}
                    className="text-red-500 text-xs flex items-center gap-1"
                  >
                    <span>✗</span> {issue}
                  </li>
                ))}
              </ul>
            )}
            {isSignup && passwordTouched && issues.length === 0 && (
              <p className="text-green-600 text-xs mt-1">
                ✓ Password looks strong
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <p
          onClick={() => {
            setIsSignup(!isSignup);
            setError("");
            setSuccess("");
            setPasswordTouched(false);
          }}
          className="text-center text-sm text-blue-600 cursor-pointer mt-4"
        >
          {isSignup
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  );
}
