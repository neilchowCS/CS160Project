import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children?: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const location = useLocation();

    // base URL for backend (same pattern you used elsewhere)
    const apiBase =
        (import.meta as any).env?.VITE_API_BASE?.replace(/\/+$/, "") || "";

    // whenever the route changes, re-read the user from localStorage
    // (this catches the update after you save your profile)
    useEffect(() => {
        const raw = localStorage.getItem("user");
        if (!raw) {
            setUser(null);
            return;
        }
        try {
            setUser(JSON.parse(raw));
        } catch {
            setUser(null);
        }
    }, [location.pathname]);

    const avatarSrc = user?.avatar_url || null;

    return (
        <div className="min-h-screen w-screen bg-gray-50 text-gray-900">
            {/* Top Nav */}
            <header className="sticky top-0 z-20 w-full border-b bg-white/80 backdrop-blur">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                                C
                            </span>
                            <span className="text-lg font-semibold">EcoTrackers</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Profile icon button */}
                        <Link to="/profile" title="Profile">
                            {avatarSrc ? (
                                <img
                                    src={avatarSrc}
                                    alt="Profile"
                                    className="h-8 w-8 rounded-full object-cover border border-emerald-200 cursor-pointer"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-emerald-100 cursor-pointer bg-emerald-50 border border-emerald-200">
                                    <span
                                        role="img"
                                        aria-label="profile"
                                        className="text-xl text-emerald-700"
                                    >
                                        👤
                                    </span>
                                </div>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <Outlet />
            {children}
        </div>
    );
}
