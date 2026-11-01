(function () {
  'use strict';
  // REPLACE with the business WhatsApp number: country code, digits only, no "+" (e.g. 9725XXXXXXXX)
  var WHATSAPP_NUMBER = '972500000000';
  var EMAIL = 'mazebyme@gmail.com';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Entry: pointer / touch reveals a second typographic layer; the headline words drift with the pointer
  var rev = $('#reveal'), words = $$('.big span', $('#entry'));
  function setPos(e) {
    var r = rev.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
    rev.style.setProperty('--x', (t.clientX - r.left) + 'px');
    rev.style.setProperty('--y', (t.clientY - r.top) + 'px');
    rev.style.setProperty('--r', (innerWidth < 600 ? 90 : 140) + 'px');
  }
  if (!reduce) {
    ['pointermove', 'touchstart', 'touchmove'].forEach(function (ev) { rev.addEventListener(ev, setPos, { passive: true }); });
    ['pointerleave', 'touchend'].forEach(function (ev) { rev.addEventListener(ev, function () { rev.style.setProperty('--r', '0px'); }); });
    $('#entry').addEventListener('pointermove', function (e) {
      var p = e.clientX / innerWidth - 0.5;
      words.forEach(function (w, i) { w.style.transform = 'translateX(' + ((i % 2 ? -1 : 1) * p * 3) + 'vw)'; });
    }, { passive: true });
  } else { rev.style.setProperty('--r', '0px'); }

  // ---- Reacting to the maze: current room in the header, visited paths, guided tour
  var route = ['paths', 'archive', 'fix', 'about', 'contact'], tourOn = false, tourIdx = 0, bar = $('#tour');
  document.addEventListener('maze:change', function (e) {
    var id = e.detail.room, vis = e.detail.visited;
    $$('.bar nav a').forEach(function (a) { a.removeAttribute('aria-current'); if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); });
    $$('.paths a').forEach(function (a) { if (vis[a.getAttribute('href').slice(1)]) a.classList.add('visited'); });
    if (tourOn) { var i = route.indexOf(id); if (i > -1) tourIdx = i; drawTour(); }
  });
  function go(id) { window.MazeNav.go(id); }
  function drawTour() {
    $('#tour-step').textContent = 'Guided route · ' + (tourIdx + 1) + ' of ' + route.length;
    $('#tour-back').disabled = tourIdx === 0;
    $('#tour-next').textContent = tourIdx === route.length - 1 ? 'DONE' : 'NEXT';
  }
  function tour(on) { tourOn = on; bar.hidden = !on; document.body.classList.toggle('touring', on); if (on) drawTour(); }
  $('[data-tour="start"]').addEventListener('click', function () { tour(true); tourIdx = 1; go('archive'); drawTour(); });
  $('#tour-next').addEventListener('click', function () { if (tourIdx === route.length - 1) return tour(false); tourIdx++; go(route[tourIdx]); drawTour(); });
  $('#tour-back').addEventListener('click', function () { if (tourIdx > 0) { tourIdx--; go(route[tourIdx]); drawTour(); } });
  $('#tour-exit').addEventListener('click', function () { tour(false); });

  // ---- Contact: service picks fill the form; submit opens WhatsApp (if number set) or an email draft
  var ready = WHATSAPP_NUMBER !== '972500000000';
  var form = $('#cform'), note = $('#wa-note'), svcs = $$('[data-svc]');
  if (ready) { var fw = $('#f-wa'); fw.hidden = false; fw.href = 'https://wa.me/' + WHATSAPP_NUMBER; fw.target = '_blank'; fw.rel = 'noopener'; }
  svcs.forEach(function (b) {
    b.addEventListener('click', function () {
      svcs.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      form.msg.value = 'שלום, אני מתעניין/ת ב: ' + b.dataset.svc;
      form.msg.focus({ preventScroll: true });
    });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.name.value.trim() || !form.contact.value.trim() || !form.msg.value.trim()) { note.textContent = 'Please fill in all three fields.'; return; }
    var text = form.msg.value.trim() + '\n\n' + form.name.value.trim() + '\n' + form.contact.value.trim();
    if (ready) { window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener'); note.textContent = 'Opening WhatsApp with your message.'; }
    else { location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('פנייה מהאתר') + '&body=' + encodeURIComponent(text); note.textContent = 'Opening an email draft.'; }
  });
})();
