import Link from "next/link";

export const metadata = {
  title: "404 - Page not found",
  description: "The page you are looking for could not be found.",
};

export default function NotFound() {
  return (
    <>
      <main className="not-found-page">
        <div className="not-found-inner">
          <h1 aria-label="404" className="not-found-title">
            <span aria-hidden="true">4</span>
            <span aria-hidden="true">0</span>
            <span aria-hidden="true">4</span>
          </h1>

          <div className="scene">
            <svg viewBox="0 0 600 230" role="img" aria-label="A caveman holding two ends of a cut wire that runs through a door and behind the rocks while electric bolts arc around him">
              <path d="M12 200 V150 Q12 138 24 138 H40 Q52 138 52 150 V200 Z" fill="#8a5a3b" />
              <path d="M32 138 V200 M12 168 H52" stroke="#6e4629" strokeWidth="1.5" fill="none" />
              <circle cx="44" cy="172" r="2" fill="#e0b64a" />
              <ellipse cx="32" cy="198" rx="5" ry="3" fill="#1e1e1e" />

              <g fill="none" strokeLinecap="round">
                <path d="M32 198 C90 202 150 197 205 200 S240 199 250 199" stroke="#2f2f2f" strokeWidth="3" />
                <path className="pulse" pathLength="100" d="M32 198 C90 202 150 197 205 200 S240 199 250 199" stroke="#ffd84a" strokeWidth="1.6" />
                <path d="M600 199 C540 203 470 197 425 200 S390 199 380 200" stroke="#2f2f2f" strokeWidth="3" />
                <path className="pulse" pathLength="100" style={{ animationDelay: "-0.9s" }} d="M600 199 C540 203 470 197 425 200 S390 199 380 200" stroke="#ffd84a" strokeWidth="1.6" />
              </g>

              <g className="rocks">
                <ellipse cx="105" cy="190" rx="40" ry="14" fill="#dedede" />
                <ellipse cx="105" cy="168" rx="30" ry="13" fill="#e6e6e6" />
                <ellipse cx="103" cy="148" rx="20" ry="11" fill="#dedede" />
                <ellipse cx="103" cy="133" rx="10" ry="8" fill="#e6e6e6" />
              </g>
              <path d="M448 204 C440 130 452 62 498 62 C544 62 556 130 548 204 Z" fill="#ececec" />

              <g className="bush" fill="#6aa84f">
                <circle cx="72" cy="198" r="7" />
                <circle cx="86" cy="194" r="9" />
              </g>
              <g className="bush" fill="#6aa84f" style={{ animationDelay: "-1s" }}>
                <circle cx="205" cy="197" r="8" />
                <circle cx="218" cy="192" r="11" />
                <circle cx="232" cy="198" r="7" />
              </g>
              <g className="bush" fill="#6aa84f" style={{ animationDelay: "-2s" }}>
                <circle cx="402" cy="198" r="7" />
                <circle cx="415" cy="193" r="11" />
                <circle cx="430" cy="198" r="8" />
              </g>
              <g className="bush" fill="#6aa84f" style={{ animationDelay: "-0.5s" }}>
                <circle cx="566" cy="198" r="8" />
                <circle cx="579" cy="194" r="10" />
              </g>

              <ellipse cx="300" cy="203" rx="46" ry="6" fill="#000" opacity="0.08" />

              <g className="shaker">
                <circle className="aura" cx="300" cy="120" r="64" fill="#ffe66b" />

                <path d="M350 142 C352 170 368 198 380 200" fill="none" stroke="#2f2f2f" strokeWidth="3" strokeLinecap="round">
                  <animate
                    attributeName="d"
                    dur="9s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keyTimes="0;0.22;0.38;0.56;0.62;1"
                    keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"
                    values="M350 142 C352 170 368 198 380 200;M350 142 C352 170 368 198 380 200;M306 108 C318 146 352 186 380 200;M306 108 C318 146 352 186 380 200;M350 142 C352 170 368 198 380 200;M350 142 C352 170 368 198 380 200"
                  />
                </path>
                <path d="M264 150 C263 172 258 194 250 199" fill="none" stroke="#2f2f2f" strokeWidth="3" strokeLinecap="round" />

                <path d="M289 160 L287 198" stroke="#f0bf94" strokeWidth="10" strokeLinecap="round" />
                <path d="M312 160 L314 198" stroke="#f0bf94" strokeWidth="10" strokeLinecap="round" />
                <ellipse cx="285" cy="200" rx="9" ry="4" fill="#e9b184" />
                <ellipse cx="317" cy="200" rx="9" ry="4" fill="#e9b184" />

                <path d="M280 114 Q268 124 264 146" fill="none" stroke="#f0bf94" strokeWidth="8" strokeLinecap="round" />
                <circle cx="264" cy="148" r="5" fill="#f0bf94" />
                <path d="M264 143 l-3 -8 M264 143 l1 -9 M264 143 l4 -7" stroke="#d98a3c" strokeWidth="1.4" strokeLinecap="round" />
                <polygon className="tspark fb" fill="#ffcf3d" points="262,128 263.5,132 267.5,133.5 263.5,135 262,139 260.5,135 256.5,133.5 260.5,132" />

                <ellipse cx="300" cy="110" rx="20" ry="7" fill="#f0bf94" />
                <path d="M279 112 Q300 106 321 112 L329 165 L321 157 L313 166 L305 157 L297 166 L289 157 L281 166 Z" fill="#e8a34c" />
                <g fill="#b9722a">
                  <circle cx="292" cy="125" r="3" />
                  <circle cx="310" cy="132" r="3.5" />
                  <circle cx="300" cy="146" r="3" />
                  <circle cx="317" cy="150" r="2.5" />
                  <circle cx="287" cy="151" r="2.5" />
                </g>

                <g className="head">
                  <g className="spikes">
                    <polygon fill="#5e3a21" points="286,72 288,52 294,68 297,66 300,46 304,66 307,68 312,52 314,72" />
                  </g>
                  <circle cx="300" cy="86" r="17" fill="#f2c399" />
                  <path d="M282 84 C280 62 320 62 318 84 C312 74 288 74 282 84 Z" fill="#5e3a21" />
                  <path d="M284 88 C284 112 316 112 316 88 C310 96 290 96 284 88 Z" fill="#5e3a21" />
                  <g className="blink fb">
                    <g className="eyes fb">
                      <circle cx="294" cy="84" r="3.3" fill="#fff" />
                      <circle cx="306" cy="84" r="3.3" fill="#fff" />
                      <circle className="pupil fb" cx="294" cy="84" r="1.7" fill="#2a1a10" />
                      <circle className="pupil fb" cx="306" cy="84" r="1.7" fill="#2a1a10" />
                    </g>
                  </g>
                  <ellipse cx="300" cy="89" rx="2.6" ry="2" fill="#e0a877" />
                  <path d="M296 97 Q300 100 304 97" stroke="#f2c399" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  <ellipse className="mopen" cx="300" cy="98" rx="3.2" ry="3.6" fill="#5a1f1a" />
                </g>

                <path d="M321 114 Q340 120 350 138" fill="none" stroke="#f0bf94" strokeWidth="8" strokeLinecap="round">
                  <animate
                    attributeName="d"
                    dur="9s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keyTimes="0;0.22;0.38;0.56;0.62;1"
                    keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"
                    values="M321 114 Q340 120 350 138;M321 114 Q340 120 350 138;M321 114 Q338 100 306 104;M321 114 Q338 100 306 104;M321 114 Q340 120 350 138;M321 114 Q340 120 350 138"
                  />
                </path>
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    dur="9s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keyTimes="0;0.22;0.38;0.56;0.62;1"
                    keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"
                    values="0 0;0 0;-44 -34;-44 -34;0 0;0 0"
                  />
                  <circle cx="350" cy="138" r="5" fill="#f0bf94" />
                  <path d="M350 133 l-6 -5 M350 133 l-3 -8 M350 133 l-8 -2" stroke="#d98a3c" strokeWidth="1.4" strokeLinecap="round" />
                  <polygon className="tspark fb" style={{ animationDelay: "-1.3s" }} fill="#ffcf3d" points="342,120 343.5,124 347.5,125.5 343.5,127 342,131 340.5,127 336.5,125.5 340.5,124" />
                  <polygon className="bolt fb" fill="#fff59a" points="341,114 344,122 351,124 344,127 341,136 338,127 331,124 338,122" />
                </g>

                <g fill="none" stroke="#ffe14a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline className="bolt" points="268,62 278,74 271,76 282,90" />
                  <polyline className="bolt b" points="334,58 324,72 331,74 320,90" />
                  <polyline className="bolt" points="288,150 296,138 291,136 300,122" />
                  <polyline className="bolt b" points="352,150 344,138 349,136 340,122" />
                </g>

                <g fill="#8a8a8a">
                  <circle className="smoke fb" cx="300" cy="56" r="6" style={{ "--dx": "-6px" }} />
                  <circle className="smoke fb" cx="292" cy="60" r="4.5" style={{ "--dx": "-14px", animationDelay: "0.25s" }} />
                  <circle className="smoke fb" cx="309" cy="58" r="5" style={{ "--dx": "10px", animationDelay: "0.45s" }} />
                </g>
                <text className="q fb" x="322" y="58" fontSize="24" fontFamily="Arvo, Georgia, serif" fill="#555" textAnchor="middle">
                  ?
                </text>
              </g>

              <rect className="flash" x="-20" y="-20" width="640" height="270" fill="#fffbe0" />
            </svg>
          </div>

          <h2>Looks like you are lost</h2>
          <p>The page you are looking for is not available!</p>

          <Link href="/" className="btn">
            Go to Home
          </Link>
        </div>
      </main>

      <style>{`
        :root {
          --ink: #f2f2f2;
          --muted: #d6d3d1;
          --green: #f5590a;
          --green-dark: #d84e00;
          --bg: #0a0a0a;
          --bg-strong: #121212;
          --t: 9s;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html,
        body {
          min-height: 100%;
        }

        body {
          background: var(--bg);
          color: var(--ink);
        }

        .not-found-page {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px 22px 50px;
          background:
            radial-gradient(circle at center, rgba(245, 89, 10, 0.08), transparent 42%),
            linear-gradient(180deg, rgba(10, 10, 10, 0.2), rgba(10, 10, 10, 0.9)),
            var(--bg);
          color: var(--ink);
          font-family: "Roboto", "Helvetica Neue", Arial, sans-serif;
          overflow: hidden;
        }

        .not-found-page::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: linear-gradient(rgba(245, 89, 10, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 89, 10, 0.08) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(circle at center, black 35%, transparent 100%);
          opacity: 0.75;
        }

        .not-found-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: min(100%, 1200px);
          margin: 0 auto;
        }

        .not-found-title {
          position: relative;
          z-index: 1;
          margin: 0;
          font-weight: 300;
          font-size: clamp(100px, 12vw, 300px);
          line-height: 0.9;
          letter-spacing: 0.02em;
          color: rgba(255,255,255,0.94);
          text-shadow: 0 0 22px rgba(255,255,255,0.1);
        }

        .not-found-title span {
          display: inline-block;
          animation: drop 0.9s cubic-bezier(0.2, 0.9, 0.3, 1.3) both, float 4s 1.2s ease-in-out infinite;
        }

        .not-found-title span:nth-child(2) {
          animation-delay: 0.12s, 1.6s;
        }

        .not-found-title span:nth-child(3) {
          animation-delay: 0.24s, 2s;
        }

        .scene {
          position: relative;
          z-index: 1;
          width: min(100%, 620px);
          margin-top: 12px;
          animation: scene-in 0.9s 0.35s ease both;
        }

        .scene svg {
          width: 100%;
          height: auto;
          display: block;
          overflow: visible;
        }

        .not-found-page h2 {
          position: relative;
          z-index: 1;
          font-family: "Arvo", Georgia, serif;
          font-weight: 400;
          font-size: clamp(20px, 4vw, 26px);
          margin-top: 6px;
          color: #f8efe8;
          animation: rise 0.8s 0.3s ease both;
        }

        .not-found-page p {
          position: relative;
          z-index: 1;
          font-family: "Arvo", Georgia, serif;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          margin-top: 8px;
          animation: rise 0.8s 0.45s ease both;
        }

        .btn {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 22px;
          padding: 11px 22px;
          border-radius: 3px;
          background: var(--green);
          color: #fff;
          text-decoration: none;
          font-family: "Arvo", Georgia, serif;
          font-size: 14px;
          transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          animation: rise 0.8s 0.6s ease both;
          box-shadow: 0 0 18px rgba(245, 89, 10, 0.26);
        }

        .btn:hover {
          background: var(--green-dark);
          transform: translateY(-2px);
        }

        .btn:focus-visible {
          outline: 3px solid #1c1c1c;
          outline-offset: 3px;
        }

        .fb { transform-box: fill-box; transform-origin: center; }
        .shaker { transform-origin: 300px 200px; animation: shake var(--t) ease-in-out infinite; }
        .head { transform-origin: 300px 102px; animation: nod var(--t) ease-in-out infinite; }
        .blink { animation: blink 4s infinite; }
        .eyes { animation: wide var(--t) ease-in-out infinite; }
        .pupil { animation: look var(--t) ease-in-out infinite; }
        .mopen { opacity: 0; animation: mopen var(--t) linear infinite; }
        .spikes { transform-box: fill-box; transform-origin: 50% 100%; transform: scaleY(0); animation: spikes var(--t) ease-out infinite; }
        .bolt { opacity: 0; animation: zap var(--t) linear infinite; }
        .bolt.b { animation-delay: 0.07s; }
        .aura { opacity: 0; animation: aura var(--t) linear infinite; }
        .flash { opacity: 0; animation: flash var(--t) linear infinite; pointer-events: none; }
        .smoke { opacity: 0; animation: smoke var(--t) ease-out infinite; }
        .q { opacity: 0; animation: q var(--t) ease-out infinite; }
        .tspark { opacity: 0; animation: tspark 2.6s infinite; }
        .pulse { stroke-dasharray: 4 96; animation: pulse 1.8s linear infinite; }
        .bush { transform-box: fill-box; transform-origin: 50% 100%; animation: bush 3s ease-in-out infinite; }
        .rocks { transform-box: fill-box; transform-origin: 50% 100%; animation: rocks 5s ease-in-out infinite; }

        @keyframes float {
          50% { transform: translateY(-8px); }
        }

        @keyframes drop {
          from { opacity: 0; transform: translateY(-40px) scale(0.9); }
          to { opacity: 1; transform: none; }
        }

        @keyframes rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }

        @keyframes scene-in {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: none; }
        }

        @keyframes bush {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }

        @keyframes rocks {
          0%, 100% { transform: rotate(-0.8deg); }
          50% { transform: rotate(0.8deg); }
        }

        @keyframes blink {
          0%, 94%, 100% { transform: scaleY(1); }
          97% { transform: scaleY(0.1); }
        }

        @keyframes pulse {
          to { stroke-dashoffset: -100; }
        }

        @keyframes tspark {
          0%, 70%, 100% { opacity: 0; transform: scale(0.3); }
          75% { opacity: 1; transform: scale(1.2); }
          82% { opacity: 0.2; }
          88% { opacity: 1; transform: scale(0.9); }
          95% { opacity: 0; }
        }

        @keyframes shake {
          0%, 39% { transform: rotate(0); }
          40% { transform: rotate(2.5deg); }
          41% { transform: rotate(-2.5deg); }
          42% { transform: rotate(3deg); }
          43% { transform: rotate(-3deg); }
          44% { transform: rotate(2.5deg); }
          45% { transform: rotate(-2.5deg); }
          46% { transform: rotate(3deg); }
          47% { transform: rotate(-3deg); }
          48% { transform: rotate(2.5deg); }
          49% { transform: rotate(-2.5deg); }
          50% { transform: rotate(2deg); }
          51% { transform: rotate(-2deg); }
          52% { transform: rotate(1.5deg); }
          53% { transform: rotate(-1.5deg); }
          54% { transform: rotate(1deg); }
          55% { transform: rotate(-1deg); }
          56% { transform: rotate(0); }
          58% { transform: rotate(-6deg); }
          62% { transform: rotate(4deg); }
          66% { transform: rotate(-2deg); }
          70%, 100% { transform: rotate(0); }
        }

        @keyframes nod {
          0%, 100% { transform: rotate(0); }
          8%, 15% { transform: rotate(-6deg); }
          19%, 26% { transform: rotate(6deg); }
          32% { transform: rotate(0); }
          39% { transform: rotate(-3deg); }
          40% { transform: rotate(5deg); }
          46% { transform: rotate(-5deg); }
          52% { transform: rotate(4deg); }
          56% { transform: rotate(0); }
          62%, 74% { transform: rotate(9deg); }
          82% { transform: rotate(0); }
        }

        @keyframes look {
          0%, 100% { transform: translateX(0) scale(1); }
          8%, 15% { transform: translateX(-1.6px) scale(1); }
          19%, 30% { transform: translateX(1.6px) scale(1); }
          39% { transform: translateX(1px) scale(1); }
          40%, 56% { transform: translateX(0) scale(0.45); }
          60% { transform: translateX(0) scale(1); }
          66% { transform: translateX(-1.6px) scale(1); }
          72% { transform: translateX(1.6px) scale(1); }
          78% { transform: translateX(0) scale(1); }
        }

        @keyframes wide {
          0%, 39%, 60%, 100% { transform: scale(1); }
          40%, 56% { transform: scale(1.55); }
        }

        @keyframes mopen {
          0%, 32%, 62%, 100% { opacity: 0; }
          36%, 58% { opacity: 1; }
        }

        @keyframes spikes {
          0%, 39%, 60%, 100% { transform: scaleY(0); }
          41% { transform: scaleY(1.15); }
          44%, 56% { transform: scaleY(1); }
        }

        @keyframes zap {
          0%, 39.9%, 100% { opacity: 0; }
          40% { opacity: 1; }
          41% { opacity: 0; }
          42% { opacity: 1; }
          43% { opacity: 0; }
          44% { opacity: 1; }
          45.5% { opacity: 0; }
          46.5% { opacity: 1; }
          47.5% { opacity: 0; }
          49% { opacity: 1; }
          50% { opacity: 0; }
          51.5% { opacity: 1; }
          52.5% { opacity: 0; }
          54% { opacity: 1; }
          55% { opacity: 0; }
        }

        @keyframes aura {
          0%, 39.9%, 56%, 100% { opacity: 0; }
          40% { opacity: 0.55; }
          42% { opacity: 0.25; }
          44% { opacity: 0.55; }
          46% { opacity: 0.2; }
          48% { opacity: 0.5; }
          50% { opacity: 0.2; }
          52% { opacity: 0.4; }
        }

        @keyframes flash {
          0%, 39.9%, 100% { opacity: 0; }
          40% { opacity: 0.7; }
          41.5% { opacity: 0; }
          43% { opacity: 0.45; }
          44% { opacity: 0; }
          47% { opacity: 0.35; }
          48% { opacity: 0; }
        }

        @keyframes smoke {
          0%, 56%, 100% {
            opacity: 0;
            transform: translate(0, 0) scale(0.4);
          }
          62% { opacity: 0.7; }
          80% {
            opacity: 0;
            transform: translate(var(--dx), -34px) scale(1.7);
          }
        }

        @keyframes q {
          0%, 5%, 24%, 82%, 98%, 100% {
            opacity: 0;
            transform: scale(0.3);
          }
          8% {
            opacity: 1;
            transform: scale(1.25);
          }
          11%, 21% {
            opacity: 1;
            transform: scale(1);
          }
          86%, 94% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}