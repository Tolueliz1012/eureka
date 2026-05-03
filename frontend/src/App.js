import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import TutorChat from "./pages/TutorChat";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [screen, setScreen] = useState("dashboard");
  const [subject, setSubject] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const goToChat = (subj) => { setSubject(subj); setScreen("chat"); };
  const goToDashboard = () => { setSubject(null); setScreen("dashboard"); };
  const logout = async () => { await supabase.auth.signOut(); setUser(null); };

  if (authLoading) return (
    <div style={{ background: "#0F0F13", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B6875", fontFamily: "system-ui, sans-serif" }}>
      Loading...
    </div>
  );

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div style={{ minHeight: "100vh", background: "#0F0F13", fontFamily: "system-ui, sans-serif" }}>
      {screen !== "dashboard" && (
        <div style={{ background: "#18181F", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={goToDashboard} style={{ background: "none", border: "none", cursor: "pointer", color: "#A78BFA", fontSize: 15, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>
            ← Dashboard
          </button>
          {subject && <span style={{ color: "#6B6875" }}>{subject}</span>}
          <button onClick={logout} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B6875", fontSize: 13, fontFamily: "system-ui, sans-serif" }}>
            Sign out
          </button>
        </div>
      )}
      {screen === "dashboard" && <Dashboard userId={user.id} userName={user.email.split("@")[0]} onStartLearning={goToChat} onNewSubject={() => setScreen("onboarding")} onLogout={logout} />}
      {screen === "onboarding" && <Onboarding userId={user.id} onComplete={(subj) => goToChat(subj)} />}
      {screen === "chat" && subject && <TutorChat userId={user.id} userName={user.email.split("@")[0]} subject={subject} />}
    </div>
  );
}
