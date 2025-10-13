import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!name.trim() || !email.trim() || !password) {
            setError("Please fill out all required fields.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
        return;
        }


        const parts = name.trim().split(/\s+/);
        const first_name = parts[0] || "";
        const last_name = parts.slice(1).join(" ") || parts[0] || "";

        const base = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "";
        fetch(`${base}/api/userAccount/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            first_name,
            last_name,
            email: email.trim(),
            password,
            repeat_password: password
            }),
        })
            .then(async (r) => {
            const data = await r.json().catch(() => ({}));
            if (!r.ok) {
                const msg = typeof data === "string" ? data : (data.error || "Registration failed.");
                throw new Error(msg);
            }
            navigate("/login");
            })
            .catch((err: any) => {
            setError(String(err.message || err) || "Registration failed.");
            });
        }


    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-gray-50">
            <div className="w-[90vw] max-w-md rounded-2xl border bg-white p-6 shadow-sm">
                <h1 className="mb-4 text-center text-2xl font-semibold text-gray-900">Create an account</h1>
                <p className="mb-4 text-center text-sm text-gray-500">Sign up to start tracking your carbon footprint.</p>

                <form onSubmit={handleSubmit} className="grid gap-3">
                    <div className="grid gap-1">
                        <label className="text-sm text-gray-600" htmlFor="name">Full name</label>
                        <input
                            id="name"
                            type="text"
                            required
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-black rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="grid gap-1">
                        <label className="text-sm text-gray-600" htmlFor="email">Email</label>
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
                        <label className="text-sm text-gray-600" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            required
                            placeholder="Enter a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="text-black rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="grid gap-1">
                        <label className="text-sm text-gray-600" htmlFor="confirm">Confirm password</label>
                        <input
                            id="confirm"
                            type="password"
                            required
                            placeholder="Repeat password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="text-black rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {error && <div className="text-sm text-red-600">{error}</div>}

                    <button
                        type="submit"
                        className="mt-2 w-full rounded-2xl bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700"
                    >
                        Create account
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="text-emerald-600 hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
}
