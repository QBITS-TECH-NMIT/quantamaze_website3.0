import { useEffect, useMemo, useReducer, useRef, useState } from "react";

/* =====================================================================
   Quant-A-Maze 3.0 · Inauguration
   One component, three views, chosen by the URL:
     (no params)        -> landing page with the stage + phone links
     ?role=stage        -> auditorium display
     ?p=1 ... ?p=5      -> a guest's phone (optional &n1=Name label)
   Realtime sync: Firebase Realtime Database over REST + EventSource.
   Leave CONFIG.databaseURL empty for demo mode (BroadcastChannel, same browser only).
   ===================================================================== */

const CONFIG = {
  databaseURL: "https://qam3-7cbc6-default-rtdb.asia-southeast1.firebasedatabase.app/",
  room: "qam3",      // change per event / rehearsal
  showStatus: false, // true = show the five circles + bar on the stage (or add &hud=1)
  holdMs: 1500,      // how long all five must hold together
  flameMs: 3000,     // how long flames burn before the welcome
  names: ["Chief Guest", "Chief Guest", "HOD", "HOD", "Student"], // fallback labels for 1..5
};

/* ---------------- tiny realtime layer (module-level) ---------------- */
const Q = new URLSearchParams(window.location.search);
let S = {}; // shared state mirror
const subs = new Set();
const notify = () => subs.forEach((f) => f(S));
let netState = "";

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

let put;
if (CONFIG.databaseURL) {
  const base = CONFIG.databaseURL.replace(/\/$/, "") + "/" + CONFIG.room;
  put = (path, val) => {
    setPath(path, val);
    notify();
    fetch(`${base}/${path}.json`, { method: "PUT", body: JSON.stringify(val), keepalive: true }).catch(() => {});
  };
  const es = new EventSource(base + ".json");
  const apply = (e, patch) => {
    const m = JSON.parse(e.data);
    if (patch) for (const k in m.data) setPath(m.path + "/" + k, m.data[k]);
    else setPath(m.path, m.data);
    notify();
  };
  es.addEventListener("put", (e) => apply(e, false));
  es.addEventListener("patch", (e) => apply(e, true));
  es.onopen = () => { netState = "online"; notify(); };
  es.onerror = () => { netState = "reconnecting…"; notify(); };
} else {
  const bc = new BroadcastChannel("qam-demo-" + CONFIG.room);
  put = (path, val) => { setPath(path, val); notify(); bc.postMessage({ path, val }); };
  bc.onmessage = (e) => {
    const d = e.data;
    if (d.sync) { bc.postMessage({ full: S }); return; }
    if (d.full) { if (!Object.keys(S).length) { S = d.full; notify(); } return; }
    setPath(d.path, d.val);
    notify();
  };
  bc.postMessage({ sync: 1 });
  netState = "demo";
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
  --ink:#080b1c; --ink2:#10163a; --gold:#e8b84a; --ivory:#f6ecd2;
  --flame:#ff8a1f; --flame2:#ffd36b; --velvet:#6e0f26; --velvet2:#a31a3a;
  --display:'Cinzel',Georgia,serif; --body:'Outfit',system-ui,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body,#root{height:100%;background:var(--ink);color:var(--ivory);font-family:var(--body);overflow:hidden;touch-action:none}

/* STAGE */
#stage{position:fixed;inset:0;background:radial-gradient(ellipse at 50% 85%,#1b2358 0%,var(--ink) 65%)}
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
  background:repeating-linear-gradient(90deg,var(--velvet) 0,var(--velvet2) 5%,var(--velvet) 10%,#4a0a1a 14%,var(--velvet) 18%);box-shadow:inset 0 -80px 120px rgba(0,0,0,.55)}
#cL{left:0;border-right:3px solid var(--gold)} #cR{right:0;border-left:3px solid var(--gold)}
#stage.open #cL{transform:translateX(-102%)} #stage.open #cR{transform:translateX(102%)}
#valance{position:absolute;top:0;left:0;right:0;height:9vh;z-index:6;background:linear-gradient(var(--velvet2),var(--velvet));border-bottom:4px solid var(--gold);display:flex;align-items:center;justify-content:center;font-family:var(--display);font-size:3.2vh;letter-spacing:.35em;color:var(--gold)}
#idleMsg{position:absolute;z-index:7;left:50%;top:52%;transform:translate(-50%,-50%);text-align:center;transition:opacity 1s}
#idleMsg h1{font-family:var(--display);font-size:7vh;font-weight:900;color:var(--gold);text-shadow:0 0 40px rgba(232,184,74,.4)}
#idleMsg p{margin-top:2vh;font-size:2.6vh;font-weight:300;letter-spacing:.2em}
#stage.open #idleMsg{opacity:0;pointer-events:none}

#hud{position:absolute;z-index:4;left:0;right:0;bottom:3vh;display:flex;flex-direction:column;align-items:center;gap:1.6vh;opacity:0;transition:opacity 1s 3s}
#stage.open:not(.lit):not(.welcome) #hud{opacity:1}
#slots{display:flex;gap:2.4vw}
.slot{cursor:pointer;width:9vh;text-align:center;font-size:1.7vh;font-weight:500;opacity:.55;transition:.25s}
.slot i{display:block;width:5.6vh;height:5.6vh;margin:0 auto 1vh;border-radius:50%;border:2px solid var(--gold);transition:.2s}
.slot.on{opacity:1}.slot.on i{background:var(--flame);box-shadow:0 0 28px var(--flame);border-color:var(--flame2)}
.slot.live i{background:rgba(232,184,74,.25)}
#bar{width:42vw;height:.9vh;border-radius:9px;background:rgba(255,255,255,.12);overflow:hidden}
#bar b{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--flame),var(--flame2))}
#stage.nohud #hud{display:none}
#hint{display:none;font-size:2.2vh;font-weight:300;letter-spacing:.18em}

#welcome{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none;opacity:0;background:radial-gradient(circle,rgba(8,11,28,.55),rgba(8,11,28,.92));transition:opacity .6s}
#stage.welcome #welcome{opacity:1}
#welcome small{font-family:var(--display);font-size:5vh;letter-spacing:.5em;color:var(--ivory)}
#welcome h2{font-family:var(--display);font-weight:900;font-size:13vh;line-height:1.1;margin-top:2vh;color:var(--gold)}
#welcome h2 span{display:inline-block;opacity:0;transform:translateY(5vh) scale(.6);filter:blur(12px)}
#stage.welcome #welcome h2 span{animation:letter .6s cubic-bezier(.2,1.2,.3,1) forwards;animation-delay:calc(var(--i)*45ms + .1s)}
@keyframes letter{to{opacity:1;transform:none;filter:none;text-shadow:0 0 50px rgba(255,170,60,.7)}}
#welcome p{margin-top:4vh;font-size:3vh;font-weight:300;letter-spacing:.3em;opacity:0}
#stage.welcome #welcome p{animation:fade .6s 1.1s forwards}
@keyframes fade{to{opacity:.9}}
#fx{position:absolute;inset:0;z-index:9;pointer-events:none}
#net{position:absolute;right:1.5vw;top:10.5vh;z-index:10;font-size:1.5vh;opacity:.5}

/* PHONE */
#phone{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:max(5vh,env(safe-area-inset-top)) 6vw max(5vh,env(safe-area-inset-bottom));background:radial-gradient(ellipse at 50% 70%,#1b2358,var(--ink) 70%);user-select:none;-webkit-user-select:none}
#phone header{text-align:center}
#phone header h1{font-family:var(--display);font-size:22px;color:var(--gold);letter-spacing:.12em}
#phone header p{margin-top:6px;font-size:15px;font-weight:300;opacity:.8}
#who{font-size:26px;font-weight:700;margin-top:18px}
#btn{position:relative;width:min(70vw,46vh);aspect-ratio:1;border-radius:50%;border:3px solid var(--gold);background:radial-gradient(circle at 50% 35%,#3a2a0c,#150f05);color:var(--ivory);font:700 22px var(--display);letter-spacing:.14em;display:grid;place-items:center;touch-action:none;transition:transform .12s,box-shadow .2s;box-shadow:0 0 0 10px rgba(232,184,74,.08);-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
#btn.down{transform:scale(.94);background:radial-gradient(circle at 50% 35%,var(--flame2),var(--flame) 55%,#a63d00);color:#2a1100;box-shadow:0 0 90px 18px rgba(255,138,31,.55)}
#btn:disabled{opacity:.35}
#status{font-size:17px;font-weight:300;text-align:center;min-height:48px;letter-spacing:.04em}

/* LANDING */
#home{position:fixed;inset:0;overflow:auto;padding:6vh 6vw;touch-action:auto}
#home h1{font-family:var(--display);color:var(--gold);font-size:34px}
#home p{margin:10px 0 24px;font-weight:300;max-width:60ch;line-height:1.5}
#home a{display:block;max-width:420px;margin:10px 0;padding:14px 18px;border:1px solid var(--gold);border-radius:10px;color:var(--ivory);text-decoration:none;font-weight:500}
#home a:hover{background:rgba(232,184,74,.15)}
#home input{margin-left:10px;background:transparent;border:0;border-bottom:1px solid var(--gold);color:var(--ivory);font:inherit;width:60%}
#banner{position:fixed;left:0;right:0;bottom:0;z-index:99;background:#7a5200;color:#fff;font-size:12px;text-align:center;padding:4px}
@media (prefers-reduced-motion:reduce){#math{display:none}}
`;

/* =====================================================================
   LANDING
   ===================================================================== */
function Home() {
  const base = window.location.href.split("?")[0];
  const [names, setNames] = useState({});
  const link = (n) => `${base}?p=${n}` + (names[n] ? `&n${n}=${encodeURIComponent(names[n])}` : "");
  return (
    <div id="home">
      <h1>Quant-A-Maze 3.0 · Inauguration</h1>
      <p>
        Open the stage link on the auditorium display (full screen, F11). Give each guest their own
        phone link. Type a name next to each to show it on their phone and on the stage.
      </p>
      <a href={base + "?role=stage"} target="_blank" rel="noreferrer">Stage display</a>
      <div>
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n}>
            <a href={link(n)} target="_blank" rel="noreferrer">Phone {n}</a>
            <input
              placeholder={CONFIG.names[n - 1]}
              value={names[n] || ""}
              onChange={(e) => setNames((s) => ({ ...s, [n]: e.target.value }))}
            />
          </div>
        ))}
      </div>
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
    const holding = (n) => S.p && S.p[n] && S.p[n].h === 1 && now() - (seen[n] || 0) < 1300;
    const live = (n) => now() - (seenC[n] || -1e9) < 7000;

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
      if (ph === "lit" || ph === "welcome" || (ph === "idle" && !st.p))
        for (let n = 1; n <= 5; n++) if (simOn[n]) simSet(n, false);
    };
    subs.add(sub);

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

    // restore after a stage refresh
    const restore = setTimeout(() => {
      if (S.phase === "open") setPhase("open"); else setPhase("idle");
      put("p", null);
    }, 900);

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
      clearTimeout(restore);
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
              <stop offset="0" stopColor="#8a5f12" /><stop offset=".35" stopColor="#f3cf6e" />
              <stop offset=".6" stopColor="#c8922a" /><stop offset="1" stopColor="#6b4709" />
            </linearGradient>
            <radialGradient id="fg" cx=".5" cy=".8" r=".7">
              <stop offset="0" stopColor="#fff6c8" /><stop offset=".35" stopColor="#ffd36b" /><stop offset="1" stopColor="#ff6a00" />
            </radialGradient>
            <radialGradient id="gl">
              <stop offset="0" stopColor="#ffb347" stopOpacity=".85" /><stop offset="1" stopColor="#ff7a00" stopOpacity="0" />
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
                <ellipse cx={x} cy={262} rx={38} ry={7} fill="#4a2f05" />
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
      {!CONFIG.databaseURL && (
        <div id="banner">DEMO MODE · no database set · works across tabs of this browser only</div>
      )}
    </>
  );
}
