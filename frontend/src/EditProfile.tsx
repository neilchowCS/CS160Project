import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    useEffect(() => {
        // Try to get user info from localStorage (set after login/profile fetch)
        const userRaw = localStorage.getItem("user");
        if (userRaw) {
            try {
                const user = JSON.parse(userRaw);
                setFirstName(user.first_name || "");
                setLastName(user.last_name || "");
                setEmail(user.email || "");
            } catch {}
        }
    }, []);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function handlePicChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null;
        setPhotoFile(file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        const base = (import.meta as any).env?.VITE_API_BASE?.replace(/\/+$/, "") || "";
        const token = localStorage.getItem("jwt") || "";
        try {
            // if there's a photo file, convert to base64 and include as avatar_base64
            let avatar_base64 = undefined;
            if (photoFile) {
                avatar_base64 = await new Promise<string | undefined>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        resolve(result);
                    };
                    reader.onerror = () => resolve(undefined);
                    reader.readAsDataURL(photoFile);
                });
            }

            const body: any = { first_name: firstName, last_name: lastName, email };
            if (avatar_base64) body.avatar_base64 = avatar_base64;

            const res = await fetch(`${base}/api/userAccount/update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                alert(data.error || "Failed to update profile");
            } else {
                localStorage.setItem("user", JSON.stringify(data));
                navigate("/profile");
            }
        } catch (err: any) {
            alert(err?.message || "Failed to update profile");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-gray-50">
            <div className="w-[90vw] max-w-md rounded-2xl border bg-white p-6 shadow-sm flex flex-col items-center">
                <h1 className="mb-2 text-2xl font-bold">Edit profile</h1>
                <p className="mb-6 text-gray-600 text-center">Keep your personal details private. Information you add here is visible to anyone who can view your profile.</p>
                <div className="mb-6 flex flex-col items-center">
                    <div className="mb-2">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Profile preview" className="w-20 h-20 rounded-full object-cover border-4 border-emerald-200" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-5xl text-emerald-600 border-4 border-emerald-200">
                                <span role="img" aria-label="profile">👤</span>
                            </div>
                        )}
                    </div>
                    <label className="block mb-2">
                        <span className="sr-only">Change photo</span>
                        <input type="file" accept="image/*" onChange={handlePicChange} className="hidden" id="profile-photo-input" />
                        <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => document.getElementById('profile-photo-input')?.click()}>Change</button>
                    </label>
                </div>
                <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium mb-1">First name</label>
                        <input
                            type="text"
                            className="w-full rounded-xl border px-3 py-2"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Last name</label>
                        <input
                            type="text"
                            className="w-full rounded-xl border px-3 py-2"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full rounded-xl border px-3 py-2"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button
                            type="button"
                            className="flex-1 rounded-xl border px-4 py-2 hover:bg-gray-50"
                            onClick={() => navigate("/profile")}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 rounded-xl bg-emerald-600 text-white px-4 py-2 font-semibold hover:bg-emerald-700 disabled:opacity-60"
                            disabled={submitting}
                        >
                            {submitting ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
