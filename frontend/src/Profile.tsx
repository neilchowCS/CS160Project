import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [showPwModal, setShowPwModal] = useState(false);
    const [challengeStatus, setChallengeStatus] = useState<{ count: number; completedToday: boolean } | null>(null);
    const [pwForm, setPwForm] = useState({ cur1: "", cur2: "", new1: "", new2: "" });
    const [pwSubmitting, setPwSubmitting] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    function openPwModal() {
        setPwForm({ cur1: "", cur2: "", new1: "", new2: "" });
        setShowPwModal(true);
    }
    function closePwModal() {
        if (!pwSubmitting) setShowPwModal(false);
    }
    function handlePicChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null;
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    }
    async function submitChangePassword(e: React.FormEvent) {
        e.preventDefault();
        if (pwForm.cur1 !== pwForm.cur2) {
            alert("Current password entries do not match.");
            return;
        }
        if (pwForm.new1 !== pwForm.new2) {
            alert("New password entries do not match.");
            return;
        }
        const base = (import.meta as any).env?.VITE_API_BASE?.replace(/\/+$/, "") || "";
        const token = localStorage.getItem("jwt") || "";
        setPwSubmitting(true);
        try {
            const res = await fetch(`${base}/api/userAccount/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: pwForm.cur1,
                    newPassword: pwForm.new1,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.error || `Request failed with ${res.status}`);
            }
            alert("Password changed successfully.");
            setShowPwModal(false);
        } catch (err: any) {
            alert(err?.message || "Failed to change password.");
        } finally {
            setPwSubmitting(false);
        }
    }
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) return;
        const base = (import.meta as any).env?.VITE_API_BASE?.replace(/\/+$/, "") || "";
        (async () => {
            try {
                const res = await fetch(`${base}/api/userAccount/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to fetch profile");
                const data = await res.json();
                if (data.error) setError(data.error);
                else {
                    setUser(data);
                    localStorage.setItem("user", JSON.stringify(data));
                }
            } catch (err: any) {
                setError(String(err.message || err));
            }
        })();
    }, [navigate]);
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) return;
        const base = (import.meta as any).env?.VITE_API_BASE?.replace(/\/+$/, "") || "";
        (async () => {
            try {
                const res = await fetch(`${base}/api/challenges/status`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return;
                const j = await res.json();
                setChallengeStatus({ count: j.challengeCount || 0, completedToday: !!j.completedToday });
            } catch {
                /* ignore */
            }
        })();
    }, []);

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
                    {previewUrl ? (
                        <img src={previewUrl || undefined} alt="Profile preview" className="w-20 h-20 rounded-full object-cover border-4 border-emerald-200" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-5xl text-emerald-600 border-4 border-emerald-200">
                            <span role="img" aria-label="profile">👤</span>
                        </div>
                    )}
                </div>
                <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">Your Profile</h1>
                <div className="mb-4 w-full text-center">
                    <div><span className="font-semibold">Name:</span> {user.first_name} {user.last_name}</div>
                    <div><span className="font-semibold">Email:</span> {user.email}</div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 ring-1 ring-emerald-200">
                        ✓ Challenges completed: <span className="font-semibold">{challengeStatus?.count ?? 0}</span>
                    </span>
                    {challengeStatus?.completedToday && (
                        <span className="text-xs text-emerald-700">(completed today)</span>
                    )}
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col gap-3 w-full mt-6">
                    <button className="w-full rounded-xl border border-emerald-500 text-emerald-700 py-2 font-semibold hover:bg-emerald-50 transition" onClick={() => navigate("/edit-profile")}>Edit Profile</button>
                    <button
                        className="w-full rounded-xl border border-emerald-500 text-emerald-700 py-2 font-semibold hover:bg-emerald-50 transition"
                        onClick={() => navigate("/home")}
                    >
                        Back to Home
                    </button>
                    <button 
                        className="w-full rounded-xl border border-emerald-500 text-emerald-700 py-2 font-semibold hover:bg-emerald-50 transition"
                        onClick={openPwModal}
                    >
                        Change Password
                    </button>
                    <button
                        className="w-full rounded-xl bg-red-500 text-white py-2 font-semibold hover:bg-red-600 transition"
                        onClick={() => {
                            localStorage.removeItem("jwt");
                            navigate("/login");
                        }}
                    >
                        Logout
                    </button>
                    {showPwModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                                <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                                <form onSubmit={submitChangePassword} className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Current password</label>
                                        <input
                                            type="password"
                                            className="w-full rounded-xl border px-3 py-2"
                                            value={pwForm.cur1}
                                            onChange={e => setPwForm(f => ({ ...f, cur1: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Repeat current password</label>
                                        <input
                                            type="password"
                                            className="w-full rounded-xl border px-3 py-2"
                                            value={pwForm.cur2}
                                            onChange={e => setPwForm(f => ({ ...f, cur2: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">New password</label>
                                        <input
                                            type="password"
                                            className="w-full rounded-xl border px-3 py-2"
                                            value={pwForm.new1}
                                            onChange={e => setPwForm(f => ({ ...f, new1: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Repeat new password</label>
                                        <input
                                            type="password"
                                            className="w-full rounded-xl border px-3 py-2"
                                            value={pwForm.new2}
                                            onChange={e => setPwForm(f => ({ ...f, new2: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <button
                                            type="button"
                                            className="flex-1 rounded-xl border px-4 py-2 hover:bg-gray-50"
                                            onClick={closePwModal}
                                            disabled={pwSubmitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 rounded-xl bg-emerald-600 text-white px-4 py-2 font-semibold hover:bg-emerald-700 disabled:opacity-60"
                                            disabled={pwSubmitting}
                                        >
                                            {pwSubmitting ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    {/* Edit Profile Modal */}
                    {editOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/30" onClick={() => setEditOpen(false)} />
                            <div className="relative z-10 w-[92vw] max-w-md rounded-2xl border bg-white p-6 shadow-xl flex flex-col items-center">
                                <h2 className="mb-4 text-xl font-semibold">Edit Profile</h2>
                                <label className="mb-2 font-medium">Profile Picture</label>
                                <input type="file" accept="image/*" onChange={handlePicChange} />
                                {previewUrl && (
                                    <img src={previewUrl || undefined} alt="Preview" className="w-20 h-20 rounded-full object-cover border-4 border-emerald-200 mt-2" />
                                )}
                                <button className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700" onClick={() => setEditOpen(false)}>Save</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
