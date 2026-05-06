import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export type AuthStep =
    | "email"
    | "password"
    | "magic"
    | "forgot"
    | "verify"
    | "reset"
    | "register";

interface FloatingParticle {
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    speed: number;
}

const FEATURES = [
    { icon: "✦", label: "AI-Powered Scanning", desc: "SmartScan receipts instantly" },
    { icon: "◈", label: "Global Reimbursements", desc: "Pay in 190+ currencies" },
    { icon: "⬡", label: "Corporate Cards", desc: "Expensify Visa® with cashback" },
    { icon: "◉", label: "45+ Integrations", desc: "QuickBooks, NetSuite & more" },
];

const TRUST_LOGOS = ["GitHub", "Pinterest", "Swatch", "Warby Parker", "Xero", "Tribeca"];

export default function ExpensifyLogin() {
    const navigate = useNavigate();
    const [step, setStep] = useState<AuthStep>("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [magicSent, setMagicSent] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); 
    const [particles] = useState<FloatingParticle[]>(() =>
        Array.from({ length: 18 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.4 + 0.1,
            speed: Math.random() * 20 + 15,
        }))
    );
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setActiveFeature((p) => (p + 1) % FEATURES.length);
        }, 2800);
        return () => clearInterval(interval);
    }, []);

    // Animated grid lines on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let frame = 0;
        let animId: number;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cols = 12;
            const rows = 8;
            const cellW = canvas.width / cols;
            const cellH = canvas.height / rows;

            for (let c = 0; c <= cols; c++) {
                const x = c * cellW;
                const alpha = 0.03 + 0.02 * Math.sin(frame * 0.01 + c * 0.4);
                ctx.beginPath();
                ctx.strokeStyle = `rgba(16,185,129,${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let r = 0; r <= rows; r++) {
                const y = r * cellH;
                const alpha = 0.03 + 0.02 * Math.sin(frame * 0.012 + r * 0.5);
                ctx.beginPath();
                ctx.strokeStyle = `rgba(16,185,129,${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Floating dots
            particles.forEach((p) => {
                const nx = (p.x / 100) * canvas.width;
                const ny = ((p.y + (frame / p.speed)) % 100) / 100 * canvas.height;
                ctx.beginPath();
                ctx.arc(nx, ny, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(16,185,129,${p.opacity * (0.7 + 0.3 * Math.sin(frame * 0.02 + p.id))})`;
                ctx.fill();
            });

            frame++;
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, [particles]);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setStep("password");
    };

const handlePasswordSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  await new Promise((r) => setTimeout(r, 1000));

  // ✅ Hardcoded auth
  if (email === "admin@gmail.com" && password === "admin@123") {
    setLoading(false);

    // Optional: store login state
    localStorage.setItem("isAuth", "true");

    navigate("/"); // this goes to Dashboard (since it's index inside Layout)
  } else {
    setLoading(false);
    alert("Invalid credentials");
  }
};

    const handleMagicLink = async () => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1200));
        setLoading(false);
        setMagicSent(true);
    };

    return (
        <div className="min-h-screen flex bg-[#0a0d0b] font-sans overflow-hidden">
            {/* ── Left Panel ── */}
            <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                {/* Radial glow */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 
                            "radial-gradient(ellipse 70% 60% at 30% 50%, rgba(16,185,129,0.08) 0%, transparent 70%)",
                    }}
                />

                <div className="relative z-10 flex flex-col h-full px-14 py-12">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-16">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-white text-xl font-semibold tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                            expensify
                        </span>
                    </div>

                    {/* Hero */}
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="mb-3">
                            <span
                                className="text-xs font-medium tracking-[0.2em] uppercase px-3 py-1 rounded-full border"
                                style={{ color: "#10b981", borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.08)" }}
                            >
                                15 million+ members
                            </span>
                        </div>

                        <h1
                            className="text-[3.2rem] leading-[1.1] font-bold text-white mb-6"
                            style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.03em" }}
                        >
                            The smartest<br />
                            <span style={{ color: "#10b981" }}>way to manage</span><br />
                            expenses.
                        </h1>

                        <p className="text-[#6b7c74] text-lg leading-relaxed mb-12 max-w-sm">
                            AI-powered expense reports, corporate cards, travel booking, and global reimbursements — all in one place.
                        </p>

                        {/* Feature Rotator */}
                        <div className="space-y-2 mb-12">
                            {FEATURES.map((f, i) => (
                                <div
                                    key={f.label}
                                    className="flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-500"
                                    style={{
                                        background: i === activeFeature ? "rgba(16,185,129,0.08)" : "transparent",
                                        border: i === activeFeature ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
                                        transform: i === activeFeature ? "translateX(4px)" : "none",
                                    }}
                                >
                                    <span
                                        className="text-lg w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                                        style={{
                                            color: i === activeFeature ? "#10b981" : "#3d4f47",
                                            background: i === activeFeature ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)",
                                        }}
                                    >
                                        {f.icon}
                                    </span>
                                    <div>
                                        <p
                                            className="text-sm font-medium transition-colors duration-300"
                                            style={{ color: i === activeFeature ? "#fff" : "#4a5c54" }}
                                        >
                                            {f.label}
                                        </p>
                                        <p
                                            className="text-xs transition-colors duration-300"
                                            style={{ color: i === activeFeature ? "#6b7c74" : "#2e3c36" }}
                                        >
                                            {f.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust logos */}
                        <div>
                            <p className="text-xs text-[#3d4f47] uppercase tracking-widest mb-3">Trusted by teams at</p>
                            {/* <div className="flex flex-wrap gap-x-5 gap-y-2">
                {TRUST_LOGOS.map((logo) => (
                  <span key={logo} className="text-[#3d4f47] text-sm font-medium">
                    {logo}
                  </span>
                ))}
              </div> */}
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
                </div>
            </div>

            {/* ── Right Panel ── */}
            <div
                className="flex-1 flex items-center justify-center px-6 py-12 relative"
                style={{ background: "#0d1210" }}
            >
                {/* Subtle corner accent */}
                <div
                    className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
                    style={{
                        background: "radial-gradient(circle at top right, rgba(16,185,129,0.06), transparent 60%)",
                    }}
                />

                <div
                    className={`w-full max-w-[420px] transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                >
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-10 lg:hidden">
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-white text-lg font-semibold" style={{ fontFamily: "'Sora', sans-serif" }}>
                            expensify
                        </span>
                    </div>

                    {/* Card */}
                    <div
                        className="rounded-2xl p-8"
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        {/* Step indicator */}
                        <div className="flex items-center gap-2 mb-6">
                            {(["email", "password"] as AuthStep[]).map((s, i) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300"
                                        style={{
                                            background:
                                                step === s || (i === 0 && step === "password") || (i === 0 && step === "magic")
                                                    ? "#10b981"
                                                    : "rgba(255,255,255,0.08)",
                                            color:
                                                step === s || (i === 0 && step === "password") || (i === 0 && step === "magic")
                                                    ? "#fff"
                                                    : "#4a5c54",
                                        }}
                                    >
                                        {i === 0 && step !== "email" ? "✓" : i + 1}
                                    </div>
                                    {i < 1 && (
                                        <div
                                            className="w-8 h-px transition-all duration-500"
                                            style={{ background: step !== "email" ? "#10b981" : "rgba(255,255,255,0.1)" }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <h2
                            className="text-2xl font-bold text-white mb-1"
                            style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}
                        >
                            {step === "email" && "Welcome back"}
                            {step === "password" && "Enter password"}
                            {step === "magic" && (magicSent ? "Check your inbox" : "Magic link")}
                        </h2>
                        <p className="text-sm text-[#4a5c54] mb-7">
                            {step === "email" && "Sign in to your Expensify account"}
                            {step === "password" && `Signing in as ${email}`}
                            {step === "magic" && !magicSent && "We'll send you a one-click login link"}
                            {step === "magic" && magicSent && `Sent to ${email}`}
                        </p>

                        {/* ── Email Step ── */}
                        {step === "email" && (
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-[#6b7c74] mb-2 uppercase tracking-wider">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        required
                                        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-[#2e3c36] outline-none transition-all duration-200"
                                        style={{
                                            background: "rgba(255,255,255,0.05)",
                                            border: "1px solid rgba(255,255,255,0.09)",
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.border = "1px solid rgba(16,185,129,0.5)";
                                            e.target.style.background = "rgba(16,185,129,0.04)";
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.border = "1px solid rgba(255,255,255,0.09)";
                                            e.target.style.background = "rgba(255,255,255,0.05)";
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98]"
                                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                                >
                                    Continue with email →
                                </button>

                                {/* <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                  <span className="text-xs text-[#3d4f47]">or</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                </div>

                <button
                  type="button"
                  className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98]"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: "#aab8b2",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  Continue with Google
                </button> */}
                            </form>
                        )}

                        {/* ── Forgot Password  Step ── */}
                        {step === "forgot" && (
                            <div className="space-y-4">
                                <p className="text-sm text-[#4a5c54]">
                                    Enter your email to reset password
                                </p>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 text-white"
                                />

                                <button
                                    onClick={() => setStep("verify")}
                                    className="w-full py-3 rounded-xl text-white"
                                    style={{ background: "#10b981" }}
                                >
                                    Send OTP
                                </button>
                            </div>
                        )}

                        {/* ── Verify OTP Step ── */}
                        {step === "verify" && (
                            <div className="space-y-4">
                                <p className="text-sm text-[#4a5c54]">
                                    Enter OTP sent to {email}
                                </p>

                                <input
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 text-white"
                                />

                                <button
                                    onClick={() => setStep("reset")}
                                    className="w-full py-3 rounded-xl text-white"
                                    style={{ background: "#10b981" }}
                                >
                                    Verify OTP
                                </button>
                            </div>
                        )}

                        {/* ── Reset Password Step ── */}

                        {step === "reset" && (
                            <div className="space-y-4">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New Password"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 text-white"
                                />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm Password"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 text-white"
                                />

                                <button
                                    onClick={() => alert("Password Reset Success")}
                                    className="w-full py-3 rounded-xl text-white"
                                    style={{ background: "#10b981" }}
                                >
                                    Reset Password
                                </button>
                            </div>
                        )}

                        {/* ── Password Step ── */}
                        {step === "password" && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-[#6b7c74] mb-2 uppercase tracking-wider">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••••••"
                                            required
                                            autoFocus
                                            className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-[#2e3c36] outline-none transition-all duration-200"
                                            style={{
                                                background: "rgba(255,255,255,0.05)",
                                                border: "1px solid rgba(255,255,255,0.09)",
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.border = "1px solid rgba(16,185,129,0.5)";
                                                e.target.style.background = "rgba(16,185,129,0.04)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.border = "1px solid rgba(255,255,255,0.09)";
                                                e.target.style.background = "rgba(255,255,255,0.05)";
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5c54] hover:text-[#6b7c74] transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setStep("forgot")}
                                            className="text-xs"
                                            style={{ color: "#10b981" }}
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                                                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                            </svg>
                                            Signing in…
                                        </>
                                    ) : (
                                        "Sign in →"
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep("magic")}
                                    className="w-full py-2.5 rounded-xl text-sm transition-all duration-200 text-center"
                                    style={{ color: "#4a5c54" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#10b981"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#4a5c54"; }}
                                >
                                    Use magic link instead
                                </button>
                            </form>
                        )}

                        {/* ── Magic Link Step ── */}
                        {step === "magic" && !magicSent && (
                            <div className="space-y-4">
                                <p className="text-sm text-[#4a5c54]">
                                    We'll send a secure one-click link to{" "}
                                    <span style={{ color: "#10b981" }}>{email}</span>
                                </p>
                                <button
                                    onClick={handleMagicLink}
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                                                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                            </svg>
                                            Sending…
                                        </>
                                    ) : (
                                        "Send magic link ✦"
                                    )}
                                </button>
                                <button
                                    onClick={() => setStep("password")}
                                    className="w-full text-sm transition-colors py-2"
                                    style={{ color: "#3d4f47" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b7c74"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#3d4f47"; }}
                                >
                                    ← Back to password
                                </button>
                            </div>
                        )}

                        {/* ── Magic Sent ── */}
                        {step === "magic" && magicSent && (
                            <div className="text-center py-4 space-y-4">
                                <div
                                    className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                                    style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <p className="text-white font-medium">Link sent!</p>
                                <p className="text-sm text-[#4a5c54]">
                                    Check your inbox and click the link to sign in instantly.
                                </p>
                                <button
                                    onClick={() => { setStep("email"); setMagicSent(false); }}
                                    className="text-sm transition-colors"
                                    style={{ color: "#10b981" }}
                                >
                                    Use a different email
                                </button>
                            </div>
                        )}


                        {/* ── Register Step ── */}
                        {step === "register" && (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 text-white"
                                />

                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 text-white"
                                />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 text-white"
                                />

                                <button
                                    className="w-full py-3 rounded-xl text-white"
                                    style={{ background: "#10b981" }}
                                >
                                    Create Account
                                </button>

                                <button
                                    onClick={() => setStep("email")}
                                    className="text-sm text-[#4a5c54]"
                                >
                                    ← Back to login
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-[#2e3c36] mt-6 leading-relaxed">
                        By signing in, you agree to our{" "}
                        <a href="#" className="underline transition-colors" style={{ color: "#3d4f47" }}
                            onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = "#10b981"; }}
                            onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = "#3d4f47"; }}>
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="underline transition-colors" style={{ color: "#3d4f47" }}
                            onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = "#10b981"; }}
                            onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = "#3d4f47"; }}>
                            Privacy Policy
                        </a>
                    </p>

                    <p className="text-center text-xs text-[#2e3c36] mt-3">
                        New to Expensify?{" "}
                        <a
                            href="#"
                            onClick={() => setStep("register")}
                            className="font-medium"
                            style={{ color: "#10b981" }}
                        >
                            Create a free account
                        </a>
                    </p>
                </div>
            </div>

            {/* Google Font */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #111a15 inset !important;
          -webkit-text-fill-color: #fff !important;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
        </div>
    );
}