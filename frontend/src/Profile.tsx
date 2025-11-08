import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) {
            navigate("/login");
            return;
        }

        // Ensure we always have a sensible backend base URL for debugging.
        const base = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "http://localhost:5001";
        const url = `${base}/api/userAccount/profile`;
        console.log("Profile: fetching user from", url);
        console.log("Profile: token present?", !!token);

        fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        })
            .then(async (res) => {
                const ct = res.headers.get('content-type') || '';
                if (!ct.includes('application/json')) {
                    // Return raw text so we can see HTML error pages in the UI
                    const text = await res.text();
                    throw new Error('Non-JSON response: ' + text.slice(0, 200));
                }
                return res.json();
            })
            .then((data) => {
                if (data.error) setError(data.error);
                else setUser(data);
            })
            .catch((err) => {
                console.error('Profile fetch error', err);
                setError(String(err.message || err));
            });
    }, [navigate]);

    if (error) {
        return <div className="p-6 text-red-600">Error: {error}</div>;
    }
    if (!user) {
        return <div className="p-6">Loading profile...</div>;
    }
    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-gray-50">
            <div className="w-[90vw] max-w-md rounded-2xl border bg-white p-6 shadow-sm flex flex-col items-center">
                {/* Profile Icon */}
                <div className="flex justify-center w-full mt-2 mb-4">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-5xl text-emerald-600 border-4 border-emerald-200">
                        <span role="img" aria-label="profile">👤</span>
                    </div>
                </div>
                <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">Your Profile</h1>
                <div className="mb-4 w-full text-center">
                    <div><span className="font-semibold">Name:</span> {user.first_name} {user.last_name}</div>
                    <div><span className="font-semibold">Email:</span> {user.email}</div>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col gap-3 w-full mt-6">
                    <button className="w-full rounded-xl border border-emerald-500 text-emerald-700 py-2 font-semibold hover:bg-emerald-50 transition">Edit Profile</button>
                    <button className="w-full rounded-xl border border-emerald-500 text-emerald-700 py-2 font-semibold hover:bg-emerald-50 transition">Change Password</button>
                    <button
                        className="w-full rounded-xl bg-red-500 text-white py-2 font-semibold hover:bg-red-600 transition"
                        onClick={() => {
                            localStorage.removeItem("jwt");
                            navigate("/login");
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
