import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function getPasswordStrength(password: string): string[] {
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
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordIssues = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (isSignup && passwordIssues.length > 0) {
      setError("Please fix password issues before continuing.");
      return;
    }

    setLoading(true);

    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg(
          "Account created! Check your email to confirm before logging in.",
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.message.toLowerCase().includes("invalid login")) {
          setError("Incorrect email or password. Please try again.");
        } else if (
          error.message.toLowerCase().includes("email not confirmed")
        ) {
          setError("Please confirm your email before logging in.");
        } else {
          setError(error.message);
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h1 className="text-xl font-bold mb-4">
          {isSignup ? "Create Account" : "Login"}
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-3 bg-red-50 border border-red-200 p-2 rounded">
            {error}
          </p>
        )}

        {successMsg && (
          <p className="text-green-600 text-sm mb-3 bg-green-50 border border-green-200 p-2 rounded">
            {successMsg}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-3"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordTouched(true);
          }}
          className="w-full border p-2 rounded mb-1"
          required
        />

        {/* Password strength hints — only show on signup after user starts typing */}
        {isSignup && passwordTouched && passwordIssues.length > 0 && (
          <ul className="mb-3 mt-1">
            {passwordIssues.map((issue, i) => (
              <li
                key={i}
                className="text-red-500 text-xs flex items-center gap-1"
              >
                <span>✗</span> {issue}
              </li>
            ))}
          </ul>
        )}

        {isSignup && passwordTouched && passwordIssues.length === 0 && (
          <p className="text-green-600 text-xs mb-3 flex items-center gap-1">
            <span>✓</span> Password looks strong
          </p>
        )}

        {!isSignup && <div className="mb-3" />}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </button>

        <p
          className="text-sm text-center mt-3 text-blue-600 cursor-pointer"
          onClick={() => {
            setIsSignup(!isSignup);
            setError("");
            setSuccessMsg("");
            setPasswordTouched(false);
          }}
        >
          {isSignup
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </p>
      </form>
    </div>
  );
}
