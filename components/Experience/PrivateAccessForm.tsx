"use client";
import { useState } from "react";

interface Props {
  locale: string;
  propertyTitle: string;
  propertySlug: string;
}

const COPY = {
  es: {
    label: "VISITA PRIVADA",
    headline: "Acceso reservado para compradores cualificados.",
    sub: "Organizamos visitas privadas bajo cita previa. Nuestro equipo le contactará para confirmar disponibilidad y condiciones.",
    disclaimer: "Nuestro servicio de representación exclusiva tiene honorarios. Trabajamos únicamente con compradores serios.",
    fields: {
      name: "Nombre completo",
      email: "Email",
      phone: "Teléfono",
      horizon: "¿Cuál es su horizonte de inversión?",
      horizonOpts: ["3 meses","6 meses","1 año","Flexible"],
    },
    submit: "Solicitar Acceso Privado",
    success: "Su solicitud ha sido recibida. Nos pondremos en contacto en menos de 24 horas.",
    sending: "Enviando...",
  },
  en: {
    label: "PRIVATE VIEWING",
    headline: "Reserved for qualified buyers.",
    sub: "We organise private viewings by appointment only. Our team will contact you to confirm availability and terms.",
    disclaimer: "Our exclusive representation service carries a fee. We work only with serious buyers.",
    fields: {
      name: "Full name",
      email: "Email",
      phone: "Phone",
      horizon: "What is your investment horizon?",
      horizonOpts: ["3 months","6 months","1 year","Flexible"],
    },
    submit: "Request Private Access",
    success: "Your request has been received. We will be in touch within 24 hours.",
    sending: "Sending...",
  },
  fr: {
    label: "VISITE PRIVÉE",
    headline: "Réservé aux acheteurs qualifiés.",
    sub: "Nous organisons des visites privées sur rendez-vous. Notre équipe vous contactera pour confirmer les disponibilités et les conditions.",
    disclaimer: "Notre service de représentation exclusive est payant. Nous travaillons uniquement avec des acheteurs sérieux.",
    fields: {
      name: "Nom complet",
      email: "Email",
      phone: "Téléphone",
      horizon: "Quel est votre horizon d'investissement?",
      horizonOpts: ["3 mois","6 mois","1 an","Flexible"],
    },
    submit: "Demander l'Accès Privé",
    success: "Votre demande a été reçue. Nous vous contacterons dans les 24 heures.",
    sending: "Envoi en cours...",
  },
  ru: {
    label: "ЧАСТНЫЙ ПРОСМОТР",
    headline: "Доступ для квалифицированных покупателей.",
    sub: "Мы организуем частные просмотры по предварительной записи. Наша команда свяжется с вами для подтверждения доступности и условий.",
    disclaimer: "Наша служба эксклюзивного представительства является платной. Мы работаем только с серьёзными покупателями.",
    fields: {
      name: "Полное имя",
      email: "Email",
      phone: "Телефон",
      horizon: "Каков ваш инвестиционный горизонт?",
      horizonOpts: ["3 месяца","6 месяцев","1 год","Гибко"],
    },
    submit: "Запросить Частный Доступ",
    success: "Ваш запрос получен. Мы свяжемся с вами в течение 24 часов.",
    sending: "Отправка...",
  },
} as const;

type Locale = keyof typeof COPY;

export default function PrivateAccessForm({ locale, propertyTitle, propertySlug }: Props) {
  const lang = (["es","en","fr","ru"].includes(locale) ? locale : "en") as Locale;
  const c = COPY[lang];

  const [form, setForm] = useState({ name:"", email:"", phone:"", horizon:"", privacy:false });
  const [status, setStatus] = useState<"idle"|"sending"|"done"|"error">("idle");
  const [focused, setFocused] = useState<string|null>(null);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.horizon || !form.privacy) return;
    setStatus("sending");
    try {
      await fetch("/api/contact", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...form, propertyTitle, propertySlug, locale }),
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const inputStyle = (field: string) => ({
    width:"100%",
    background:"transparent",
    border:"none",
    borderBottom:`1px solid rgba(26,23,20,${focused===field?0.5:0.18})`,
    color:"#1A1714",
    fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
    fontSize:"clamp(1rem,1.8vw,1.3rem)",
    fontWeight:200,
    padding:"0.8rem 0",
    outline:"none",
    letterSpacing:"0.02em",
    transition:"border-color 0.3s ease",
  } as React.CSSProperties);

  return (
<div style={{ width:"100%", } as React.CSSProperties}>
      <div style={{ maxWidth:"680px", width:"100%", padding:"0 0 6rem" }}>

        {/* Label */}
        <p style={{
          fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
          fontSize:"0.5rem", fontWeight:300,
          color:"rgba(201,169,110,0.7)",
          letterSpacing:"0.6em", textTransform:"uppercase",
          marginBottom:"3rem",
        }}>{c.label}</p>

        {/* Headline */}
        <h2 style={{
          fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
          fontSize:"clamp(1.5rem,3vw,2.2rem)",
          fontWeight:300,
          color:"#1A1714",
          letterSpacing:"-0.02em",
          lineHeight:1.2,
          margin:"0 0 1.5rem",
        }}>{c.headline}</h2>

        <p style={{
          fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
          fontSize:"clamp(0.9rem,1.5vw,1.1rem)",
          fontWeight:300,
          color:"rgba(26,23,20,0.65)",
          lineHeight:1.8,
          margin:"0 0 2rem",
          letterSpacing:"0.01em",
        }}>{c.sub}</p>

        {status === "done" ? (
          <div style={{
            padding:"3rem",
            border:"1px solid rgba(201,169,110,0.3)",
            textAlign:"center",
          }}>
            <div style={{ color:"#c9a96e", fontSize:"1.5rem", marginBottom:"1rem" }}>✦</div>
            <p style={{
              fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
              fontSize:"clamp(0.8rem,1.2vw,1rem)",
              fontWeight:200, color:"rgba(26,23,20,0.6)",
              letterSpacing:"0.02em", lineHeight:1.8,
            }}>{c.success}</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>

            {/* Nombre */}
            <div>
              <label style={{ display:"block", fontFamily:"'Montserrat','Helvetica Neue',sans-serif", fontSize:"0.65rem", color:"rgba(26,23,20,0.7)", letterSpacing:"0.25em", textTransform:"uppercase", marginBottom:"0.5rem" }}>
                {c.fields.name}
              </label>
              <input
                type="text" value={form.name}
                onChange={e => setForm(p=>({...p,name:e.target.value}))}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
                style={inputStyle("name")}
              />
            </div>

            {/* Email + Telefono en fila */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2rem" }}>
              <div>
                <label style={{ display:"block", fontFamily:"'Montserrat','Helvetica Neue',sans-serif", fontSize:"0.65rem", color:"rgba(26,23,20,0.7)", letterSpacing:"0.25em", textTransform:"uppercase", marginBottom:"0.5rem" }}>
                  {c.fields.email}
                </label>
                <input
                  type="email" value={form.email}
                  onChange={e => setForm(p=>({...p,email:e.target.value}))}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle("email")}
                />
              </div>
              <div>
                <label style={{ display:"block", fontFamily:"'Montserrat','Helvetica Neue',sans-serif", fontSize:"0.65rem", color:"rgba(26,23,20,0.7)", letterSpacing:"0.25em", textTransform:"uppercase", marginBottom:"0.5rem" }}>
                  {c.fields.phone}
                </label>
                <input
                  type="tel" value={form.phone}
                  onChange={e => setForm(p=>({...p,phone:e.target.value}))}
                  onFocus={() => setFocused("phone")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle("phone")}
                />
              </div>
            </div>

            {/* Horizonte */}
            <div>
              <label style={{ display:"block", fontFamily:"'Montserrat','Helvetica Neue',sans-serif", fontSize:"0.65rem", color:"rgba(26,23,20,0.7)", letterSpacing:"0.25em", textTransform:"uppercase", marginBottom:"0.8rem" }}>
                {c.fields.horizon}
              </label>
              <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
                {c.fields.horizonOpts.map(opt => (
                  <button key={opt}
                    onClick={() => setForm(p=>({...p,horizon:opt}))}
                    style={{
                      background: form.horizon===opt ? "rgba(201,169,110,0.08)" : "none",
                      border:`1px solid rgba(26,23,20,${form.horizon===opt?0.5:0.18})`,
                      color: form.horizon===opt ? "#c9a96e" : "rgba(26,23,20,0.45)",
                      fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
                      fontSize:"0.65rem", letterSpacing:"0.2em",
                      padding:"0.8rem 1.8rem", cursor:"pointer",
                      transition:"all 0.3s ease",
                    } as React.CSSProperties}
                  >{opt}</button>
                ))}
              </div>
            </div>
            {/* Checkbox privacidad */}
            <label style={{
              display:"flex", alignItems:"flex-start", gap:"0.8rem",
              cursor:"pointer", marginBottom:"1rem",
            }}>
              <input
                type="checkbox"
                checked={form.privacy}
                onChange={e=>setForm(p=>({...p,privacy:e.target.checked}))}
                style={{ marginTop:"3px", accentColor:"#c9a96e", width:"16px", height:"16px", flexShrink:0 }}
              />
              <span style={{
                fontFamily:"'Montserrat',sans-serif",
                fontSize:"0.6rem", fontWeight:200,
                color:"rgba(26,23,20,0.4)",
                lineHeight:1.7,
              }}>
                {({"es":"He leído y acepto la ","en":"I have read and accept the ","fr":"J'ai lu et j'accepte la ","ru":"Я прочитал и принимаю "} as Record<string,string>)[locale]}
                <a
                  href={`/${locale}/privacidad`}
                  target="_blank"
                  style={{ color:"#c9a96e", textDecoration:"none" }}
                >
                  {({"es":"Política de Privacidad","en":"Privacy Policy","fr":"Politique de Confidentialité","ru":"Политику конфиденциальности"} as Record<string,string>)[locale]}
                </a>
              </span>
            </label>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={status==="sending" || !form.name || !form.email || !form.phone || !form.horizon || !form.privacy}
              style={{
                background: !form.name||!form.email||!form.phone||!form.horizon||!form.privacy ? "rgba(45,74,62,0.3)" : "#2D4A3E",
                border:"none",
                color:"#fff",
                fontFamily:"'Montserrat','Helvetica Neue',sans-serif",
                fontSize:"0.7rem", letterSpacing:"0.5em", fontWeight:600,
                textTransform:"uppercase", padding:"1.2rem 3rem",
                cursor: !form.name||!form.email||!form.phone||!form.horizon||!form.privacy ? "default" : "pointer",
                transition:"all 0.3s ease",
                alignSelf:"flex-start",
              }}
              onMouseEnter={e => {
                if (form.name&&form.email&&form.phone&&form.horizon&&form.privacy)
                  e.currentTarget.style.opacity="0.85";
              }}
              onMouseLeave={e => { e.currentTarget.style.opacity="1"; }}
            >
              {status==="sending" ? c.sending : c.submit}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
