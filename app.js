// HAVILA — site public : Supabase si configuré, sinon contenus intégrés (fallback)
const FALLBACK_TEAM=[
{name:"Ir. Freddy CUBAKA BAFUNYEMBAKA",role:"Directeur Général",bio:"Directeur Général et responsable du Centre Évangélique Havila."},
{name:"Narcisse",role:"Logistique • Transport",bio:"Responsable de la logistique et chargé de Havila Transport."},
{name:"Amani BAFUNYEMBAKA Obed",role:"DAF • Havila Immo",bio:"DAF et responsable de Havila Immo."},
{name:"Moïse MUGISHO BAFUNYEMBAKA",role:"Assistant DAF • Secrétaire",bio:"Assistant du DAF et secrétaire de la société."},
{name:"Ir. Emmanuel BIRINDWA MUGOZI",role:"Directeur des projets",bio:"Directeur des projets et responsable de Havila Construction."},
{name:"Oscar",role:"AgriHavila • Centre Commercial",bio:"Responsable d’AgriHavila et du Centre Commercial Havila."},
{name:"Boss Iragi",role:"Secrétaire adjoint",bio:"Secrétaire adjoint, responsable de C.S Havila et de l’Université Technologique Havila."},
{name:"Pascaline CIKWANINE BAFUNYEMBAKA",role:"Training • Event",bio:"Responsable de Havila Training et Havila Event."}];
const FALLBACK_DEPTS=[
{title:"HAVILA CONSTRUCTION",category:"Construction",description:"Génie civil, architecture, bâtiments, routes, études et matériaux de construction.",image_url:"images/construction.jpg"},
{title:"AGRIHAVILA",category:"Agriculture",description:"Agriculture, cultures, transformation et commercialisation.",image_url:"images/agriculture.jpg"},
{title:"HAVILA ÉLEVAGE",category:"Élevage",description:"Élevage bovin, porcin, aviculture et pisciculture.",image_url:"images/elevage-bovin.jpg"},
{title:"HAVILA TRAINING",category:"Formation",description:"Informatique, bureautique, AutoCAD, Archicad, Robot Structural Analysis, Covadis et langues.",image_url:"images/training.jpg"},
{title:"HAVILA TRANSPORT",category:"Transport",description:"Transport et logistique.",image_url:"images/transport.jpg"},
{title:"CENTRE COMMERCIAL HAVILA",category:"Commerce",description:"Boulangerie, distribution et commerce.",image_url:"images/commerce.jpg"},
{title:"HAVILA IMMO",category:"Immobilier",description:"Activités immobilières.",image_url:"images/immo.jpg"},
{title:"AUTRES STRUCTURES",category:"Autres",description:"Université Technologique Havila, École de Bérée, Centre Évangélique Havila, C.S Havila et Havila Event.",image_url:"images/evenement.jpg"}];
function initials(n){return n.split(" ").filter(w=>w.length>1).slice(0,2).map(w=>w[0]).join("").toUpperCase()}
function renderTeam(list){document.getElementById("teamGrid").innerHTML=list.map(m=>`<div class="member"><div class="member-photo"><div class="avatar">${m.photo_url?`<img src="${m.photo_url}" alt="">`:initials(m.full_name||m.name)}</div></div><div class="member-body"><h3>${m.full_name||m.name}</h3><div class="role">${m.role}</div><p>${m.bio||""}</p></div></div>`).join("")}
function renderDepts(list){document.getElementById("deptGrid").innerHTML=list.map(d=>`<div class="card"><div class="card-img"><img src="${d.image_url}" alt="${d.title}"></div><div class="card-body"><span class="tag">${d.category||""}</span><h3>${d.title}</h3><p>${d.description||""}</p></div></div>`).join("")}
function renderList(elId,list,emptyMsg,fn){const el=document.getElementById(elId); if(!list||!list.length){el.innerHTML=`<p style="color:var(--muted)">${emptyMsg}</p>`;return} el.innerHTML=list.map(fn).join("")}
async function loadPublic(){
  renderTeam(FALLBACK_TEAM); renderDepts(FALLBACK_DEPTS);
  const cfg=window.HAVILA_CONFIG||{}; const configured=cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("VOTRE-PROJET");
  if(!configured){renderList("newsGrid",[],"Aucune actualité publiée pour le moment.",()=> ""); renderList("projectsGrid",[],"Aucun projet publié.",()=> ""); renderList("partnersGrid",[],"Aucun partenaire publié.",()=> ""); renderList("oppoList",[],"Aucune offre en cours.",()=> ""); return}
  try{
    const sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
    window.__havila_sb=sb;
    const [st,t,d,p,n,pa,o]=await Promise.all([
      sb.from("site_settings").select("*").eq("id",1).maybeSingle(),
      sb.from("team_members").select("*").eq("is_published",true).order("order_index"),
      sb.from("departments").select("*").eq("is_published",true).order("order_index"),
      sb.from("projects").select("*").eq("is_published",true).order("created_at",{ascending:false}),
      sb.from("news").select("*").eq("is_published",true).order("published_at",{ascending:false}),
      sb.from("partners").select("*").eq("is_published",true).order("order_index"),
      sb.from("opportunities").select("*").eq("is_published",true).order("created_at",{ascending:false})]);
    if(t.data?.length) renderTeam(t.data);
    if(d.data?.length) renderDepts(d.data);
    if(st.data){ if(st.data.about_text) document.getElementById("aboutText").textContent=st.data.about_text; if(st.data.vision_text) document.getElementById("visionText").textContent=st.data.vision_text; if(st.data.mission_text) document.getElementById("missionText").textContent=st.data.mission_text; if(st.data.dg_message) document.getElementById("dgText").textContent=st.data.dg_message; }
    renderList("projectsGrid",p.data||[],"Aucun projet publié.",x=>`<div class="card"><div class="card-img">${x.image_url?`<img src="${x.image_url}">`:""}</div><div class="card-body"><span class="tag">${x.category||""} • ${x.status||""}</span><h3>${x.title}</h3><p>${x.description||""}</p>${x.is_illustration?`<p style="font-size:12px;color:var(--muted)">Illustration représentative</p>`:""}</div></div>`);
    renderList("newsGrid",n.data||[],"Aucune actualité publiée.",x=>`<article class="card"><div class="card-img">${x.image_url?`<img src="${x.image_url}">`:""}</div><div class="card-body"><span class="tag">${x.category||"Actualités"}</span><h3>${x.title}</h3><p>${x.excerpt||""}</p><p style="font-size:13px;color:var(--muted)">${x.published_at||""}</p></div></article>`);
    renderList("partnersGrid",pa.data||[],"Aucun partenaire publié.",x=>`<div class="card"><div class="card-body" style="text-align:center">${x.logo_url?`<img src="${x.logo_url}" style="height:70px;object-fit:contain;margin:0 auto 10px">`:""}<h3>${x.name}</h3><p>${x.description||""}</p>${x.website?`<a href="${x.website}" target="_blank" style="font-weight:700">Visiter →</a>`:""}</div></div>`);
    renderList("oppoList",o.data||[],"Aucune offre en cours.",x=>`<div style="border:1px solid #E6E9F2;border-radius:12px;padding:12px"><b>${x.title}</b> — ${x.type||""} • ${x.location||"Bukavu"}<br><span style="color:var(--muted);font-size:13px">${x.description||""}</span></div>`);
    document.getElementById("projectsEmpty").style.display=(p.data?.length?"none":"block");
    document.getElementById("partnersEmpty").style.display=(pa.data?.length?"none":"block");
  }catch(e){console.warn("Supabase indisponible, fallback affiché",e)}
}
document.getElementById("contactForm")?.addEventListener("submit",async e=>{
  e.preventDefault(); const f=new FormData(e.target); const payload={name:f.get("name"),phone:f.get("phone"),email:f.get("email"),department:f.get("department"),message:f.get("message")};
  const msg=document.getElementById("formMsg");
  try{ if(window.__havila_sb){ const {error}=await window.__havila_sb.from("contact_messages").insert([payload]); if(error) throw error; msg.textContent="✅ Merci ! Votre message a bien été envoyé. Nous vous recontactons très vite."; e.target.reset(); return; } }catch(err){ console.warn(err) }
  // Secours WhatsApp si Supabase non configuré
  const text=`Bonjour HAVILA,%0A%0ANom: ${encodeURIComponent(payload.name)}%0ATéléphone: ${encodeURIComponent(payload.phone||"")}%0AE-mail: ${encodeURIComponent(payload.email||"")}%0ADépartement: ${encodeURIComponent(payload.department)}%0A%0AMessage: ${encodeURIComponent(payload.message)}`;
  msg.textContent="Ouverture de WhatsApp avec votre message pré-rempli…"; window.open("https://wa.me/243973708481?text="+text,"_blank");
});
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting)x.target.classList.add("visible")}),{threshold:.1});
document.querySelectorAll(".card,.member").forEach(el=>{el.classList.add("reveal");io.observe(el)});
loadPublic();
