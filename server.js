"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = __dirname, DB_DIR = path.join(ROOT, "data"), DB_FILE = path.join(DB_DIR, "tantera-db.json");
const PORT = Number(process.env.PORT || 3000), sessions = new Map();
const areas = ["Financeiro","Captação","Projetos","Eventos","Esportes","E-sports","Produtos","Digital"];
const categories = ["Esportes","Eventos","Identidade visual","Financeiro e Captação","Projetos"];
const products = [
  {id:"moletom",name:"Moletom",price:159.90,image:"assets/moletom.png",sizes:["P","M","G","GG"]},
  {id:"bone",name:"Boné",price:69.90,image:"assets/bone.png",sizes:[]},
  {id:"short-feminino",name:"Short feminino",price:59.90,image:"assets/short-feminino.png",sizes:["P","M","G","GG"]},
  {id:"camisa-feminina",name:"Camisa feminina",price:69.90,image:"assets/camisa-feminina.png",sizes:["P","M","G","GG"]},
  {id:"chaveiro",name:"Chaveiro",price:12.90,image:"assets/chaveiro.png",sizes:[]}
];
const archiveSeed = [
  {id:"arc-2025-esportes",title:"Regulamento da Copa Tantera 2025",year:"2025",area:"Esportes",category:"Esportes",description:"Regras, formato das partidas, critérios de desempate e orientações para a arbitragem. Exemplo de acervo.",keywords:"copa regulamento arbitragem jogos",status:"Aprovada",example:true,materials:[]},
  {id:"arc-2025-eventos",title:"Checklist da Festa de abertura",year:"2025",area:"Eventos",category:"Eventos",description:"Checklist de fornecedores, cronograma de montagem, controle de público e aprendizados para a próxima edição. Exemplo de acervo.",keywords:"festa checklist fornecedores cronograma",status:"Aprovada",example:true,materials:[]},
  {id:"arc-2024-identidade",title:"Kit de identidade visual da gestão 2024",year:"2024",area:"Digital",category:"Identidade visual",description:"Paleta, fontes, versões do mascote, modelos de posts e materiais de divulgação. Exemplo de acervo.",keywords:"logo mascote paleta fonte posts",status:"Aprovada",example:true,materials:[]},
  {id:"arc-2024-projetos",title:"Relato da campanha de arrecadação",year:"2024",area:"Projetos",category:"Projetos",description:"Documentação da iniciativa, links utilizados e aprendizados para novas campanhas. Exemplo de acervo.",keywords:"campanha documentação captação aprendizados",status:"Aprovada",example:true,materials:[]}
];
function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) { return {salt, hash:crypto.scryptSync(password, salt, 64).toString("hex")}; }
function verifyPassword(password, user) { const h=crypto.scryptSync(password,user.passwordSalt,64); return crypto.timingSafeEqual(h,Buffer.from(user.passwordHash,"hex")); }
function id() { return crypto.randomUUID(); }
function loadDb() { fs.mkdirSync(DB_DIR,{recursive:true}); if(!fs.existsSync(DB_FILE)){ const db={users:[],records:archiveSeed,suggestions:[]}; const email=process.env.TANTERA_ADMIN_EMAIL, password=process.env.TANTERA_ADMIN_PASSWORD; if(email&&password){const p=hashPassword(password);db.users.push({id:id(),name:process.env.TANTERA_ADMIN_NAME||"Presidência Tantera",email:email.toLowerCase(),role:"presidente",area:"Todas",active:true,mustChangePassword:false,passwordSalt:p.salt,passwordHash:p.hash}); console.log(`Conta da presidência criada para ${email}`);} fs.writeFileSync(DB_FILE,JSON.stringify(db,null,2)); return db; } return JSON.parse(fs.readFileSync(DB_FILE,"utf8")); }
let db=loadDb();
function persist(){fs.writeFileSync(DB_FILE,JSON.stringify(db,null,2));}
function body(req){return new Promise((resolve,reject)=>{let raw="";req.on("data",c=>raw+=c);req.on("end",()=>{try{resolve(raw?JSON.parse(raw):{})}catch{reject(new Error("JSON inválido"))}});req.on("error",reject)})}
function send(res,status,data,headers={}){res.writeHead(status,{"Content-Type":"application/json; charset=utf-8",...headers});res.end(JSON.stringify(data));}
function cookie(req,name){return (req.headers.cookie||"").split(";").map(x=>x.trim().split("=")).find(x=>x[0]===name)?.[1]}
function userFrom(req){const token=cookie(req,"tantera_session");const uid=sessions.get(token);return uid&&db.users.find(u=>u.id===uid&&u.active)||null}
function safeUser(u){return u&&{id:u.id,name:u.name,email:u.email,role:u.role,area:u.area,active:u.active,mustChangePassword:u.mustChangePassword};}
function requireAuth(req,res){const u=userFrom(req);if(!u){send(res,401,{error:"Faça login para acessar a Área da equipe."});return null}return u}
function isLeader(u){return u.role==="presidente"} function canArea(u,area){return isLeader(u)||u.area===area}
async function api(req,res,url){
  if(req.method==="POST"&&url==="/api/auth/login"){const b=await body(req),u=db.users.find(x=>x.email===String(b.email||"").trim().toLowerCase());if(!u||!u.active||!verifyPassword(String(b.password||""),u))return send(res,401,{error:"E-mail ou senha inválidos."});const token=crypto.randomBytes(32).toString("hex");sessions.set(token,u.id);send(res,200,{user:safeUser(u)}, {"Set-Cookie":`tantera_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`});return}
  if(req.method==="POST"&&url==="/api/auth/logout"){sessions.delete(cookie(req,"tantera_session"));return send(res,200,{ok:true},{"Set-Cookie":"tantera_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"})}
  if(req.method==="GET"&&url==="/api/auth/me"){const u=userFrom(req);return send(res,200,{user:safeUser(u)})}
  const u=requireAuth(req,res);if(!u)return;
  if(req.method==="POST"&&url==="/api/auth/change-password"){const b=await body(req);if(String(b.password||"").length<3)return send(res,400,{error:"A nova senha precisa ter pelo menos 3 caracteres."});const p=hashPassword(b.password);Object.assign(u,{passwordSalt:p.salt,passwordHash:p.hash,mustChangePassword:false});persist();return send(res,200,{user:safeUser(u)})}
  if(u.mustChangePassword)return send(res,403,{code:"PASSWORD_CHANGE_REQUIRED",error:"Troque sua senha temporária antes de continuar."});
  if(req.method==="GET"&&url==="/api/team/products")return send(res,200,{products});
  if(req.method==="GET"&&url==="/api/team/records"){const records=db.records.filter(r=>r.status==="Aprovada"||(r.status==="Pendente"&&canArea(u,r.area)));const suggestions=db.suggestions.filter(s=>s.status==="Pendente"&&canArea(u,s.area));return send(res,200,{records,suggestions,areas,categories})}
  if(req.method==="POST"&&url==="/api/team/suggestions"){const b=await body(req);if(!areas.includes(b.area))return send(res,400,{error:"Área inválida."});const suggestion={id:id(),title:String(b.title||"").trim(),year:String(b.year||"").trim(),area:b.area,category:b.category,description:String(b.description||"").trim(),keywords:String(b.keywords||"").trim(),materials:Array.isArray(b.materials)?b.materials:[],status:"Pendente",submittedBy:u.id};if(!suggestion.title||!suggestion.description)return send(res,400,{error:"Título e descrição são obrigatórios."});db.suggestions.push(suggestion);persist();return send(res,201,{suggestion})}
  if(req.method==="POST"&&url==="/api/team/records"){const b=await body(req);if(!canArea(u,b.area))return send(res,403,{error:"Você só pode criar registros da sua área."});const record={...b,id:id(),status:"Aprovada",example:false};db.records.push(record);persist();return send(res,201,{record})}
  const recordPath=url.match(/^\/api\/team\/records\/([^/]+)$/);if(req.method==="PATCH"&&recordPath){const record=db.records.find(x=>x.id===recordPath[1]);if(!record||!canArea(u,record.area))return send(res,403,{error:"Você só pode editar registros da sua área."});const b=await body(req);Object.assign(record,{title:b.title??record.title,year:b.year??record.year,category:b.category??record.category,description:b.description??record.description,keywords:b.keywords??record.keywords,materials:b.materials??record.materials});persist();return send(res,200,{record})}
  const action=url.match(/^\/api\/team\/suggestions\/([^/]+)\/(approve|reject)$/);if(req.method==="POST"&&action){const s=db.suggestions.find(x=>x.id===action[1]);if(!s||!canArea(u,s.area))return send(res,403,{error:"Esta sugestão pertence a outra área."});s.status=action[2]==="approve"?"Aprovada":"Recusada";if(s.status==="Aprovada")db.records.push({...s,id:s.id,status:"Aprovada"});persist();return send(res,200,{suggestion:s})}
  if(req.method==="GET"&&url==="/api/team/members"){if(!isLeader(u))return send(res,403,{error:"Apenas a presidência pode gerenciar a equipe."});return send(res,200,{users:db.users.map(safeUser)})}
  if(req.method==="POST"&&url==="/api/team/members"){if(!isLeader(u))return send(res,403,{error:"Apenas a presidência pode gerenciar a equipe."});const b=await body(req),email=String(b.email||"").trim().toLowerCase();if(db.users.some(x=>x.email===email))return send(res,409,{error:"Este e-mail já está cadastrado."});const p=hashPassword(String(b.temporaryPassword||""));if(!b.name||!email||String(b.temporaryPassword||"").length<3)return send(res,400,{error:"Nome, e-mail e senha temporária de 3 caracteres são obrigatórios."});const member={id:id(),name:b.name,email,role:b.role==="diretor"?"diretor":"integrante",area:b.area||"",active:true,mustChangePassword:true,passwordSalt:p.salt,passwordHash:p.hash};db.users.push(member);persist();return send(res,201,{user:safeUser(member)})}
  const member=url.match(/^\/api\/team\/members\/([^/]+)$/);if(req.method==="PATCH"&&member){if(!isLeader(u))return send(res,403,{error:"Apenas a presidência pode gerenciar a equipe."});const target=db.users.find(x=>x.id===member[1]);if(!target)return send(res,404,{error:"Conta não encontrada."});const b=await body(req);if(typeof b.active==="boolean")target.active=b.active;if(b.temporaryPassword){const p=hashPassword(b.temporaryPassword);Object.assign(target,p,{mustChangePassword:true})}if(b.name)target.name=b.name;if(b.area)target.area=b.area;persist();return send(res,200,{user:safeUser(target)})}
  return send(res,404,{error:"Rota não encontrada."});
}
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg"};
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,`http://${req.headers.host}`).pathname;if(url.startsWith("/api/"))return await api(req,res,url);const file=path.normalize(path.join(ROOT,url==="/"?"index.html":url));if(!file.startsWith(ROOT))return send(res,403,{error:"Acesso negado"});if(!fs.existsSync(file)||fs.statSync(file).isDirectory())return send(res,404,{error:"Arquivo não encontrado"});res.writeHead(200,{"Content-Type":mime[path.extname(file)]||"application/octet-stream"});fs.createReadStream(file).pipe(res)}catch(e){console.error(e);send(res,500,{error:"Erro interno do servidor"})}});
server.listen(PORT,()=>console.log(`Tantera em http://localhost:${PORT}`));
