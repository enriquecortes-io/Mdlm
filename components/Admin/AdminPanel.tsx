"use client";
import { useState, useEffect } from "react";
import NewProperty from "./NewProperty";
import Portfolio from "./Portfolio";
import Leads from "./Leads";
import LeadsCaptacion from "./LeadsCaptacion";
import Contactos from "./Contactos";
import CruceVentas from "./CruceVentas";
import FeedsPanel from "./FeedsPanel";
import Users from "./Users";
import Dashboard from "./Dashboard";
import Newsletter from "./Newsletter";

type Section = "dashboard" | "portfolio" | "new" | "leads" | "captacion" | "contactos" | "cruce" | "feeds" | "users" | "newsletter";

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState<{name:string,role:string,password:string}|null>(null);
  const [authError, setAuthError] = useState("");
  const [username, setUsername] = useState("");
  const [section, setSection] = useState<Section>("dashboard");

  useEffect(() => {
    const saved = localStorage.getItem("mdlm_admin_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        const savedPw = localStorage.getItem("mdlm_admin_pw") || "";
        setAuth(true);
        setPassword(savedPw);
        setUser(u);
      } catch {}
    }
  }, []);

  const handleAuth = async () => {
    try {
      const pwInput = document.querySelector('input[name="password"]') as HTMLInputElement;
      const unInput = document.querySelector('input[name="username"]') as HTMLInputElement;
      const pw = password || pwInput?.value || "";
      const un = username || unInput?.value || "";
      if (pw) setPassword(pw);
      if (un) setUsername(un);
      const res = await fetch("/api/admin/auth", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ password: pw, username: un }),
      });
      const data = await res.json();
      if (data.ok) {
        setAuth(true);
        setUser(data.user);
        localStorage.setItem("mdlm_admin_user", JSON.stringify(data.user));
        localStorage.setItem("mdlm_admin_pw", password);
      } else {
        setAuthError("Contraseña incorrecta");
      }
    } catch {
      setAuthError("Error de conexión");
    }
  };

  if (!auth) return (
    <div style={{ minHeight:"100vh", background:"#FAF8F4", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"white", padding:"40px", borderRadius:"12px", boxShadow:"0 4px 24px rgba(26,23,20,0.08)", width:"360px" }}>
        <h2 style={{ fontFamily:"system-ui", fontSize:"20px", fontWeight:700, marginBottom:"8px", color:"#111" }}>
          Edit Marbella
        </h2>
        <p style={{ fontSize:"13px", color:"#4A4540", marginBottom:"24px", fontFamily:"system-ui" }}>Panel de Administración</p>
        <form onSubmit={e=>{e.preventDefault();handleAuth();}} method="post" action="">
          <label style={{ display:"block", fontSize:"11px", fontWeight:600, color:"#4A4540", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"4px", fontFamily:"system-ui" }}>
            Usuario
          </label>
          <input
            type="text"
            name="username"
            autoComplete="username"
            defaultValue=""
            onChange={e=>setUsername(e.target.value)}
            onInput={e=>setUsername((e.target as HTMLInputElement).value)}
            style={{ width:"100%", padding:"10px 12px", border:"1px solid #d1d5db", borderRadius:"6px", fontSize:"14px", fontFamily:"system-ui", outline:"none", boxSizing:"border-box", marginBottom:"16px" }}
            placeholder="Tu nombre de usuario"
          />
          <label style={{ display:"block", fontSize:"11px", fontWeight:600, color:"#4A4540", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"4px", fontFamily:"system-ui" }}>
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            defaultValue=""
            onChange={e=>setPassword(e.target.value)}
            onInput={e=>setPassword((e.target as HTMLInputElement).value)}
            style={{ width:"100%", padding:"10px 12px", border:"1px solid #d1d5db", borderRadius:"6px", fontSize:"14px", fontFamily:"system-ui", outline:"none", boxSizing:"border-box", marginBottom:"20px" }}
            placeholder="••••••••"
          />
          <button type="submit" style={{ width:"100%", padding:"10px", background:"#111", color:"white", border:"none", borderRadius:"6px", fontSize:"14px", fontWeight:600, cursor:"pointer", fontFamily:"system-ui" }}>
            Entrar
          </button>
        </form>
        {authError && <p style={{ color:"#ef4444", marginTop:"12px", fontSize:"13px", fontFamily:"system-ui" }}>{authError}</p>}
      </div>
    </div>
  );

  const NAV: { id: Section; icon: string; label: string; green?: boolean }[] = [
    { id:"dashboard", icon:"📊", label:"Dashboard" },
    { id:"new",       icon:"➕", label:"Nueva Propiedad", green:true },
    { id:"portfolio", icon:"🏠", label:"Portfolio" },
    { id:"leads",     icon:"👥", label:"Leads Venta" },
    { id:"captacion",  icon:"🏠", label:"Leads Captación" },
    { id:"contactos", icon:"📋", label:"Contactos" },
    { id:"cruce",     icon:"🔗", label:"Cruce de Ventas" },
    { id:"feeds",     icon:"📡", label:"Portales / Feeds" },
    { id:"users",     icon:"👤", label:"Usuarios" },
    { id:"newsletter", icon:"✉️", label:"Newsletter" },
  ];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#FAF8F4", fontFamily:"system-ui" }}>

      {/* Sidebar */}
      <div style={{ width:"220px", background:"#111", minHeight:"100vh", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"24px 20px 20px" }}>
          <p style={{ fontSize:"9px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.2em", margin:"0 0 8px" }}>THE EDIT MARBELLA</p>
          {user && (
            <>
              <p style={{ fontSize:"18px", color:"white", fontWeight:700, margin:"0 0 2px", letterSpacing:"-0.01em" }}>{user.name}</p>
              <p style={{ fontSize:"11px", color:"#c9a96e", margin:"0 0 12px", textTransform:"uppercase", letterSpacing:"0.15em" }}>{user.role}</p>
              <button onClick={()=>{ localStorage.removeItem("mdlm_admin_user"); localStorage.removeItem("mdlm_admin_pw"); setAuth(false); setUser(null); setPassword(""); }}
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"6px", color:"rgba(255,255,255,0.5)", fontSize:"11px", cursor:"pointer", padding:"6px 12px", width:"100%", textAlign:"left" }}>
                Cerrar sesión →
              </button>
            </>
          )}
        </div>

        <div style={{ height:"1px", background:"rgba(250,248,244,0.08)", margin:"0 20px 16px" }}/>

        <nav style={{ flex:1, padding:"0 12px" }}>
          {NAV.map(item => (
            <button key={item.id} onClick={()=>setSection(item.id)}
              style={{
                display:"flex", alignItems:"center", gap:"10px",
                width:"100%", padding:"10px 12px",
                background: (item as any).green && section!==item.id
                  ? "rgba(22,163,74,0.2)"
                  : section===item.id ? "rgba(255,255,255,0.1)" : "none",
                border: (item as any).green ? "1px solid rgba(22,163,74,0.4)" : "none",
                borderRadius:"8px",
                color: (item as any).green
                  ? "#4ade80"
                  : section===item.id ? "white" : "rgba(255,255,255,0.5)",
                fontSize:"13px", fontWeight: section===item.id || (item as any).green ? 600 : 400,
                cursor:"pointer", textAlign:"left",
                transition:"all 0.15s",
                marginBottom:"4px",
              }}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding:"16px 20px", borderTop:"1px solid rgba(250,248,244,0.08)" }}>
          <button onClick={()=>{ localStorage.removeItem("mdlm_admin_user"); setAuth(false); setUser(null); }}
            style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:"12px", cursor:"pointer", padding:0 }}>
            Cerrar sesión →
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflow:"auto" }}>
        {section === "portfolio" && <Portfolio password={password} role={user?.role||""} onEdit={()=>setSection("new")} />}
        {section === "new" && <NewProperty password={password} />}
        {section === "leads" && <Leads password={password} />}
        {section === "captacion" && <LeadsCaptacion password={password} />}
        {section === "contactos" && <Contactos password={password} />}
        {section === "cruce" && <CruceVentas password={password} />}
        {section === "dashboard" && <Dashboard password={password} />}
        {section === "feeds" && <FeedsPanel />}
        {section === "users" && <Users password={password} />}
        {section === "newsletter" && <Newsletter />}
      </div>
    </div>
  );
}
