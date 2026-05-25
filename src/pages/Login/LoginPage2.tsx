import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loginService } from "../../services/authService";

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
    
    // Registration form state
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    
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
                ctx.strokeStyle = `rgba(79,70,229,${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let r = 0; r <= rows; r++) {
                const y = r * cellH;
                const alpha = 0.03 + 0.02 * Math.sin(frame * 0.012 + r * 0.5);
                ctx.beginPath();
                ctx.strokeStyle = `rgba(79,70,229,${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            particles.forEach((p) => {
                const nx = (p.x / 100) * canvas.width;
                const ny = ((p.y + (frame / p.speed)) % 100) / 100 * canvas.height;
                ctx.beginPath();
                ctx.arc(nx, ny, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(79,70,229,${p.opacity * (0.7 + 0.3 * Math.sin(frame * 0.02 + p.id))})`;
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
        if (email === "admin@gmail.com" && password === "admin@123") {
            setLoading(false);
            localStorage.setItem("isAuth", "true");
            navigate("/");
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

    // ✅ Registration API call
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!registerName.trim()) {
            alert("Please enter your full name");
            return;
        }
        if (!registerEmail.trim()) {
            alert("Please enter your email");
            return;
        }
        if (!registerPassword.trim()) {
            alert("Please enter a password");
            return;
        }
        if (registerPassword.length < 8) {
            alert("Password must be at least 8 characters long");
            return;
        }
        if (!acceptTerms) {
            alert("Please accept the Terms of Service and Privacy Policy");
            return;
        }

        setLoading(true);

        // Prepare payload
        const payload = {
            name: registerName,
            email: registerEmail,
            password: registerPassword,
            acceptTerms: acceptTerms
        };

        try {
            // Replace this URL with your actual API endpoint
          const response = await loginService(payload);

            if (response) {
                // Registration successful
                alert("Registration successful! Please login.");
                
                // Auto-fill email for login
                setEmail(registerEmail);
                setStep("email");
                
                // Clear registration form
                setRegisterName("");
                setRegisterEmail("");
                setRegisterPassword("");
                setAcceptTerms(false);
            } else {
                // Handle API errors
                alert(response.message || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    // Reusable input style helpers
    const inputBase = {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.09)",
    };
    const inputFocus = {
        border: "1px solid rgba(79,70,229,0.55)",
        background: "rgba(79,70,229,0.06)",
    };

    const PrimaryButton = ({
        children,
        onClick,
        type = "button",
        disabled = false,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        type?: "button" | "submit";
        disabled?: boolean;
    }) => (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
        >
            {children}
        </button>
    );

    const Spinner = () => (
        <>
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
        </>
    );

    return (
        <div className="min-h-screen flex bg-[#07070f] font-sans overflow-hidden">

            {/* ── Left Panel ── */}
            <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse 70% 60% at 30% 50%, rgba(79,70,229,0.1) 0%, transparent 70%)",
                    }}
                />

                <div className="relative z-10 flex flex-col h-full px-14 py-12">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-16">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                            </svg>
                        </div>
                        <span className="text-white text-xl font-semibold tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                            AR HyperAutomation
                        </span>
                    </div>

                    {/* Hero */}
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="mb-3">
                            <span
                                className="text-xs font-medium tracking-[0.2em] uppercase px-3 py-1 rounded-full border"
                                style={{
                                    color: "#818cf8",
                                    borderColor: "rgba(79,70,229,0.35)",
                                    background: "rgba(79,70,229,0.1)",
                                }}
                            >
                                15 million+ members
                            </span>
                        </div>

                        <h1
                            className="text-[3.2rem] leading-[1.1] font-bold text-white mb-6"
                            style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.03em" }}
                        >
                            The smartest<br />
                            <span style={{ color: "#818cf8" }}>way to manage</span><br />
                            expenses.
                        </h1>

                        <p className="text-[#4a4470] text-lg leading-relaxed mb-12 max-w-sm">
                            AI-powered expense reports, corporate cards, travel booking, and global reimbursements — all in one place.
                        </p>

                        {/* Feature Rotator */}
                        <div className="space-y-2 mb-12">
                            {FEATURES.map((f, i) => (
                                <div
                                    key={f.label}
                                    className="flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-500"
                                    style={{
                                        background: i === activeFeature ? "rgba(79,70,229,0.1)" : "transparent",
                                        border: i === activeFeature ? "1px solid rgba(79,70,229,0.25)" : "1px solid transparent",
                                        transform: i === activeFeature ? "translateX(4px)" : "none",
                                    }}
                                >
                                    <span
                                        className="text-lg w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                                        style={{
                                            color: i === activeFeature ? "#818cf8" : "#2a2545",
                                            background: i === activeFeature ? "rgba(79,70,229,0.15)" : "rgba(255,255,255,0.03)",
                                        }}
                                    >
                                        {f.icon}
                                    </span>
                                    <div>
                                        <p
                                            className="text-sm font-medium transition-colors duration-300"
                                            style={{ color: i === activeFeature ? "#fff" : "#332e5c" }}
                                        >
                                            {f.label}
                                        </p>
                                        <p
                                            className="text-xs transition-colors duration-300"
                                            style={{ color: i === activeFeature ? "#4a4470" : "#1e1a38" }}
                                        >
                                            {f.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust avatars */}
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {["4f46e5", "7c3aed", "6366f1", "a78bfa"].map((c, i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 rounded-full border-2 border-[#07070f] flex items-center justify-center text-xs text-white font-bold"
                                        style={{ backgroundColor: `#${c}` }}
                                    >
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
                style={{ background: "#09090f" }}
            >
                <div
                    className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
                    style={{
                        background: "radial-gradient(circle at top right, rgba(79,70,229,0.07), transparent 60%)",
                    }}
                />

                <div
                    className={`w-full max-w-[420px] transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                >
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-10 lg:hidden">
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-white text-lg font-semibold" style={{ fontFamily: "'Sora', sans-serif" }}>
                            AR HyperAutomation
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
                        {/* Step indicator - Only show for non-register steps */}
                        {step !== "register" && (
                            <div className="flex items-center gap-2 mb-6">
                                {(["email", "password"] as AuthStep[]).map((s, i) => (
                                    <div key={s} className="flex items-center gap-2">
                                        <div
                                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300"
                                            style={{
                                                background:
                                                    step === s || (i === 0 && step === "password") || (i === 0 && step === "magic")
                                                        ? "#4f46e5"
                                                        : "rgba(255,255,255,0.08)",
                                                color:
                                                    step === s || (i === 0 && step === "password") || (i === 0 && step === "magic")
                                                        ? "#fff"
                                                        : "#332e5c",
                                            }}
                                        >
                                            {i === 0 && step !== "email" ? "✓" : i + 1}
                                        </div>
                                        {i < 1 && (
                                            <div
                                                className="w-8 h-px transition-all duration-500"
                                                style={{ background: step !== "email" ? "#4f46e5" : "rgba(255,255,255,0.1)" }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <h2
                            className="text-2xl font-bold text-white mb-1"
                            style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}
                        >
                            {step === "email" && "Welcome back"}
                            {step === "password" && "Enter password"}
                            {step === "magic" && (magicSent ? "Check your inbox" : "Magic link")}
                            {step === "forgot" && "Reset password"}
                            {step === "verify" && "Verify OTP"}
                            {step === "reset" && "New password"}
                            {step === "register" && "Create account"}
                        </h2>
                        <p className="text-sm text-[#332e5c] mb-7">
                            {step === "email" && "Sign in to AR HyperAutomation account"}
                            {step === "password" && `Signing in as ${email}`}
                            {step === "magic" && !magicSent && "We'll send you a one-click login link"}
                            {step === "magic" && magicSent && `Sent to ${email}`}
                            {step === "forgot" && "We'll send an OTP to your email"}
                            {step === "verify" && `Enter the OTP sent to ${email}`}
                            {step === "reset" && "Choose a strong new password"}
                            {step === "register" && "Join AR HyperAutomation for free"}
                        </p>

                        {/* ── Email Step ── */}
                        {step === "email" && (
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-[#4a4470] mb-2 uppercase tracking-wider">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        required
                                        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-[#221e40] outline-none transition-all duration-200"
                                        style={inputBase}
                                        onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                                        onBlur={(e) => Object.assign(e.target.style, inputBase)}
                                    />
                                </div>
                                <PrimaryButton type="submit">Continue with email →</PrimaryButton>
                            </form>
                        )}

                        {/* ── Forgot Password Step ── */}
                        {step === "forgot" && (
                            <div className="space-y-4">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-[#221e40] outline-none transition-all duration-200"
                                    style={inputBase}
                                    onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                                    onBlur={(e) => Object.assign(e.target.style, inputBase)}
                                />
                                <PrimaryButton onClick={() => setStep("verify")}>Send OTP</PrimaryButton>
                                <button
                                    onClick={() => setStep("password")}
                                    className="w-full text-sm py-2 transition-colors"
                                    style={{ color: "#332e5c" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#818cf8"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#332e5c"; }}
                                >
                                    ← Back to sign in
                                </button>
                            </div>
                        )}

                        {/* ── Verify OTP Step ── */}
                        {step === "verify" && (
                            <div className="space-y-4">
                                <input
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-[#221e40] outline-none transition-all duration-200"
                                    style={inputBase}
                                    onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                                    onBlur={(e) => Object.assign(e.target.style, inputBase)}
                                />
                                <PrimaryButton onClick={() => setStep("reset")}>Verify OTP</PrimaryButton>
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
                                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-[#221e40] outline-none transition-all duration-200"
                                    style={inputBase}
                                    onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                                    onBlur={(e) => Object.assign(e.target.style, inputBase)}
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm Password"
                                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-[#221e40] outline-none transition-all duration-200"
                                    style={inputBase}
                                    onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                                    onBlur={(e) => Object.assign(e.target.style, inputBase)}
                                />
                                <PrimaryButton onClick={() => alert("Password Reset Success")}>Reset Password</PrimaryButton>
                            </div>
                        )}

                        {/* ── Password Step ── */}
                        {step === "password" && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-[#4a4470] mb-2 uppercase tracking-wider">
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
                                            className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-[#221e40] outline-none transition-all duration-200"
                                            style={inputBase}
                                            onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                                            onBlur={(e) => Object.assign(e.target.style, inputBase)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#332e5c] hover:text-[#818cf8] transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                                    <line x1="1" y1="1" x2="23" y2="23" />
                                                </svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setStep("forgot")}
                                            className="text-xs transition-colors"
                                            style={{ color: "#818cf8" }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#a5b4fc"; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#818cf8"; }}
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                                    style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                                >
                                    {loading ? <><Spinner /> Signing in…</> : "Sign in →"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep("magic")}
                                    className="w-full py-2.5 rounded-xl text-sm transition-all duration-200 text-center"
                                    style={{ color: "#332e5c" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#818cf8"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#332e5c"; }}
                                >
                                    Use magic link instead
                                </button>
                            </form>
                        )}

                        {/* ── Magic Link Step ── */}
                        {step === "magic" && !magicSent && (
                            <div className="space-y-4">
                                <p className="text-sm text-[#332e5c]">
                                    We'll send a secure one-click link to{" "}
                                    <span style={{ color: "#818cf8" }}>{email}</span>
                                </p>
                                <button
                                    onClick={handleMagicLink}
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                                    style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                                >
                                    {loading ? <><Spinner /> Sending…</> : "Send magic link ✦"}
                                </button>
                                <button
                                    onClick={() => setStep("password")}
                                    className="w-full text-sm transition-colors py-2"
                                    style={{ color: "#221e40" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#4a4470"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#221e40"; }}
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
                                    style={{
                                        background: "rgba(79,70,229,0.12)",
                                        border: "1px solid rgba(79,70,229,0.3)",
                                    }}
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <p className="text-white font-medium">Link sent!</p>
                                <p className="text-sm text-[#332e5c]">
                                    Check your inbox and click the link to sign in instantly.
                                </p>
                                <button
                                    onClick={() => { setStep("email"); setMagicSent(false); }}
                                    className="text-sm transition-colors"
                                    style={{ color: "#818cf8" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#a5b4fc"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#818cf8"; }}
                                >
                                    Use a different email
                                </button>
                            </div>
                        )}

                        {/* ── Register Step (Updated with API integration) ── */}
                        {step === "register" && (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-[#4a4470] mb-2 uppercase tracking-wider">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={registerName}
                                        onChange={(e) => setRegisterName(e.target.value)}
                                        placeholder="John Doe"
                                        required
                                        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-[#221e40] outline-none transition-all duration-200"
                                        style={inputBase}
                                        onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                                        onBlur={(e) => Object.assign(e.target.style, inputBase)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#4a4470] mb-2 uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={registerEmail}
                                        onChange={(e) => setRegisterEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        required
                                        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-[#221e40] outline-none transition-all duration-200"
                                        style={inputBase}
                                        onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                                        onBlur={(e) => Object.assign(e.target.style, inputBase)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#4a4470] mb-2 uppercase tracking-wider">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={registerPassword}
                                            onChange={(e) => setRegisterPassword(e.target.value)}
                                            placeholder="Minimum 8 characters"
                                            required
                                            className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-[#221e40] outline-none transition-all duration-200"
                                            style={inputBase}
                                            onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                                            onBlur={(e) => Object.assign(e.target.style, inputBase)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#332e5c] hover:text-[#818cf8] transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                                    <line x1="1" y1="1" x2="23" y2="23" />
                                                </svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-[#4a4470] mt-1">Password must be at least 8 characters</p>
                                </div>

                                <div className="flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        id="acceptTerms"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        className="mt-1 rounded"
                                        style={{ accentColor: "#4f46e5" }}
                                    />
                                    <label htmlFor="acceptTerms" className="text-xs text-[#4a4470] leading-relaxed">
                                        I agree to the{" "}
                                        <a href="#" className="underline transition-colors" style={{ color: "#818cf8" }}>
                                            Terms of Service
                                        </a>{" "}
                                        and{" "}
                                        <a href="#" className="underline transition-colors" style={{ color: "#818cf8" }}>
                                            Privacy Policy
                                        </a>
                                    </label>
                                </div>

                                <PrimaryButton type="submit" disabled={loading}>
                                    {loading ? <><Spinner /> Creating account...</> : "Create Account →"}
                                </PrimaryButton>

                                <button
                                    type="button"
                                    onClick={() => setStep("email")}
                                    className="w-full text-sm py-2 transition-colors"
                                    style={{ color: "#332e5c" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#818cf8"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#332e5c"; }}
                                >
                                    ← Back to login
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-[#1e1a38] mt-6 leading-relaxed">
                        By signing in, you agree to our{" "}
                        <a
                            href="#"
                            className="underline transition-colors"
                            style={{ color: "#221e40" }}
                            onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = "#818cf8"; }}
                            onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = "#221e40"; }}
                        >
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                            href="#"
                            className="underline transition-colors"
                            style={{ color: "#221e40" }}
                            onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = "#818cf8"; }}
                            onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = "#221e40"; }}
                        >
                            Privacy Policy
                        </a>
                    </p>

                    <p className="text-center text-xs text-[#1e1a38] mt-3">
                        New to AR HyperAutomation?{" "}
                        <a
                            href="#"
                            onClick={() => setStep("register")}
                            className="font-medium transition-colors"
                            style={{ color: "#818cf8" }}
                            onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = "#a5b4fc"; }}
                            onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = "#818cf8"; }}
                        >
                            Create a free account
                        </a>
                    </p>
                </div>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #0c0b1e inset !important;
          -webkit-text-fill-color: #fff !important;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
        </div>
    );
}