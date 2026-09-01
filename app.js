// ===== Mobile drawer =====
function initDrawer(){
  const btn = document.querySelector('.hamburger');
  const drawer = document.querySelector('.mobile-drawer');
  const closeX = document.querySelector('.close-x');
  if(!btn||!drawer) return;
  btn.addEventListener('click', ()=> drawer.classList.add('open'));
  closeX && closeX.addEventListener('click', ()=> drawer.classList.remove('open'));
  drawer.addEventListener('click', (e)=>{ if(e.target===drawer) drawer.classList.remove('open'); });
}

// ===== Toast =====
function toast(msg){
  let t = document.querySelector('.toast');
  if(!t){
    t = document.createElement('div');
    t.className='toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(()=> t.classList.remove('show'), 2400);
}

// ===== Favorite / watchlist heart toggle (in-memory) =====
function initFavButtons(){
  document.querySelectorAll('.fav').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault(); e.stopPropagation();
      btn.classList.toggle('active');
      toast(btn.classList.contains('active') ? 'Added to watchlist' : 'Removed from watchlist');
    });
  });
}

// ===== Bezel ring builder =====
// el: container with data-percent (0-100), data-size, data-stroke
function buildBezel(el){
  const size = parseInt(el.dataset.size || 64);
  const stroke = parseInt(el.dataset.stroke || 5);
  const pct = parseFloat(el.dataset.percent || 60);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct/100);
  el.innerHTML = `<svg width="${size}" height="${size}">
    <circle class="bezel-track" cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke-width="${stroke}"/>
    <circle class="bezel-progress" cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke-width="${stroke}"
      stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
  </svg>`;
  el.style.width = size+'px';
  el.style.height = size+'px';
}
function initBezels(){
  document.querySelectorAll('.bezel[data-percent]').forEach(buildBezel);
}

// ===== Countdown timers =====
// span.countdown[data-end="ISO"] ; optional data-bezel="#id" to drive a bezel ring, data-total-seconds for percent calc
function pad(n){ return n.toString().padStart(2,'0'); }
function formatCountdown(ms){
  if(ms<=0) return {text:'Ended', h:0,m:0,s:0, ended:true};
  const totalSec = Math.floor(ms/1000);
  const d = Math.floor(totalSec/86400);
  const h = Math.floor((totalSec%86400)/3600);
  const m = Math.floor((totalSec%3600)/60);
  const s = totalSec%60;
  let text;
  if(d>0) text = `${d}d ${pad(h)}h ${pad(m)}m`;
  else text = `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
  return {text,h,m,s,d,ended:false};
}
function initCountdowns(){
  const els = document.querySelectorAll('.countdown[data-end]');
  if(!els.length) return;
  function tick(){
    els.forEach(el=>{
      const end = new Date(el.dataset.end).getTime();
      const now = Date.now();
      const remain = end - now;
      const f = formatCountdown(remain);
      el.textContent = f.text;
      if(f.ended) el.classList.add('ended');
      const bezelSel = el.dataset.bezel;
      if(bezelSel){
        const bz = document.querySelector(bezelSel);
        if(bz){
          const total = parseFloat(bz.dataset.totalMs || 3600000);
          const pct = Math.max(0, Math.min(100, (remain/total)*100));
          bz.dataset.percent = pct;
          buildBezel(bz);
        }
      }
    });
  }
  tick();
  setInterval(tick, 1000);
}

// ===== Bid stepper (lot detail) =====
function initBidStepper(){
  const stepper = document.querySelector('.bid-stepper');
  if(!stepper) return;
  const display = document.querySelector('.bid-amount-display');
  const input = document.querySelector('#bidAmount');
  const inc = parseInt(stepper.dataset.increment || 1000);
  const min = parseInt(stepper.dataset.min || 0);
  function set(v){
    v = Math.max(min, v);
    if(input) input.value = v.toLocaleString();
    if(display) display.textContent = 'RM ' + v.toLocaleString();
    stepper.dataset.current = v;
  }
  set(parseInt(stepper.dataset.current || min));
  document.querySelectorAll('[data-bid-step]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const cur = parseInt(stepper.dataset.current || min);
      const dir = parseInt(btn.dataset.bidStep);
      set(cur + dir*inc);
    });
  });
}

// ===== Tabs =====
function initTabs(){
  document.querySelectorAll('.tabs').forEach(tabgroup=>{
    const target = tabgroup.dataset.target;
    tabgroup.querySelectorAll('.tab').forEach(tab=>{
      tab.addEventListener('click', ()=>{
        tabgroup.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        if(target){
          document.querySelectorAll(target+' > [data-pane]').forEach(p=> p.style.display='none');
          const pane = document.querySelector(target+' > [data-pane="'+tab.dataset.pane+'"]');
          if(pane) pane.style.display='';
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  initDrawer();
  initFavButtons();
  initBezels();
  initCountdowns();
  initBidStepper();
  initTabs();
});
