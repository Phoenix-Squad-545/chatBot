import { useState, useEffect } from "react";

type AuthStep = "email" | "code";

export default function LoginPage() {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setStep("code");
    }, 1200);
  };

  const handleCodeChange = (value: string) => {
    setCode(value.replace(/\D/g, "").slice(0, 6));
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const handleResend = () => {
    setCode("");
    setCountdown(30);
  };

  const isCodeComplete = code.length === 6;

  return (
    <div className="min-h-screen bg-[#0f0c29] flex overflow-hidden relative">
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)", animation: "blob1 8s ease-in-out infinite" }} />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", animation: "blob2 10s ease-in-out infinite" }} />
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", animation: "blob3 12s ease-in-out infinite" }} />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
      </div>

      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>
          <span className="text-white text-xl font-bold tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
            Expensify
          </span>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-indigo-300 text-sm font-semibold tracking-widest uppercase mb-4">Expense Management</p>
            <h1 className="text-white text-5xl leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
              The{" "}
              <span className="italic" style={{ color: "transparent", backgroundImage: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", backgroundClip: "text" }}>
                easiest
              </span>{" "}
              way to manage your expenses
            </h1>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { icon: "⚡", label: "AI-powered receipt scanning" },
              { icon: "🌍", label: "Global reimbursements in 190+ countries" },
              { icon: "🔗", label: "45+ accounting integrations" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 rounded-2xl px-5 py-3 backdrop-blur-sm"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="text-lg">{f.icon}</span>
                <span className="text-white/70 text-sm">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["4f46e5", "7c3aed", "3b82f6", "10b981"].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0f0c29] flex items-center justify-center text-xs text-white font-bold"
                  style={{ backgroundColor: `#${c}` }}>
                  {["A", "B", "C", "D"][i]}
                </div>
              ))}
            </div>
            <p className="text-white/50 text-sm">
              Trusted by <span className="text-white/80 font-semibold">15M+ members</span>
            </p>
          </div>
        </div>

        <p className="text-white/20 text-xs">© 2026 Expensify, Inc. · Privacy · Terms</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-16 relative z-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
            </div>
            <span className="text-white text-xl font-bold">Expensify</span>
          </div>

          {/* Card */}
          <div className="rounded-3xl p-8 space-y-6"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.4)",
            }}>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              {(["email", "code"] as AuthStep[]).map((s, i) => (
                <div key={s} className="h-1 rounded-full flex-1 transition-all duration-500"
                  style={{
                    backgroundColor: s === step ? "#818cf8"
                      : (["email", "code"] as AuthStep[]).indexOf(step) > i ? "#4f46e5"
                      : "rgba(255,255,255,0.1)",
                  }} />
              ))}
            </div>

            {/* ── STEP 1: Email ── */}
            {step === "email" && (
              <>
                <div>
                  <h2 className="text-white text-3xl font-bold mb-1" style={{ fontFamily: "'Georgia', serif" }}>
                    Welcome back
                  </h2>
                  <p className="text-white/40 text-sm">Enter your email — we'll send a magic code</p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-white/50 text-xs tracking-widest uppercase">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full rounded-xl px-4 py-3.5 text-white placeholder-white/20 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 8px 24px rgba(79,70,229,0.4)" }}
                  >
                    {sending
                      ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      : "Send Magic Code →"}
                  </button>
                </form>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/30 text-xs">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <button
                  type="button"
                  className="w-full py-3.5 rounded-xl text-white/80 text-sm font-medium flex items-center justify-center gap-3 transition-all hover:bg-white/10 active:scale-[0.98]"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                <p className="text-center text-white/30 text-xs">
                  Don't have an account?{" "}
                  <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">Create one free</a>
                </p>
              </>
            )}

            {/* ── STEP 2: Magic Code ── */}
            {step === "code" && (
              <>
                <div>
                  <h2 className="text-white text-3xl font-bold mb-1" style={{ fontFamily: "'Georgia', serif" }}>
                    Welcome back!
                  </h2>
                  <p className="text-white/40 text-sm">
                    Code sent to <span className="text-indigo-300 font-medium">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-5">
                  {/* Single magic code input */}
                  <div className="space-y-2">
                    <label className="text-white/50 text-xs tracking-widest uppercase block">Magic Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      placeholder="Enter 6-digit code"
                      autoFocus
                      className="w-full rounded-xl px-4 py-3.5 text-white placeholder-white/20 text-lg font-bold tracking-[0.4em] outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                      style={{
                        background: code ? "rgba(79,70,229,0.15)" : "rgba(255,255,255,0.06)",
                        border: code ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.1)",
                        caretColor: "#818cf8",
                      }}
                    />
                  </div>

                  {/* Scam warning */}
                  <div className="flex gap-3 rounded-xl p-4"
                    style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                    <div className="shrink-0 mt-0.5">
                      <svg viewBox="0 0 20 20" className="w-4 h-4 fill-amber-400">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-amber-200/80 text-xs leading-relaxed">
                      <span className="font-bold text-amber-300">Avoid scams.</span> Do not share your code with anyone. If anyone asks for this code, stop. Our team will never call, text, or email you for this code.
                    </p>
                  </div>

                  {/* Resend + Sign In row */}
                  <div className="flex items-center justify-between gap-4">
                    {countdown > 0 ? (
                      <span className="text-white/40 text-sm shrink-0">
                        Request new code in{" "}
                        <span className="text-indigo-300 font-semibold tabular-nums">
                          00:{String(countdown).padStart(2, "0")}
                        </span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors shrink-0"
                      >
                        Didn't receive a magic code?
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={!isCodeComplete || loading}
                      className="shrink-0 px-7 py-3 rounded-2xl text-white font-semibold text-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{
                        background: isCodeComplete ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.08)",
                        boxShadow: isCodeComplete ? "0 8px 24px rgba(16,185,129,0.4)" : "none",
                        opacity: !isCodeComplete ? 0.4 : 1,
                        cursor: !isCodeComplete ? "not-allowed" : "pointer",
                      }}
                    >
                      {loading
                        ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        : "Sign In"}
                    </button>
                  </div>

                  <p className="text-white/20 text-xs text-center">
                    By logging in, you agree to our{" "}
                    <a href="#" className="text-indigo-400/70 hover:text-indigo-300 transition-colors underline underline-offset-2">terms of service</a>
                    {" "}and{" "}
                    <a href="#" className="text-indigo-400/70 hover:text-indigo-300 transition-colors underline underline-offset-2">privacy policy</a>.
                  </p>

                  <button
                    type="button"
                    onClick={() => { setStep("email"); setCode(""); setCountdown(0); }}
                    className="w-full text-white/25 text-xs hover:text-white/50 transition-colors text-center"
                  >
                    ← Use a different email
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-6">
            {["SOC 2 Type II", "GDPR", "256-bit SSL"].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <span className="text-white/25 text-xs">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(40px,-30px) scale(1.05); }
          66% { transform: translate(-20px,20px) scale(0.95); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(-30px,40px) scale(1.08); }
          66% { transform: translate(20px,-20px) scale(0.92); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(20px,30px) scale(0.95); }
          66% { transform: translate(-30px,-10px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
