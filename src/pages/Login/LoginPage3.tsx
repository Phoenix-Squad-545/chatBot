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

// ── Theme tokens ──────────────────────────────────────────
const T = {
    primary:        "#3b82f6",
    primaryDark:    "#2563eb",
    secondary:      "#60a5fa",
    accent:         "#93c5fd",
    // canvas / particles
    rgb:            "59,130,246",
    // left panel bg
    panelBg:        "#030712",
    // right panel bg
    rightBg:        "#04080f",
    // muted text shades (dark → light)
    muted1:         "#1e3a5f",
    muted2:         "#1a3352",
    muted3:         "#243d5c",
    muted4:         "#2d4f70",
    muted5:         "#3d6285",
    muted6:         "#4a739a",
    // autofill bg
    autofillBg:     "#050d1c",
};
// ──────────────────────────────────────────────────────────

export default function ExpensifyLogin() {
    const navigate = useNavigate();
    const [step, setStep]               = useState<AuthStep>("email");
    const [email, setEmail]             = useState("");
    const [password, setPassword]       = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading]         = useState(false);
    const [magicSent, setMagicSent]     = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);
    const [mounted, setMounted]         = useState(false);
    const [otp, setOtp]                 = useState("");
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
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cols = 12, rows = 8;
            const cellW = canvas.width  / cols;
            const cellH = canvas.height / rows;

            for (let c = 0; c <= cols; c++) {
                const alpha = 0.03 + 0.02 * Math.sin(frame * 0.01 + c * 0.4);
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${T.rgb},${alpha})`;
                ctx.lineWidth   = 0.5;
                ctx.moveTo(c * cellW, 0);
                ctx.lineTo(c * cellW, canvas.height);
                ctx.stroke();
            }
            for (let r = 0; r <= rows; r++) {
                const alpha = 0.03 + 0.02 * Math.sin(frame * 0.012 + r * 0.5);
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${T.rgb},${alpha})`;
                ctx.lineWidth   = 0.5;
                ctx.moveTo(0, r * cellH);
                ctx.lineTo(canvas.width, r * cellH);
                ctx.stroke();
            }

            particles.forEach((p) => {
                const nx = (p.x / 100) * canvas.width;
                const ny = ((p.y + frame / p.speed) % 100) / 100 * canvas.height;
                ctx.beginPath();
                ctx.arc(nx, ny, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${T.rgb},${p.opacity * (0.7 + 0.3 * Math.sin(frame * 0.02 + p.id))})`;
                ctx.fill();
            });

            frame++;
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
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

    // ── Shared input styles ───────────────────────────────
    const inputBase: React.CSSProperties = {
        background: "rgba(255,255,255,0.05)",
        border:     "1px solid rgba(255,255,255,0.09)",
    };
    const inputFocus: React.CSSProperties = {
        border:     `1px solid rgba(${T.rgb},0.55)`,
        background: `rgba(${T.rgb},0.06)`,
    };

    const applyFocus = (e: React.FocusEvent<HTMLInputElement>) =>
        Object.assign(e.target.style, inputFocus);
    const applyBlur  = (e: React.FocusEvent<HTMLInputElement>) =>
        Object.assign(e.target.style, inputBase);

    // ── Reusable atoms ────────────────────────────────────
    const PrimaryBtn = ({
        children, onClick, type = "button", disabled = false,
    }: { children: React.ReactNode; onClick?: () => void; type?: "button"|"submit"; disabled?: boolean }) => (
        <button
            type={type} onClick={onClick} disabled={disabled}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg,${T.primary},${T.primaryDark})` }}
        >
            {children}
        </button>
    );

    const GhostBtn = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
        <button
            type="button" onClick={onClick}
            className="w-full text-sm py-2 transition-colors"
            style={{ color: T.muted4 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = T.secondary; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = T.muted4; }}
        >
            {children}
        </button>
    );

    const Spinner = () => (
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );

    const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input
            {...props}
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-[#1e3a5f] outline-none transition-all duration-200"
            style={inputBase}
            onFocus={applyFocus}
            onBlur={applyBlur}
        />
    );

    return (
        <div className="min-h-screen flex font-sans overflow-hidden" style={{ background: T.panelBg }}>

            {/* ═══ LEFT PANEL ═══════════════════════════════════════ */}
            <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                {/* Radial glow */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: `radial-gradient(ellipse 70% 60% at 30% 50%, rgba(${T.rgb},0.09) 0%, transparent 70%)`,
                }} />

                <div className="relative z-10 flex flex-col h-full px-14 py-12">

                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg,${T.primary},${T.primaryDark})` }}>
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                            </svg>
                        </div>
                        <span className="text-white text-xl font-semibold tracking-tight" style={{ fontFamily: "'Sora',sans-serif" }}>
                            AR HyperAutomation
                        </span>
                    </div>

                    {/* Hero copy */}
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="mb-3">
                            <span className="text-xs font-medium tracking-[0.2em] uppercase px-3 py-1 rounded-full border"
                                style={{ color: T.secondary, borderColor: `rgba(${T.rgb},0.35)`, background: `rgba(${T.rgb},0.1)` }}>
                                15 million+ members
                            </span>
                        </div>

                        <h1 className="text-[3.2rem] leading-[1.1] font-bold text-white mb-6"
                            style={{ fontFamily: "'Sora',sans-serif", letterSpacing: "-0.03em" }}>
                            The smartest<br />
                            <span style={{ color: T.secondary }}>way to manage</span><br />
                            expenses.
                        </h1>

                        <p className="text-lg leading-relaxed mb-12 max-w-sm" style={{ color: T.muted5 }}>
                            AI-powered expense reports, corporate cards, travel booking, and global reimbursements — all in one place.
                        </p>

                        {/* Feature rotator */}
                        <div className="space-y-2 mb-12">
                            {FEATURES.map((f, i) => (
                                <div key={f.label}
                                    className="flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-500"
                                    style={{
                                        background:  i === activeFeature ? `rgba(${T.rgb},0.1)`  : "transparent",
                                        border:      i === activeFeature ? `1px solid rgba(${T.rgb},0.25)` : "1px solid transparent",
                                        transform:   i === activeFeature ? "translateX(4px)" : "none",
                                    }}>
                                    <span className="text-lg w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                                        style={{
                                            color:      i === activeFeature ? T.secondary : T.muted2,
                                            background: i === activeFeature ? `rgba(${T.rgb},0.15)` : "rgba(255,255,255,0.03)",
                                        }}>
                                        {f.icon}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium transition-colors duration-300"
                                            style={{ color: i === activeFeature ? "#fff" : T.muted3 }}>
                                            {f.label}
                                        </p>
                                        <p className="text-xs transition-colors duration-300"
                                            style={{ color: i === activeFeature ? T.muted5 : T.muted1 }}>
                                            {f.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust avatars */}
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[T.primary, T.primaryDark, T.secondary, T.accent].map((c, i) => (
                                    <div key={i}
                                        className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs text-white font-bold"
                                        style={{ backgroundColor: c, borderColor: T.panelBg }}>
                                        {["A","B","C","D"][i]}
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

            {/* ═══ RIGHT PANEL ══════════════════════════════════════ */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 relative"
                style={{ background: T.rightBg }}>

                {/* Corner glow */}
                <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{
                    background: `radial-gradient(circle at top right, rgba(${T.rgb},0.07), transparent 60%)`,
                }} />

                <div className={`w-full max-w-[420px] transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-10 lg:hidden">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg,${T.primary},${T.primaryDark})` }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-white text-lg font-semibold" style={{ fontFamily: "'Sora',sans-serif" }}>
                            AR HyperAutomation
                        </span>
                    </div>

                    {/* Auth card */}
                    <div className="rounded-2xl p-8" style={{
                        background:     "rgba(255,255,255,0.03)",
                        border:         "1px solid rgba(255,255,255,0.07)",
                        backdropFilter: "blur(12px)",
                    }}>

                        {/* Step indicator - Hide for register step */}
                        {step !== "register" && (
                            <div className="flex items-center gap-2 mb-6">
                                {(["email","password"] as AuthStep[]).map((s, i) => {
                                    const active = step === s || (i === 0 && (step === "password" || step === "magic"));
                                    return (
                                        <div key={s} className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300"
                                                style={{
                                                    background: active ? T.primary : "rgba(255,255,255,0.08)",
                                                    color:      active ? "#fff"    : T.muted3,
                                                }}>
                                                {i === 0 && step !== "email" ? "✓" : i + 1}
                                            </div>
                                            {i < 1 && (
                                                <div className="w-8 h-px transition-all duration-500"
                                                    style={{ background: step !== "email" ? T.primary : "rgba(255,255,255,0.1)" }} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <h2 className="text-2xl font-bold text-white mb-1"
                            style={{ fontFamily: "'Sora',sans-serif", letterSpacing: "-0.02em" }}>
                            {step === "email"    && "Welcome back"}
                            {step === "password" && "Enter password"}
                            {step === "magic"    && (magicSent ? "Check your inbox" : "Magic link")}
                            {step === "forgot"   && "Reset password"}
                            {step === "verify"   && "Verify OTP"}
                            {step === "reset"    && "New password"}
                            {step === "register" && "Create account"}
                        </h2>
                        <p className="text-sm mb-7" style={{ color: T.muted4 }}>
                            {step === "email"    && "Sign in to AR HyperAutomation account"}
                            {step === "password" && `Signing in as ${email}`}
                            {step === "magic"    && !magicSent && "We'll send you a one-click login link"}
                            {step === "magic"    && magicSent  && `Sent to ${email}`}
                            {step === "forgot"   && "We'll send an OTP to your email"}
                            {step === "verify"   && `Enter the OTP sent to ${email}`}
                            {step === "reset"    && "Choose a strong new password"}
                            {step === "register" && "Join AR HyperAutomation for free"}
                        </p>

                        {/* ── Email ── */}
                        {step === "email" && (
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: T.muted5 }}>
                                        Email address
                                    </label>
                                    <StyledInput type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com" required />
                                </div>
                                <PrimaryBtn type="submit">Continue with email →</PrimaryBtn>
                            </form>
                        )}

                        {/* ── Forgot ── */}
                        {step === "forgot" && (
                            <div className="space-y-4">
                                <StyledInput type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com" />
                                <PrimaryBtn onClick={() => setStep("verify")}>Send OTP</PrimaryBtn>
                                <GhostBtn onClick={() => setStep("password")}>← Back to sign in</GhostBtn>
                            </div>
                        )}

                        {/* ── Verify OTP ── */}
                        {step === "verify" && (
                            <div className="space-y-4">
                                <StyledInput value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
                                <PrimaryBtn onClick={() => setStep("reset")}>Verify OTP</PrimaryBtn>
                            </div>
                        )}

                        {/* ── Reset Password ── */}
                        {step === "reset" && (
                            <div className="space-y-4">
                                <StyledInput type={showPassword ? "text" : "password"}
                                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New Password" />
                                <StyledInput type={showPassword ? "text" : "password"}
                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm Password" />
                                <PrimaryBtn onClick={() => alert("Password Reset Success")}>Reset Password</PrimaryBtn>
                            </div>
                        )}

                        {/* ── Password ── */}
                        {step === "password" && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: T.muted5 }}>
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••••••"
                                            required autoFocus
                                            className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-[#1e3a5f] outline-none transition-all duration-200"
                                            style={inputBase}
                                            onFocus={applyFocus}
                                            onBlur={applyBlur}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                            style={{ color: T.muted4 }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = T.secondary; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = T.muted4; }}>
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
                                        <button type="button" onClick={() => setStep("forgot")}
                                            className="text-xs transition-colors"
                                            style={{ color: T.secondary }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = T.accent; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = T.secondary; }}>
                                            Forgot password?
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                                    style={{ background: `linear-gradient(135deg,${T.primary},${T.primaryDark})` }}>
                                    {loading ? <><Spinner /> Signing in…</> : "Sign in →"}
                                </button>

                                <GhostBtn onClick={() => setStep("magic")}>Use magic link instead</GhostBtn>
                            </form>
                        )}

                        {/* ── Magic Link ── */}
                        {step === "magic" && !magicSent && (
                            <div className="space-y-4">
                                <p className="text-sm" style={{ color: T.muted4 }}>
                                    We'll send a secure one-click link to{" "}
                                    <span style={{ color: T.secondary }}>{email}</span>
                                </p>
                                <button onClick={handleMagicLink} disabled={loading}
                                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                                    style={{ background: `linear-gradient(135deg,${T.primary},${T.primaryDark})` }}>
                                    {loading ? <><Spinner /> Sending…</> : "Send magic link ✦"}
                                </button>
                                <GhostBtn onClick={() => setStep("password")}>← Back to password</GhostBtn>
                            </div>
                        )}

                        {/* ── Magic Sent ── */}
                        {step === "magic" && magicSent && (
                            <div className="text-center py-4 space-y-4">
                                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                                    style={{ background: `rgba(${T.rgb},0.12)`, border: `1px solid rgba(${T.rgb},0.3)` }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                                        stroke={T.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <p className="text-white font-medium">Link sent!</p>
                                <p className="text-sm" style={{ color: T.muted4 }}>
                                    Check your inbox and click the link to sign in instantly.
                                </p>
                                <button onClick={() => { setStep("email"); setMagicSent(false); }}
                                    className="text-sm transition-colors"
                                    style={{ color: T.secondary }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = T.accent; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = T.secondary; }}>
                                    Use a different email
                                </button>
                            </div>
                        )}

                        {/* ── Register Step (Updated with full API integration) ── */}
                        {step === "register" && (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: T.muted5 }}>
                                        Full Name
                                    </label>
                                    <StyledInput 
                                        type="text" 
                                        value={registerName}
                                        onChange={(e) => setRegisterName(e.target.value)}
                                        placeholder="John Doe" 
                                        required 
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: T.muted5 }}>
                                        Email Address
                                    </label>
                                    <StyledInput 
                                        type="email" 
                                        value={registerEmail}
                                        onChange={(e) => setRegisterEmail(e.target.value)}
                                        placeholder="you@company.com" 
                                        required 
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: T.muted5 }}>
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={registerPassword}
                                            onChange={(e) => setRegisterPassword(e.target.value)}
                                            placeholder="Minimum 8 characters"
                                            required
                                            className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-[#1e3a5f] outline-none transition-all duration-200"
                                            style={inputBase}
                                            onFocus={applyFocus}
                                            onBlur={applyBlur}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                            style={{ color: T.muted4 }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = T.secondary; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = T.muted4; }}>
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
                                    <p className="text-xs mt-1" style={{ color: T.muted5 }}>
                                        Password must be at least 8 characters
                                    </p>
                                </div>

                                <div className="flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        id="acceptTerms"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        className="mt-1 rounded"
                                        style={{ accentColor: T.primary }}
                                    />
                                    <label htmlFor="acceptTerms" className="text-xs leading-relaxed" style={{ color: T.muted5 }}>
                                        I agree to the{" "}
                                        <a href="#" className="underline transition-colors" style={{ color: T.secondary }}
                                            onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = T.accent; }}
                                            onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = T.secondary; }}>
                                            Terms of Service
                                        </a>{" "}
                                        and{" "}
                                        <a href="#" className="underline transition-colors" style={{ color: T.secondary }}
                                            onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = T.accent; }}
                                            onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = T.secondary; }}>
                                            Privacy Policy
                                        </a>
                                    </label>
                                </div>

                                <PrimaryBtn type="submit" disabled={loading}>
                                    {loading ? <><Spinner /> Creating account...</> : "Create Account →"}
                                </PrimaryBtn>
                                
                                <GhostBtn onClick={() => setStep("email")}>← Back to login</GhostBtn>
                            </form>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs mt-6 leading-relaxed" style={{ color: T.muted1 }}>
                        By signing in, you agree to our{" "}
                        <a href="#" className="underline transition-colors" style={{ color: T.muted2 }}
                            onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = T.secondary; }}
                            onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = T.muted2; }}>
                            Terms of Service
                        </a>{" "}and{" "}
                        <a href="#" className="underline transition-colors" style={{ color: T.muted2 }}
                            onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = T.secondary; }}
                            onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = T.muted2; }}>
                            Privacy Policy
                        </a>
                    </p>

                    <p className="text-center text-xs mt-3" style={{ color: T.muted1 }}>
                        New to AR HyperAutomation?{" "}
                        <a href="#" onClick={() => setStep("register")} className="font-medium transition-colors"
                            style={{ color: T.secondary }}
                            onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = T.accent; }}
                            onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = T.secondary; }}>
                            Create a free account
                        </a>
                    </p>
                </div>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px ${T.autofillBg} inset !important;
          -webkit-text-fill-color: #fff !important;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
        </div>
    );
}