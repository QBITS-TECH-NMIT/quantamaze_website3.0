import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/* =====================================================================
   Quant-A-Maze 3.0 · Inauguration
   One component, three views, chosen by the URL:
     (no params)        -> landing page with the stage + phone links
     ?role=stage        -> auditorium display
     ?p=1 ... ?p=5      -> a guest's phone (optional &n1=Name label)
   Realtime sync: Supabase Postgres changes for the shared qam3 room.
   ===================================================================== */

const CONFIG = {
  room: "qam3",
  showStatus: false, // true = show the five circles + bar on the stage (or add &hud=1)
  holdMs: 1500,      // how long all five must hold together
  flameMs: 3000,     // how long flames burn before the welcome
  names: ["Chief Guest", "Chief Guest", "HOD", "HOD", "Student"], // fallback labels for 1..5
};

/* ---------------- tiny realtime layer (module-level) ---------------- */
const Q = new URLSearchParams(window.location.search);
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const STATE_TABLE = "inauguration_state";
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
let S = {}; // shared state mirror
const subs = new Set();
const notify = () => subs.forEach((f) => f(S));
let netState = supabase ? "connecting…" : "database not configured";
let hydrated = false;
let loadingSnapshot = false;
let realtimeConnected = false;
let snapshotInterval = null;
let pendingChanges = [];
const pendingWrites = new Map();

function setPath(path, val) {
  const k = path.split("/").filter(Boolean);
  if (!k.length) { S = val || {}; return; }
  let o = S;
  for (let i = 0; i < k.length - 1; i++) {
    o = o[k[i]] = o[k[i]] && typeof o[k[i]] === "object" ? o[k[i]] : {};
  }
  if (val === null || val === undefined) delete o[k[k.length - 1]];
  else o[k[k.length - 1]] = val;
}

function applyDatabaseChange(payload) {
  const isDelete = payload.eventType === "DELETE";
  const record = isDelete ? payload.old : payload.new;
  if (!record || typeof record.state_key !== "string") {
    console.error("[Inauguration] Received a malformed Supabase realtime event.", payload);
    return;
  }
  setPath(record.state_key, isDelete ? null : record.value);
}

async function persistWrite({ path, value }) {
  let result;
  if (value === null || value === undefined) {
    let query = supabase
      .from(STATE_TABLE)
      .delete()
      .eq("room_id", CONFIG.room);
    query = path === "p"
      ? query.like("state_key", "p/%")
      : query.eq("state_key", path);
    result = await query;
  } else {
    result = await supabase
      .from(STATE_TABLE)
      .upsert({
        room_id: CONFIG.room,
        state_key: path,
        value,
      }, { onConflict: "room_id,state_key" });
  }
  if (result.error) throw result.error;
}

function flushPendingWrites() {
  const writes = [...pendingWrites.values()];
  pendingWrites.clear();
  for (const write of writes) {
    persistWrite(write).catch((error) => {
      netState = "write failed";
      notify();
      console.error(`[Inauguration] Supabase write failed for "${write.path}". Check the database migration and RLS policies.`, error);
    });
  }
}

async function loadSnapshot() {
  if (!supabase || loadingSnapshot) return;
  loadingSnapshot = true;
  netState = realtimeConnected ? "syncing…" : "syncing (polling)…";
  notify();
  try {
    const { data, error } = await supabase
      .from(STATE_TABLE)
      .select("state_key, value")
      .eq("room_id", CONFIG.room);
    if (error) throw error;

    S = {};
    for (const row of data || []) setPath(row.state_key, row.value);
    for (const payload of pendingChanges) applyDatabaseChange(payload);
    pendingChanges = [];
    for (const write of pendingWrites.values()) setPath(write.path, write.value);
    hydrated = true;
    netState = realtimeConnected ? "online" : "online · polling";
    notify();
    flushPendingWrites();
    if (realtimeConnected) stopSnapshotFallback();
  } catch (error) {
    netState = "database read failed · retrying";
    notify();
    console.error("[Inauguration] Could not load Supabase inauguration state; retrying.", error);
    if (hydrated) {
      for (const payload of pendingChanges) applyDatabaseChange(payload);
      pendingChanges = [];
      flushPendingWrites();
    }
    startSnapshotFallback();
  } finally {
    loadingSnapshot = false;
  }
}

function startSnapshotFallback() {
  if (snapshotInterval !== null) return;
  void loadSnapshot();
  snapshotInterval = setInterval(() => { void loadSnapshot(); }, 750);
}

function stopSnapshotFallback() {
  if (snapshotInterval === null) return;
  clearInterval(snapshotInterval);
  snapshotInterval = null;
}

function put(path, value) {
  setPath(path, value);
  notify();
  if (!supabase) return;
  const write = { path, value };
  if (!hydrated || loadingSnapshot) pendingWrites.set(path, write);
  else {
    persistWrite(write).catch((error) => {
      netState = "write failed";
      notify();
      console.error(`[Inauguration] Supabase write failed for "${path}". Check the database migration and RLS policies.`, error);
    });
  }
}

if (supabase) {
  supabase
    .channel(`inauguration:${CONFIG.room}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: STATE_TABLE,
      filter: `room_id=eq.${CONFIG.room}`,
    }, (payload) => {
      if (!hydrated || loadingSnapshot) pendingChanges.push(payload);
      else {
        applyDatabaseChange(payload);
        notify();
      }
    })
    .subscribe((status, error) => {
      if (status === "SUBSCRIBED") {
        realtimeConnected = true;
        stopSnapshotFallback();
        void loadSnapshot();
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        realtimeConnected = false;
        netState = "reconnecting…";
        notify();
        if (error) console.error("[Inauguration] Supabase realtime connection failed.", error);
        startSnapshotFallback();
      }
    });
  if (!realtimeConnected) startSnapshotFallback();
}

/** Re-render the component whenever shared state changes. */
function useShared() {
  const [, bump] = useReducer((x) => x + 1, 0);
  useEffect(() => { subs.add(bump); return () => subs.delete(bump); }, []);
  return S;
}

const nameOf = (n) => Q.get("n" + n) || (S.names && S.names[n]) || `${CONFIG.names[n - 1]} ${n}`;

/* ---------------- styles ---------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Outfit:wght@300;500;700&display=swap');
:root{
  --ink:#0a0a0a; --ink2:#151515; --gold:#f5590a; --ivory:#f2f2f2;
  --flame:#f5590a; --flame2:#ff8c3a; --velvet:#111111; --velvet2:#202020;
  --display:'Cinzel',Georgia,serif; --body:'Outfit',system-ui,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body,#root{height:100%;background:var(--ink);color:var(--ivory);font-family:var(--body);overflow:hidden;touch-action:none}

/* STAGE */
#stage{position:fixed;inset:0;background:radial-gradient(ellipse at 50% 85%,#1a1512 0%,var(--ink) 65%)}
#math{position:absolute;inset:0;overflow:hidden;opacity:.14}
#math span{position:absolute;font-family:var(--display);color:var(--gold);animation:drift linear infinite}
@keyframes drift{from{transform:translateY(110vh) rotate(0)}to{transform:translateY(-20vh) rotate(40deg)}}
#lampWrap{position:absolute;left:50%;bottom:-2vh;height:92vh;aspect-ratio:600/700;transform:translate(-50%,115%);transition:transform 3.2s cubic-bezier(.2,.8,.2,1) .9s}
#stage.open #lampWrap{transform:translate(-50%,0)}
#lampWrap svg{width:100%;height:100%;overflow:visible}
.flame{transform-box:fill-box;transform-origin:50% 100%;transform:scale(0);opacity:0}
#stage.lit .flame,#stage.welcome .flame{opacity:1;animation:ignite .9s ease-out forwards,flick 1.3s ease-in-out .9s infinite}
#stage.lit .flame:nth-child(2n),#stage.welcome .flame:nth-child(2n){animation-duration:.9s,1.1s}
#stage.lit .flame:nth-child(3n),#stage.welcome .flame:nth-child(3n){animation-duration:.9s,1.6s}
@keyframes ignite{to{transform:scale(1)}}
@keyframes flick{0%,100%{transform:scale(1,1) skewX(0)}30%{transform:scale(.94,1.08) skewX(2deg)}60%{transform:scale(1.04,.95) skewX(-2deg)}}
.glow{opacity:0;transition:opacity 1.5s}
#stage.lit .glow,#stage.welcome .glow{opacity:1}

.curtain{position:absolute;top:0;bottom:0;width:50.5%;z-index:5;transition:transform 3s cubic-bezier(.7,0,.2,1);
  background:repeating-linear-gradient(90deg,var(--velvet) 0,var(--velvet2) 5%,var(--velvet) 10%,#090909 14%,var(--velvet) 18%);box-shadow:inset 0 -80px 120px rgba(0,0,0,.55)}
#cL{left:0;border-right:3px solid var(--gold)} #cR{right:0;border-left:3px solid var(--gold)}
#stage.open #cL{transform:translateX(-102%)} #stage.open #cR{transform:translateX(102%)}
#valance{position:absolute;top:0;left:0;right:0;height:9vh;z-index:6;background:linear-gradient(var(--velvet2),var(--velvet));border-bottom:4px solid var(--gold);display:flex;align-items:center;justify-content:center;font-family:var(--display);font-size:3.2vh;letter-spacing:.35em;color:var(--gold)}
#idleMsg{position:absolute;z-index:7;left:50%;top:52%;transform:translate(-50%,-50%);text-align:center;transition:opacity 1s}
#idleMsg h1{font-family:var(--display);font-size:7vh;font-weight:900;color:var(--gold);text-shadow:0 0 40px rgba(245,89,10,.4)}
#idleMsg p{margin-top:2vh;font-size:2.6vh;font-weight:300;letter-spacing:.2em}
#stage.open #idleMsg{opacity:0;pointer-events:none}

#hud{position:absolute;z-index:4;left:0;right:0;bottom:3vh;display:flex;flex-direction:column;align-items:center;gap:1.6vh;opacity:0;transition:opacity 1s 3s}
#stage.open:not(.lit):not(.welcome) #hud{opacity:1}
#slots{display:flex;gap:2.4vw}
.slot{cursor:pointer;width:9vh;text-align:center;font-size:1.7vh;font-weight:500;opacity:.55;transition:.25s}
.slot i{display:block;width:5.6vh;height:5.6vh;margin:0 auto 1vh;border-radius:50%;border:2px solid var(--gold);transition:.2s}
.slot.on{opacity:1}.slot.on i{background:var(--flame);box-shadow:0 0 28px var(--flame);border-color:var(--flame2)}
.slot.live i{background:rgba(245,89,10,.25)}
#bar{width:42vw;height:.9vh;border-radius:9px;background:rgba(255,255,255,.12);overflow:hidden}
#bar b{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--flame),var(--flame2))}
#stage.nohud #hud{display:none}
#hint{display:none;font-size:2.2vh;font-weight:300;letter-spacing:.18em}

#welcome{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none;opacity:0;background:radial-gradient(circle,rgba(10,10,10,.55),rgba(10,10,10,.92));transition:opacity .6s}
#stage.welcome #welcome{opacity:1}
#welcome small{font-family:var(--display);font-size:5vh;letter-spacing:.5em;color:var(--ivory)}
#welcome h2{font-family:var(--display);font-weight:900;font-size:13vh;line-height:1.1;margin-top:2vh;color:var(--gold)}
#welcome h2 span{display:inline-block;opacity:0;transform:translateY(5vh) scale(.6);filter:blur(12px)}
#stage.welcome #welcome h2 span{animation:letter .6s cubic-bezier(.2,1.2,.3,1) forwards;animation-delay:calc(var(--i)*45ms + .1s)}
@keyframes letter{to{opacity:1;transform:none;filter:none;text-shadow:0 0 50px rgba(245,89,10,.7)}}
#welcome p{margin-top:4vh;font-size:3vh;font-weight:300;letter-spacing:.3em;opacity:0}
#stage.welcome #welcome p{animation:fade .6s 1.1s forwards}
@keyframes fade{to{opacity:.9}}
#fx{position:absolute;inset:0;z-index:9;pointer-events:none}
#net{position:absolute;right:1.5vw;top:10.5vh;z-index:10;font-size:1.5vh;opacity:.5}

/* PHONE */
#phone{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:max(5vh,env(safe-area-inset-top)) 6vw max(5vh,env(safe-area-inset-bottom));background:radial-gradient(ellipse at 50% 70%,#1a1512,var(--ink) 70%);user-select:none;-webkit-user-select:none}
#phone header{text-align:center}
#phone header h1{font-family:var(--display);font-size:22px;color:var(--gold);letter-spacing:.12em}
#phone header p{margin-top:6px;font-size:15px;font-weight:300;opacity:.8}
#who{font-size:26px;font-weight:700;margin-top:18px}
#phone #net{position:fixed;top:12px;right:12px;font-size:12px;opacity:.65}
#btn{position:relative;width:min(70vw,46vh);aspect-ratio:1;border-radius:50%;border:3px solid var(--gold);background:radial-gradient(circle at 50% 35%,#24201e,#111111);color:var(--ivory);font:700 22px var(--display);letter-spacing:.14em;display:grid;place-items:center;touch-action:none;transition:transform .12s,box-shadow .2s;box-shadow:0 0 0 10px rgba(245,89,10,.08);-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
#btn.down{transform:scale(.94);background:radial-gradient(circle at 50% 35%,var(--flame2),var(--flame) 55%,#a33b0c);color:#0a0a0a;box-shadow:0 0 90px 18px rgba(245,89,10,.55)}
#btn:disabled{opacity:.35}
#status{font-size:17px;font-weight:300;text-align:center;min-height:48px;letter-spacing:.04em}

/* LANDING */
#home{position:fixed;inset:0;overflow:auto;overflow-x:hidden;padding:104px 24px 48px;touch-action:auto;background:radial-gradient(ellipse at 50% 42%,rgba(245,89,10,.08),transparent 65%),var(--ink)}
#home::before{position:fixed;inset:0;z-index:0;content:"";pointer-events:none;background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,.64) 100%)}
#home .home-sphere-wrap{position:fixed;z-index:0;top:18%;right:max(3vw,calc((100vw - 1200px)/2));width:min(42vw,500px);aspect-ratio:1;pointer-events:none;transform:translate3d(var(--parallax-x,0px),var(--parallax-y,0px),0);opacity:.32}
#home .home-sphere{position:absolute;inset:0;border:1px solid rgba(245,89,10,.28);border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(245,89,10,.08),transparent 62%);transform-style:preserve-3d;animation:home-sphere-rotate 80s linear infinite}
#home .home-sphere::before,#home .home-sphere::after{position:absolute;inset:0;border:1px solid rgba(245,89,10,.24);border-radius:50%;content:""}
#home .home-sphere::before{transform:rotateY(55deg)}
#home .home-sphere::after{transform:rotateY(125deg)}
#home .sphere-meridian{position:absolute;inset:0;border:1px solid rgba(245,89,10,.18);border-radius:50%}
#home .sphere-meridian:nth-child(2){transform:rotateY(25deg)}
#home .sphere-meridian:nth-child(3){transform:rotateY(85deg)}
#home .sphere-meridian:nth-child(4){transform:rotateY(145deg)}
#home .sphere-latitude{position:absolute;left:0;right:0;height:38%;border:1px solid rgba(245,89,10,.16);border-radius:50%}
#home .sphere-latitude:nth-child(5){top:31%;transform:rotateX(48deg)}
#home .sphere-latitude:nth-child(6){top:31%;transform:rotateX(-48deg)}
#home .sphere-latitude:nth-child(7){top:31%;height:38%;transform:scaleY(.55)}
@keyframes home-sphere-rotate{to{transform:rotateY(360deg) rotateX(12deg)}}
#home .home-content{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,.88fr) minmax(0,1.12fr);align-items:stretch;gap:22px;max-width:1100px;margin:0 auto}
#home .home-intro{align-self:center;animation:home-enter 500ms cubic-bezier(.16,1,.3,1) both}
#home h1{position:relative;display:inline-block;font-family:var(--display);font-size:clamp(27px,3.2vw,38px);line-height:1.25;letter-spacing:.015em;background:linear-gradient(105deg,#f2f2f2 0%,#f5590a 55%,#ff8c3a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;text-shadow:0 0 24px rgba(245,89,10,.15)}
#home h1::after{position:absolute;right:0;bottom:-10px;left:0;height:2px;content:"";transform:scaleX(0);transform-origin:left;background:linear-gradient(90deg,var(--gold),rgba(245,89,10,.08));animation:home-line 550ms cubic-bezier(.16,1,.3,1) 220ms forwards}
@keyframes home-line{to{transform:scaleX(1)}}
#home p{margin:24px 0 0;font-size:16px;font-weight:300;max-width:60ch;line-height:1.7;color:var(--ivory);animation:home-enter 500ms cubic-bezier(.16,1,.3,1) 70ms both}
@keyframes home-enter{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
#home .home-card{position:relative;isolation:isolate;overflow:hidden;border:1px solid rgba(245,89,10,.4);border-radius:16px;background:rgba(18,18,18,.84);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:inset 0 1px rgba(255,255,255,.09),0 12px 32px rgba(0,0,0,.18);transition:transform 220ms cubic-bezier(.16,1,.3,1)}
#home .home-card::after{position:absolute;inset:-1px;z-index:2;border:1px solid transparent;border-radius:inherit;content:"";pointer-events:none;opacity:0;background:linear-gradient(110deg,transparent 40%,rgba(255,245,211,.95) 50%,transparent 60%) border-box;mask:linear-gradient(#000 0 0) padding-box,linear-gradient(#000 0 0);mask-composite:exclude;transform:translateX(-90%);transition:opacity 120ms ease}
#home .home-card:hover,#home .home-card:focus-within{transform:translateY(-3px);border-color:var(--gold);box-shadow:inset 0 1px rgba(255,255,255,.14),0 0 24px rgba(245,89,10,.16),0 14px 36px rgba(0,0,0,.24)}
#home .home-card:hover::after,#home .home-card:focus-within::after{opacity:.8;animation:home-sweep 750ms ease-out}
@keyframes home-sweep{to{transform:translateX(90%);opacity:0}}
#home .home-stage{grid-column:2;grid-row:1;min-height:152px;display:flex;align-items:center;animation:home-enter 500ms cubic-bezier(.16,1,.3,1) 140ms both}
#home .home-card-link{position:relative;display:flex;align-items:center;gap:14px;width:100%;min-height:100%;padding:22px 52px 22px 22px;color:var(--ivory);text-decoration:none;font-size:18px;font-weight:500}
#home .home-card-link::before{width:9px;height:9px;flex:0 0 9px;border-radius:50%;background:var(--gold);box-shadow:0 0 12px rgba(245,89,10,.45);content:""}
#home .card-arrow{position:absolute;right:20px;color:var(--gold);font-size:20px;transform:translate(0,0);transition:transform 220ms cubic-bezier(.16,1,.3,1)}
#home .home-card-link:hover .card-arrow,#home .home-card-link:focus-visible .card-arrow{transform:translate(3px,-3px)}
#home .card-sweep{position:absolute;top:-1px;bottom:-1px;left:-1px;z-index:3;width:42%;pointer-events:none;opacity:0;border:1px solid transparent;border-radius:inherit;background:linear-gradient(110deg,transparent 35%,rgba(255,245,211,.95) 50%,transparent 65%) border-box;mask:linear-gradient(#000 0 0) padding-box,linear-gradient(#000 0 0);mask-composite:exclude;transform:translateX(-100%) skewX(-18deg)}
#home .home-card:hover .card-sweep,#home .home-card:focus-within .card-sweep{animation:home-card-sweep 650ms ease-out}
@keyframes home-card-sweep{from{transform:translateX(-100%) skewX(-18deg);opacity:0}20%{opacity:1}to{transform:translateX(350%) skewX(-18deg);opacity:0}}
#home .phone-grid{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
#home .phone-card{min-width:0;animation:home-enter 500ms cubic-bezier(.16,1,.3,1) both}
#home .phone-card:nth-child(1){animation-delay:210ms}
#home .phone-card:nth-child(2){animation-delay:280ms}
#home .phone-card:nth-child(3){animation-delay:350ms}
#home .phone-card:nth-child(4){animation-delay:420ms}
#home .phone-card:nth-child(5){grid-column:1/-1;width:calc(50% - 7px);justify-self:center;animation-delay:490ms}
#home .phone-card .home-card-link{min-height:56px;padding-top:15px;padding-bottom:15px;font-size:16px}
#home .name-field{position:relative;padding:0 18px 12px 22px}
#home .name-field::after{position:absolute;right:18px;bottom:8px;left:22px;height:1px;content:"";background:rgba(245,89,10,.55);transform:scaleX(.35);transform-origin:center;transition:transform 220ms cubic-bezier(.16,1,.3,1)}
#home .name-field:focus-within::after{transform:scaleX(1)}
#home input{display:block;width:100%;min-height:38px;border:0;outline:0;background:transparent;color:var(--ivory);caret-color:var(--gold);font:400 16px/1.5 var(--body);box-shadow:none}
#home input::placeholder{color:#a8a29e;opacity:1}
#home input:focus-visible{outline:2px solid rgba(245,89,10,.9);outline-offset:3px;border-radius:4px;box-shadow:0 0 14px rgba(245,89,10,.16)}
#home a:focus-visible{outline:2px solid #ff8c3a;outline-offset:4px;box-shadow:0 0 0 5px rgba(245,89,10,.18)}
@media (max-width:720px){
 #home{padding:calc(80px + 24px) 18px calc(36px + 5.2rem)}
 #home .home-content{grid-template-columns:minmax(0,1fr);gap:18px}
 #home .home-intro,#home .home-stage,#home .phone-grid{grid-column:1;grid-row:auto}
 #home .home-intro{padding:0 2px}
 #home .home-stage{min-height:120px}
 #home .home-sphere-wrap{top:30%;right:-26vw;width:76vw;opacity:.2}
 #home .phone-grid{grid-template-columns:minmax(0,1fr);gap:12px}
 #home .phone-card:nth-child(5){grid-column:auto;width:auto}
 #home .phone-card .home-card-link{min-height:48px}
}
@media (prefers-reduced-motion:reduce){
 #home .home-sphere-wrap{transform:none!important}
 #home .home-sphere{animation:none}
 #home .home-intro,#home .home-stage,#home .phone-card{animation:none}
 #home h1::after{animation:none;transform:scaleX(1)}
 #home .home-card,#home .card-arrow,#home .name-field::after{transition:none}
 #home .home-card::after,#home .card-sweep{display:none}
}
#banner{position:fixed;left:0;right:0;bottom:0;z-index:99;background:#f5590a;color:#0a0a0a;font-size:12px;text-align:center;padding:4px}
@media (prefers-reduced-motion:reduce){#math{display:none}}
`;

/* =====================================================================
   LANDING
   ===================================================================== */
function Home() {
  const base = window.location.href.split("?")[0];
  const [names, setNames] = useState({});
  const link = (n) => `${base}?p=${n}` + (names[n] ? `&n${n}=${encodeURIComponent(names[n])}` : "");
  const homeRef = useRef(null);

  useEffect(() => {
    const sphere = homeRef.current?.querySelector(".home-sphere-wrap");
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!sphere || motionPreference.matches || !desktopPointer.matches) return undefined;

    let frame;
    const updateParallax = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        sphere.style.setProperty("--parallax-x", `${(event.clientX / window.innerWidth - 0.5) * 16}px`);
        sphere.style.setProperty("--parallax-y", `${(event.clientY / window.innerHeight - 0.5) * 16}px`);
      });
    };
    window.addEventListener("pointermove", updateParallax, { passive: true });
    return () => {
      window.removeEventListener("pointermove", updateParallax);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div id="home" ref={homeRef}>
      <div className="home-sphere-wrap" aria-hidden="true">
        <div className="home-sphere">
          <span className="sphere-meridian" />
          <span className="sphere-meridian" />
          <span className="sphere-meridian" />
          <span className="sphere-meridian" />
          <span className="sphere-latitude" />
          <span className="sphere-latitude" />
          <span className="sphere-latitude" />
        </div>
      </div>
      <main className="home-content">
        <section className="home-intro">
          <h1>Quant-A-Maze 3.0 · Inauguration</h1>
          <p>
            Open the stage link on the auditorium display (full screen, F11). Give each guest their own
            phone link. Type a name next to each to show it on their phone and on the stage.
          </p>
        </section>
        <a className="home-card home-stage home-card-link" href={base + "?role=stage"} target="_blank" rel="noreferrer">
          <span className="card-sweep" aria-hidden="true" />
          Stage display
          <span className="card-arrow" aria-hidden="true">↗</span>
        </a>
        <div className="phone-grid">
          {[1, 2, 3, 4, 5].map((n) => (
            <div className="home-card phone-card" key={n}>
              <a className="home-card-link" href={link(n)} target="_blank" rel="noreferrer">
                <span className="card-sweep" aria-hidden="true" />
                Phone {n}
                <span className="card-arrow" aria-hidden="true">↗</span>
              </a>
              <div className="name-field">
                <input
                  placeholder={CONFIG.names[n - 1]}
                  maxLength={80}
                  value={names[n] || ""}
                  onChange={(e) => setNames((s) => ({ ...s, [n]: e.target.value }))}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* =====================================================================
   PHONE
   ===================================================================== */
function Phone({ n }) {
  const s = useShared();
  const [pressed, setPressed] = useState(false);
  const hold = useRef(false);
  const hb = useRef(null);

  const up = () => {
    if (!hold.current) return;
    hold.current = false;
    setPressed(false);
    clearInterval(hb.current);
    put(`p/${n}`, { h: 0, t: Date.now() });
  };
  const down = (e) => {
    e.preventDefault();
    if (hold.current) return;
    hold.current = true;
    setPressed(true);
    if (navigator.vibrate) navigator.vibrate(40);
    const beat = () => put(`p/${n}`, { h: 1, t: Date.now() });
    beat();
    hb.current = setInterval(beat, 350);
  };

  useEffect(() => {
    put(`names/${n}`, Q.get("n" + n) || null);
    const ping = () => put(`c/${n}`, Date.now());
    ping();
    const iv = setInterval(ping, 2500);
    const release = () => up();
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", release);
    return () => {
      clearInterval(iv);
      clearInterval(hb.current);
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", release);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const ph = s.phase || "idle";
  const disabled = ph === "lit" || ph === "welcome";
  useEffect(() => { if (disabled) up(); /* eslint-disable-next-line */ }, [disabled]);

  let status;
  if (ph === "idle") status = pressed ? "Curtains are opening…" : "Press and hold to open the curtains";
  else if (ph === "open") {
    const c = s.count || 0;
    status = pressed ? `Keep holding · ${c} of 5 holding` : `Press and hold · ${c} of 5 holding`;
  } else if (ph === "lit") status = "The lamp is lit ✨";
  else status = "Welcome to Quant-A-Maze 3.0";

  return (
    <div id="phone">
      <header>
        <h1>QUANT-A-MAZE 3.0</h1>
        <p>Inauguration</p>
        <div id="who">{nameOf(n)}</div>
      </header>
      <div id="net" role="status" aria-live="polite">{netState || "connecting…"}</div>
      <button
        id="btn"
        className={pressed ? "down" : ""}
        disabled={disabled}
        onPointerDown={(e) => { try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {} down(e); }}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}
        onLostPointerCapture={up}
        onContextMenu={(e) => e.preventDefault()}
      >
        HOLD
      </button>
      <div id="status">{status}</div>
    </div>
  );
}

/* =====================================================================
   STAGE
   ===================================================================== */
const SYMBOLS = ["∑", "∫", "π", "√", "∞", "Δ", "θ", "λ", "≈", "φ", "∂", "Ω"];
const CUP_X = [90, 195, 300, 405, 510];
const TITLE = "Quant-A-Maze 3.0";

function Stage() {
  const s = useShared();
  const [phase, setPhaseState] = useState("idle");
  const [ui, setUi] = useState({ h: [0, 0, 0, 0, 0], live: [0, 0, 0, 0, 0], net: "" });
  const phaseRef = useRef("idle");
  const barRef = useRef(null);
  const cvRef = useRef(null);
  const burstRef = useRef(() => {});

  const symbols = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        ch: SYMBOLS[i % SYMBOLS.length],
        left: Math.random() * 100 + "%",
        size: 3 + Math.random() * 7 + "vh",
        dur: 22 + Math.random() * 30 + "s",
        delay: -Math.random() * 40 + "s",
      })),
    []
  );

  useEffect(() => {
    const seen = {}, seenC = {}, last = {}, lastC = {};
    const simOn = {}, simHb = {};
    const now = () => performance.now();
    let holdStart = 0, litAt = 0, lastCount = -1;

    const setPhase = (p) => {
      phaseRef.current = p;
      lastCount = -1;
      setPhaseState(p);
      put("phase", p);
    };
    const ignite = () => { setPhase("lit"); litAt = now(); burstRef.current(6); };

    // presence tracking by LOCAL receive time (immune to phone clock skew)
    const track = (st) => {
      for (let n = 1; n <= 5; n++) {
        const t = st.p && st.p[n] ? st.p[n].t : undefined;
        if (t !== last[n]) { last[n] = t; seen[n] = now(); }
        const c = st.c && st.c[n];
        if (c !== lastC[n]) { lastC[n] = c; seenC[n] = now(); }
      }
    };
    const holding = (n) => S.p && S.p[n] && S.p[n].h === 1 && now() - (seen[n] || 0) < 2200;
    const live = (n) => now() - (seenC[n] || -1e9) < 7000;
    const syncPhase = (sharedPhase) => {
      if (phaseRef.current === sharedPhase) return;
      phaseRef.current = sharedPhase;
      lastCount = -1;
      setPhaseState(sharedPhase);
      if (sharedPhase === "lit") {
        litAt = now();
        burstRef.current(6);
      } else if (sharedPhase === "welcome") {
        burstRef.current(14);
      }
    };

    // tap a circle / press keys 1-5 on the stage to hold/release that person (testing / backup)
    const simSet = (n, on) => {
      if (!!simOn[n] === on) return;
      if (on) {
        const ph = S.phase || "idle";
        if (ph === "lit" || ph === "welcome") return;
        simOn[n] = 1;
        const beat = () => put(`p/${n}`, { h: 1, t: Date.now() });
        beat();
        simHb[n] = setInterval(beat, 350);
      } else {
        simOn[n] = 0;
        clearInterval(simHb[n]);
        put(`p/${n}`, { h: 0, t: Date.now() });
      }
    };
    window.__qamSim = (n) => simSet(n, !simOn[n]); // used by the slot onPointerDown

    const sub = (st) => {
      track(st);
      const ph = st.phase || "idle";
      syncPhase(ph);
      if (ph === "lit" || ph === "welcome" || (ph === "idle" && !st.p))
        for (let n = 1; n <= 5; n++) if (simOn[n]) simSet(n, false);
    };
    subs.add(sub);
    sub(S);

    const onKey = (e) => {
      if (!e.repeat) {
        const m = /^(?:Digit|Numpad)([1-5])$/.exec(e.code);
        if (m) { e.preventDefault(); simSet(+m[1], !simOn[+m[1]]); }
      }
      const k = e.key.toLowerCase();
      if (k === "r") { setPhase("idle"); put("p", null); }                          // reset for rehearsal
      if (k === "o" && phaseRef.current === "idle") setPhase("open");                 // manual: open curtains
      if (k === "l" && phaseRef.current === "open") ignite();                         // manual: light lamp
    };
    window.addEventListener("keydown", onKey);

    const tick = setInterval(() => {
      const h = [1, 2, 3, 4, 5].map((n) => (holding(n) ? 1 : 0));
      const lv = [1, 2, 3, 4, 5].map((n) => (live(n) ? 1 : 0));
      const cnt = h.reduce((a, b) => a + b, 0);
      const net = (netState ? netState + " · " : "") + lv.filter(Boolean).length + "/5 phones";
      setUi((u) =>
        u.net === net && u.h.join() === h.join() && u.live.join() === lv.join() ? u : { h, live: lv, net }
      );

      const ph = phaseRef.current;
      if (ph === "idle" && cnt > 0) setPhase("open");
      if (phaseRef.current === "open") {
        if (cnt !== lastCount) { lastCount = cnt; put("count", cnt); }
        const bar = barRef.current;
        if (cnt === 5) {
          if (!holdStart) holdStart = now();
          const pr = Math.min(1, (now() - holdStart) / CONFIG.holdMs);
          if (bar) bar.style.width = pr * 100 + "%";
          if (pr >= 1) { holdStart = 0; ignite(); }
        } else {
          holdStart = 0;
          if (bar) bar.style.width = "0";
        }
      }
      if (phaseRef.current === "lit" && now() - litAt > CONFIG.flameMs) {
        setPhase("welcome");
        burstRef.current(14);
      }
    }, 80);

    // fireworks / sparks
    const cv = cvRef.current, cx = cv.getContext("2d");
    let parts = [], raf;
    const fit = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    fit();
    window.addEventListener("resize", fit);
    burstRef.current = (k) => {
      for (let b = 0; b < k; b++)
        setTimeout(() => {
          const x = window.innerWidth * (0.15 + Math.random() * 0.7);
          const y = window.innerHeight * (0.15 + Math.random() * 0.45);
          const hue = 28 + Math.random() * 30;
          for (let i = 0; i < 70; i++) {
            const a = Math.random() * 6.283, v = 1 + Math.random() * 6;
            parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, h: hue });
          }
        }, b * 260);
    };
    const loop = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      parts = parts.filter((p) => p.l > 0);
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.vx *= 0.985; p.l -= 0.011;
        cx.fillStyle = `hsla(${p.h},100%,65%,${p.l})`;
        cx.beginPath(); cx.arc(p.x, p.y, 2.4, 0, 6.283); cx.fill();
      });
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      subs.delete(sub);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", fit);
      clearInterval(tick);
      cancelAnimationFrame(raf);
      for (const n in simHb) clearInterval(simHb[n]);
      delete window.__qamSim;
    };
  }, []);

  const cls = [
    phase !== "idle" && "open",
    (phase === "lit" || phase === "welcome") && phase,
    !CONFIG.showStatus && Q.get("hud") !== "1" && "nohud",
  ].filter(Boolean).join(" ");

  const onStageDown = () => { if (phaseRef.current === "idle") { phaseRef.current = "open"; setPhaseState("open"); put("phase", "open"); } };

  return (
    <div id="stage" className={cls} onPointerDown={onStageDown}>
      <div id="math">
        {symbols.map((m, i) => (
          <span key={i} style={{ left: m.left, fontSize: m.size, animationDuration: m.dur, animationDelay: m.delay }}>{m.ch}</span>
        ))}
      </div>
      <div id="valance">QUANT-A-MAZE 3.0</div>
      <div id="cL" className="curtain" />
      <div id="cR" className="curtain" />
      <div id="idleMsg"><h1>Quant-A-Maze 3.0</h1><p>THE INAUGURATION BEGINS WITH ONE TOUCH</p></div>

      <div id="lampWrap">
        <svg viewBox="0 0 600 700" aria-hidden="true">
          <defs>
            <linearGradient id="brass" x1="0" x2="1">
              <stop offset="0" stopColor="#752605" /><stop offset=".35" stopColor="#ff8c3a" />
              <stop offset=".6" stopColor="#c9470a" /><stop offset="1" stopColor="#752605" />
            </linearGradient>
            <radialGradient id="fg" cx=".5" cy=".8" r=".7">
              <stop offset="0" stopColor="#fff2e8" /><stop offset=".35" stopColor="#ff8c3a" /><stop offset="1" stopColor="#f5590a" />
            </radialGradient>
            <radialGradient id="gl">
              <stop offset="0" stopColor="#ff8c3a" stopOpacity=".85" /><stop offset="1" stopColor="#f5590a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="glow">
            {CUP_X.map((x) => <circle key={x} cx={x} cy={215} r={90} fill="url(#gl)" />)}
          </g>
          <path d="M285 300h30v280h-30z" fill="url(#brass)" />
          <ellipse cx="300" cy="360" rx="34" ry="14" fill="url(#brass)" />
          <ellipse cx="300" cy="440" rx="42" ry="16" fill="url(#brass)" />
          <ellipse cx="300" cy="520" rx="34" ry="14" fill="url(#brass)" />
          <path d="M180 690c0-70 50-110 120-110s120 40 120 110z" fill="url(#brass)" />
          <ellipse cx="300" cy="582" rx="62" ry="12" fill="url(#brass)" />
          <path d="M40 270h520c0 26-24 40-50 40H90c-26 0-50-14-50-40z" fill="url(#brass)" />
          <g>
            {CUP_X.map((x) => (
              <g key={x}>
                <path d={`M${x - 38} 262c0 22 16 34 38 34s38-12 38-34z`} fill="url(#brass)" />
                <ellipse cx={x} cy={262} rx={38} ry={7} fill="#3a1b10" />
              </g>
            ))}
          </g>
          <g>
            {CUP_X.map((x) => (
              <path key={x} className="flame" fill="url(#fg)"
                d={`M${x} 262c-20-14-24-40-8-62 4-6 6-14 6-26 16 14 30 34 24 56-3 14-10 24-22 32z`} />
            ))}
          </g>
        </svg>
      </div>

      <div id="hud">
        <div id="slots">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={"slot" + (ui.h[n - 1] ? " on" : "") + (ui.live[n - 1] && !ui.h[n - 1] ? " live" : "")}
              onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); window.__qamSim && window.__qamSim(n); }}
            >
              <i /><span>{nameOf(n)}</span>
            </div>
          ))}
        </div>
        <div id="bar"><b ref={barRef} /></div>
        <div id="hint">PRESS AND HOLD ALL FIVE BUTTONS TOGETHER</div>
      </div>

      <div id="welcome">
        <small>WELCOME TO</small>
        <h2>
          {[...TITLE].map((c, i) => (
            <span key={i} style={{ "--i": i }}>{c === " " ? "\u00a0" : c}</span>
          ))}
        </h2>
        <p>LET THE MAZE BEGIN</p>
      </div>
      <canvas id="fx" ref={cvRef} />
      <div id="net">{ui.net}</div>
    </div>
  );
}

/* =====================================================================
   ROOT
   ===================================================================== */
export default function Inaugurations() {
  useEffect(() => { document.title = "Quant-A-Maze 3.0 · Inauguration"; }, []);

  const role = Q.get("role");
  const pid = parseInt(Q.get("p"), 10);

  let view;
  if (role === "stage") view = <Stage />;
  else if (pid >= 1 && pid <= 5) view = <Phone n={pid} />;
  else view = <Home />;

  return (
    <>
      <style>{CSS}</style>
      {view}
      {!supabase && (
        <div id="banner">DATABASE NOT CONFIGURED · set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
      )}
    </>
  );
}
