"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginAdmin } from "@/app/actions";
import Link from "next/link";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await loginAdmin(email, password);
    if (res.success) {
      router.push("/dashboard");
    } else {
      toast.error("Authentication failed.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-slate-50 p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-green-500 opacity-20 blur-[100px]"></div>

      <div className="max-w-md w-full mx-auto rounded-2xl md:rounded-2xl p-6 md:p-8 shadow-xl bg-white border border-slate-200 z-10 relative">
        <h2 className="font-bold text-2xl text-slate-800 mt-2">
          Admin Portal
        </h2>
        <p className="text-sm max-w-sm mt-2 text-slate-500">
          Login to manage lobbies and view users.
        </p>

        <form className="my-8 space-y-4" onSubmit={handleAdminLogin}>
          
          <div className="flex flex-col space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border px-3 py-2 text-sm border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition duration-400"
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border px-3 py-2 text-sm border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition duration-400"
            />
          </div>
          
          <button
            className="bg-gradient-to-br relative group/btn from-green-500 to-green-600 block w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] mt-4 hover:brightness-110 transition-all"
            type="submit"
            disabled={loading}
          >
            {loading ? "Processing..." : "Login to Dashboard"}
            <BottomGradient />
          </button>
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-green-400 to-transparent" />
    </>
  );
};
