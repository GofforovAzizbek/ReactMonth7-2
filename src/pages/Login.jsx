import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Admin auth local rejimda saqlanadi (ProtectedRoute shu qiymatni tekshiradi)
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (username === "admin" && password === "admin") {
      localStorage.setItem("adminToken", "authenticated");
      localStorage.setItem("adminUser", username);
      if (!localStorage.getItem("authToken")) {
        localStorage.setItem("authToken", "admin-token");
      }
      document.cookie = "adminToken=authenticated; path=/; max-age=86400";
      navigate("/admin");
    } else {
      setError("❌ Invalid username or password. Use admin/admin");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              🔐 Admin Panel
            </h1>
            <p className="text-gray-600">Enter your credentials to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                👤 Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                🔑 Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Demo Credentials */}
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-gray-600">
              <p className="font-semibold mb-1">📝 Demo Credentials:</p>
              <p>
                Username:{" "}
                <code className="bg-white px-2 py-1 rounded">admin</code>
              </p>
              <p>
                Password:{" "}
                <code className="bg-white px-2 py-1 rounded">admin</code>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "⏳ Logging in..." : "🔓 Login"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Back to Store
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
