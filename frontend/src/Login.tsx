import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // Here you'd call your backend login API or validation logic
        console.log("Logging in with:", { email, password });
        alert(`Email: ${email}\nPassword: ${password}`);
    }

    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-gray-50">
            <div className="w-[90vw] max-w-md rounded-2xl border bg-white p-6 shadow-sm">
                <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
                    Sign in to CarbonTrack
                </h1>

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
<<<<<<< HEAD
                            placeholder="��������"
=======
                            placeholder="Enter your password"
>>>>>>> ef1e900 (fixed placeholder symbols in login frontend)
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
<<<<<<< HEAD
                    Don't have an account? <Link to="/register" className="text-emerald-600 hover:underline">Sign up</Link>
=======
                    Don't have an account? <a href="#" className="text-emerald-600 hover:underline">Sign up</a>
>>>>>>> ef1e900 (fixed placeholder symbols in login frontend)
                </p>
            </div>
        </div>
    );
}
