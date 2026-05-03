import { useState, useEffect } from "react";
import { getCurriculum } from "../api";


const SUBJECTS = ["Math", "Python", "Spanish", "Science", "History", "English"];
const SUBJECT_META = {
  Math:    { icon: "E", color: "#7C3AED", light: "#EDE9FE", dark: "#5B21B6" },
  Python:  { icon: "P", color: "#0EA5E9", light: "#E0F2FE", dark: "#0369A1" },
  Spanish: { icon: "S", color: "#F59E0B", light: "#FEF3C7", dark: "#B45309" },
  Science: { icon: "C", color: "#10B981", light: "#D1FAE5", dark: "#065F46" },
  History: { icon: "H", color: "#EF4444", light: "#FEE2E2", dark: "#991B1B" },
  English: { icon: "W", color: "#EC4899", light: "#FCE7F3", dark: "#9D174D" },
};

export default function Dashboard({ userId, userName, onStartLearning, onNewSubject, onLogout }) {
  const [curricula, setCurricula] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.allSettled(
        SUBJECTS.map(s => getCurriculum(userId, s))
      );
      const found = results
        .map((r, i) => r.status === "fulfilled" && r.value.data
          ? { ...r.value.data, subject: SUBJECTS[i] } : null)
        .filter(Boolean);
      setCurricula(found);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const completedTopics = curricula.reduce((sum, c) => sum + (c.current_topic_index || 0), 0);
  const totalMins = completedTopics * 8;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const styles = {
    root: { fontFamily: "Georgia, serif", background: "#0F0F13", minHeight: "100vh", color: "#F5F3EE" },
    nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
    logo: { fontSize: 22, color: "#F5F3EE", letterSpacing: "-0.5px" },
    avatar: { width: 38, height: 38, borderRadius: "50%", background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#fff" },
    body: { maxWidth: 960, margin: "0 auto", padding: "24px 16px" },
    h1: { fontSize: 28, fontWeight: 400, lineHeight: 1.1, color: "#F5F3EE", marginBottom: 8, fontFamily: "Georgia, serif" },
    subtitle: { color: "#6B6875", fontSize: 16, fontWeight: 300, fontFamily: "system-ui, sans-serif", marginBottom: 48 },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 32 },
    statCard: { background: "#18181F", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 12 },
    statVal: { fontSize: 28, fontWeight: 600, color: "#F5F3EE", lineHeight: 1, marginBottom: 4, fontFamily: "system-ui, sans-serif" },
    statLabel: { fontSize: 10, color: "#6B6875", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "system-ui, sans-serif" },
    sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
    sectionTitle: { fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6B6875", fontWeight: 500, fontFamily: "system-ui, sans-serif" },
    newBtn: { background: "#7C3AED", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontFamily: "system-ui, sans-serif", fontWeight: 500, cursor: "pointer" },
    grid: { display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: 12 },
    card: { background: "#18181F", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 24, cursor: "pointer" },
    cardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 },
    iconWrap: { width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 },
    badge: { fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "system-ui, sans-serif" },
    cardH3: { fontSize: 20, fontWeight: 600, color: "#F5F3EE", marginBottom: 4, fontFamily: "system-ui, sans-serif" },
    topic: { fontSize: 13, color: "#6B6875", marginBottom: 20, fontFamily: "system-ui, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    track: { background: "rgba(255,255,255,0.07)", borderRadius: 100, height: 4, marginBottom: 8 },
    meta: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B6875", fontFamily: "system-ui, sans-serif" },
    footer: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" },
    continueBtn: { fontSize: 13, fontWeight: 500, color: "#A78BFA", background: "none", border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif" },
    empty: { gridColumn: "1 / -1", background: "#18181F", border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 20, padding: "60px 40px", textAlign: "center" },
  };

  return (
    <div style={styles.root}>
      <nav style={styles.nav}>
        <div style={styles.logo}>Eure<span style={{color:"#A78BFA"}}>ka</span></div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onLogout} style={{background:"none",border:"1px solid rgba(255,255,255,0.12)",color:"#6B6875",borderRadius:8,padding:"8px 16px",fontSize:13,fontFamily:"system-ui,sans-serif",cursor:"pointer"}}>Sign out</button>
          <div style={styles.avatar}>{userName ? userName[0].toUpperCase() : "E"}</div>
        </div>
      </nav>
      <div style={styles.body}>
        <h1 style={styles.h1}>{greeting}, <em style={{color:"#A78BFA"}}>Elizabeth.</em></h1>
        <p style={styles.subtitle}>Ready to pick up where you left off?</p>

        <div style={styles.statsGrid}>
          {[
            { icon: "📚", val: curricula.length, label: "Subjects Active" },
            { icon: "✓",  val: completedTopics,  label: "Topics Completed" },
            { icon: "⏱",  val: totalMins + "m",  label: "Est. Time Invested" },
          ].map(s => (
            <div style={styles.statCard} key={s.label}>
              <div style={{fontSize:20, marginBottom:16}}>{s.icon}</div>
              <div style={styles.statVal}>{s.val}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Your Subjects</span>
          <button style={styles.newBtn} onClick={onNewSubject}>+ New Subject</button>
        </div>

        <div style={styles.grid}>
          {loading && <div style={styles.empty}><p style={{color:"#6B6875"}}>Loading...</p></div>}
          {!loading && curricula.length === 0 && (
            <div style={styles.empty}>
              <p style={{color:"#6B6875", marginBottom:20}}>No subjects yet!</p>
              <button style={{...styles.newBtn, margin:"0 auto"}} onClick={onNewSubject}>+ Add a Subject</button>
            </div>
          )}
          {curricula.map((c) => {
            const meta = SUBJECT_META[c.subject] || SUBJECT_META.Math;
            const progress = Math.round((c.current_topic_index / c.topics.length) * 100);
            const currentTopic = c.topics[c.current_topic_index] || "All done!";
            const done = c.current_topic_index >= c.topics.length;
            return (
              <div style={styles.card} key={c.id} onClick={() => onStartLearning(c.subject)}
                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.transform="translateY(0)"; }}>
                <div style={styles.cardTop}>
                  <div style={{...styles.iconWrap, background: meta.light, color: meta.color}}>{meta.icon}</div>
                  <span style={{...styles.badge, background: done ? "#D1FAE5" : meta.light, color: done ? "#065F46" : meta.dark}}>
                    {done ? "Complete" : `${c.topics.length - c.current_topic_index} left`}
                  </span>
                </div>
                <div style={styles.cardH3}>{c.subject}</div>
                <div style={styles.topic}>📍 {currentTopic}</div>
                <div style={styles.track}>
                  <div style={{height:4, borderRadius:100, background: meta.color, width: progress + "%"}} />
                </div>
                <div style={styles.meta}>
                  <span>{progress}% complete</span>
                  <span>{c.current_topic_index} / {c.topics.length}</span>
                </div>
                <div style={styles.footer}>
                  <span style={{fontSize:12, color:"#6B6875", fontFamily:"system-ui,sans-serif"}}>
                    Topic {Math.min(c.current_topic_index + 1, c.topics.length)} of {c.topics.length}
                  </span>
                  <button style={styles.continueBtn}>{done ? "Review" : "Continue"} →</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
