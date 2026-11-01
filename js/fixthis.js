(function () {
  'use strict';
  var C = window.FIX_CONFIG, root = document.getElementById('fix');
  if (!C || !root) return;
  var $ = function (s, r) { return (r || root).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
  var STEPS = ['intro', 'c1', 'c2', 'c3', 'end'], cur = 'intro';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- images: shown exactly as supplied (natural ratio, object-fit contain, no crop, no stretch); labelled placeholder if no file yet
  function fill(slot, cfg, label, hint, ratio) {
    slot.textContent = '';
    slot.style.setProperty('--r', ratio || 0.8);
    var art = slot.closest('.fx-art'); if (art) art.style.setProperty('--r', ratio || 0.8);
    if (cfg && cfg.src) {
      var i = new Image(); i.draggable = false; i.alt = cfg.alt || ''; i.decoding = 'async'; i.loading = 'lazy';
      i.onload = function () { slot.style.setProperty('--r', i.naturalWidth / i.naturalHeight); if (art) art.style.setProperty('--r', i.naturalWidth / i.naturalHeight); slot.dataset.ratio = i.naturalWidth / i.naturalHeight; slot.dispatchEvent(new Event('fx:loaded', { bubbles: true })); };
      i.src = cfg.src; slot.appendChild(i);
    } else {
      var p = document.createElement('span'); p.className = 'fx-ph'; p.setAttribute('role', 'img'); p.setAttribute('aria-label', 'Placeholder: ' + label);
      p.innerHTML = '<b></b><small></small>'; p.firstChild.textContent = label; p.lastChild.textContent = hint; slot.appendChild(p);
    }
  }
  fill($('[data-slot="c1a"]'), C.c1.a, 'DESIGN A', 'Add assets/fix/c1-a.webp in js/fixthis-config.js');
  fill($('[data-slot="c1b"]'), C.c1.b, 'DESIGN B', 'Add assets/fix/c1-b.webp in js/fixthis-config.js');
  fill($('[data-slot="c2"]'), C.c2.image, 'DESIGN', 'Add assets/fix/c2.webp in js/fixthis-config.js', 1.25);
  fill($('[data-slot="c3b"]'), C.c3.before, 'BEFORE', 'Add assets/fix/c3-before.webp in js/fixthis-config.js', 1.25);
  fill($('[data-slot="c3a"]'), C.c3.after, 'AFTER', 'Add assets/fix/c3-after.webp in js/fixthis-config.js', 1.25);

  // ---- step machine
  function show(step) {
    cur = step;
    $$('.fx-panel').forEach(function (p) { var on = p.dataset.step === step; p.hidden = !on; if (on && !reduce) { p.classList.remove('in'); void p.offsetWidth; p.classList.add('in'); } });
    var n = STEPS.indexOf(step), cnt = $('#fx-count');
    cnt.hidden = !(n > 0 && n < 4); cnt.textContent = '0' + n + ' / 03';
    $('#fx-skip').hidden = step === 'end';
    if (step === 'c3') setupCompare();
    var h = $('.fx-panel:not([hidden]) [data-focus]'); if (h) h.focus({ preventScroll: false });
  }
  root.addEventListener('click', function (e) {
    var g = e.target.closest('[data-go]'); if (g) show(g.dataset.go);
  });
  root.addEventListener('fx:loaded', function () { if (cur === 'c3') setupCompare(); });
  $('#fx-skip').addEventListener('click', function () { show('end'); });
  $('#fx-replay').addEventListener('click', function () { reset(); show('intro'); });

  // ---- challenge 1: pick A or B
  var pair = $('.fx-pair'), r1 = $('[data-step="c1"] .fx-reveal');
  $$('[data-pick]', pair).forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-pick]', pair).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); x.classList.toggle('sel', x === b); });
      pair.classList.add('picked');
      if (C.c1.correct) $$('[data-pick]', pair).forEach(function (x) { x.classList.toggle('fav', x.dataset.pick === C.c1.correct); });
      $('.fx-quote', r1).textContent = C.c1.quote; $('.fx-why', r1).textContent = C.c1.why;
      r1.hidden = false; if (!reduce) { r1.classList.remove('in'); void r1.offsetWidth; r1.classList.add('in'); }
      $('.fx-next', r1).focus({ preventScroll: true });
    });
  });

  // ---- challenge 2: what is missing?
  var list = $('.fx-opts'), r2 = $('[data-step="c2"] .fx-reveal');
  C.c2.options.forEach(function (o) {
    var li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.dataset.opt = o.id; b.setAttribute('aria-pressed', 'false'); b.textContent = o.text;
    b.addEventListener('click', function () {
      $$('[data-opt]', list).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); x.classList.toggle('sel', x === b); if (C.c2.correct) x.classList.toggle('fav', x.dataset.opt === C.c2.correct); });
      list.classList.add('picked'); $('.fx-why', r2).textContent = C.c2.why;
      r2.hidden = false; if (!reduce) { r2.classList.remove('in'); void r2.offsetWidth; r2.classList.add('in'); }
      $('.fx-next', r2).focus({ preventScroll: true });
    });
    li.appendChild(b); list.appendChild(li);
  });

  // ---- challenge 3: before / after (slider when both images share a ratio, otherwise a toggle; never distorted)
  var cmp = $('.fx-cmp'), range = $('#fx-range'), tog = $('.fx-tog'), mode = 'slider';
  function setP(v) { cmp.style.setProperty('--p', v + '%'); range.value = v; }
  function setupCompare() {
    var rb = +$('[data-slot="c3b"]').dataset.ratio, ra = +$('[data-slot="c3a"]').dataset.ratio;
    mode = (rb && ra && Math.abs(rb - ra) / rb > 0.02) ? 'toggle' : 'slider';
    cmp.style.setProperty('--r', rb || 1.25);
    range.hidden = $('.fx-cmp-ctrl').hidden = mode === 'toggle'; tog.hidden = mode !== 'toggle';
    cmp.classList.toggle('is-toggle', mode === 'toggle'); setP(mode === 'toggle' ? 100 : 50);
    $$('[data-tg]', tog).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.tg === 'before' ? 'true' : 'false'); });
  }
  range.addEventListener('input', function () { setP(+range.value); });
  var drag = false;
  function fromPointer(e) { var r = cmp.getBoundingClientRect(); setP(Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100))); }
  cmp.addEventListener('pointerdown', function (e) { if (mode !== 'slider') return; drag = true; cmp.setPointerCapture(e.pointerId); fromPointer(e); });
  cmp.addEventListener('pointermove', function (e) { if (drag) fromPointer(e); });
  ['pointerup', 'pointercancel'].forEach(function (ev) { cmp.addEventListener(ev, function () { drag = false; }); });
  $$('[data-tg]', tog).forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-tg]', tog).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      setP(b.dataset.tg === 'before' ? 100 : 0);
    });
  });

  function reset() {
    pair.classList.remove('picked'); $$('[data-pick]', pair).forEach(function (x) { x.classList.remove('sel', 'fav'); x.setAttribute('aria-pressed', 'false'); }); r1.hidden = true;
    list.classList.remove('picked'); $$('[data-opt]', list).forEach(function (x) { x.classList.remove('sel', 'fav'); x.setAttribute('aria-pressed', 'false'); }); r2.hidden = true;
  }
  show('intro');
})();
