"use client";
import { useState } from "react";
import { convertGDriveUrl } from "@/lib/gdrive";

interface Props { password: string; }

const F: React.CSSProperties = { width:"100%", padding:"10px 12px", border:"1px solid #d1d5db", borderRadius:"6px", fontSize:"14px", fontFamily:"system-ui", background:"white", color:"#111", outline:"none", boxSizing:"border-box", marginBottom:"16px" };
const L: React.CSSProperties = { display:"block", fontSize:"11px", fontWeight:600, color:"#4A4540", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"4px", fontFamily:"system-ui" };
const BTN = (color = "#2563eb"): React.CSSProperties => ({ padding:"10px 20px", background:color, color:"white", border:"none", borderRadius:"6px", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"system-ui" });

export default function NewProperty({ password }: Props) {
  const [status, setStatus] = useState("");
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState<Record<string,Record<string,string>>>({});

  const [form, setForm] = useState({
    slug:"", sourceLang:"es", tipo:"", zona:"",
    titulo:"", descripcion:"",
    precio:"", habitaciones:"", banos:"",
    m2Construidos:"", m2Parcela:"", m2Terraza:"", plazasParking:"", tieneJardin:false,
    ubicacion:"", videoUrl:"", galeriaUrls:"",
    destacada:false, activa:false,
    // Ubicación detallada
    latitud:'', longitud:'', codigo_postal:'', direccion:'', google_maps_url:'',
    // Características
    ano_construccion:'', estado:'', orientacion:'', planta:'',
    garajes:'0', trasteros:'0', amueblado:'no', certificado_energetico:'',
    // Amenidades
    amenidades:[] as string[],
  });

  const generateSlug = (text: string) =>
    text.toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-z0-9\s-]/g,"")
      .trim().replace(/\s+/g,"-");

  const handleTranslate = async (field: "descripcion") => {
    if (!form[field]) return;
    setStatus("Traduciendo...");
    setTranslating(true);
    try {
      const pw = password || localStorage.getItem("mdlm_admin_pw") || "";
      const text = form[field].slice(0, 3000);
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sourceLang: form.sourceLang, password: pw }),
      });
      const data = await res.json();
      if (data.translations) {
        setTranslated(prev => ({...prev, [field]: data.translations}));
        setStatus("Traducido en 4 idiomas");
      } else {
        setStatus("Error: " + (data.error || "desconocido"));
      }
    } catch (e: any) {
      setStatus("Error: " + (e?.message || "desconocido"));
    }
    setTranslating(false);
  };

  const handleSave = async (publish = false) => {
    if (!form.slug || !form.titulo || !form.precio) {
      setStatus("❌ Slug, título y precio son obligatorios"); return;
    }
    setStatus("Guardando...");
    try {
      // Si no se ha traducido, usar el texto original en todos los idiomas
      const tituloFinal = {
        es: form.titulo, en: form.titulo, fr: form.titulo, ru: form.titulo
      };
      const descFinal = translated.descripcion || {
        es: form.descripcion, en: form.descripcion, fr: form.descripcion, ru: form.descripcion
      };
      if (!translated.titulo || !translated.descripcion) {
        setStatus("⚠️ Guardando sin traducir — se usará el mismo texto en todos los idiomas");
      }
      const property = {
        slug: form.slug,
        tipo: form.tipo,
        zona: form.zona,
        titulo: tituloFinal,
        descripcion: descFinal,
        precio: parseFloat(form.precio),
        habitaciones: parseInt(form.habitaciones)||0,
        banos: parseInt(form.banos)||0,
        m2_construidos: parseInt(form.m2Construidos)||0,
        m2_parcela: form.tieneJardin ? (parseInt(form.m2Parcela)||0) : 0,
        m2_terraza: parseInt(form.m2Terraza)||0,
        plazas_parking: parseInt(form.plazasParking)||0,
        ubicacion: form.ubicacion,
        video_url: convertGDriveUrl(form.videoUrl),
        galeria_urls: form.galeriaUrls.split("\n").map(s=>convertGDriveUrl(s.trim())).filter(Boolean),
        infografias: [],
        google_maps_url: form.google_maps_url,
        latitud: form.latitud ? parseFloat(form.latitud) : null,
        longitud: form.longitud ? parseFloat(form.longitud) : null,
        codigo_postal: form.codigo_postal,
        direccion: form.direccion,
        ano_construccion: form.ano_construccion ? parseInt(form.ano_construccion) : null,
        estado: form.estado,
        orientacion: form.orientacion,
        planta: form.planta ? parseInt(form.planta) : null,
        garajes: parseInt(form.garajes) || 0,
        trasteros: parseInt(form.trasteros) || 0,
        amueblado: form.amueblado,
        certificado_energetico: form.certificado_energetico,
        amenidades: form.amenidades,
        destacada: form.destacada,
        activa: publish ? true : form.activa,
      };
      const res = await fetch("/api/admin/save-property", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ password, property }),
      });
      const data = await res.json();
      if (data.ok) setStatus(publish ? "✅ Propiedad publicada" : "✅ Borrador guardado");
      else setStatus(`❌ ${data.error}`);
    } catch { setStatus("❌ Error al guardar"); }
  };

  return (
    <div style={{ padding:"32px" }}>
      <div style={{ marginBottom:"24px" }}>
        <p style={{ fontSize:"12px", color:"#4A4540", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 4px" }}>Panel de Administración</p>
        <h1 style={{ fontSize:"24px", fontWeight:700, color:"#111", margin:0 }}>Nueva Propiedad</h1>
      </div>

      <div style={{ background:"white", borderRadius:"12px", boxShadow:"0 1px 8px rgba(26,23,20,0.06)", padding:"32px" }}>

        {/* Idioma */}
        <label style={L}>Idioma del texto</label>
        <select value={form.sourceLang} onChange={e=>setForm(p=>({...p,sourceLang:e.target.value}))} style={F}>
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="ru">Русский</option>
        </select>

        {/* Tipo y Localidad */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
          <div>
            <label style={L}>Tipo de Propiedad</label>
            <select value={form.tipo} onChange={e=>setForm(p=>({...p,tipo:e.target.value}))} style={F}>
              <option value="">— Seleccionar —</option>
              <option value="villa">Villa</option>
              <option value="casa-adosada">Casa Adosada</option>
              <option value="atico">Apartamento — Ático</option>
              <option value="media-planta">Apartamento — Media Planta</option>
              <option value="bajo">Apartamento — Bajo</option>
              <option value="terreno">Terreno</option>
            </select>
          </div>
          <div>
            <label style={L}>Zona (filtro)</label>
            <select value={form.zona} onChange={e=>setForm(p=>({...p,zona:e.target.value}))} style={F}>
              <option value="">— Seleccionar —</option>
              <option value="marbella">Marbella</option>
              <option value="estepona">Estepona</option>
              <option value="mijas">Mijas</option>
              <option value="benahavis">Benahavís</option>
              <option value="sotogrande">Sotogrande</option>
            </select>
          </div>
        </div>

        {/* Título */}
        <label style={L}>Título</label>
        <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
          <input value={form.titulo}
            onChange={e=>setForm(p=>({...p,titulo:e.target.value,slug:generateSlug(e.target.value)}))}
            placeholder="Villa Annabel" style={{...F,marginBottom:0,flex:1}}/>

        </div>


        {/* Slug */}
        <label style={L}>Slug (URL)</label>
        <input value={form.slug} onChange={e=>setForm(p=>({...p,slug:e.target.value}))}
          placeholder="villa-annabel" style={F}/>

        {/* M² Terraza y Parking */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
            <div>
              <label style={L}>M² Terraza</label>
              <input type="number" value={form.m2Terraza} onChange={e=>setForm(p=>({...p,m2Terraza:e.target.value}))} style={INP} placeholder="0"/>
            </div>
            <div>
              <label style={L}>Plazas de Parking</label>
              <input type="number" value={form.plazasParking} onChange={e=>setForm(p=>({...p,plazasParking:e.target.value}))} style={INP} placeholder="0"/>
            </div>
          </div>

          {/* Descripción */}
        <label style={L}>Descripción</label>
        <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
          <textarea value={form.descripcion} onChange={e=>setForm(p=>({...p,descripcion:e.target.value}))}
            placeholder="Descripción..." rows={5}
            style={{...F,marginBottom:0,flex:1,resize:"vertical"}}/>

        </div>


        {/* Campos numéricos */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" }}>
          <div><label style={L}>Precio (€)</label>
            <input type="number" value={form.precio} onChange={e=>setForm(p=>({...p,precio:e.target.value}))} placeholder="4500000" style={F}/></div>
          <div><label style={L}>Habitaciones</label>
            <input type="number" value={form.habitaciones} onChange={e=>setForm(p=>({...p,habitaciones:e.target.value}))} placeholder="6" style={F}/></div>
          <div><label style={L}>Baños</label>
            <input type="number" value={form.banos} onChange={e=>setForm(p=>({...p,banos:e.target.value}))} placeholder="4" style={F}/></div>
          <div><label style={L}>M² Construidos</label>
            <input type="number" value={form.m2Construidos} onChange={e=>setForm(p=>({...p,m2Construidos:e.target.value}))} placeholder="1200" style={F}/></div>
          <div>
            <label style={{...L,display:"flex",alignItems:"center",gap:"6px"}}>
              <input type="checkbox" checked={form.tieneJardin} onChange={e=>setForm(p=>({...p,tieneJardin:e.target.checked}))}/>
              M² Parcela/Jardín
            </label>
            {form.tieneJardin && <input type="number" value={form.m2Parcela} onChange={e=>setForm(p=>({...p,m2Parcela:e.target.value}))} placeholder="3500" style={F}/>}
          </div>
          <div><label style={L}>Ubicación</label>
            <input value={form.ubicacion} onChange={e=>setForm(p=>({...p,ubicacion:e.target.value}))} placeholder="Golden Mile, Marbella" style={F}/></div>
        </div>

        {/* Separador */}
        <div style={{ borderTop:"2px solid #f3f4f6", margin:"8px 0 24px", paddingTop:"24px" }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"#111", margin:"0 0 20px" }}>📍 Ubicación detallada</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
            <div><label style={L}>Latitud</label>
              <input type="number" step="any" value={form.latitud} onChange={e=>setForm(p=>({...p,latitud:e.target.value}))} placeholder="36.5123" style={F}/></div>
            <div><label style={L}>Longitud</label>
              <input type="number" step="any" value={form.longitud} onChange={e=>setForm(p=>({...p,longitud:e.target.value}))} placeholder="-4.8765" style={F}/></div>
            <div><label style={L}>Código Postal</label>
              <input value={form.codigo_postal} onChange={e=>setForm(p=>({...p,codigo_postal:e.target.value}))} placeholder="29600" style={F}/></div>
            <div><label style={L}>Dirección</label>
              <input value={form.direccion} onChange={e=>setForm(p=>({...p,direccion:e.target.value}))} placeholder="Urb. Los Monteros, 12" style={F}/></div>
          </div>
          <div style={{ marginTop:"16px" }}>
            <label style={L}>URL Google Maps</label>
            <input value={form.google_maps_url} onChange={e=>setForm(p=>({...p,google_maps_url:e.target.value}))} placeholder="https://maps.google.com/..." style={F}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
          </div>
        </div>

        <div style={{ borderTop:"2px solid #f3f4f6", margin:"8px 0 24px", paddingTop:"24px" }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"#111", margin:"0 0 20px" }}>🏗️ Características adicionales</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" }}>
            <div><label style={L}>Año construcción</label>
              <input type="number" value={form.ano_construccion} onChange={e=>setForm(p=>({...p,ano_construccion:e.target.value}))} placeholder="2018" style={F}/></div>
            <div><label style={L}>Estado</label>
              <select value={form.estado} onChange={e=>setForm(p=>({...p,estado:e.target.value}))} style={F}>
                <option value="">— Seleccionar —</option>
                <option value="nueva">Nueva construcción</option>
                <option value="buen-estado">Buen estado</option>
                <option value="reformado">Reformado</option>
                <option value="a-reformar">A reformar</option>
              </select></div>
            <div><label style={L}>Orientación</label>
              <select value={form.orientacion} onChange={e=>setForm(p=>({...p,orientacion:e.target.value}))} style={F}>
                <option value="">— Seleccionar —</option>
                <option value="sur">Sur</option>
                <option value="norte">Norte</option>
                <option value="este">Este</option>
                <option value="oeste">Oeste</option>
                <option value="sur-este">Sur-Este</option>
                <option value="sur-oeste">Sur-Oeste</option>
              </select></div>
            <div><label style={L}>Planta</label>
              <input type="number" value={form.planta} onChange={e=>setForm(p=>({...p,planta:e.target.value}))} placeholder="3" style={F}/></div>
            <div><label style={L}>Garajes</label>
              <input type="number" value={form.garajes} onChange={e=>setForm(p=>({...p,garajes:e.target.value}))} placeholder="2" style={F}/></div>
            <div><label style={L}>Trasteros</label>
              <input type="number" value={form.trasteros} onChange={e=>setForm(p=>({...p,trasteros:e.target.value}))} placeholder="1" style={F}/></div>
            <div><label style={L}>Amueblado</label>
              <select value={form.amueblado} onChange={e=>setForm(p=>({...p,amueblado:e.target.value}))} style={F}>
                <option value="no">No</option>
                <option value="si">Sí</option>
                <option value="parcial">Parcial</option>
              </select></div>
            <div><label style={L}>Cert. Energético</label>
              <select value={form.certificado_energetico} onChange={e=>setForm(p=>({...p,certificado_energetico:e.target.value}))} style={F}>
                <option value="">— Seleccionar —</option>
                {["A","B","C","D","E","F","G"].map(l=><option key={l} value={l}>{l}</option>)}
              </select></div>
          </div>
        </div>

        <div style={{ borderTop:"2px solid #f3f4f6", margin:"8px 0 24px", paddingTop:"24px" }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"#111", margin:"0 0 16px" }}>✨ Amenidades</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
            {["Piscina","Jardín","Terraza","Ascensor","Aire acondicionado","Calefacción","Seguridad 24h","Spa","Gimnasio","Garaje","Trastero","Bodega","Cine","Sala de juegos","Pista de tenis","Paddle","Domótica","Vistas al mar","Primera línea de playa","Acceso directo playa","Urbanización cerrada"].map(a=>(
              <label key={a} style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"13px", cursor:"pointer", padding:"6px 12px", border:`1px solid ${form.amenidades.includes(a)?"#2563eb":"#C8C0B4"}`, borderRadius:"20px", background:form.amenidades.includes(a)?"#eff6ff":"white", color:form.amenidades.includes(a)?"#1d4ed8":"#1A1714", transition:"all 0.15s" }}>
                <input type="checkbox" checked={form.amenidades.includes(a)}
                  onChange={e=>setForm(p=>({...p,amenidades:e.target.checked?[...p.amenidades,a]:p.amenidades.filter(x=>x!==a)}))}
                  style={{ display:"none" }}/>
                {a}
              </label>
            ))}
          </div>
        </div>

        {/* Video */}
        <label style={L}>URL del Video — acepta Google Drive</label>
        <input value={form.videoUrl} onChange={e=>setForm(p=>({...p,videoUrl:e.target.value}))} placeholder="/videos/hero.mp4" style={F}/>

        {/* Galería */}
        <label style={L}>URLs de Galería (una por línea) — acepta Google Drive</label>
        <p style={{fontSize:"11px",color:"#8A847C",margin:"-8px 0 8px"}}>Pega el enlace de compartir de Google Drive directamente</p>
        <textarea value={form.galeriaUrls} onChange={e=>setForm(p=>({...p,galeriaUrls:e.target.value}))}
          placeholder="/gallery/foto1.jpg" rows={4} style={{...F,resize:"vertical"}}/>

        {/* Opciones */}
        <div style={{ display:"flex", gap:"24px", marginBottom:"24px" }}>
          <label style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"14px", cursor:"pointer" }}>
            <input type="checkbox" checked={form.destacada} onChange={e=>setForm(p=>({...p,destacada:e.target.checked}))}/>
            Destacada
          </label>
          <label style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"14px", cursor:"pointer" }}>
            <input type="checkbox" checked={form.activa} onChange={e=>setForm(p=>({...p,activa:e.target.checked}))}/>
            Activa
          </label>
        </div>

        {/* Botones */}
        <div style={{ display:"flex", gap:"12px" }}>
          <button onClick={()=>handleSave(false)} style={{...BTN("#4A4540"),flex:1}}>Guardar Borrador</button>
          <button onClick={()=>handleSave(true)} style={{...BTN("#16a34a"),flex:2}}>✦ Publicar Propiedad</button>
        </div>

        {/* Status */}
        {status && (
          <div style={{ padding:"12px 16px", borderRadius:"8px", marginTop:"16px",
            background: status.includes("traducido")?"#f0fdf4":status.includes("Traduciendo")?"#eff6ff":"#fef2f2",
            border:`1px solid ${status.includes("traducido")?"#86efac":status.includes("Traduciendo")?"#93c5fd":"#fca5a5"}`,
            color: status.includes("traducido")?"#166534":status.includes("Traduciendo")?"#1e40af":"#991b1b",
            fontSize:"14px" }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
