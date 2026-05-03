import { useState } from "react";
import { supabase } from "../supabase";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const s = {
    root: { fontFamily: "Georgia, serif", background: "#0F0F13", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
    card: { background: "#18181F", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: "48px 40px", width: "100%", maxWidth: 420 },
    logo: { fontSize: 24, color: "#F5F3EE", marginBottom: 8, textAlign: "center" },
    subtitle: { color: "#6B6875", fontSize: 14, textAlign: "center", marginBottom: 40, fontFamily: "system-ui, sans-serif" },
    label: { display: "block", fontSize: 13, color: "#6B6875", marginBottom: 6, fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" },
    input: { display: "block", width: "100%", padding: "12px 16px", background: "#0F0F13", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#F5F3EE", fontSize: 15, fontFamily: "system-ui, sans-serif", marginBottom: 20, outline: "none", boxSizing: "border-box" },
    btn: { width: "100%", padding: "14px", background: "#7C3AED", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontFamily: "system-ui, sans-serif", fontWeight: 500, cursor: "pointer", marginBottom: 16 },
    toggle: { textAlign: "center", fontSize: 14, color: "#6B6875", fontFamily: "system-ui, sans-serif" },
    toggleBtn: { color: "#A78BFA", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "system-ui, sans-serif" },
    error: { color: "#EF4444", fontSize: 13, marginBottom: 16, fontFamily: "system-ui, sans-serif", textAlign: "center" },
    success: { color: "#10B981", fontSize: 13, marginBottom: 16, fontFamily: "system-ui, sans-serif", textAlign: "center" },
  };

  const handle = async () => {
    setLoading(true); setError(""); setMessage("");
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Check your email to confirm your account!");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLogin(data.user);
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={s.root}>
      <div style={s.card}>
        <div style={s.logo}>Eure<span style={{color:"#A78BFA"}}>ka</span></div>
        <p style={s.subtitle}>{isSignup ? "Create your account" : "Welcome back"}</p>
        {error && <p style={s.error}>{error}</p>}
        {message && <p style={s.success}>{message}</p>}
        <label style={s.label}>Email</label>
        <input style={s.input} type="email" value={email}
          onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        <label style={s.label}>Password</label>
        <input style={s.input} type="password" value={password}
          onChange={e => setPassword(e.target.value)} placeholder="••••••••"
          onKeyDown={e => e.key === "Enter" && handle()} />
        <button style={s.btn} onClick={handle} disabled={loading}>
          {loading ? "Loading..." : isSignup ? "Create Account" : "Sign In"}
        </button>
        <div style={s.toggle}>
          {isSignup ? "Already have an account?" : "New here?"}
          <button style={s.toggleBtn} onClick={() => { setIsSignup(!isSignup); setError(""); setMessage(""); }}>
            {isSignup ? " Sign in" : " Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}
