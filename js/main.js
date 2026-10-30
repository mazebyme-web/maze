(function () {
  'use strict';
  // REPLACE with the business WhatsApp number: country code, digits only, no "+" (e.g. 9725XXXXXXXX)
  var WHATSAPP_NUMBER = '972500000000';
  var EMAIL = 'mazebyme@gmail.com';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Entry: pointer / touch reveals a second typographic layer; scroll shifts the headline words
  var rev = $('#reveal'), words = $$('.big span', $('#entry'));
  function setPos(e) {
    var r = rev.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
    rev.style.setProperty('--x', (t.clientX - r.left) + 'px');
    rev.style.setProperty('--y', (t.clientY - r.top) + 'px');
    rev.style.setProperty('--r', (innerWidth < 600 ? 150 : 230) + 'px');
  }
  if (!reduce) {
    ['pointermove', 'touchstart', 'touchmove'].forEach(function (ev) { rev.addEventListener(ev, setPos, { passive: true }); });
    ['pointerleave', 'touchend'].forEach(function (ev) { rev.addEventListener(ev, function () { rev.style.setProperty('--r', '0px'); }); });
    var tick = false;
    addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        var p = Math.min(scrollY / innerHeight, 1);
        words.forEach(function (w, i) { w.style.transform = 'translateX(' + ((i % 2 ? -1 : 1) * p * 12) + 'vw)'; });
        tick = false;
      });
    }, { passive: true });
  } else { rev.style.setProperty('--r', '0px'); }

  // ---- Navigation state: current section + visited paths
  var ids = ['entry', 'paths', 'archive', 'fix', 'contact'], seen = {};
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var id = e.target.id;
      $$('.bar nav a').forEach(function (a) { a.removeAttribute('aria-current'); if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); });
      seen[id] = 1;
      $$('.paths a').forEach(function (a) { if (seen[a.getAttribute('href').slice(1)] && id !== 'paths') a.classList.add('visited'); });
      if (tourOn) { tourIdx = Math.max(0, route.indexOf(id)); drawTour(); }
    });
  }, { threshold: 0.55 });
  ids.forEach(function (id) { io.observe(document.getElementById(id)); });

  // ---- Guided tour: Paths → Archive → Fix this → Contact
  var route = ['paths', 'archive', 'fix', 'contact'], tourOn = false, tourIdx = 0;
  var bar = $('#tour');
  function go(id) {
    var el = document.getElementById(id);
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true });
  }
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

  // ---- FIX THIS: before/after slider + annotation pins + alignment grid
  var box = $('#cmpbox'), cmp = $('#cmp'), out = $('#fix-out');
  function setP() { box.style.setProperty('--p', cmp.value + '%'); }
  cmp.addEventListener('input', setP); setP();
  $('#gl').addEventListener('change', function (e) { box.classList.toggle('show-grid', e.target.checked); });
  var why = {
    1: 'היררכיה: השם גדול פי ארבעה מכל פרט אחר, ולכן הוא הדבר הראשון שנקרא. לפני, חמש שורות בגדלים דומים התחרו זו בזו.',
    2: 'יישור ומרווח: כל הפרטים נשענים על אותו קו וברווח קבוע (הפעילו את הרשת כדי לראות). לפני, שורות במרכז, בצד ובמרחקים לא קבועים.',
    3: 'ניגודיות: טקסט בהיר על רקע כהה ביחס 11.6:1. לפני, חול על חום-אפור ביחס 3.87:1, שקשה לקרוא.'
  };
  $$('[data-pin]').forEach(function (p) {
    p.addEventListener('click', function () {
      $$('[data-pin]').forEach(function (x) { x.setAttribute('aria-pressed', x === p ? 'true' : 'false'); });
      out.textContent = why[p.dataset.pin];
      if (+cmp.value > 20) { cmp.value = 10; setP(); }
    });
  });

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
