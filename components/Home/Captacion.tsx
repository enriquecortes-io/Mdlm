"use client";
import NeonButton from "@/components/ui/NeonButton";
import SiteFooter from "./SiteFooter";
import { forwardRef, useState } from "react";

interface Props { locale: string; }

const TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    eyebrow: "Propietarios",
    title: "Confíanos tu Legado",
    subtitle: "No vendemos propiedades. Editamos su historia para el comprador correcto.",
    s1: "Valoración Estratégica",
    s1d: "Precio óptimo basado en datos de mercado premium y demanda internacional.",
    s2: "Producción Editorial",
    s2d: "Fotografía y video cinematográfico que transforma tu propiedad en obra de arte.",
    s3: "Alcance Global",
    s3d: "Red de compradores HNWI en 40+ países. Venta discreta o exposición máxima.",
    s4: "Acompañamiento Total",
    s4d: "Gestión legal, fiscal y notarial desde la valoración hasta la escritura.",
    formTitle: "Solicita una Valoración Privada",
    name: "Nombre",
    email: "Email",
    phone: "Teléfono",
    ubicacion: "Ubicación de la propiedad",
    precio: "Precio estimado",
    mensaje: "Mensaje (opcional)",
    send: "Solicitar valoración",
    sending: "Enviando...",
    sent: "Solicitud recibida. Le contactaremos en 24h.",
    error: "Error al enviar. Inténtelo de nuevo.",
  },
  en: {
    eyebrow: "Property Owners",
    title: "Entrust Us Your Legacy",
    subtitle: "We don't sell properties. We edit their story for the right buyer.",
    s1: "Strategic Valuation",
    s1d: "Optimal pricing based on premium market data and international demand.",
    s2: "Editorial Production",
    s2d: "Cinematic photography and video that transforms your property into art.",
    s3: "Global Reach",
    s3d: "HNWI buyer network across 40+ countries. Discreet or maximum exposure.",
    s4: "Full Accompaniment",
    s4d: "Legal, tax and notarial management from valuation to completion.",
    formTitle: "Request a Private Valuation",
    name: "Name",
    email: "Email",
    phone: "Phone",
    ubicacion: "Property location",
    precio: "Estimated price",
    mensaje: "Message (optional)",
    send: "Request valuation",
    sending: "Sending...",
    sent: "Request received. We will contact you within 24h.",
    error: "Error sending. Please try again.",
  },
  fr: {
    eyebrow: "Propriétaires",
    title: "Confiez-nous Votre Héritage",
    subtitle: "Nous ne vendons pas des propriétés. Nous éditons leur histoire pour le bon acheteur.",
    s1: "Évaluation Stratégique",
    s1d: "Prix optimal basé sur les données du marché premium et la demande internationale.",
    s2: "Production Éditoriale",
    s2d: "Photographie et vidéo cinématographique qui transforme votre propriété en œuvre d'art.",
    s3: "Portée Mondiale",
    s3d: "Réseau d'acheteurs HNWI dans 40+ pays. Vente discrète ou exposition maximale.",
    s4: "Accompagnement Total",
    s4d: "Gestion juridique, fiscale et notariale de l'évaluation à la signature.",
    formTitle: "Demander une Évaluation Privée",
    name: "Nom",
    email: "Email",
    phone: "Téléphone",
    ubicacion: "Emplacement du bien",
    precio: "Prix estimé",
    mensaje: "Message (optionnel)",
    send: "Demander l'évaluation",
    sending: "Envoi...",
    sent: "Demande reçue. Nous vous contacterons sous 24h.",
    error: "Erreur d'envoi. Veuillez réessayer.",
  },
  ru: {
    eyebrow: "Владельцам",
    title: "Доверьте нам своё Наследие",
    subtitle: "Мы не продаём недвижимость. Мы редактируем её историю для правильного покупателя.",
    s1: "Стратегическая Оценка",
    s1d: "Оптимальная цена на основе данных премиального рынка и международного спроса.",
    s2: "Редакционное Производство",
    s2d: "Кинематографическая фотография и видео, превращающие вашу недвижимость в произведение искусства.",
    s3: "Глобальный Охват",
    s3d: "Сеть покупателей HNWI в 40+ странах. Дискретная продажа или максимальная экспозиция.",
    s4: "Полное Сопровождение",
    s4d: "Юридическое, налоговое и нотариальное сопровождение от оценки до сделки.",
    formTitle: "Запросить Частную Оценку",
    name: "Имя",
    email: "Email",
    phone: "Телефон",
    ubicacion: "Расположение объекта",
    precio: "Ориентировочная цена",
    mensaje: "Сообщение (необязательно)",
    send: "Запросить оценку",
    sending: "Отправка...",
    sent: "Запрос получен. Свяжемся с вами в течение 24ч.",
    error: "Ошибка отправки. Попробуйте снова.",
  },
};

const PRICES = ["< 1M €", "1M – 3M €", "3M – 7M €", "7M – 15M €", "+ 15M €"];

const SERVICES_ES = [
  { icon:"◆", title:"Valoración por Inteligencia de Mercado", desc:"Precio de salida calculado con datos transaccionales en tiempo real, no con estimaciones. Tu propiedad entra al mercado posicionada, no tanteando." },
  { icon:"◈", title:"Compradores Precalificados, No Visitas", desc:"Nuestra cartera activa de compradores identificados acorta el ciclo de venta de meses a semanas. Cada visita es una conversación real, no un reconocimiento." },
  { icon:"◉", title:"Visibilidad Total, Privacidad Absoluta", desc:"Exposición selectiva o máxima — tú decides. Acceso a redes privadas internacionales sin comprometer la discreción que una operación de este nivel exige." },
  { icon:"◎", title:"Documentación Sin Fricción", desc:"Nota simple, certificación energética, contratos de arras, coordinación notarial. Todo gestionado. Tu única decisión es cuándo firmar." },
  { icon:"◐", title:"Producción Editorial", desc:"Cada propiedad recibe un tratamiento visual cinematográfico. Porque la primera impresión de un comprador global se forma a 10.000 kilómetros de distancia, antes de coger el avión." },
  { icon:"◑", title:"Reporting Mensual", desc:"Panel de control con datos de impresiones, conversión a contactos y feedback estructurado post-visita. Sabes exactamente dónde está tu operación en cada momento." },
];

const SERVICES_EN = [
  { icon:"◆", title:"Market Intelligence Valuation", desc:"Launch price calculated with real-time transactional data, not estimates. Your property enters the market positioned, not guessing." },
  { icon:"◈", title:"Pre-Qualified Buyers, Not Visits", desc:"Our active portfolio of identified buyers shortens the sales cycle from months to weeks. Every visit is a real conversation, not a reconnaissance." },
  { icon:"◉", title:"Total Visibility, Absolute Privacy", desc:"Selective or maximum exposure — you decide. Access to international private networks without compromising the discretion an operation of this level demands." },
  { icon:"◎", title:"Frictionless Documentation", desc:"Title search, energy certificate, deposit contracts, notarial coordination. All managed. Your only decision is when to sign." },
  { icon:"◐", title:"Editorial Production", desc:"Each property receives cinematic visual treatment. Because a global buyer's first impression is formed 10,000 kilometres away, before boarding the plane." },
  { icon:"◑", title:"Monthly Reporting", desc:"Dashboard with impression data, contact conversion and structured post-visit feedback. You know exactly where your operation stands at every moment." },
];

const SERVICES_FR = [
  { icon:"◆", title:"Évaluation par Intelligence de Marché", desc:"Prix de lancement calculé avec des données transactionnelles en temps réel, non des estimations. Votre bien entre sur le marché positionné, pas en tâtonnant." },
  { icon:"◈", title:"Acheteurs Précalifiés, Pas des Visites", desc:"Notre portefeuille actif d'acheteurs identifiés raccourcit le cycle de vente de mois à semaines. Chaque visite est une vraie conversation, pas une reconnaissance." },
  { icon:"◉", title:"Visibilité Totale, Confidentialité Absolue", desc:"Exposition sélective ou maximale — vous décidez. Accès aux réseaux privés internationaux sans compromettre la discrétion qu'une opération de ce niveau exige." },
  { icon:"◎", title:"Documentation Sans Friction", desc:"Note simple, certification énergétique, contrats d'arrhes, coordination notariale. Tout géré. Votre seule décision est quand signer." },
  { icon:"◐", title:"Production Éditoriale", desc:"Chaque propriété reçoit un traitement visuel cinématographique. Car la première impression d'un acheteur mondial se forme à 10 000 kilomètres, avant de prendre l'avion." },
  { icon:"◑", title:"Reporting Mensuel", desc:"Tableau de bord avec données d'impressions, conversion en contacts et feedback structuré post-visite. Vous savez exactement où en est votre opération à chaque instant." },
];

const SERVICES_RU = [
  { icon:"◆", title:"Оценка через Рыночную Аналитику", desc:"Стартовая цена рассчитывается по транзакционным данным в реальном времени, а не по оценкам. Ваш объект выходит на рынок позиционированным, а не наощупь." },
  { icon:"◈", title:"Прекvalифицированные Покупатели, Не Визиты", desc:"Наш активный портфель идентифицированных покупателей сокращает цикл продажи с месяцев до недель. Каждый визит — настоящий разговор, а не разведка." },
  { icon:"◉", title:"Полная Видимость, Абсолютная Конфиденциальность", desc:"Избирательная или максимальная экспозиция — вы решаете. Доступ к международным частным сетям без ущерба для дискретности, которой требует операция такого уровня." },
  { icon:"◎", title:"Документация Без Трений", desc:"Выписка из реестра, энергетический сертификат, договоры задатка, нотариальная координация. Всё под управлением. Ваше единственное решение — когда подписывать." },
  { icon:"◐", title:"Редакционное Производство", desc:"Каждый объект получает кинематографическую визуальную обработку. Потому что первое впечатление глобального покупателя формируется в 10 000 километрах, до посадки в самолёт." },
  { icon:"◑", title:"Ежемесячная Отчётность", desc:"Панель управления с данными по показам, конверсии в контакты и структурированной обратной связью после визитов. Вы точно знаете, где находится ваша сделка в каждый момент." },
];

const SERVICES_MAP: Record<string, typeof SERVICES_ES> = { es:SERVICES_ES, en:SERVICES_EN, fr:SERVICES_FR, ru:SERVICES_RU };
const SERVICES = (locale: string) => SERVICES_MAP[locale] || SERVICES_EN;

const INP: React.CSSProperties = {
  width:"100%", background:"rgba(45,74,62,0.04)",
  border:"1px solid rgba(201,169,110,0.2)",
  color:"#111111", padding:"0.9rem 1rem",
  fontFamily:"'Montserrat',sans-serif", fontSize:"0.7rem",
  letterSpacing:"0.05em", outline:"none", boxSizing:"border-box",
  transition:"border-color 0.3s",
};

const Captacion = forwardRef<HTMLDivElement, Props>(({ locale }, ref) => {
  const t = TRANSLATIONS[locale] || TRANSLATIONS["es"];
  const [tab, setTab] = useState<"servicios"|"contacto">("servicios");
  const [form, setForm] = useState({ name:"", email:"", phone:"", ubicacion:"", precio_estimado:"", mensaje:"" });
  const [status, setStatus] = useState<"idle"|"sending"|"sent"|"error">("idle");

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/captacion", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...form, locale }),
      });
      const data = await res.json();
      setStatus(data.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div ref={ref} style={{
      position:"absolute", inset:0, zIndex:23,
      opacity:0, pointerEvents:"none",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start",
      padding:"clamp(1rem,3vw,3rem)",
      overflowY:"auto",
      willChange:"opacity",
    }}>
      <div style={{
        width:"100%", maxWidth:"1000px",
        display:"flex", flexDirection:"column",
        gap:"clamp(1.5rem,2.5vw,2.5rem)",
        background:"rgba(250,250,247,0.85)",
        border:"1px solid rgba(201,169,110,0.25)",
        backdropFilter:"blur(12px)",
        padding:"clamp(1.5rem,3vw,3rem)",
        boxSizing:"border-box",
        position:"relative",
      }}>
        {/* Línea dorada superior */}
        <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,110,0.8),transparent)" }}/>

        {/* Header */}
        <div>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.5rem", color:"rgba(45,74,62,0.7)", letterSpacing:"0.5em", textTransform:"uppercase", margin:"0 0 0.6rem" }}>{t.eyebrow}</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2rem,3vw,3rem)", fontWeight:600, color:"#111111", lineHeight:1.1, margin:"0 0 0.6rem", fontStyle:"italic" }}>{t.title}</h2>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(0.9rem,1.1vw,1rem)", color:"rgba(17,17,17,0.7)", lineHeight:1.6, margin:0, fontStyle:"italic" }}>{t.subtitle}</p>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:0, borderBottom:"1px solid rgba(201,169,110,0.15)" }}>
          {(["servicios","contacto"] as const).map(tabId => (
            <button key={tabId} onClick={() => setTab(tabId)} style={{
              fontFamily:"'Montserrat',sans-serif", fontSize:"0.5rem",
              letterSpacing:"0.3em", textTransform:"uppercase",
              color: tab === tabId ? "#2D4A3E" : "rgba(45,74,62,0.4)",
              background:"transparent", border:"none",
              borderBottom: tab === tabId ? "1px solid #2D4A3E" : "1px solid transparent",
              padding:"0.6rem 1.5rem 0.8rem", cursor:"pointer",
              transition:"all 0.3s", marginBottom:"-1px",
            }}>
              {tabId === "servicios" ? (locale === "fr" ? "Services" : locale === "ru" ? "Услуги" : locale === "en" ? "Services" : "Servicios") : t.formTitle}
            </button>
          ))}
        </div>

        {/* Tab: Servicios */}
        {tab === "servicios" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem 2.5rem" }}>
            {SERVICES(locale).map((s, i) => (
              <div key={i} style={{ display:"flex", flexDirection:"column", gap:"0.35rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.7rem", color:"rgba(45,74,62,0.5)", fontWeight:300, flexShrink:0 }}>
                    {String(i+1).padStart(2,"0")}
                  </span>
                  <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg,rgba(201,169,110,0.4),transparent)" }}/>
                </div>
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.55rem", color:"#2D4A3E", letterSpacing:"0.2em", textTransform:"uppercase", margin:0, lineHeight:1.3 }}>{s.title}</p>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(0.9rem,1.1vw,1rem)", color:"rgba(17,17,17,0.8)", lineHeight:1.55, margin:0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Contacto */}
        {tab === "contacto" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.8rem" }}>
            {status === "sent" ? (
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", color:"#2D4A3E", textAlign:"center", fontStyle:"italic", lineHeight:1.6, padding:"2rem 0" }}>{t.sent}</p>
            ) : (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.7rem" }}>
                  {[
                    { key:"name",      label:t.name,      type:"text" },
                    { key:"email",     label:t.email,     type:"email" },
                    { key:"phone",     label:t.phone,     type:"tel" },
                    { key:"ubicacion", label:t.ubicacion, type:"text" },
                  ].map(f => (
                    <input key={f.key} type={f.type} placeholder={f.label}
                      value={(form as any)[f.key]}
                      onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                      style={INP}
                      onFocus={e => e.target.style.borderColor = "rgba(45,74,62,0.6)"}
                      onBlur={e => e.target.style.borderColor = "rgba(45,74,62,0.2)"}
                    />
                  ))}
                </div>
                <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                  {PRICES.map((p: string) => (
                    <button key={p} onClick={() => setForm(f => ({...f, precio_estimado: p}))}
                      style={{
                        fontFamily:"'Montserrat',sans-serif", fontSize:"0.45rem",
                        letterSpacing:"0.15em", padding:"0.45rem 0.8rem",
                        border:`1px solid rgba(201,169,110,${form.precio_estimado === p ? 0.8 : 0.2})`,
                        background: form.precio_estimado === p ? "rgba(45,74,62,0.12)" : "transparent",
                        color: form.precio_estimado === p ? "#2D4A3E" : "rgba(255,255,255,0.4)",
                        cursor:"pointer", transition:"all 0.2s",
                      }}>
                      {p}
                    </button>
                  ))}
                </div>
                <textarea placeholder={t.mensaje} value={form.mensaje}
                  onChange={e => setForm(p => ({...p, mensaje: e.target.value}))}
                  rows={3} style={{...INP, resize:"none"}}
                  onFocus={e => e.target.style.borderColor = "rgba(45,74,62,0.6)"}
                  onBlur={e => e.target.style.borderColor = "rgba(45,74,62,0.2)"}
                />
                {status === "error" && <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.4rem", color:"rgba(255,100,100,0.8)" }}>{t.error}</p>}
                <NeonButton onClick={handleSubmit} disabled={status === "sending"} variant="solid" size="lg" style={{width:"100%",marginTop:"0.5rem",color:"#FAFAF7",backgroundColor:"#2D4A3E"}}>
                  {"Solicitar valoración"}
                </NeonButton>
              </>
            )}
          </div>
        )}

        {/* Línea dorada inferior */}
        <div style={{ position:"absolute", bottom:0, left:"10%", right:"10%", height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,110,0.4),transparent)" }}/>
      </div>

      <div style={{ width:"100%", maxWidth:"1000px" }}>
        <SiteFooter locale={locale} />
      </div>
    </div>
  );
});

Captacion.displayName = "Captacion";
export default Captacion;
