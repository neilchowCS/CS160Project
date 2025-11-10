import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        console.log("Logging in with:", { email, password });
        const base = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "";
        
        try {
        const res = await fetch(`${base}/api/userAccount/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email.trim(),
                password,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(typeof data === "string" ? data : data.error || "Login failed");
        }

        const token = data.token;
        if (!token) {
            throw new Error("No token received from server");
        }

        localStorage.setItem("jwt", token);

        window.location.href = "/home";


        } catch (err: any) {
            setError(String(err.message || err) || "Login failed");
        }
    }

    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-gray-50">
            <div className="w-[90vw] max-w-md rounded-2xl border bg-white p-6 shadow-sm">
                <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
                    Sign in to CarbonTrack
                </h1>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700 text-sm border border-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-1">
                        <label className="text-sm text-gray-600" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="text-black rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="grid gap-1">
                        <label className="text-sm text-gray-600" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="text-black rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-2 w-full rounded-2xl bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700"
                    >
                        Log In
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-500">
                    Don't have an account? <Link to="/register" className="text-emerald-600 hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
