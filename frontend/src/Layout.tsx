import { Outlet, Link } from "react-router-dom";

export default function Layout({ children }: { children?: React.ReactNode }) {
    return (
        <div className="min-h-screen w-screen bg-gray-50 text-gray-900">
            {/* Top Nav */}
            <header className="sticky top-0 z-20 w-full border-b bg-white/80 backdrop-blur">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">C</span>
                            <span className="text-lg font-semibold">CarbonTrack</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Profile icon button */}
                        <Link to="/profile" title="Profile">
                            <div className="h-8 w-8 rounded-full bg-emerald-600/10 ring-2 ring-emerald-600 flex items-center justify-center hover:bg-emerald-100 cursor-pointer">
                                <span role="img" aria-label="profile" className="text-2xl">👤</span>
                            </div>
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
