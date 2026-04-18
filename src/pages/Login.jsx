import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { showError, showSuccess } from "../services/toast";

const loginSchema = Yup.object({
  username: Yup.string().trim().required("Username is required."),
  password: Yup.string().trim().required("Password is required."),
});

function InputError({ message }) {
  if (!message) return null;

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: loginSchema,
    validateOnMount: true,
    onSubmit: async (values, { setStatus }) => {
      setStatus("");
      setLoading(true);

      // Formik keeps the form state and validation logic easier to manage.
      if (values.username === "admin" && values.password === "admin") {
        localStorage.setItem("adminToken", "authenticated");
        localStorage.setItem("adminUser", values.username);
        if (!localStorage.getItem("authToken")) {
          localStorage.setItem("authToken", "admin-token");
        }
        document.cookie = "adminToken=authenticated; path=/; max-age=86400";
        showSuccess("Welcome back to the admin dashboard.");
        navigate("/admin");
      } else {
        const message = "Invalid username or password. Use admin / admin.";
        setStatus(message);
        showError("Use admin/admin to access the dashboard.", "Login failed");
      }

      setLoading(false);
    },
  });

  const hasFieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : "";

  const handleBlur = (event) => {
    formik.handleBlur(event);
    formik.setFieldValue(event.target.name, event.target.value.trimStart(), false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value, true);
  };

  const isSubmitDisabled =
    loading || !formik.isValid || !formik.dirty;


  return (
    <div className="min-h-screen overflow-hidden bg-[#f2f0f1]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] items-center justify-center px-4 py-10">
        <div className="absolute left-[-120px] top-[-80px] h-[260px] w-[260px] rounded-full bg-white/60 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-80px] h-[320px] w-[320px] rounded-full bg-black/5 blur-3xl" />

        <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative hidden bg-black px-10 py-12 text-white lg:block">
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="text-sm tracking-[0.28em] text-white/50">SHOP.CO</p>
                <h1 className="mt-6 max-w-[420px] text-5xl font-black uppercase leading-none">
                  Welcome Back To The Control Room
                </h1>
                <p className="mt-6 max-w-[420px] text-base leading-7 text-white/70">
                  Sign in to manage products, reviews, and orders while keeping the storefront aligned with the project design.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/50">
                  Demo Access
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <p>
                    Username: <span className="font-semibold text-white">admin</span>
                  </p>
                  <p>
                    Password: <span className="font-semibold text-white">admin</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-12">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <p className="text-sm tracking-[0.25em] text-black/40">ADMIN LOGIN</p>
                <h2 className="mt-3 text-4xl font-black text-black">Sign In</h2>
              </div>
              <Link
                to="/"
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black transition hover:border-black"
              >
                Back Store
              </Link>
            </div>

            <div className="mb-8 rounded-[24px] bg-[#f2f0f1] p-5 lg:hidden">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-black/40">
                Demo Access
              </p>
              <div className="mt-3 space-y-2 text-sm text-black/70">
                <p>
                  Username: <span className="font-semibold text-black">admin</span>
                </p>
                <p>
                  Password: <span className="font-semibold text-black">admin</span>
                </p>
              </div>
            </div>

            {formik.status ? (
              <div className="mb-6 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formik.status}
              </div>
            ) : null}

            <form onSubmit={formik.handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-black/60">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formik.values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="admin"
                  className={`h-14 w-full rounded-[18px] border bg-white px-4 text-base outline-none transition focus:border-black ${
                    hasFieldError("username") ? "border-red-300" : "border-black/10"
                  }`}
                />
                <InputError message={hasFieldError("username")} />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-black/60">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formik.values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="admin"
                  className={`h-14 w-full rounded-[18px] border bg-white px-4 text-base outline-none transition focus:border-black ${
                    hasFieldError("password") ? "border-red-300" : "border-black/10"
                  }`}
                />
                <InputError message={hasFieldError("password")} />
              </div>

              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="inline-flex h-14 w-full items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Login To Dashboard"}
              </button>
            </form>

            <p className="mt-6 text-sm text-black/45">
              This login is for the project admin area only and keeps the storefront flow untouched.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
