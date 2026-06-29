"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brain, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account");
        setIsLoading(false);
        return;
      }

      // Auto signIn on success
      await signIn("credentials", {
        username: username.trim(),
        password,
        callbackUrl: "/dashboard",
      });
    } catch (err) {
      setError("An unexpected error occurred during signup");
      setIsLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setError("");
    setIsDemoLoading(true);
    try {
      const res = await signIn("credentials", {
        username: "testuser",
        password: "testpass",
        redirect: false, // ensure don't redirect on error
      });

      if (res?.error) {
        setError("Failed to log in to demo account");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-gray-50 font-sans pt-24">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between px-6 md:px-12 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="p-2 bg-blue-600 rounded-xl shadow-md shadow-blue-500/10">
            <Brain size={20} className="text-white" />
          </div>
          <span className="font-extrabold text-lg text-gray-900 tracking-tight">Brain Dump</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            asChild
            className="text-sm font-semibold text-gray-600 hover:text-gray-955 transition-colors px-4 py-2 cursor-pointer"
          >
            <Link href="/login">Sign In</Link>
          </Button>
          <Button
            asChild
            className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 px-5 py-2.5 rounded-xl transition-all duration-200 h-fit cursor-pointer"
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>

      {/* Centered Signup Card */}
      <div className="w-full max-w-md bg-white border border-gray-250/60 rounded-2xl p-8 shadow-xl flex flex-col gap-6 relative z-10">
        <div className="flex flex-col gap-1.5 text-center">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create Account</h2>
          <p className="text-sm text-gray-500">Sign up to build your digital workspace</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-xs font-semibold text-gray-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full px-3.5 py-2 text-sm border border-gray-250 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label htmlFor="password" className="text-xs font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
                className="w-full px-3.5 py-2 text-sm border border-gray-250 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition-all pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-3.5 py-2 text-sm border border-gray-250 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition-all pr-10"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || isDemoLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2 h-fit"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            <span>Sign Up</span>
          </Button>

          {error && <p className="text-xs text-red-500 text-center font-medium mt-1">{error}</p>}
        </form>

        <div className="relative flex py-1 items-center">
          <div className="grow border-t border-gray-200"></div>
          <span className="shrink mx-4 text-[10px] text-gray-450 font-semibold uppercase tracking-wider text-center">
            Wanna try without sign up?
          </span>
          <div className="grow border-t border-gray-200"></div>
        </div>

        <Button
          type="button"
          onClick={handleDemoAccess}
          disabled={isLoading || isDemoLoading}
          className="w-full bg-amber-50 hover:bg-amber-100/80 disabled:opacity-50 text-amber-700 border border-amber-200 font-bold text-sm py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 h-fit shadow-none"
        >
          {isDemoLoading && <Loader2 size={16} className="animate-spin" />}
          <span>⚡ Enter as Guest User</span>
        </Button>

        <div className="text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
