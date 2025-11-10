import { useNavigate } from "react-router-dom";

export default function Help() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
          <button
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>

        <div className="grid gap-4">
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-2 text-lg font-semibold">Getting Started</h2>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>Use <span className="font-medium">+ Add Log</span> to record activity.</li>
              <li>Filter/search logs on the Logs tab.</li>
              <li>Manage your account on the Profile page.</li>
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-2 text-lg font-semibold">Account & Profile</h2>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>Change password on the Profile page.</li>
              <li>Edit your profile picture via <span className="font-medium">Edit Profile</span>.</li>
              <li>Log out from the Profile page.</li>
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-2 text-lg font-semibold">Troubleshooting</h2>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>If actions fail, check you’re logged in (valid token).</li>
              <li>Ensure the backend is running on your API base.</li>
              <li>Verify <code className="bg-gray-100 px-1 rounded">VITE_API_BASE</code> matches the backend port.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
