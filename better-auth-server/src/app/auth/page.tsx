"use client";

import { useState } from "react";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3020",
  fetchOptions: {
    credentials: "include",
  },
});

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [softwareBackground, setSoftwareBackground] = useState("Beginner");
  const [hasRTXGPU, setHasRTXGPU] = useState(false);
  const [hasJetsonKit, setHasJetsonKit] = useState(false);
  const [hasRoboticsExp, setHasRoboticsExp] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        await authClient.signUp.email({
          email,
          password,
          name,
          additionalData: {
            softwareBackground,
            hasRTXGPU,
            hasJetsonKit,
            hasRoboticsExp,
          },
        }as any);
        alert("Signup successful! You can now sign in.");
      } else {
        await authClient.signIn.email({ email, password });
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Error: " + (error as any)?.message || "Something went wrong");
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-2xl">Welcome back!</h2>
            <p className="text-lg mt-2">{session.user.email}</p>
            <div className="card-actions mt-6">
              <button onClick={() => authClient.signOut()} className="btn btn-error">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-3xl text-center mb-6">
            {isSignUp ? "Sign Up" : "Sign In"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
              required
            />

            {isSignUp && (
              <>
                <select
                  value={softwareBackground}
                  onChange={(e) => setSoftwareBackground(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>

                <div className="space-y-3">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="checkbox"
                      checked={hasRTXGPU}
                      onChange={(e) => setHasRTXGPU(e.target.checked)}
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text">Have NVIDIA RTX GPU?</span>
                  </label>

                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="checkbox"
                      checked={hasJetsonKit}
                      onChange={(e) => setHasJetsonKit(e.target.checked)}
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text">Have Jetson kit?</span>
                  </label>

                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="checkbox"
                      checked={hasRoboticsExp}
                      onChange={(e) => setHasRoboticsExp(e.target.checked)}
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text">Robotics/ROS experience?</span>
                  </label>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary w-full">
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="link link-primary ml-1"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}