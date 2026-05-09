import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from "recharts";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  navy: "#0F172A",
  blue: "#2563EB",
  teal: "#0D9488",
  orange: "#F59E0B",
  red: "#DC2626",
  gray: "#64748B",
  border: "#E2E8F0",
  lightBlue: "#EFF6FF",
  lightTeal: "#F0FDFA",
  lightOrange: "#FFFBEB",
  lightRed: "#FEF2F2",
};

const CONGESTION_COLOR = {
  CRITICAL: T.red,
  HIGH: T.orange,
  MODERATE: T.blue,
  LOW: T.teal,
};
const CONGESTION_BG = {
  CRITICAL: T.lightRed,
  HIGH: T.lightOrange,
  MODERATE: T.lightBlue,
  LOW: T.lightTeal,
};

// ─── DATA ────────────────────────────────────────────────────────────────────
const JUNCTIONS = [
  { id: 1, name: "Dadar TT Circle", x: 38, y: 52, congestion: "HIGH", volume: 2840, speed: 14, weather: "Rainy", rainfall: 18, delay: 22, aiProb: 0.87, signal: { green: 75, red: 45, yellow: 5 }, trend: [1800,2100,2400,2600,2840,2900,2750], zone: "Central" },
  { id: 2, name: "Bandra Kurla Complex", x: 58, y: 42, congestion: "MODERATE", volume: 1920, speed: 28, weather: "Cloudy", rainfall: 4, delay: 10, aiProb: 0.52, signal: { green: 50, red: 50, yellow: 5 }, trend: [1400,1500,1700,1800,1920,1850,1780], zone: "Western" },
  { id: 3, name: "Sion Junction", x: 44, y: 46, congestion: "HIGH", volume: 2560, speed: 16, weather: "Rainy", rainfall: 22, delay: 19, aiProb: 0.81, signal: { green: 70, red: 40, yellow: 5 }, trend: [1600,1900,2100,2300,2560,2600,2480], zone: "Central" },
  { id: 4, name: "Kurla West", x: 52, y: 50, congestion: "CRITICAL", volume: 3200, speed: 8, weather: "Heavy Rain", rainfall: 35, delay: 34, aiProb: 0.94, signal: { green: 90, red: 30, yellow: 5 }, trend: [2000,2400,2700,2900,3100,3200,3150], zone: "Eastern" },
  { id: 5, name: "Andheri West", x: 35, y: 28, congestion: "MODERATE", volume: 1650, speed: 32, weather: "Partly Cloudy", rainfall: 2, delay: 7, aiProb: 0.41, signal: { green: 45, red: 55, yellow: 5 }, trend: [1200,1300,1450,1550,1650,1600,1580], zone: "Western" },
  { id: 6, name: "Worli Sea Face", x: 28, y: 60, congestion: "LOW", volume: 890, speed: 52, weather: "Clear", rainfall: 0, delay: 3, aiProb: 0.18, signal: { green: 30, red: 60, yellow: 5 }, trend: [700,750,800,850,890,870,860], zone: "Western" },
  { id: 7, name: "CST / Fort", x: 24, y: 74, congestion: "MODERATE", volume: 1780, speed: 24, weather: "Cloudy", rainfall: 6, delay: 12, aiProb: 0.58, signal: { green: 55, red: 45, yellow: 5 }, trend: [1100,1300,1500,1650,1780,1720,1690], zone: "South" },
  { id: 8, name: "Ghatkopar East", x: 66, y: 48, congestion: "LOW", volume: 980, speed: 48, weather: "Clear", rainfall: 0, delay: 4, aiProb: 0.22, signal: { green: 35, red: 55, yellow: 5 }, trend: [800,850,900,940,980,960,950], zone: "Eastern" },
  { id: 9, name: "Powai Lake Rd", x: 68, y: 32, congestion: "LOW", volume: 740, speed: 58, weather: "Sunny", rainfall: 0, delay: 2, aiProb: 0.12, signal: { green: 25, red: 65, yellow: 5 }, trend: [600,650,680,710,740,730,720], zone: "Eastern" },
  { id: 10, name: "Mahim Causeway", x: 30, y: 48, congestion: "HIGH", volume: 2290, speed: 18, weather: "Rainy", rainfall: 20, delay: 17, aiProb: 0.76, signal: { green: 65, red: 35, yellow: 5 }, trend: [1500,1700,1900,2100,2290,2350,2210], zone: "Western" },
  { id: 11, name: "Chembur Naka", x: 62, y: 58, congestion: "MODERATE", volume: 1540, speed: 30, weather: "Cloudy", rainfall: 5, delay: 9, aiProb: 0.48, signal: { green: 48, red: 52, yellow: 5 }, trend: [1100,1200,1350,1420,1540,1490,1470], zone: "Eastern" },
  { id: 12, name: "Lower Parel", x: 32, y: 64, congestion: "MODERATE", volume: 1680, speed: 26, weather: "Drizzle", rainfall: 8, delay: 11, aiProb: 0.55, signal: { green: 52, red: 48, yellow: 5 }, trend: [1200,1350,1480,1580,1680,1640,1620], zone: "South" },
];

const ROUTES = [
  [1,3],[3,4],[4,2],[2,5],[5,10],[10,1],[1,12],[12,7],[7,6],[6,10],[3,11],[11,8],[8,9],[8,4],[2,11],[4,11]
];

const TRAFFIC_24H = Array.from({length:24},(_,i)=>({
  hour: `${String(i).padStart(2,"0")}:00`,
  actual: Math.round(500 + 2500*Math.max(0,Math.sin((i-8)*Math.PI/10)) + (i>17&&i<21?800:0)),
  predicted: Math.round(480 + 2400*Math.max(0,Math.sin((i-8)*Math.PI/10)) + (i>17&&i<21?750:0) + Math.random()*80),
}));

const ZONE_DATA = [
  { zone: "Central", volume: 5400, congestion: 82 },
  { zone: "Western", volume: 4820, congestion: 68 },
  { zone: "Eastern", volume: 3760, congestion: 44 },
  { zone: "South", volume: 2460, congestion: 56 },
];

const CONGESTION_DIST = [
  { name: "Critical", value: 1, color: T.red },
  { name: "High", value: 4, color: T.orange },
  { name: "Moderate", value: 5, color: T.blue },
  { name: "Low", value: 3, color: T.teal },
];

// ─── TRAFFIC LIGHT ───────────────────────────────────────────────────────────
function TrafficLight({ junction, phase }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, background:T.bg, border:`1px solid ${T.border}`, borderRadius:12, padding:"12px 10px", width:72, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
      <div style={{ width:20, height:20, borderRadius:"50%", background: phase==="red" ? T.red : "#E2E8F0", boxShadow: phase==="red" ? `0 0 10px ${T.red}88` : "none", transition:"all 0.4s" }} />
      <div style={{ width:20, height:20, borderRadius:"50%", background: phase==="yellow" ? T.orange : "#E2E8F0", boxShadow: phase==="yellow" ? `0 0 10px ${T.orange}88` : "none", transition:"all 0.4s" }} />
      <div style={{ width:20, height:20, borderRadius:"50%", background: phase==="green" ? T.teal : "#E2E8F0", boxShadow: phase==="green" ? `0 0 10px ${T.teal}88` : "none", transition:"all 0.4s" }} />
      <div style={{ fontSize:9, color:T.gray, marginTop:2, textAlign:"center", maxWidth:64, lineHeight:1.3, fontWeight:500 }}>{junction.name.split(" ")[0]}</div>
      <span style={{ fontSize:9, fontWeight:700, color:CONGESTION_COLOR[junction.congestion], background:CONGESTION_BG[junction.congestion], padding:"2px 6px", borderRadius:20 }}>{junction.congestion}</span>
    </div>
  );
}

// ─── NODE DETAIL PANEL ───────────────────────────────────────────────────────
function NodePanel({ node, onClose }) {
  if (!node) return null;
  const trendData = node.trend.map((v,i)=>({ t:`-${6-i}h`, v }));
  const color = CONGESTION_COLOR[node.congestion];
  return (
    <div style={{ position:"absolute", top:12, right:12, width:300, background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:20, zIndex:50, boxShadow:"0 8px 32px rgba(15,23,42,0.12)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:T.navy }}>{node.name}</div>
          <div style={{ fontSize:11, color:T.gray, marginTop:2 }}>Zone: {node.zone} · J-{String(node.id).padStart(3,"0")}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:10, fontWeight:700, color:color, background:CONGESTION_BG[node.congestion], padding:"3px 10px", borderRadius:20 }}>{node.congestion}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.gray, cursor:"pointer", fontSize:16, lineHeight:1 }}>✕</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
        {[
          ["Traffic Volume", `${node.volume.toLocaleString()} veh/hr`],
          ["Avg Speed", `${node.speed} km/h`],
          ["Predicted Delay", `${node.delay} min`],
          ["Rainfall", `${node.rainfall} mm/hr`],
          ["Weather", node.weather],
          ["AI Risk Score", `${Math.round(node.aiProb*100)}%`],
        ].map(([label,val])=>(
          <div key={label} style={{ background:T.bg, borderRadius:8, padding:"8px 10px" }}>
            <div style={{ fontSize:10, color:T.gray }}>{label}</div>
            <div style={{ fontSize:12, fontWeight:600, color:T.navy, marginTop:2 }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ background:T.bg, borderRadius:8, padding:"10px 12px", marginBottom:12 }}>
        <div style={{ fontSize:10, color:T.gray, marginBottom:6 }}>Congestion Probability (Random Forest)</div>
        <div style={{ height:8, background:T.border, borderRadius:4, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${node.aiProb*100}%`, background:color, borderRadius:4, transition:"width 0.8s" }} />
        </div>
        <div style={{ fontSize:11, color:color, marginTop:4, fontWeight:700 }}>{Math.round(node.aiProb*100)}% probability</div>
      </div>

      <div style={{ background:T.bg, borderRadius:8, padding:"10px 12px", marginBottom:12 }}>
        <div style={{ fontSize:10, color:T.gray, marginBottom:8 }}>Signal Timing Recommendation</div>
        <div style={{ display:"flex", gap:8 }}>
          {[["🟢","Green",`${node.signal.green}s`],["🟡","Yellow",`${node.signal.yellow}s`],["🔴","Red",`${node.signal.red}s`]].map(([e,label,t])=>(
            <div key={label} style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontSize:16 }}>{e}</div>
              <div style={{ fontSize:10, color:T.gray }}>{label}</div>
              <div style={{ fontSize:13, fontWeight:700, color:T.navy }}>{t}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:10, color:T.gray, marginTop:8, padding:"6px 8px", background:T.border+"44", borderRadius:6 }}>
          {node.congestion==="CRITICAL"||node.congestion==="HIGH"
            ? "Extended green phase — AI override applied"
            : node.congestion==="LOW"
            ? "Short cycle — energy-saving mode"
            : "Standard adaptive timing"}
        </div>
      </div>

      <div style={{
  background:T.bg,
  borderRadius:8,
  padding:"10px 12px",
  fontSize:11,
  color:T.gray,
  textAlign:"center"
}}>
  Historical traffic trend available in analytics dashboard
</div>
</div>
  );
}

// ─── SVG MAP ─────────────────────────────────────────────────────────────────
function TrafficMap({ onNodeClick, selectedNode }) {
  return (
    <div style={{ position:"relative", width:"100%", height:"100%" }}>
      <svg viewBox="0 0 100 100" style={{ width:"100%", height:"100%", background:"transparent" }} preserveAspectRatio="xMidYMid meet">
        {[20,40,60,80].map(v=>(
          <g key={v}>
            <line x1={v} y1={0} x2={v} y2={100} stroke={T.border} strokeWidth={0.25} />
            <line x1={0} y1={v} x2={100} y2={v} stroke={T.border} strokeWidth={0.25} />
          </g>
        ))}
        {ROUTES.map(([a,b],i)=>{
          const na=JUNCTIONS[a-1], nb=JUNCTIONS[b-1];
          const bothHigh = (na.congestion==="HIGH"||na.congestion==="CRITICAL")&&(nb.congestion==="HIGH"||nb.congestion==="CRITICAL");
          return (
            <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={bothHigh ? T.orange : "#CBD5E1"} strokeWidth={bothHigh?0.7:0.4} opacity={0.8} />
          );
        })}
        {JUNCTIONS.map(j=>{
          const isSelected = selectedNode?.id===j.id;
          const r = j.congestion==="CRITICAL"?3.2:j.congestion==="HIGH"?2.8:2.4;
          const color = CONGESTION_COLOR[j.congestion];
          return (
            <g key={j.id} style={{ cursor:"pointer" }} onClick={()=>onNodeClick(j)}>
              {(j.congestion==="CRITICAL"||j.congestion==="HIGH") && (
                <circle cx={j.x} cy={j.y} r={r+2} fill="none" stroke={color} strokeWidth={0.4} opacity={0.3}>
                  <animate attributeName="r" from={r+1} to={r+4} dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from={0.4} to={0} dur="2.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={j.x} cy={j.y} r={isSelected?r+1.2:r} fill={CONGESTION_BG[j.congestion]} stroke={color} strokeWidth={isSelected?1.4:0.8} />
              <circle cx={j.x} cy={j.y} r={1} fill={color} />
              <text x={j.x} y={j.y-r-1.8} textAnchor="middle" fontSize={2.4} fill={T.gray} fontFamily="Arial">{j.name.split(" ")[0]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:13, fontWeight:700, color:T.navy, letterSpacing:0.3 }}>{title}</div>
      {subtitle && <div style={{ fontSize:11, color:T.gray, marginTop:2 }}>{subtitle}</div>}
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
function Card({ children, style={} }) {
  return (
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(15,23,42,0.06)", ...style }}>
      {children}
    </div>
  );
}

// ─── STAT BADGE ──────────────────────────────────────────────────────────────
function StatBadge({ label, value, color=T.blue, bg=T.lightBlue }) {
  return (
    <div style={{ background:bg, borderRadius:10, padding:"10px 14px", border:`1px solid ${color}22` }}>
      <div style={{ fontSize:10, color:T.gray, marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:15, fontWeight:700, color }}>{value}</div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeTab, setActiveTab] = useState("map");
  const [lightPhase, setLightPhase] = useState({});
  const [signalMode, setSignalMode] = useState("adaptive");

  useEffect(()=>{
    const id = setInterval(()=>{
      setLightPhase(prev=>{
        const next={...prev};
        JUNCTIONS.forEach(j=>{ const cur=prev[j.id]||0; next[j.id]=(cur+1)%3; });
        return next;
      });
    },3500);
    return ()=>clearInterval(id);
  },[]);

  const getPhase = j => (["green","yellow","red"][lightPhase[j.id]||0]);

  const tabs = [
    { id:"map", label:"Traffic Map" },
    { id:"analytics", label:"Analytics" },
    { id:"signals", label:"Signal Control" },
    { id:"summary", label:"Project Summary" },
  ];

  const critCount = JUNCTIONS.filter(j=>j.congestion==="CRITICAL").length;
  const highCount = JUNCTIONS.filter(j=>j.congestion==="HIGH").length;
  const modCount = JUNCTIONS.filter(j=>j.congestion==="MODERATE").length;
  const lowCount = JUNCTIONS.filter(j=>j.congestion==="LOW").length;

  const tooltipStyle = { background:T.card, border:`1px solid ${T.border}`, borderRadius:8, color:T.navy, fontSize:11, boxShadow:"0 4px 12px rgba(0,0,0,0.08)" };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.navy, fontFamily:"'Segoe UI', Arial, sans-serif", fontSize:13 }}>

      {/* ── HEADER ── */}
      <div style={{ background:T.card, borderBottom:`2px solid ${T.blue}`, padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 8px rgba(37,99,235,0.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:42, height:42, borderRadius:10, background:T.blue, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontSize:20 }}>🚦</span>
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:T.navy, letterSpacing:0.2, lineHeight:1.2 }}>
              AI-Based Smart Traffic Monitoring &amp; Congestion Prediction System
            </div>
            <div style={{ fontSize:11, color:T.gray, marginTop:2 }}>Mumbai Metropolitan Area · Machine Learning Demonstration · Academic Project</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          {[
            { label:"CRITICAL", count:critCount, color:T.red, bg:T.lightRed },
            { label:"HIGH", count:highCount, color:T.orange, bg:T.lightOrange },
            { label:"MODERATE", count:modCount, color:T.blue, bg:T.lightBlue },
            { label:"LOW", count:lowCount, color:T.teal, bg:T.lightTeal },
          ].map(s=>(
            <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.color}33`, borderRadius:8, padding:"6px 12px", textAlign:"center" }}>
              <div style={{ fontSize:16, fontWeight:800, color:s.color }}>{s.count}</div>
              <div style={{ fontSize:9, color:T.gray, fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ background:T.card, borderBottom:`1px solid ${T.border}`, padding:"0 28px", display:"flex", gap:0 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
            padding:"12px 20px", background:"transparent", border:"none",
            borderBottom: activeTab===t.id ? `2px solid ${T.blue}` : "2px solid transparent",
            color: activeTab===t.id ? T.blue : T.gray,
            cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit",
            letterSpacing:0.3, transition:"all 0.2s"
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding:"20px 28px", maxWidth:1400, margin:"0 auto" }}>

        {/* ── MAP TAB ── */}
        {activeTab==="map" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20 }}>
            <Card style={{ padding:0, overflow:"hidden" }}>
              <div style={{ padding:"14px 18px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:T.navy }}>Mumbai Traffic Junction Map</div>
                  <div style={{ fontSize:11, color:T.gray }}>Click any junction node to view details</div>
                </div>
                <div style={{ display:"flex", gap:12 }}>
                  {Object.entries(CONGESTION_COLOR).map(([k,v])=>(
                    <span key={k} style={{ fontSize:10, color:v, display:"flex", alignItems:"center", gap:4, fontWeight:600 }}>
                      <span style={{ width:9, height:9, borderRadius:"50%", background:v, display:"inline-block" }} />{k}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ height:480, background:"#F1F5F9", position:"relative" }}>
                <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(${T.border} 1px, transparent 1px), linear-gradient(90deg, ${T.border} 1px, transparent 1px)`, backgroundSize:"40px 40px", opacity:0.5 }} />
                <TrafficMap onNodeClick={setSelectedNode} selectedNode={selectedNode} />
                {selectedNode && <NodePanel node={selectedNode} onClose={()=>setSelectedNode(null)} />}
              </div>
            </Card>

            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {/* Zone Congestion */}
              <Card>
                <SectionHeader title="Zone Congestion Levels" />
                {ZONE_DATA.map(z=>(
                  <div key={z.zone} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:12, color:T.navy, fontWeight:500 }}>{z.zone} Zone</span>
                      <span style={{ fontSize:12, fontWeight:700, color: z.congestion>75?T.red:z.congestion>55?T.orange:T.teal }}>{z.congestion}%</span>
                    </div>
                    <div style={{ height:6, background:T.border, borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${z.congestion}%`, background: z.congestion>75?T.red:z.congestion>55?T.orange:T.teal, borderRadius:3, transition:"width 0.6s" }} />
                    </div>
                    <div style={{ fontSize:10, color:T.gray, marginTop:2 }}>{z.volume.toLocaleString()} veh/hr</div>
                  </div>
                ))}
              </Card>

              {/* Junction list */}
              <Card style={{ flex:1, overflow:"hidden", padding:"16px 0" }}>
                <div style={{ padding:"0 16px 10px" }}>
                  <SectionHeader title="All Junctions" />
                </div>
                <div style={{ maxHeight:280, overflowY:"auto", padding:"0 16px" }}>
                  {JUNCTIONS.map(j=>(
                    <div key={j.id} onClick={()=>setSelectedNode(j)} style={{
                      display:"flex", justifyContent:"space-between", alignItems:"center",
                      padding:"8px 10px", marginBottom:4, borderRadius:8, cursor:"pointer",
                      background: selectedNode?.id===j.id ? T.lightBlue : T.bg,
                      border: `1px solid ${selectedNode?.id===j.id ? T.blue+"44" : T.border}`,
                      transition:"all 0.15s"
                    }}>
                      <div>
                        <div style={{ fontSize:11, fontWeight:600, color:T.navy }}>{j.name}</div>
                        <div style={{ fontSize:10, color:T.gray }}>{j.volume.toLocaleString()} veh/hr · {j.speed} km/h</div>
                      </div>
                      <span style={{ fontSize:9, fontWeight:700, color:CONGESTION_COLOR[j.congestion], background:CONGESTION_BG[j.congestion], padding:"2px 7px", borderRadius:20, whiteSpace:"nowrap", flexShrink:0 }}>{j.congestion}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab==="analytics" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {/* Top stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
              <StatBadge label="Total Volume (all junctions)" value="18,370 veh/hr" color={T.blue} bg={T.lightBlue} />
              <StatBadge label="Average Network Speed" value="29 km/h" color={T.teal} bg={T.lightTeal} />
              <StatBadge label="Peak Delay (Kurla West)" value="34 minutes" color={T.red} bg={T.lightRed} />
              <StatBadge label="Model Accuracy" value="Approx. 92–94%" color={T.orange} bg={T.lightOrange} />
            </div>

            {/* Hourly trend */}
            <Card>
              <SectionHeader title="24-Hour Traffic Volume: Predicted vs Actual" subtitle="Hourly aggregated vehicle count across all monitored junctions" />
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={TRAFFIC_24H}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="hour" tick={{ fill:T.gray, fontSize:10 }} interval={3} />
                  <YAxis tick={{ fill:T.gray, fontSize:10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize:11, color:T.gray }} />
                  <Area type="monotone" dataKey="actual" stroke={T.blue} fill={T.lightBlue} strokeWidth={2} name="Actual" />
                  <Area type="monotone" dataKey="predicted" stroke={T.teal} fill={T.lightTeal} strokeWidth={2} strokeDasharray="5 3" name="Predicted" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              {/* Zone comparison */}
              <Card>
                <SectionHeader title="Volume by Zone" subtitle="Total hourly vehicle count per metropolitan zone" />
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={ZONE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="zone" tick={{ fill:T.gray, fontSize:10 }} />
                    <YAxis tick={{ fill:T.gray, fontSize:10 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="volume" fill={T.blue} radius={[4,4,0,0]} name="Volume (veh/hr)" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Congestion distribution pie */}
              <Card>
                <SectionHeader title="Congestion Level Distribution" subtitle="Proportion of junctions by congestion class" />
                <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                  <PieChart width={160} height={160}>
                    <Pie data={CONGESTION_DIST} cx={80} cy={80} innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>
                      {CONGESTION_DIST.map((entry,i)=><Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                  <div style={{ flex:1 }}>
                    {CONGESTION_DIST.map(d=>(
                      <div key={d.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ width:10, height:10, borderRadius:2, background:d.color, display:"inline-block" }} />
                          <span style={{ fontSize:11, color:T.navy, fontWeight:500 }}>{d.name}</span>
                        </div>
                        <span style={{ fontSize:12, fontWeight:700, color:d.color }}>{d.value} junctions</span>
                      </div>
                    ))}
                    <div style={{ fontSize:10, color:T.gray, marginTop:6 }}>Total: 12 monitored junctions</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Hotspot table */}
            <Card>
              <SectionHeader title="High-Risk Congestion Hotspots" subtitle="Junctions classified as HIGH or CRITICAL by the Random Forest model" />
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr style={{ background:T.bg }}>
                      {["Junction","Zone","Volume (veh/hr)","Speed (km/h)","Delay (min)","Rainfall (mm/hr)","AI Risk","Status"].map(h=>(
                        <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:T.gray, borderBottom:`1px solid ${T.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {JUNCTIONS.filter(j=>j.congestion==="HIGH"||j.congestion==="CRITICAL").map((j,i)=>(
                      <tr key={j.id} style={{ background: i%2===0?T.bg:T.card, cursor:"pointer" }}>
                        <td style={{ padding:"8px 12px", fontWeight:600, color:T.navy }}>{j.name}</td>
                        <td style={{ padding:"8px 12px", color:T.gray }}>{j.zone}</td>
                        <td style={{ padding:"8px 12px", fontWeight:600 }}>{j.volume.toLocaleString()}</td>
                        <td style={{ padding:"8px 12px" }}>{j.speed}</td>
                        <td style={{ padding:"8px 12px", color:T.orange, fontWeight:600 }}>{j.delay}</td>
                        <td style={{ padding:"8px 12px" }}>{j.rainfall}</td>
                        <td style={{ padding:"8px 12px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ flex:1, height:6, background:T.border, borderRadius:3, overflow:"hidden" }}>
                              <div style={{ width:`${j.aiProb*100}%`, height:"100%", background:CONGESTION_COLOR[j.congestion], borderRadius:3 }} />
                            </div>
                            <span style={{ fontSize:11, fontWeight:700, color:CONGESTION_COLOR[j.congestion], minWidth:32 }}>{Math.round(j.aiProb*100)}%</span>
                          </div>
                        </td>
                        <td style={{ padding:"8px 12px" }}>
                          <span style={{ fontSize:10, fontWeight:700, color:CONGESTION_COLOR[j.congestion], background:CONGESTION_BG[j.congestion], padding:"3px 8px", borderRadius:20 }}>{j.congestion}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ── SIGNAL CONTROL TAB ── */}
        {activeTab==="signals" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {/* Mode selector */}
            <Card style={{ padding:"14px 18px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                <span style={{ fontSize:12, fontWeight:600, color:T.navy }}>Signal Control Mode:</span>
                {["adaptive","manual","emergency"].map(m=>(
                  <button key={m} onClick={()=>setSignalMode(m)} style={{
                    padding:"6px 16px", borderRadius:8, border:`1.5px solid ${signalMode===m?T.blue:T.border}`,
                    background:signalMode===m?T.lightBlue:T.card, color:signalMode===m?T.blue:T.gray,
                    cursor:"pointer", fontSize:11, fontWeight:600, textTransform:"capitalize", fontFamily:"inherit", transition:"all 0.2s"
                  }}>{m.charAt(0).toUpperCase()+m.slice(1)}</button>
                ))}
                <span style={{ marginLeft:"auto", fontSize:11, color:T.gray }}>Cycle transitions every 3.5 seconds for demonstration</span>
              </div>
            </Card>

            {/* AI pipeline */}
            <Card>
              <SectionHeader title="AI Prediction Engine — Signal Timing Pipeline" subtitle="How the Random Forest model determines adaptive signal durations" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 48px 1fr 48px 1fr", gap:0, alignItems:"center" }}>
                <div style={{ background:T.lightBlue, border:`1px solid ${T.blue}33`, borderRadius:10, padding:16 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.blue, marginBottom:10 }}>INPUT FEATURES</div>
                  {[["Traffic Volume","2,840 veh/hr"],["Time of Day","Peak Hour Input"],["Weather","Rainy"],["Historical Avg","7-day rolling"],["Rainfall","18 mm/hr"]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${T.blue}22`, fontSize:11 }}>
                      <span style={{ color:T.gray }}>{k}</span>
                      <span style={{ color:T.navy, fontWeight:500 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign:"center", color:T.blue, fontSize:22 }}>→</div>
                <div style={{ background:T.navy, borderRadius:10, padding:16, textAlign:"center" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#93C5FD", marginBottom:10 }}>RANDOM FOREST MODEL</div>
                  <div style={{ fontSize:28, marginBottom:6 }}>🌲</div>
                  <div style={{ fontSize:13, fontWeight:700, color:"white" }}>Random Forest</div>
                  <div style={{ fontSize:10, color:"#93C5FD", marginTop:4 }}>150 decision trees</div>
                  <div style={{ fontSize:10, color:"#93C5FD" }}>Gini impurity splitting</div>
                  <div style={{ fontSize:10, color:"#93C5FD" }}>Features: Volume, Time, Weather</div>
                  <div style={{ marginTop:12, background:T.teal+"33", border:`1px solid ${T.teal}`, borderRadius:6, padding:"6px 10px" }}>
                    <div style={{ fontSize:10, color:T.teal, fontWeight:700 }}>Model Accuracy: Approx 92–94%</div>
                    <div style={{ fontSize:9, color:"#94D5CF" }}>on Metro Interstate Dataset</div>
                  </div>
                </div>
                <div style={{ textAlign:"center", color:T.blue, fontSize:22 }}>→</div>
                <div style={{ background:T.lightTeal, border:`1px solid ${T.teal}33`, borderRadius:10, padding:16 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.teal, marginBottom:10 }}>OUTPUTS</div>
                  {[["Congestion Class","HIGH"],["Predicted Delay","22 min"],["Green Duration","75 sec"],["Red Duration","45 sec"],["Traffic Recommendation","Adaptive Signal Timing"]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${T.teal}22`, fontSize:11 }}>
                      <span style={{ color:T.gray }}>{k}</span>
                      <span style={{ color: k.includes("Cong")?T.red:k.includes("Green")?T.teal:T.navy, fontWeight:600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Traffic lights */}
            <Card>
              <SectionHeader title="Adaptive Signal Control — Live Simulation" subtitle="Signal phases cycle based on congestion-level rules derived from the AI model" />
              <div style={{ display:"flex", flexWrap:"wrap", gap:14, marginBottom:20 }}>
                {JUNCTIONS.map(j=>(
                  <TrafficLight key={j.id} junction={j} phase={getPhase(j)} />
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                {[
                  { label:"CRITICAL / HIGH Congestion", desc:"Extended green phase (75–90s). Red minimized to 30–45s. AI override ensures maximum throughput on high-volume corridors.", color:T.red, bg:T.lightRed },
                  { label:"MODERATE Congestion", desc:"Balanced adaptive cycle (50s green / 50s red). Standard timing adjusted based on real-time arrival rates using the Poisson model.", color:T.blue, bg:T.lightBlue },
                  { label:"LOW Congestion", desc:"Energy-saving short cycle (25–35s green / 55–65s red). Reduces unnecessary wait times during off-peak hours.", color:T.teal, bg:T.lightTeal },
                ].map(m=>(
                  <div key={m.label} style={{ background:m.bg, border:`1px solid ${m.color}33`, borderRadius:10, padding:14, borderLeft:`4px solid ${m.color}` }}>
                    <div style={{ fontSize:11, fontWeight:700, color:m.color, marginBottom:6 }}>{m.label}</div>
                    <div style={{ fontSize:10, color:T.gray, lineHeight:1.6 }}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Signal timing table */}
            <Card>
              <SectionHeader title="Junction Signal Timing Configuration" />
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr style={{ background:T.bg }}>
                      {["Junction","Congestion","Green (s)","Yellow (s)","Red (s)","Cycle Total","Adaptive Rule"].map(h=>(
                        <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:T.gray, borderBottom:`1px solid ${T.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {JUNCTIONS.map((j,i)=>(
                      <tr key={j.id} style={{ background: i%2===0?T.bg:T.card }}>
                        <td style={{ padding:"7px 12px", fontWeight:600, color:T.navy }}>{j.name}</td>
                        <td style={{ padding:"7px 12px" }}>
                          <span style={{ fontSize:10, fontWeight:700, color:CONGESTION_COLOR[j.congestion], background:CONGESTION_BG[j.congestion], padding:"2px 7px", borderRadius:20 }}>{j.congestion}</span>
                        </td>
                        <td style={{ padding:"7px 12px", color:T.teal, fontWeight:700 }}>{j.signal.green}s</td>
                        <td style={{ padding:"7px 12px", color:T.orange }}>{j.signal.yellow}s</td>
                        <td style={{ padding:"7px 12px", color:T.red }}>{j.signal.red}s</td>
                        <td style={{ padding:"7px 12px", color:T.gray }}>{j.signal.green+j.signal.yellow+j.signal.red}s</td>
                        <td style={{ padding:"7px 12px", fontSize:10, color:T.gray }}>
                          {j.congestion==="CRITICAL"?"Max throughput override":j.congestion==="HIGH"?"Extended green phase":j.congestion==="LOW"?"Energy-saving mode":"Standard adaptive"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ── PROJECT SUMMARY TAB ── */}
        {activeTab==="summary" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {/* Title */}
            <Card style={{ background:T.navy, border:"none" }}>
              <div style={{ textAlign:"center", padding:"10px 0" }}>
                <div style={{ fontSize:20, fontWeight:800, color:"white", marginBottom:6 }}>AI-Based Smart Traffic Monitoring &amp; Congestion Prediction System</div>
                <div style={{ fontSize:13, color:"#93C5FD" }}>Probability & Stochastic Processes Mini Project</div>
              </div>
            </Card>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              {/* Project Info */}
              <Card>
                <SectionHeader title="Project Information" />
                <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                  {[
                    ["Objective", "Predict urban traffic congestion levels using machine learning and implement adaptive signal control"],
                    ["ML Model", "Random Forest Classifier"],
                    ["Dataset", "Metro Interstate Traffic Volume (UCI Repository)"],
                    ["Model Accuracy", "Approx 92–94%"],
                    ["Features Used", "Traffic volume, hour of day, weather, temperature, holiday indicator"],
                    ["Target Variable", "Congestion level (Low / Moderate / High / Critical)"],
                    ["Signal Logic", "Adaptive Smart Control — timing adjusted per predicted congestion class"],
                    ["Study Area", "Mumbai Metropolitan Region — 12 key junctions"],
                    ["Programming Language", "Python (scikit-learn, pandas, matplotlib)"],
                    ["Dashboard", "React.js with Recharts"],
                  ].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", gap:14, padding:"10px 0", borderBottom:`1px solid ${T.border}` }}>
                      <div style={{ fontSize:11, fontWeight:700, color:T.navy, minWidth:140, flexShrink:0 }}>{k}</div>
                      <div style={{ fontSize:11, color:T.gray, lineHeight:1.5 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* Key Metrics */}
                <Card>
                  <SectionHeader title="Model Performance Metrics" />
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[
                      ["Accuracy", "Approx 92–94%", T.blue, T.lightBlue],
                      ["Precision", "92%", T.teal, T.lightTeal],
                      ["Recall", "91%", T.orange, T.lightOrange],
                      ["F1 Score", "91.5%", T.navy, T.bg],
                      ["Trees (RF)", "150", T.gray, T.bg],
                      ["Max Depth", "12", T.gray, T.bg],
                    ].map(([k,v,c,bg])=>(
                      <div key={k} style={{ background:bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"10px 12px" }}>
                        <div style={{ fontSize:10, color:T.gray }}>{k}</div>
                        <div style={{ fontSize:18, fontWeight:800, color:c, marginTop:2 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Adaptive signal logic */}
                <Card>
                  <SectionHeader title="Adaptive Signal Timing Rules" />
                  {[
                    { level:"CRITICAL", rule:"Green: 90s · Red: 30s", desc:"Maximum throughput. Emergency override.", color:T.red },
                    { level:"HIGH", rule:"Green: 65–75s · Red: 40–45s", desc:"Extended green. Heavy flow management.", color:T.orange },
                    { level:"MODERATE", rule:"Green: 48–55s · Red: 48–52s", desc:"Balanced adaptive cycle.", color:T.blue },
                    { level:"LOW", rule:"Green: 25–35s · Red: 55–65s", desc:"Energy-saving short cycle.", color:T.teal },
                  ].map(m=>(
                    <div key={m.level} style={{ display:"flex", gap:12, padding:"8px 0", borderBottom:`1px solid ${T.border}`, alignItems:"flex-start" }}>
                      <span style={{ fontSize:10, fontWeight:700, color:m.color, background:CONGESTION_BG[m.level], padding:"2px 8px", borderRadius:20, minWidth:70, textAlign:"center", flexShrink:0 }}>{m.level}</span>
                      <div>
                        <div style={{ fontSize:11, fontWeight:600, color:T.navy }}>{m.rule}</div>
                        <div style={{ fontSize:10, color:T.gray }}>{m.desc}</div>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>

            {/* Methodology */}
            <Card>
              <SectionHeader title="Methodology Overview" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:1 }}>
                {[
                  { step:"01", title:"Data Collection", desc:"Metro Interstate Traffic Volume dataset from UCI ML Repository. 48,000+ hourly records.", icon:"📦" },
                  { step:"02", title:"Preprocessing", desc:"Feature engineering: congestion labels, one-hot encoding for weather, cyclical time features.", icon:"⚙️" },
                  { step:"03", title:"Model Training", desc:"Random Forest with 150 estimators, Gini splitting, 80/20 train-test split, cross-validation.", icon:"🌲" },
                  { step:"04", title:"Evaluation", desc:"Approx. 92–94% accuracy on held-out test set. Confusion matrix, precision-recall analysis.", icon:"📊" },
                  { step:"05", title:"Signal Control", desc:"Predicted congestion class maps to adaptive green/red durations. Dashboard visualization.", icon:"STM" },
                ].map((s,i)=>(
                  <div key={s.step} style={{ background:T.bg, padding:"16px 14px", textAlign:"center", borderRight: i<4?`1px solid ${T.border}`:"none" }}>
                    <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
                    <div style={{ fontSize:10, fontWeight:700, color:T.blue, marginBottom:4 }}>STEP {s.step}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:T.navy, marginBottom:6 }}>{s.title}</div>
                    <div style={{ fontSize:10, color:T.gray, lineHeight:1.6 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Congestion class description */}
            <Card>
              <SectionHeader title="Congestion Classification Criteria" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                {[
                  { level:"LOW", range:"< 1,200 veh/hr", speed:"> 45 km/h", delay:"< 5 min", color:T.teal, bg:T.lightTeal },
                  { level:"MODERATE", range:"1,200–2,000 veh/hr", speed:"20–45 km/h", delay:"5–15 min", color:T.blue, bg:T.lightBlue },
                  { level:"HIGH", range:"2,000–3,000 veh/hr", speed:"10–20 km/h", delay:"15–25 min", color:T.orange, bg:T.lightOrange },
                  { level:"CRITICAL", range:"> 3,000 veh/hr", speed:"< 10 km/h", delay:"> 25 min", color:T.red, bg:T.lightRed },
                ].map(c=>(
                  <div key={c.level} style={{ background:c.bg, border:`1px solid ${c.color}33`, borderRadius:10, padding:14, borderTop:`4px solid ${c.color}` }}>
                    <div style={{ fontSize:13, fontWeight:800, color:c.color, marginBottom:10 }}>{c.level}</div>
                    <div style={{ fontSize:10, color:T.gray, marginBottom:4 }}>Volume: <span style={{ color:T.navy, fontWeight:600 }}>{c.range}</span></div>
                    <div style={{ fontSize:10, color:T.gray, marginBottom:4 }}>Speed: <span style={{ color:T.navy, fontWeight:600 }}>{c.speed}</span></div>
                    <div style={{ fontSize:10, color:T.gray }}>Delay: <span style={{ color:T.navy, fontWeight:600 }}>{c.delay}</span></div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ background:T.card, borderTop:`1px solid ${T.border}`, padding:"10px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20 }}>
        <span style={{ fontSize:11, color:T.gray }}>Smart Traffic Monitoring & Congestion Prediction System · Academic Project Simulation</span>
        <span style={{ fontSize:11, color:T.gray }}>Model: Random Forest · Dataset: Metro Interstate Traffic Volume (UCI) · Accuracy: Approx. 92–94%</span>
      </div>
    </div>
  );
}
