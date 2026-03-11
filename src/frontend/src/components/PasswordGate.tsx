import { Eye, EyeOff, Lock } from "lucide-react";
import { type ReactNode, useState } from "react";

const PASSWORD = "truffleur2024";
const STORAGE_KEY = "truffleur_authenticated";

function isAuthenticated(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function lockApp() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

export default function PasswordGate({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(isAuthenticated);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  if (authenticated) {
    return <>{children}</>;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setShaking(true);
      setPassword("");
      setTimeout(() => setShaking(false), 600);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, oklch(0.32 0.06 155) 0%, oklch(0.18 0.04 155) 40%, oklch(0.12 0.03 155) 100%)",
      }}
    >
      {/* Atmospheric background blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.12 295) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.10 155) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 48px, oklch(0.85 0.04 78 / 0.3) 48px, oklch(0.85 0.04 78 / 0.3) 49px), repeating-linear-gradient(90deg, transparent, transparent 48px, oklch(0.85 0.04 78 / 0.3) 48px, oklch(0.85 0.04 78 / 0.3) 49px)",
          }}
        />
      </div>

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-sm mx-4 ${
          shaking ? "animate-[shake_0.5s_ease-in-out]" : ""
        }`}
      >
        <div
          className="rounded-2xl p-8 flex flex-col items-center gap-6"
          style={{
            background: "oklch(0.20 0.04 155 / 0.85)",
            border: "1px solid oklch(0.72 0.12 295 / 0.25)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 32px 80px oklch(0.10 0.03 155 / 0.6), 0 0 0 1px oklch(0.72 0.12 295 / 0.08) inset",
          }}
        >
          {/* Icon */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full opacity-40"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.72 0.12 295) 0%, transparent 70%)",
                filter: "blur(16px)",
                transform: "scale(1.4)",
              }}
            />
            <img
              src="/assets/generated/truffleur-icon.dim_512x512.png"
              alt="TRUFFLEUR"
              width={96}
              height={96}
              className="relative rounded-2xl shadow-2xl"
              style={{
                border: "1px solid oklch(0.72 0.12 295 / 0.3)",
              }}
            />
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h1
              className="font-display text-3xl font-semibold tracking-[0.25em] uppercase"
              style={{ color: "oklch(0.93 0.035 78)" }}
            >
              TRUFFLEUR
            </h1>
            <p
              className="text-xs tracking-[0.3em] uppercase font-light"
              style={{ color: "oklch(0.72 0.12 295 / 0.8)" }}
            >
              Private Access
            </p>
          </div>

          {/* Divider */}
          <div
            className="w-full h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.72 0.12 295 / 0.4), transparent)",
            }}
          />

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
              <div
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "oklch(0.72 0.12 295 / 0.6)" }}
              >
                <Lock className="w-4 h-4" />
              </div>
              <input
                data-ocid="password_gate.input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Enter password"
                className="w-full pl-10 pr-12 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "oklch(0.15 0.03 155 / 0.8)",
                  border: error
                    ? "1px solid oklch(0.65 0.20 25 / 0.8)"
                    : "1px solid oklch(0.72 0.12 295 / 0.25)",
                  color: "oklch(0.93 0.02 78)",
                  caretColor: "oklch(0.72 0.12 295)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100 opacity-60"
                style={{ color: "oklch(0.72 0.12 295)" }}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p
                data-ocid="password_gate.error_state"
                className="text-xs text-center font-medium tracking-wide"
                style={{ color: "oklch(0.72 0.20 25)" }}
              >
                Incorrect password. Please try again.
              </p>
            )}

            <button
              data-ocid="password_gate.submit_button"
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.38 0.09 155) 0%, oklch(0.30 0.07 155) 100%)",
                color: "oklch(0.93 0.035 78)",
                border: "1px solid oklch(0.50 0.10 155 / 0.5)",
                boxShadow: "0 4px 20px oklch(0.25 0.06 155 / 0.4)",
              }}
            >
              Enter
            </button>
          </form>
        </div>

        {/* Subtle footer */}
        <p
          className="text-center mt-6 text-xs tracking-wider"
          style={{ color: "oklch(0.50 0.05 155)" }}
        >
          © {new Date().getFullYear()} TRUFFLEUR
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}
