// Alma Mayor: servidor seguro para IA (Cloudflare Workers)
// La clave GEMINI_API_KEY se configura como secreto del Worker, nunca en GitHub.
// Configurar también ALLOWED_ORIGIN = https://profesoraamp-boop.github.io
const LIMIT = 500;
export default {
 async fetch(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = env.ALLOWED_ORIGIN || "https://profesoraamp-boop.github.io";
  const cors = {"Access-Control-Allow-Origin":allowed,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Vary":"Origin"};
  if (request.method === "OPTIONS") return new Response(null,{status:204,headers:cors});
  if (origin !== allowed) return new Response(JSON.stringify({error:"Origen no permitido"}),{status:403,headers:{...cors,"Content-Type":"application/json"}});
  if (request.method !== "POST") return new Response("Método no permitido",{status:405,headers:cors});
  if (!env.GEMINI_API_KEY) return new Response(JSON.stringify({error:"Servicio aún no configurado"}),{status:503,headers:{...cors,"Content-Type":"application/json"}});
  let data;
  try { data = await request.json(); } catch { return new Response("JSON inválido",{status:400,headers:cors}); }
  const message = typeof data.message==="string" ? data.message.trim().slice(0,LIMIT) : "";
  if (!message) return new Response(JSON.stringify({error:"Mensaje vacío"}),{status:400,headers:{...cors,"Content-Type":"application/json"}});
  const history = Array.isArray(data.history) ? data.history.slice(-8).filter(x=>x && ["user","model"].includes(x.role) && typeof x.text==="string").map(x=>({role:x.role,parts:[{text:x.text.slice(0,LIMIT)}]})) : [];
  const contents=[...history,{role:"user",parts:[{text:message}]}];
  const prompt="Eres Alma, una compañera virtual amable para Anita, una persona mayor en Chile. Habla en español chileno sencillo, con calidez, frases breves y preguntas de una en una. Nunca finjas ser una persona real ni reemplazar a su familia. No solicites datos personales. No diagnostiques ni des instrucciones médicas. Si hay una emergencia, sugiere contactar inmediatamente a familiares o servicios de emergencia. No asegures recordar cosas entre sesiones.";
  try {
   const upstream=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",{
    method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},
    body:JSON.stringify({systemInstruction:{parts:[{text:prompt}]},contents,generationConfig:{maxOutputTokens:320,temperature:0.7}})
   });
   const result=await upstream.json();
   if(!upstream.ok) return new Response(JSON.stringify({error:"IA temporalmente no disponible"}),{status:502,headers:{...cors,"Content-Type":"application/json"}});
   const reply=(result.candidates?.[0]?.content?.parts||[]).map(p=>p.text||"").join("").trim();
   return new Response(JSON.stringify({reply:reply||"Disculpa, Anita, ¿puedes repetirlo?"}),{headers:{...cors,"Content-Type":"application/json","Cache-Control":"no-store"}});
  } catch {return new Response(JSON.stringify({error:"Error de conexión"}),{status:502,headers:{...cors,"Content-Type":"application/json"}});}
 }
};
