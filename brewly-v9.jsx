import { useState, useRef } from "react";

const S = {
  WELCOME: "welcome",
  PROFILE: "profile",
  LEVEL: "level",
  TASTE: "taste",
  BREWING: "brewing",
  LOCATION: "location",
  HOME: "home",
  BAR_LOGIN: "bar_login",
  BAR_PORTAL: "bar_portal",
};

const TASTE_DATA = {
  casual: {
    sliders: [
      { id: "sweet", label: "Sweetness", left: "Not Sweet", right: "Very Sweet", icon: "🍬" },
      { id: "strength", label: "Strength", left: "Mild", right: "Strong & Bold", icon: "💪" },
      { id: "milk", label: "Milk Ratio", left: "Black", right: "Extra Milk", icon: "🥛" },
    ],
    flavors: [
      { id: "choc", label: "Chocolate", e: "🍫" },
      { id: "caramel", label: "Caramel", e: "🍮" },
      { id: "fruity", label: "Fruity", e: "🍓" },
      { id: "nutty", label: "Nutty", e: "🌰" },
      { id: "vanilla", label: "Vanilla", e: "🫐" },
      { id: "spicy", label: "Spicy Warmth", e: "🌶️" },
    ],
    temps: ["Hot", "Iced", "Both"],
  },
  exploring: {
    sliders: [
      { id: "acidity", label: "Acidity", left: "Low & Smooth", right: "Bright & Zingy", icon: "⚡" },
      { id: "body", label: "Body Weight", left: "Light", right: "Full-Bodied", icon: "☕" },
      { id: "roast", label: "Roast Level", left: "Light Roast", right: "Dark Roast", icon: "🔥" },
    ],
    notes: [
      { id: "blueberry", label: "Blueberry", cat: "Fruity" },
      { id: "citrus", label: "Citrus", cat: "Fruity" },
      { id: "tropical", label: "Tropical", cat: "Fruity" },
      { id: "stoneFruit", label: "Stone Fruit", cat: "Fruity" },
      { id: "darkChoc", label: "Dark Chocolate", cat: "Sweet" },
      { id: "caramel", label: "Caramel", cat: "Sweet" },
      { id: "hazelnut", label: "Hazelnut", cat: "Nutty" },
      { id: "floral", label: "Floral / Jasmine", cat: "Floral" },
    ],
    processing: ["No Preference", "Washed", "Natural", "Honey / Pulped"],
    origins: ["Africa", "Central America", "South America", "Asia-Pacific"],
  },
  expert: {
    acidities: [
      { id: "citric", label: "Citric", desc: "Lemon — clean, sharp, bright" },
      { id: "malic", label: "Malic", desc: "Apple — smooth, green, crisp" },
      { id: "tartaric", label: "Tartaric", desc: "Grape — winey, complex" },
      { id: "phosphoric", label: "Phosphoric", desc: "Mineral — crisp, effervescent" },
    ],
    bodies: [
      { id: "silky", label: "Silky", desc: "Delicate, refined, elegant" },
      { id: "creamy", label: "Creamy", desc: "Rich, buttery, full" },
      { id: "juicy", label: "Juicy", desc: "Vibrant, saturated, bright" },
      { id: "teaLike", label: "Tea-like", desc: "Transparent, clean, delicate" },
    ],
    wheel: {
      Floral: ["Jasmine", "Rose", "Lavender", "Chamomile", "Orange Blossom"],
      Fruity: ["Blueberry", "Raspberry", "Passionfruit", "Mango", "Orange", "Lemon", "Peach", "Apricot"],
      "Nutty / Cocoa": ["Almond", "Hazelnut", "Dark Chocolate", "Cocoa Nibs", "Walnut"],
      Sweet: ["Brown Sugar", "Honey", "Vanilla", "Caramel", "Maple Syrup"],
      "Spice / Earthy": ["Clove", "Black Pepper", "Cinnamon", "Cedar", "Tobacco"],
    },
    origins: [
      { id: "eth_yirg", label: "Ethiopia Yirgacheffe", f: "🇪🇹" },
      { id: "ken_aa", label: "Kenya AA", f: "🇰🇪" },
      { id: "col_huila", label: "Colombia Huila", f: "🇨🇴" },
      { id: "guat_ant", label: "Guatemala Antigua", f: "🇬🇹" },
      { id: "braz", label: "Brazil Sul de Minas", f: "🇧🇷" },
      { id: "pan_gei", label: "Panama Geisha", f: "🇵🇦" },
      { id: "yem", label: "Yemen Mocha", f: "🇾🇪" },
      { id: "burundi", label: "Burundi Kayanza", f: "🇧🇮" },
      { id: "peru", label: "Peru Cajamarca", f: "🇵🇪" },
      { id: "java", label: "Java Estate", f: "🇮🇩" },
    ],
    extractions: ["Ristretto", "Standard Espresso", "Lungo", "Filter / Pour-over", "Cold Brew / Nitro"],
  },
};

const BREW_METHODS = [
  { id: "espresso", label: "Espresso", i: "☕", desc: "Rich & concentrated" },
  { id: "pourover", label: "Pour Over", i: "🫗", desc: "Clean & nuanced" },
  { id: "french", label: "French Press", i: "🧊", desc: "Full-bodied & robust" },
  { id: "aeropress", label: "AeroPress", i: "🔩", desc: "Versatile & smooth" },
  { id: "moka", label: "Moka Pot", i: "🏺", desc: "Intense & stovetop" },
  { id: "cold", label: "Cold Brew", i: "🧊", desc: "Smooth & low acid" },
  { id: "drip", label: "Drip / Filter", i: "💧", desc: "Classic & consistent" },
  { id: "siphon", label: "Siphon", i: "⚗️", desc: "Theatrical & clean" },
  { id: "turkish", label: "Turkish / Ibrik", i: "🫖", desc: "Traditional & bold" },
  { id: "capsule", label: "Capsule / Pod", i: "💊", desc: "Quick & convenient" },
];

const LOCATION_TYPES = [
  { id: "specialty", label: "Specialty Third Wave", sub: "Single origins, light roasts, pour-overs", i: "🏆" },
  { id: "cozy", label: "Cozy & Neighbourhood", sub: "Local gems, relaxed vibe, great coffee", i: "🏡" },
  { id: "work", label: "Work-Friendly", sub: "Good wifi, quiet, long sessions welcome", i: "💻" },
  { id: "social", label: "Social & Vibrant", sub: "Community tables, lively, coffee events", i: "🎉" },
  { id: "roastery", label: "In-House Roastery", sub: "Roast on-site, freshest possible coffee", i: "🔥" },
];

const CAFES = [
  { id: 1, name: "Father Coffee", area: "Braamfontein, JHB", dist: "0.3km", rating: 4.9, match: 97, tag1: "Pour Over", tag2: "Single Origin", status: "Open", brew: "Ethiopia Yirgacheffe — Natural", barista: "Liam K." },
  { id: 2, name: "Truth Coffee", area: "Cape Town CBD", dist: "2.1km", rating: 4.8, match: 92, tag1: "Espresso", tag2: "Filter", status: "Open", brew: "Colombia Huila — Washed", barista: "Sarah M." },
  { id: 3, name: "Rosetta Roastery", area: "De Waterkant, CT", dist: "1.8km", rating: 4.7, match: 89, tag1: "AeroPress", tag2: "Siphon", status: "Open", brew: "Kenya AA — Washed", barista: "Thabo N." },
  { id: 4, name: "Wolves Coffee", area: "Maboneng, JHB", dist: "1.2km", rating: 4.6, match: 84, tag1: "Cold Brew", tag2: "Filter", status: "Closing 6pm", brew: "Panama Geisha — Honey", barista: "Priya S." },
  { id: 5, name: "The Grind", area: "Rosebank, JHB", dist: "3.4km", rating: 4.5, match: 81, tag1: "Espresso", tag2: "French Press", status: "Open", brew: "Brazil Sul de Minas — Natural", barista: "Marco V." },
];

const SOCIAL_FEED = [
  { user: "alex_k", avatar: "A", brew: "Panama Geisha — V60", cafe: "Wolves Coffee", note: "Incredible jasmine florals. Best cup this month.", mins: 4 },
  { user: "siya_m", avatar: "S", brew: "Ethiopia Yirgacheffe — Espresso", cafe: "Father Coffee", note: "Liam absolutely nailed the extraction today. 10/10.", mins: 11 },
  { user: "priya_d", avatar: "P", brew: "Cold Brew Nitro", cafe: "The Grind", note: "On my 3rd. Not sorry.", mins: 28 },
  { user: "tmv_jnb", avatar: "T", brew: "Kenya AA — AeroPress", cafe: "Rosetta Roastery", note: "That phosphoric acidity is something else.", mins: 45 },
];

const MENU_ITEMS = [
  { name: "Flat White", desc: "Double ristretto, micro-foam", price: "R48", active: true },
  { name: "V60 Pour Over", desc: "Single origin, filter grind", price: "R65", active: true },
  { name: "Cold Brew", desc: "18hr steep, Ethiopia", price: "R55", active: true },
  { name: "AeroPress", desc: "Inverted method, 2min brew", price: "R52", active: false },
  { name: "Cappuccino", desc: "Traditional ratio, velvety", price: "R44", active: true },
  { name: "Espresso Tonic", desc: "Double shot, tonic, orange peel", price: "R62", active: true },
];

const BREW_OPTIONS = [
  "Ethiopia Yirgacheffe — Natural Process",
  "Kenya AA — Washed",
  "Colombia Huila — Honey Process",
  "Panama Geisha — Washed",
  "Brazil Sul de Minas — Natural",
  "Guatemala Antigua — Washed",
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0d0a07;
  --s1:#181210;
  --s2:#231a13;
  --s3:#2e231a;
  --br:rgba(255,255,255,0.07);
  --cream:#f4e6cf;
  --muted:#7a6a57;
  --amber:#c8883c;
  --amb2:#e8a855;
  --terra:#c4614a;
  --sage:#7d9a6e;
  --sage2:#9db88d;
  --fd:'Cormorant Garamond',serif;
  --fb:'Plus Jakarta Sans',sans-serif;
}
body{font-family:var(--fb);background:var(--bg);color:var(--cream);-webkit-font-smoothing:antialiased;}
.app{max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg);position:relative;}

/* WELCOME */
.welcome{min-height:100vh;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.w-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 15% 85%,rgba(200,136,60,.2) 0%,transparent 55%),radial-gradient(ellipse at 85% 15%,rgba(196,97,74,.12) 0%,transparent 50%),linear-gradient(180deg,#090604 0%,#130d08 60%,#0d0a07 100%);}
.w-logo{position:relative;z-index:1;padding:72px 32px 0;flex:1;display:flex;flex-direction:column;justify-content:center;}
.w-word{font-family:var(--fd);font-size:72px;font-weight:700;color:var(--cream);line-height:1;letter-spacing:-3px;}
.w-word em{color:var(--amber);font-style:normal;}
.w-tag{font-size:15px;color:var(--muted);margin-top:10px;font-weight:300;letter-spacing:.3px;}
.w-cup{font-size:100px;margin-top:20px;line-height:1;animation:float 3.5s ease-in-out infinite;display:block;}
@keyframes float{0%,100%{transform:translateY(0) rotate(-3deg);}50%{transform:translateY(-14px) rotate(3deg);}}
.w-actions{position:relative;z-index:1;padding:0 22px 44px;display:flex;flex-direction:column;gap:11px;}
.btn-social{display:flex;align-items:center;gap:14px;padding:15px 18px;border-radius:14px;border:1px solid var(--br);background:rgba(255,255,255,.04);color:var(--cream);font-family:var(--fb);font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;backdrop-filter:blur(8px);}
.btn-social:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.13);transform:translateY(-1px);}
.sicon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;flex-shrink:0;}
.sicon.g{background:#fff;color:#555;}
.sicon.ig{background:linear-gradient(135deg,#f58529,#dd2a7b,#8134af);color:#fff;}
.sicon.fb{background:#1877f2;color:#fff;}
.sicon.em{background:var(--s3);color:var(--amber);font-size:14px;}
.divider{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:12px;}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--br);}
.bar-link{text-align:center;font-size:13px;color:var(--muted);cursor:pointer;padding:4px 0;}
.bar-link span{color:var(--amber);text-decoration:underline;}

/* ONBOARD SHARED */
.ob{min-height:100vh;display:flex;flex-direction:column;padding-bottom:32px;animation:si .25s ease;}
@keyframes si{from{opacity:0;transform:translateX(18px);}to{opacity:1;transform:translateX(0);}}
.ob-head{padding:56px 24px 20px;}
.pdots{display:flex;gap:6px;margin-bottom:28px;}
.pdot{width:6px;height:6px;border-radius:3px;background:var(--br);transition:all .3s;}
.pdot.a{background:var(--amber);width:22px;}
.pdot.d{background:var(--sage);}
.ob-title{font-family:var(--fd);font-size:34px;font-weight:700;color:var(--cream);line-height:1.15;margin-bottom:8px;}
.ob-sub{font-size:13px;color:var(--muted);line-height:1.6;}
.ob-body{flex:1;padding:4px 24px 0;overflow-y:auto;}
.ob-foot{padding:16px 24px 0;display:flex;gap:10px;}
.btn-back{width:52px;height:52px;border-radius:13px;border:1px solid var(--br);background:transparent;color:var(--cream);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;}
.btn-back:hover{background:var(--s1);}
.btn-cont{flex:1;background:var(--amber);color:#0d0a07;border:none;padding:16px;border-radius:13px;font-family:var(--fb);font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;}
.btn-cont:hover{background:var(--amb2);}
.btn-cont:disabled{opacity:.4;cursor:not-allowed;}

/* PROFILE */
.av-pick{width:96px;height:96px;border-radius:50%;background:var(--s2);border:2px dashed var(--amber);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;margin:16px auto 24px;font-size:40px;transition:all .2s;}
.av-pick:hover{background:var(--s3);}
.av-pick small{font-size:9px;color:var(--muted);margin-top:2px;}
.av-opts{display:flex;gap:10px;justify-content:center;margin-top:-10px;margin-bottom:20px;}
.av-opt{width:44px;height:44px;border-radius:50%;background:var(--s2);border:2px solid var(--br);display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;transition:all .2s;}
.av-opt.sel,.av-opt:hover{border-color:var(--amber);}
.fl{margin-bottom:16px;}
.fl label{display:block;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:7px;font-weight:600;}
.fl input{width:100%;padding:13px 15px;background:var(--s1);border:1px solid var(--br);border-radius:12px;color:var(--cream);font-family:var(--fb);font-size:14px;outline:none;transition:border-color .2s;}
.fl input:focus{border-color:var(--amber);}
.fl input::placeholder{color:var(--muted);}

/* LEVEL */
.lv-cards{display:flex;flex-direction:column;gap:13px;margin-top:6px;}
.lv-card{padding:18px 18px;border-radius:16px;border:2px solid var(--br);background:var(--s1);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:14px;}
.lv-card.sel{border-color:var(--amber);background:rgba(200,136,60,.07);}
.lv-card:hover:not(.sel){border-color:rgba(255,255,255,.12);}
.lv-ico{font-size:42px;line-height:1;flex-shrink:0;}
.lv-name{font-family:var(--fd);font-size:20px;font-weight:600;color:var(--cream);margin-bottom:3px;}
.lv-desc{font-size:12px;color:var(--muted);line-height:1.45;}
.lv-chk{width:22px;height:22px;border-radius:50%;border:2px solid var(--br);margin-left:auto;display:flex;align-items:center;justify-content:center;font-size:11px;transition:all .2s;flex-shrink:0;}
.lv-card.sel .lv-chk{background:var(--amber);border-color:var(--amber);color:#0d0a07;}

/* TASTE */
.tsec{margin-bottom:26px;}
.tsec-t{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:var(--amber);font-weight:600;margin-bottom:14px;}
.tslider{margin-bottom:22px;}
.tsl-h{display:flex;align-items:center;gap:8px;margin-bottom:9px;}
.tsl-lbl{font-size:13px;font-weight:500;color:var(--cream);}
.tsl-row{display:flex;align-items:center;gap:9px;}
.tsl-end{font-size:10px;color:var(--muted);width:64px;line-height:1.2;}
.tsl-end:last-child{text-align:right;}
input[type=range]{flex:1;-webkit-appearance:none;height:4px;border-radius:2px;outline:none;cursor:pointer;}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:var(--amber);box-shadow:0 2px 8px rgba(200,136,60,.5);cursor:pointer;transition:transform .2s;}
input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.2);}
.chips{display:flex;flex-wrap:wrap;gap:9px;}
.chip{padding:9px 15px;border-radius:100px;border:1px solid var(--br);background:var(--s1);color:var(--cream);font-size:12px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:5px;font-family:var(--fb);}
.chip.sel{background:rgba(200,136,60,.14);border-color:var(--amber);color:var(--amb2);}
.chip:hover:not(.sel){border-color:rgba(255,255,255,.12);}
.card-opts{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
.card-opt{padding:13px;border-radius:12px;border:1px solid var(--br);background:var(--s1);cursor:pointer;transition:all .2s;text-align:left;}
.card-opt.sel{border-color:var(--amber);background:rgba(200,136,60,.07);}
.co-lbl{font-size:13px;font-weight:500;color:var(--cream);margin-bottom:3px;}
.co-desc{font-size:11px;color:var(--muted);line-height:1.3;}
.pill-opts{display:flex;flex-wrap:wrap;gap:9px;}
.pill{padding:9px 17px;border-radius:100px;border:1px solid var(--br);background:var(--s1);color:var(--cream);font-size:13px;cursor:pointer;transition:all .2s;font-weight:500;font-family:var(--fb);}
.pill.sel{background:var(--amber);border-color:var(--amber);color:#0d0a07;font-weight:600;}
.wcat{margin-bottom:18px;}
.wcat-lbl{font-size:11px;color:var(--muted);margin-bottom:9px;font-weight:500;}
.wchips{display:flex;flex-wrap:wrap;gap:7px;}
.wchip{padding:7px 13px;border-radius:8px;border:1px solid var(--br);background:var(--s1);color:var(--cream);font-size:11px;cursor:pointer;transition:all .2s;}
.wchip.sel{background:rgba(200,136,60,.14);border-color:var(--amber);color:var(--amb2);}

/* BREWING */
.brew-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-top:6px;}
.brew-card{padding:16px 14px;border-radius:14px;border:2px solid var(--br);background:var(--s1);cursor:pointer;transition:all .2s;text-align:center;}
.brew-card.sel{border-color:var(--amber);background:rgba(200,136,60,.07);}
.brew-ico{font-size:30px;margin-bottom:7px;display:block;}
.brew-name{font-size:13px;font-weight:600;color:var(--cream);margin-bottom:3px;}
.brew-desc{font-size:10px;color:var(--muted);}

/* LOCATION */
.loc-opts{display:flex;flex-direction:column;gap:10px;margin-top:6px;}
.loc-opt{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-radius:14px;border:1px solid var(--br);background:var(--s1);cursor:pointer;transition:all .2s;}
.loc-opt.sel{border-color:var(--amber);background:rgba(200,136,60,.07);}
.loc-l{display:flex;align-items:center;gap:13px;}
.loc-ico{width:40px;height:40px;border-radius:10px;background:var(--s2);display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0;}
.loc-name{font-size:14px;font-weight:500;color:var(--cream);}
.loc-sub{font-size:11px;color:var(--muted);margin-top:2px;}
.loc-chk{width:22px;height:22px;border-radius:50%;border:2px solid var(--br);display:flex;align-items:center;justify-content:center;font-size:11px;transition:all .2s;flex-shrink:0;}
.loc-opt.sel .loc-chk{background:var(--amber);border-color:var(--amber);color:#0d0a07;}
.dist-sec{margin-top:22px;}
.dist-lbl{font-size:11px;text-transform:uppercase;letter-spacing:1.2px;color:var(--muted);font-weight:600;margin-bottom:4px;}
.dist-val{font-family:var(--fd);font-size:28px;font-weight:600;color:var(--amber);margin-bottom:12px;}

/* HOME */
.home{min-height:100vh;display:flex;flex-direction:column;animation:si .25s ease;}
.h-head{padding:52px 22px 16px;display:flex;align-items:flex-start;justify-content:space-between;}
.h-greet{font-family:var(--fd);font-size:30px;color:var(--cream);line-height:1.15;}
.h-greet span{font-size:14px;font-family:var(--fb);color:var(--muted);font-style:normal;display:block;margin-top:3px;}
.av-circle{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--amber),var(--terra));display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;flex-shrink:0;}
.h-tabs{display:flex;padding:0 22px;gap:3px;border-bottom:1px solid var(--br);}
.h-tab{padding:10px 16px;font-size:13px;font-weight:500;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;}
.h-tab.a{color:var(--amber);border-bottom-color:var(--amber);}
.h-body{flex:1;padding:18px 22px;overflow-y:auto;}
.s-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;}
.s-ttl{font-family:var(--fd);font-size:20px;font-weight:600;color:var(--cream);}
.see-all{font-size:12px;color:var(--amber);cursor:pointer;}
.cafe-card{background:var(--s1);border-radius:16px;padding:15px;margin-bottom:11px;border:1px solid var(--br);cursor:pointer;transition:all .2s;}
.cafe-card:hover{border-color:rgba(200,136,60,.4);transform:translateY(-2px);}
.cc-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:9px;}
.cc-name{font-family:var(--fd);font-size:18px;font-weight:600;color:var(--cream);}
.cc-area{font-size:11px;color:var(--muted);margin-top:2px;}
.cc-rt{text-align:right;}
.match-badge{font-size:11px;font-weight:700;color:var(--amber);background:rgba(200,136,60,.12);padding:3px 9px;border-radius:100px;margin-bottom:4px;display:inline-block;}
.rating{font-size:12px;color:var(--muted);}
.cc-mid{display:flex;align-items:center;gap:7px;margin-bottom:9px;flex-wrap:wrap;}
.ctag{padding:3px 9px;background:var(--s2);border-radius:100px;font-size:10px;color:var(--muted);}
.cc-bot{display:flex;align-items:center;justify-content:space-between;}
.live-row{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);}
.dot{width:6px;height:6px;border-radius:50%;background:#4ade80;animation:pulse 1.5s infinite;flex-shrink:0;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.8);}}
.status-open{font-size:10px;padding:3px 9px;border-radius:100px;background:rgba(74,222,128,.1);color:#4ade80;}
.status-closing{font-size:10px;padding:3px 9px;border-radius:100px;background:rgba(251,191,36,.1);color:#fbbf24;}

/* MAP VIEW */
.map-wrap{height:220px;border-radius:16px;background:var(--s1);border:1px solid var(--br);overflow:hidden;position:relative;margin-bottom:18px;}
.map-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:28px 28px;}
.map-road{position:absolute;background:rgba(255,255,255,.06);border-radius:2px;}
.map-pin{position:absolute;cursor:pointer;transition:transform .2s;text-align:center;}
.map-pin:hover{transform:scale(1.25) !important;}
.map-pin-dot{width:28px;height:28px;border-radius:50%;background:var(--amber);display:flex;align-items:center;justify-content:center;font-size:13px;margin:0 auto 2px;}
.map-pin-lbl{font-size:9px;color:var(--cream);white-space:nowrap;background:rgba(0,0,0,.6);padding:2px 5px;border-radius:4px;}

/* SOCIAL FEED */
.social-card{background:var(--s1);border-radius:14px;padding:14px;margin-bottom:11px;border:1px solid var(--br);}
.sc-top{display:flex;align-items:center;gap:11px;margin-bottom:10px;}
.sc-av{width:36px;height:36px;border-radius:50%;background:var(--s3);border:2px solid var(--amber);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:var(--amber);flex-shrink:0;}
.sc-user{font-size:13px;font-weight:600;color:var(--cream);}
.sc-cafe{font-size:11px;color:var(--muted);}
.sc-brew{font-size:12px;color:var(--amb2);margin-bottom:6px;font-weight:500;}
.sc-note{font-size:13px;color:var(--cream);line-height:1.5;}
.sc-time{font-size:10px;color:var(--muted);margin-top:8px;}

/* BOTTOM NAV */
.bnav{display:flex;align-items:center;justify-content:space-around;padding:10px 0 22px;border-top:1px solid var(--br);background:var(--bg);position:sticky;bottom:0;}
.bni{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:6px 14px;border-radius:10px;transition:all .2s;min-width:60px;}
.bni.a .bni-ico,.bni.a .bni-lbl{color:var(--amber);}
.bni-ico{font-size:21px;color:var(--muted);}
.bni-lbl{font-size:9px;color:var(--muted);font-weight:500;}

/* BARISTA LOGIN */
.brl{min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:32px 24px;background:linear-gradient(180deg,#080c08 0%,#0d0a07 100%);animation:si .25s ease;}
.br-badge{width:70px;height:70px;border-radius:18px;background:linear-gradient(135deg,#7d9a6e,#4a7a3d);display:flex;align-items:center;justify-content:center;font-size:34px;margin:0 auto 22px;box-shadow:0 10px 30px rgba(125,154,110,.3);}
.br-title{font-family:var(--fd);font-size:32px;font-weight:700;color:var(--cream);text-align:center;margin-bottom:6px;}
.br-sub{font-size:13px;color:var(--muted);text-align:center;margin-bottom:32px;}
.btn-sage{background:var(--sage);color:#080c08;border:none;padding:15px;border-radius:13px;font-family:var(--fb);font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;width:100%;}
.btn-sage:hover{background:var(--sage2);}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--br);padding:12px;border-radius:13px;font-family:var(--fb);font-size:13px;cursor:pointer;transition:all .2s;width:100%;margin-top:10px;}
.btn-ghost:hover{color:var(--cream);border-color:rgba(255,255,255,.15);}

/* BARISTA PORTAL */
.portal{min-height:100vh;background:#080c08;animation:si .25s ease;}
.p-head{padding:52px 22px 18px;background:linear-gradient(180deg,#0a0f0a 0%,#080c08 100%);border-bottom:1px solid rgba(125,154,110,.18);}
.p-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.p-mark{font-family:var(--fd);font-size:22px;font-weight:700;color:var(--cream);}
.p-mark span{color:var(--sage);}
.p-logout{font-size:12px;color:var(--muted);cursor:pointer;background:none;border:none;font-family:var(--fb);}
.p-cafe{font-family:var(--fd);font-size:27px;font-weight:700;color:var(--cream);margin-bottom:2px;}
.p-cafe-sub{font-size:12px;color:var(--muted);}
.p-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:18px 22px;}
.p-stat{background:rgba(125,154,110,.08);border:1px solid rgba(125,154,110,.18);border-radius:12px;padding:13px;text-align:center;}
.pstat-v{font-family:var(--fd);font-size:26px;font-weight:700;color:var(--sage);margin-bottom:3px;}
.pstat-l{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;}
.p-tabs{display:flex;padding:0 22px;gap:3px;border-bottom:1px solid rgba(125,154,110,.18);overflow-x:auto;}
.p-tab{padding:10px 15px;font-size:12px;font-weight:500;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;}
.p-tab.a{color:var(--sage);border-bottom-color:var(--sage);}
.p-body{padding:18px 22px;overflow-y:auto;}
.p-sec-t{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:var(--sage);font-weight:600;margin-bottom:13px;padding-top:4px;}
.brew-status-card{background:var(--s1);border:1px solid var(--br);border-radius:16px;padding:17px;margin-bottom:14px;}
.bsc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;}
.bsc-title{font-family:var(--fd);font-size:17px;font-weight:600;color:var(--cream);}
.live-ind{display:flex;align-items:center;gap:6px;font-size:11px;color:#4ade80;background:rgba(74,222,128,.1);padding:4px 10px;border-radius:100px;}
.brew-btns{display:flex;flex-direction:column;gap:7px;}
.brew-btn{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:10px;border:1px solid var(--br);background:var(--s2);color:var(--cream);font-family:var(--fb);font-size:12px;cursor:pointer;transition:all .2s;text-align:left;}
.brew-btn.a{border-color:var(--sage);background:rgba(125,154,110,.1);color:#a8c899;}
.brew-btn-dot{width:8px;height:8px;border-radius:50%;background:var(--br);flex-shrink:0;}
.brew-btn.a .brew-btn-dot{background:var(--sage);}
.menu-item{display:flex;align-items:center;justify-content:space-between;padding:13px 0;border-bottom:1px solid var(--br);}
.menu-item:last-child{border-bottom:none;}
.mi-name{font-size:14px;font-weight:500;color:var(--cream);margin-bottom:2px;}
.mi-desc{font-size:11px;color:var(--muted);}
.mi-r{text-align:right;}
.mi-price{font-size:14px;font-weight:600;color:var(--sage);margin-bottom:6px;}
.toggle{width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;}
.toggle.on{background:var(--sage);}
.toggle.off{background:var(--s3);}
.tknob{width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:left .2s;}
.toggle.on .tknob{left:23px;}
.insight-card{background:var(--s1);border:1px solid var(--br);border-radius:12px;padding:15px;margin-bottom:11px;}
.ins-lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;}
.bar-row{display:flex;align-items:center;gap:9px;margin-bottom:7px;}
.bar-lbl{font-size:11px;color:var(--muted);width:78px;flex-shrink:0;}
.bar-track{flex:1;height:6px;background:var(--s2);border-radius:3px;overflow:hidden;}
.bar-fill{height:100%;background:var(--sage);border-radius:3px;}
.bar-val{font-size:11px;color:var(--muted);width:28px;text-align:right;}
.trow{display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--br);}
.trow:last-child{border-bottom:none;}
.trow-l .tl{font-size:14px;color:var(--cream);}
.trow-l .ts{font-size:11px;color:var(--muted);margin-top:2px;}
`;

const AVATARS = ["☕", "🫘", "🌿", "🔥", "⭐", "🎯"];

export default function BrewlyApp() {
  const [screen, setScreen] = useState(S.WELCOME);
  const [profile, setProfile] = useState({
    name: "", handle: "", avatar: "☕",
    level: null,
    sliders: { sweet: 50, strength: 50, milk: 30, acidity: 50, body: 50, roast: 40 },
    flavors: [], notes: [], acidities: [], bodies: [], wheelNotes: [],
    processing: [], origins: [], extractions: [],
    brewing: [], locTypes: [], maxDist: 5,
  });
  const [homeTab, setHomeTab] = useState("discover");
  const [navTab, setNavTab] = useState("home");
  const [baristaAuth, setBaristaAuth] = useState({ cafe: "Father Coffee", email: "", password: "" });
  const [portalTab, setPortalTab] = useState("live");
  const [currentBrew, setCurrentBrew] = useState(BREW_OPTIONS[0]);
  const [menuItems, setMenuItems] = useState(MENU_ITEMS);
  const [toggles, setToggles] = useState({ accepting: true, matchmaking: true, liveUpdates: true });

  const up = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const tog = (arr, key, val) => {
    const cur = profile[arr];
    up(arr, cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val]);
  };

  const STEPS = 5;
  const stepOf = { [S.PROFILE]: 1, [S.LEVEL]: 2, [S.TASTE]: 3, [S.BREWING]: 4, [S.LOCATION]: 5 };
  const curStep = stepOf[screen] || 0;

  const ProgressDots = () => (
    <div className="pdots">
      {Array.from({ length: STEPS }).map((_, i) => (
        <div key={i} className={`pdot${i + 1 === curStep ? " a" : i + 1 < curStep ? " d" : ""}`} />
      ))}
    </div>
  );

  const SliderInput = ({ id, left, right }) => {
    const val = profile.sliders[id];
    return (
      <div className="tsl-row">
        <div className="tsl-end">{left}</div>
        <input type="range" min="0" max="100" step="1" value={val}
          style={{ background: `linear-gradient(to right, var(--amber) 0%, var(--amber) ${val}%, var(--s3) ${val}%, var(--s3) 100%)` }}
          onChange={e => up("sliders", { ...profile.sliders, [id]: +e.target.value })} />
        <div className="tsl-end">{right}</div>
      </div>
    );
  };

  // ── WELCOME ──────────────────────────────────────────────────────────────
  if (screen === S.WELCOME) return (
    <div className="app">
      <style>{css}</style>
      <div className="welcome">
        <div className="w-bg" />
        <div className="w-logo">
          <div className="w-word">brew<em>ly</em></div>
          <div className="w-tag">Discover your perfect cup</div>
          <span className="w-cup">☕</span>
        </div>
        <div className="w-actions">
          <button className="btn-social" onClick={() => setScreen(S.PROFILE)}>
            <div className="sicon g">G</div>
            Continue with Google
          </button>
          <button className="btn-social" onClick={() => setScreen(S.PROFILE)}>
            <div className="sicon ig">▶</div>
            Continue with Instagram
          </button>
          <button className="btn-social" onClick={() => setScreen(S.PROFILE)}>
            <div className="sicon fb">f</div>
            Continue with Facebook
          </button>
          <div className="divider">or</div>
          <button className="btn-social" onClick={() => setScreen(S.PROFILE)}>
            <div className="sicon em">@</div>
            Sign up with Email
          </button>
          <div className="bar-link" onClick={() => setScreen(S.BAR_LOGIN)}>
            Are you a barista? <span>Access the Portal →</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ── PROFILE SETUP ─────────────────────────────────────────────────────────
  if (screen === S.PROFILE) return (
    <div className="app">
      <style>{css}</style>
      <div className="ob">
        <div className="ob-head">
          <ProgressDots />
          <div className="ob-title">Let's set up<br />your profile</div>
          <div className="ob-sub">Your coffee identity — how the community knows you</div>
        </div>
        <div className="ob-body">
          <div className="av-pick" onClick={() => {}}>
            <span style={{ fontSize: 40 }}>{profile.avatar}</span>
            <small>choose avatar</small>
          </div>
          <div className="av-opts">
            {AVATARS.map(a => (
              <div key={a} className={`av-opt${profile.avatar === a ? " sel" : ""}`} onClick={() => up("avatar", a)}>{a}</div>
            ))}
          </div>
          <div className="fl">
            <label>Full Name</label>
            <input placeholder="e.g. Alex Khumalo" value={profile.name} onChange={e => up("name", e.target.value)} />
          </div>
          <div className="fl">
            <label>Username</label>
            <input placeholder="@yourhandle" value={profile.handle} onChange={e => up("handle", e.target.value)} />
          </div>
          <div className="fl">
            <label>Email Address</label>
            <input type="email" placeholder="you@email.com" />
          </div>
        </div>
        <div className="ob-foot">
          <button className="btn-back" onClick={() => setScreen(S.WELCOME)}>←</button>
          <button className="btn-cont" disabled={!profile.name} onClick={() => setScreen(S.LEVEL)}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  // ── LEVEL SELECT ──────────────────────────────────────────────────────────
  if (screen === S.LEVEL) return (
    <div className="app">
      <style>{css}</style>
      <div className="ob">
        <div className="ob-head">
          <ProgressDots />
          <div className="ob-title">How do you<br />take your coffee?</div>
          <div className="ob-sub">This shapes the flavour language we use to match you</div>
        </div>
        <div className="ob-body">
          <div className="lv-cards">
            {[
              { id: "casual", icon: "😊", name: "Casual Drinker", desc: "I know what I like — sweet, strong, milky. Keep it simple and delicious." },
              { id: "exploring", icon: "🧭", name: "Exploring", desc: "I'm curious about origins, roast levels, and why some coffees taste fruity." },
              { id: "expert", icon: "🏆", name: "Expert", desc: "I speak in flavour notes, terroir, and processing methods. Bring the complexity." },
            ].map(l => (
              <div key={l.id} className={`lv-card${profile.level === l.id ? " sel" : ""}`} onClick={() => up("level", l.id)}>
                <div className="lv-ico">{l.icon}</div>
                <div>
                  <div className="lv-name">{l.name}</div>
                  <div className="lv-desc">{l.desc}</div>
                </div>
                <div className="lv-chk">{profile.level === l.id ? "✓" : ""}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="ob-foot">
          <button className="btn-back" onClick={() => setScreen(S.PROFILE)}>←</button>
          <button className="btn-cont" disabled={!profile.level} onClick={() => setScreen(S.TASTE)}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  // ── TASTE PROFILE ─────────────────────────────────────────────────────────
  if (screen === S.TASTE) {
    const lvl = profile.level;
    const td = TASTE_DATA[lvl];
    return (
      <div className="app">
        <style>{css}</style>
        <div className="ob">
          <div className="ob-head">
            <ProgressDots />
            <div className="ob-title">Build your<br />taste profile</div>
            <div className="ob-sub">
              {lvl === "casual" && "Tell us what you love — we'll match you to your ideal cup"}
              {lvl === "exploring" && "Fine-tune your flavour preferences across key coffee dimensions"}
              {lvl === "expert" && "Configure your palate with precision — SCA flavour wheel included"}
            </div>
          </div>
          <div className="ob-body">

            {/* CASUAL */}
            {lvl === "casual" && <>
              <div className="tsec">
                <div className="tsec-t">Flavour Sliders</div>
                {td.sliders.map(s => (
                  <div key={s.id} className="tslider">
                    <div className="tsl-h">
                      <span>{s.icon}</span>
                      <span className="tsl-lbl">{s.label}</span>
                    </div>
                    <SliderInput id={s.id} left={s.left} right={s.right} />
                  </div>
                ))}
              </div>
              <div className="tsec">
                <div className="tsec-t">Favourite Vibes — pick all that appeal</div>
                <div className="chips">
                  {td.flavors.map(f => (
                    <div key={f.id} className={`chip${profile.flavors.includes(f.id) ? " sel" : ""}`}
                      onClick={() => tog("flavors", "flavors", f.id)}>
                      {f.e} {f.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="tsec">
                <div className="tsec-t">Temperature Preference</div>
                <div className="pill-opts">
                  {td.temps.map(t => (
                    <div key={t} className={`pill${profile.flavors.includes("temp_" + t) ? " sel" : ""}`}
                      onClick={() => tog("flavors", "flavors", "temp_" + t)}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </>}

            {/* EXPLORING */}
            {lvl === "exploring" && <>
              <div className="tsec">
                <div className="tsec-t">Coffee Dimensions</div>
                {td.sliders.map(s => (
                  <div key={s.id} className="tslider">
                    <div className="tsl-h">
                      <span>{s.icon}</span>
                      <span className="tsl-lbl">{s.label}</span>
                    </div>
                    <SliderInput id={s.id} left={s.left} right={s.right} />
                  </div>
                ))}
              </div>
              <div className="tsec">
                <div className="tsec-t">Tasting Notes — select what you enjoy</div>
                <div className="chips">
                  {td.notes.map(n => (
                    <div key={n.id} className={`chip${profile.notes.includes(n.id) ? " sel" : ""}`}
                      onClick={() => tog("notes", "notes", n.id)}>
                      {n.label} <span style={{ fontSize: 10, color: "var(--muted)" }}>· {n.cat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="tsec">
                <div className="tsec-t">Processing Method</div>
                <div className="card-opts">
                  {td.processing.map(p => (
                    <div key={p} className={`card-opt${profile.processing.includes(p) ? " sel" : ""}`}
                      onClick={() => tog("processing", "processing", p)}>
                      <div className="co-lbl">{p}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="tsec">
                <div className="tsec-t">Origin Interest</div>
                <div className="pill-opts">
                  {td.origins.map(o => (
                    <div key={o} className={`pill${profile.origins.includes(o) ? " sel" : ""}`}
                      onClick={() => tog("origins", "origins", o)}>
                      {o}
                    </div>
                  ))}
                </div>
              </div>
            </>}

            {/* EXPERT */}
            {lvl === "expert" && <>
              <div className="tsec">
                <div className="tsec-t">Acidity Profile — choose all that resonate</div>
                <div className="card-opts">
                  {td.acidities.map(a => (
                    <div key={a.id} className={`card-opt${profile.acidities.includes(a.id) ? " sel" : ""}`}
                      onClick={() => tog("acidities", "acidities", a.id)}>
                      <div className="co-lbl">{a.label}</div>
                      <div className="co-desc">{a.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="tsec">
                <div className="tsec-t">Body & Mouthfeel</div>
                <div className="card-opts">
                  {td.bodies.map(b => (
                    <div key={b.id} className={`card-opt${profile.bodies.includes(b.id) ? " sel" : ""}`}
                      onClick={() => tog("bodies", "bodies", b.id)}>
                      <div className="co-lbl">{b.label}</div>
                      <div className="co-desc">{b.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="tsec">
                <div className="tsec-t">SCA Flavour Wheel — select your notes</div>
                {Object.entries(td.wheel).map(([cat, notes]) => (
                  <div key={cat} className="wcat">
                    <div className="wcat-lbl">{cat}</div>
                    <div className="wchips">
                      {notes.map(n => (
                        <div key={n} className={`wchip${profile.wheelNotes.includes(n) ? " sel" : ""}`}
                          onClick={() => tog("wheelNotes", "wheelNotes", n)}>
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="tsec">
                <div className="tsec-t">Origin Preferences</div>
                <div className="chips">
                  {td.origins.map(o => (
                    <div key={o.id} className={`chip${profile.origins.includes(o.id) ? " sel" : ""}`}
                      onClick={() => tog("origins", "origins", o.id)}>
                      {o.f} {o.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="tsec">
                <div className="tsec-t">Preferred Extraction</div>
                <div className="pill-opts">
                  {td.extractions.map(e => (
                    <div key={e} className={`pill${profile.extractions.includes(e) ? " sel" : ""}`}
                      onClick={() => tog("extractions", "extractions", e)}>
                      {e}
                    </div>
                  ))}
                </div>
              </div>
            </>}
          </div>
          <div className="ob-foot">
            <button className="btn-back" onClick={() => setScreen(S.LEVEL)}>←</button>
            <button className="btn-cont" onClick={() => setScreen(S.BREWING)}>Continue</button>
          </div>
        </div>
      </div>
    );
  }

  // ── BREWING METHODS ───────────────────────────────────────────────────────
  if (screen === S.BREWING) return (
    <div className="app">
      <style>{css}</style>
      <div className="ob">
        <div className="ob-head">
          <ProgressDots />
          <div className="ob-title">Preferred brewing<br />methods</div>
          <div className="ob-sub">Pick one or more — we'll match cafés that do them well</div>
        </div>
        <div className="ob-body">
          <div className="brew-grid">
            {BREW_METHODS.map(m => (
              <div key={m.id} className={`brew-card${profile.brewing.includes(m.id) ? " sel" : ""}`}
                onClick={() => tog("brewing", "brewing", m.id)}>
                <span className="brew-ico">{m.i}</span>
                <div className="brew-name">{m.label}</div>
                <div className="brew-desc">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="ob-foot">
          <button className="btn-back" onClick={() => setScreen(S.TASTE)}>←</button>
          <button className="btn-cont" onClick={() => setScreen(S.LOCATION)}>Continue</button>
        </div>
      </div>
    </div>
  );

  // ── LOCATION PREFS ────────────────────────────────────────────────────────
  if (screen === S.LOCATION) return (
    <div className="app">
      <style>{css}</style>
      <div className="ob">
        <div className="ob-head">
          <ProgressDots />
          <div className="ob-title">Your kind<br />of café</div>
          <div className="ob-sub">Help us find places that match your vibe, not just your cup</div>
        </div>
        <div className="ob-body">
          <div className="loc-opts">
            {LOCATION_TYPES.map(l => (
              <div key={l.id} className={`loc-opt${profile.locTypes.includes(l.id) ? " sel" : ""}`}
                onClick={() => tog("locTypes", "locTypes", l.id)}>
                <div className="loc-l">
                  <div className="loc-ico">{l.i}</div>
                  <div>
                    <div className="loc-name">{l.label}</div>
                    <div className="loc-sub">{l.sub}</div>
                  </div>
                </div>
                <div className="loc-chk">{profile.locTypes.includes(l.id) ? "✓" : ""}</div>
              </div>
            ))}
          </div>
          <div className="dist-sec">
            <div className="dist-lbl">Max Distance</div>
            <div className="dist-val">{profile.maxDist} km</div>
            <input type="range" min="1" max="25" step="1" value={profile.maxDist}
              style={{ width: "100%", background: `linear-gradient(to right, var(--amber) 0%, var(--amber) ${(profile.maxDist - 1) / 24 * 100}%, var(--s3) ${(profile.maxDist - 1) / 24 * 100}%, var(--s3) 100%)` }}
              onChange={e => up("maxDist", +e.target.value)} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>1 km</span>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>25 km</span>
            </div>
          </div>
        </div>
        <div className="ob-foot">
          <button className="btn-back" onClick={() => setScreen(S.BREWING)}>←</button>
          <button className="btn-cont" onClick={() => setScreen(S.HOME)}>
            Enter Brewly ☕
          </button>
        </div>
      </div>
    </div>
  );

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (screen === S.HOME) return (
    <div className="app">
      <style>{css}</style>
      <div className="home">
        <div className="h-head">
          <div className="h-greet">
            Good morning,<br />
            <em style={{ fontStyle: "italic" }}>{profile.name || "coffee lover"}</em>
            <span>Johannesburg · 14°C · Partly cloudy</span>
          </div>
          <div className="av-circle">{profile.avatar}</div>
        </div>

        <div className="h-tabs">
          {["discover", "near me", "social"].map(t => (
            <div key={t} className={`h-tab${homeTab === t ? " a" : ""}`}
              style={{ textTransform: "capitalize" }}
              onClick={() => setHomeTab(t)}>{t}</div>
          ))}
        </div>

        <div className="h-body">

          {/* DISCOVER TAB */}
          {homeTab === "discover" && <>
            <div className="s-hd">
              <div className="s-ttl">Your Matches</div>
              <div className="see-all">See all</div>
            </div>
            {CAFES.map(c => (
              <div key={c.id} className="cafe-card">
                <div className="cc-top">
                  <div>
                    <div className="cc-name">{c.name}</div>
                    <div className="cc-area">📍 {c.area} · {c.dist}</div>
                  </div>
                  <div className="cc-rt">
                    <div className="match-badge">{c.match}% match</div>
                    <div className="rating">⭐ {c.rating}</div>
                  </div>
                </div>
                <div className="cc-mid">
                  <div className="ctag">{c.tag1}</div>
                  <div className="ctag">{c.tag2}</div>
                </div>
                <div className="cc-bot">
                  <div className="live-row">
                    <div className="dot" />
                    {c.barista} is brewing: <strong style={{ color: "var(--amb2)", marginLeft: 3 }}>{c.brew}</strong>
                  </div>
                  <div className={c.status.includes("Closing") ? "status-closing" : "status-open"}>{c.status}</div>
                </div>
              </div>
            ))}
          </>}

          {/* NEAR ME TAB */}
          {homeTab === "near me" && <>
            <div className="map-wrap">
              <div className="map-bg" />
              <div className="map-road" style={{ width: "100%", height: 2, top: "45%", left: 0 }} />
              <div className="map-road" style={{ width: 2, height: "100%", top: 0, left: "40%" }} />
              <div className="map-road" style={{ width: "70%", height: 2, top: "70%", left: "10%" }} />
              {[
                { top: "38%", left: "32%", name: "Father" },
                { top: "55%", left: "58%", name: "Wolves" },
                { top: "22%", left: "65%", name: "Truth" },
                { top: "68%", left: "20%", name: "Rosetta" },
              ].map((p, i) => (
                <div key={i} className="map-pin" style={{ top: p.top, left: p.left, transform: "translate(-50%,-100%)" }}>
                  <div className="map-pin-dot">☕</div>
                  <div className="map-pin-lbl">{p.name}</div>
                </div>
              ))}
            </div>
            <div className="s-hd">
              <div className="s-ttl">Nearby</div>
              <div className="see-all">Map view</div>
            </div>
            {CAFES.slice(0, 3).map(c => (
              <div key={c.id} className="cafe-card">
                <div className="cc-top">
                  <div>
                    <div className="cc-name">{c.name}</div>
                    <div className="cc-area">📍 {c.dist} away · {c.area}</div>
                  </div>
                  <div className="cc-rt">
                    <div className="match-badge">{c.match}% match</div>
                    <div className="rating">⭐ {c.rating}</div>
                  </div>
                </div>
                <div className="cc-bot">
                  <div className="live-row"><div className="dot" />{c.brew}</div>
                  <div className={c.status.includes("Closing") ? "status-closing" : "status-open"}>{c.status}</div>
                </div>
              </div>
            ))}
          </>}

          {/* SOCIAL TAB */}
          {homeTab === "social" && <>
            <div className="s-hd">
              <div className="s-ttl">Currently Drinking</div>
              <div className="see-all">+ Share yours</div>
            </div>
            {SOCIAL_FEED.map((f, i) => (
              <div key={i} className="social-card">
                <div className="sc-top">
                  <div className="sc-av">{f.avatar}</div>
                  <div>
                    <div className="sc-user">@{f.user}</div>
                    <div className="sc-cafe">at {f.cafe}</div>
                  </div>
                </div>
                <div className="sc-brew">☕ {f.brew}</div>
                <div className="sc-note">{f.note}</div>
                <div className="sc-time">{f.mins} min ago</div>
              </div>
            ))}
          </>}

        </div>

        <div className="bnav">
          {[
            { id: "home", ico: "🏠", lbl: "Home" },
            { id: "map", ico: "🗺️", lbl: "Map" },
            { id: "search", ico: "🔍", lbl: "Discover" },
            { id: "profile", ico: "👤", lbl: "Profile" },
          ].map(n => (
            <div key={n.id} className={`bni${navTab === n.id ? " a" : ""}`} onClick={() => setNavTab(n.id)}>
              <div className="bni-ico">{n.ico}</div>
              <div className="bni-lbl">{n.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── BARISTA LOGIN ─────────────────────────────────────────────────────────
  if (screen === S.BAR_LOGIN) return (
    <div className="app">
      <style>{css}</style>
      <div className="brl">
        <div className="br-badge">👨‍🍳</div>
        <div className="br-title">Barista Portal</div>
        <div className="br-sub">Manage your café, track customer preferences & go live</div>
        <div className="fl">
          <label>Café Name</label>
          <input value={baristaAuth.cafe}
            onChange={e => setBaristaAuth(a => ({ ...a, cafe: e.target.value }))}
            placeholder="Your café name" />
        </div>
        <div className="fl">
          <label>Email</label>
          <input type="email" value={baristaAuth.email}
            onChange={e => setBaristaAuth(a => ({ ...a, email: e.target.value }))}
            placeholder="barista@cafe.com" />
        </div>
        <div className="fl">
          <label>Password</label>
          <input type="password" value={baristaAuth.password}
            onChange={e => setBaristaAuth(a => ({ ...a, password: e.target.value }))}
            placeholder="••••••••" />
        </div>
        <button className="btn-sage" onClick={() => setScreen(S.BAR_PORTAL)}>
          Sign In to Portal
        </button>
        <button className="btn-ghost" onClick={() => setScreen(S.WELCOME)}>
          ← Back to Brewly
        </button>
      </div>
    </div>
  );

  // ── BARISTA PORTAL ────────────────────────────────────────────────────────
  if (screen === S.BAR_PORTAL) return (
    <div className="app">
      <style>{css}</style>
      <div className="portal">
        <div className="p-head">
          <div className="p-top">
            <div className="p-mark">brew<span>ly</span> portal</div>
            <button className="p-logout" onClick={() => setScreen(S.BAR_LOGIN)}>Sign out</button>
          </div>
          <div className="p-cafe">{baristaAuth.cafe}</div>
          <div className="p-cafe-sub">Braamfontein · Open · Last update 2 min ago</div>
        </div>

        <div className="p-stats">
          <div className="p-stat">
            <div className="pstat-v">47</div>
            <div className="pstat-l">Visitors Today</div>
          </div>
          <div className="p-stat">
            <div className="pstat-v">31</div>
            <div className="pstat-l">Profile Matches</div>
          </div>
          <div className="p-stat">
            <div className="pstat-v">4.9</div>
            <div className="pstat-l">Avg Rating</div>
          </div>
        </div>

        <div className="p-tabs">
          {["live", "menu", "insights", "settings"].map(t => (
            <div key={t} className={`p-tab${portalTab === t ? " a" : ""}`}
              style={{ textTransform: "capitalize" }}
              onClick={() => setPortalTab(t)}>{t}</div>
          ))}
        </div>

        <div className="p-body">

          {/* LIVE TAB */}
          {portalTab === "live" && <>
            <div className="p-sec-t">Currently Brewing</div>
            <div className="brew-status-card">
              <div className="bsc-head">
                <div className="bsc-title">Live Brew Status</div>
                <div className="live-ind"><div className="dot" />Live</div>
              </div>
              <div className="brew-btns">
                {BREW_OPTIONS.map(b => (
                  <button key={b} className={`brew-btn${currentBrew === b ? " a" : ""}`}
                    onClick={() => setCurrentBrew(b)}>
                    <div className="brew-btn-dot" />
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-sec-t" style={{ paddingTop: 8 }}>Visitor Queue</div>
            <div className="brew-status-card">
              {[
                { name: "alex_k", match: 97, note: "Fruity, bright, floral" },
                { name: "siya_m", match: 91, note: "Full body, caramel" },
                { name: "priya_d", match: 88, note: "Light roast, citric" },
              ].map((v, i) => (
                <div key={i} className="trow">
                  <div className="trow-l">
                    <div className="tl">@{v.name}</div>
                    <div className="ts">{v.note}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="match-badge" style={{ margin: 0 }}>{v.match}%</div>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* MENU TAB */}
          {portalTab === "menu" && <>
            <div className="p-sec-t">Today's Menu</div>
            <div className="brew-status-card">
              {menuItems.map((item, i) => (
                <div key={i} className="menu-item">
                  <div>
                    <div className="mi-name">{item.name}</div>
                    <div className="mi-desc">{item.desc}</div>
                  </div>
                  <div className="mi-r">
                    <div className="mi-price">{item.price}</div>
                    <button
                      className={`toggle${item.active ? " on" : " off"}`}
                      onClick={() => setMenuItems(m => m.map((x, j) => j === i ? { ...x, active: !x.active } : x))}>
                      <div className="tknob" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* INSIGHTS TAB */}
          {portalTab === "insights" && <>
            <div className="p-sec-t">Customer Taste Profiles</div>
            <div className="insight-card">
              <div className="ins-lbl">Flavour Preferences (avg of today's visitors)</div>
              {[
                { lbl: "Fruity", pct: 72 },
                { lbl: "Floral", pct: 58 },
                { lbl: "Chocolate", pct: 45 },
                { lbl: "Caramel", pct: 63 },
                { lbl: "Nutty", pct: 38 },
                { lbl: "Spice", pct: 22 },
              ].map(b => (
                <div key={b.lbl} className="bar-row">
                  <div className="bar-lbl">{b.lbl}</div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: b.pct + "%" }} /></div>
                  <div className="bar-val">{b.pct}%</div>
                </div>
              ))}
            </div>
            <div className="insight-card">
              <div className="ins-lbl">Brewing Method Demand</div>
              {[
                { lbl: "Pour Over", pct: 68 },
                { lbl: "Espresso", pct: 55 },
                { lbl: "AeroPress", pct: 40 },
                { lbl: "Cold Brew", pct: 32 },
              ].map(b => (
                <div key={b.lbl} className="bar-row">
                  <div className="bar-lbl">{b.lbl}</div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: b.pct + "%" }} /></div>
                  <div className="bar-val">{b.pct}%</div>
                </div>
              ))}
            </div>
            <div className="insight-card">
              <div className="ins-lbl">Expertise Level Distribution</div>
              {[
                { lbl: "Expert", pct: 38 },
                { lbl: "Exploring", pct: 44 },
                { lbl: "Casual", pct: 18 },
              ].map(b => (
                <div key={b.lbl} className="bar-row">
                  <div className="bar-lbl">{b.lbl}</div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: b.pct + "%" }} /></div>
                  <div className="bar-val">{b.pct}%</div>
                </div>
              ))}
            </div>
          </>}

          {/* SETTINGS TAB */}
          {portalTab === "settings" && <>
            <div className="p-sec-t">Portal Settings</div>
            <div className="brew-status-card">
              {[
                { key: "accepting", label: "Accepting Visitors", sub: "Show as open on Brewly discovery" },
                { key: "matchmaking", label: "Active Matchmaking", sub: "Allow taste-profile based matches" },
                { key: "liveUpdates", label: "Live Brew Updates", sub: "Push current brew to matched users" },
              ].map(t => (
                <div key={t.key} className="trow">
                  <div className="trow-l">
                    <div className="tl">{t.label}</div>
                    <div className="ts">{t.sub}</div>
                  </div>
                  <button className={`toggle${toggles[t.key] ? " on" : " off"}`}
                    onClick={() => setToggles(ts => ({ ...ts, [t.key]: !ts[t.key] }))}>
                    <div className="tknob" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-sec-t" style={{ paddingTop: 8 }}>Café Details</div>
            <div className="brew-status-card">
              <div className="fl" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6, fontWeight: 600 }}>Café Name</label>
                <input className="fl" style={{ width: "100%", padding: "11px 13px", background: "var(--s2)", border: "1px solid var(--br)", borderRadius: 10, color: "var(--cream)", fontFamily: "var(--fb)", fontSize: 13, outline: "none" }}
                  value={baristaAuth.cafe}
                  onChange={e => setBaristaAuth(a => ({ ...a, cafe: e.target.value }))} />
              </div>
              <button className="btn-sage" style={{ marginTop: 4, fontSize: 13, padding: "11px" }}>Save Changes</button>
            </div>

            <button className="btn-ghost" style={{ marginTop: 12 }} onClick={() => setScreen(S.BAR_LOGIN)}>
              Sign Out of Portal
            </button>
          </>}

        </div>
      </div>
    </div>
  );

  return null;
}
