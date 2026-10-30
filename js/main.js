(function () {
  'use strict';
  // Replace with your real WhatsApp number: country code + digits, no + (e.g. 9725XXXXXXXX).
  var WHATSAPP_NUMBER = '972500000000';
  var EMAIL = 'mazebyme@gmail.com';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ENTRY: pointer / touch reveals a second typographic layer.
  var rev = $('#reveal'), words = $$('.big span', $('#entry'));
  function setPos(e) {
    var r = rev.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
    rev.style.setProperty('--x', (t.clientX - r.left) + 'px');
    rev.style.setProperty('--y', (t.clientY - r.top) + 'px');
    rev.style.setProperty('--r', (window.innerWidth < 600 ? 100 : 155) + 'px');
  }
  if (!reduce) {
    ['pointermove', 'touchstart', 'touchmove'].forEach(function (ev) { rev.addEventListener(ev, setPos, { passive: true }); });
    ['pointerleave', 'touchend'].forEach(function (ev) { rev.addEventListener(ev, function () { rev.style.setProperty('--r', '0px'); }); });
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        var p = Math.min(window.scrollY / window.innerHeight, 1);
        words.forEach(function (w, i) { w.style.transform = 'translateX(' + ((i % 2 ? -1 : 1) * p * 12) + 'vw)'; });
        tick = false;
      });
    }, { passive: true });
  } else { rev.style.setProperty('--r', '0px'); }

  // NAVIGATION STATE + GUIDED TOUR.
  var ids = ['entry', 'paths', 'archive', 'fix', 'contact'], seen = {};
  var route = ['paths', 'archive', 'fix', 'contact'], tourOn = false, tourIdx = 0;
  var bar = $('#tour');
  function go(id) {
    var target = document.getElementById(id);
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true });
  }
  function drawTour() {
    $('#tour-step').textContent = 'Guided route · ' + (tourIdx + 1) + ' of ' + route.length;
    $('#tour-back').disabled = tourIdx === 0;
    $('#tour-next').textContent = tourIdx === route.length - 1 ? 'DONE' : 'NEXT';
  }
  function tour(on) { tourOn = on; bar.hidden = !on; document.body.classList.toggle('touring', on); if (on) drawTour(); }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.id;
      $$('.bar nav a').forEach(function (a) {
        a.removeAttribute('aria-current');
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
      });
      seen[id] = 1;
      $$('.paths a').forEach(function (a) {
        var destination = a.getAttribute('href').slice(1);
        if (seen[destination] && id !== 'paths') a.classList.add('visited');
      });
      if (tourOn) { tourIdx = Math.max(0, route.indexOf(id)); drawTour(); }
    });
  }, { threshold: 0.55 });
  ids.forEach(function (id) { var section = document.getElementById(id); if (section) io.observe(section); });
  $('[data-tour="start"]').addEventListener('click', function () { tour(true); tourIdx = 1; go('archive'); drawTour(); });
  $('#tour-next').addEventListener('click', function () { if (tourIdx === route.length - 1) return tour(false); tourIdx++; go(route[tourIdx]); drawTour(); });
  $('#tour-back').addEventListener('click', function () { if (tourIdx > 0) { tourIdx--; go(route[tourIdx]); drawTour(); } });
  $('#tour-exit').addEventListener('click', function () { tour(false); });

  // FIX THIS: before / after slider, annotations and alignment grid.
  var box = $('#cmpbox'), cmp = $('#cmp'), out = $('#fix-out');
  function setP() { box.style.setProperty('--p', cmp.value + '%'); }
  cmp.addEventListener('input', setP); setP();
  $('#gl').addEventListener('change', function (e) { box.classList.toggle('show-grid', e.target.checked); });
  var why = {
    1: 'היררכיה: השם גדול פי ארבעה מכל פרט אחר, ולכן הוא הדבר הראשון שנקרא. לפני, חמש שורות בגדלים דומים התחרו זו בזו.',
    2: 'יישור ומרווח: כל הפרטים נשענים על אותו קו וברווח קבוע (הפעילו את הרשת כדי לראות). לפני, שורות במרכז, בצד ובמרחקים לא קבועים.',
    3: 'ניגודיות: טקסט בהיר על רקע כהה ביחס 11.6:1. לפני, חול על חום-אפור ביחס 3.87:1, שקשה לקרוא.'
  };
  $$('[data-pin]').forEach(function (pin) {
    pin.addEventListener('click', function () {
      $$('[data-pin]').forEach(function (x) { x.setAttribute('aria-pressed', x === pin ? 'true' : 'false'); });
      out.textContent = why[pin.dataset.pin];
      if (+cmp.value > 20) { cmp.value = 10; setP(); }
    });
  });

  // MINI CHALLENGES: tabbed challenges with keyboard-friendly buttons and reset states.
  var gameTabs = $$('[data-game]'), gamePanels = $$('[data-panel]');
  gameTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      gameTabs.forEach(function (t) { t.setAttribute('aria-pressed', t === tab ? 'true' : 'false'); });
      gamePanels.forEach(function (panel) { panel.hidden = panel.dataset.panel !== tab.dataset.game; });
    });
  });

  // 01 — SPOT THE PROBLEM.
  var spotNotes = {
    1: 'נמצאה בעיית היררכיה: הכותרת צועקת, אבל לא מסבירה מה העסק מציע. קודם מנסחים מסר ברור, אחר כך מחליטים כמה חזק להציג אותו.',
    2: 'נמצאה בעיית קריאות: פרטי המידע נדחסים לאזור אחד ובמשקלים דומים. צריך ליצור קבוצות ורווחים כדי שהעין תדע לאן להמשיך.',
    3: 'נמצאה בעיית פעולה: הכפתור נראה כמו עוד שורת טקסט ולא ברור מה יקרה בלחיצה. פעולה מרכזית צריכה להיראות ולהישמע כמו פעולה.'
  };
  var spotFound = {};
  function updateSpot() {
    var total = Object.keys(spotFound).length;
    $('#spot-count').textContent = total + ' / 3 CLUES';
    if (total === 3) $('#spot-feedback').textContent = 'CASE SOLVED. מצאתם את שלוש הבעיות. שימו לב: לא צריך לקשט יותר — צריך להחליט מה חשוב.';
  }
  $$('[data-spot]').forEach(function (target) {
    target.addEventListener('click', function () {
      var id = target.dataset.spot;
      if (spotFound[id]) return;
      spotFound[id] = true; target.classList.add('found'); target.setAttribute('aria-pressed', 'true');
      $('#spot-feedback').textContent = spotNotes[id]; updateSpot();
    });
  });
  $('#spot-reset').addEventListener('click', function () {
    spotFound = {};
    $$('[data-spot]').forEach(function (target) { target.classList.remove('found'); target.setAttribute('aria-pressed', 'false'); });
    $('#spot-feedback').textContent = 'רמז: חפשו היררכיה, קריאות ופעולה ברורה.'; updateSpot();
  });

  // 02 — MAKE THE CALL. The explanation focuses on the reasoning, not a taste-based right answer.
  var callCopy = {
    a: 'צבע יכול למשוך תשומת לב, אבל הוא לא פותר חוסר בהירות. לפני שבוחרים צבע, צריך להבין מה הקהל אמור לקחת מהמודעה.',
    b: 'בדיוק. כשמגדירים את המסר המרכזי, אפשר לבנות סביבו היררכיה, צבע, טיפוגרפיה וקריאה לפעולה. זו החלטה שמכוונת את כל העיצוב.'
  };
  $$('[data-call]').forEach(function (choice) {
    choice.addEventListener('click', function () {
      $$('[data-call]').forEach(function (b) { b.setAttribute('aria-pressed', b === choice ? 'true' : 'false'); });
      $('#call-feedback').textContent = callCopy[choice.dataset.call];
    });
  });
  $('#call-reset').addEventListener('click', function () {
    $$('[data-call]').forEach(function (b) { b.removeAttribute('aria-pressed'); });
    $('#call-feedback').textContent = 'בחרו תשובה כדי לפתוח את ההסבר.';
  });

  // 03 — UNLOCK THE DESIGN. Build a sequence by choosing information blocks.
  var orderLabels = { offer: 'מה העסק מציע?', proof: 'למה לסמוך עליו?', action: 'איך מתקדמים?' };
  var orderExpected = ['offer', 'proof', 'action'], orderChosen = [];
  function renderOrder() {
    var list = $('#unlock-sequence'); list.textContent = '';
    orderChosen.forEach(function (key, index) {
      var item = document.createElement('li'); item.textContent = (index + 1) + '. ' + orderLabels[key]; list.appendChild(item);
    });
    $('#unlock-count').textContent = orderChosen.length + ' / 3 PLACED';
  }
  $$('[data-order]').forEach(function (choice) {
    choice.addEventListener('click', function () {
      var key = choice.dataset.order;
      if (orderChosen.indexOf(key) > -1 || orderChosen.length === 3) return;
      orderChosen.push(key); choice.disabled = true; renderOrder();
      var step = orderChosen.length - 1;
      if (key === orderExpected[step]) {
        $('#unlock-feedback').textContent = orderChosen.length === 3
          ? 'SEQUENCE UNLOCKED. מתחילים בהצעת הערך, בונים אמון, ואז מסירים חסמים ליצירת קשר. זו היררכיה שמובילה לפעולה.'
          : 'נכון. הבלוק הזה יושב במקום ' + (step + 1) + '. מה השלב הבא?';
      } else {
        $('#unlock-feedback').textContent = 'אפשר גם כך, אבל חשבו על מסלול הקריאה: קודם להבין מה מקבלים, אחר כך למה להאמין, ורק אז מה לעשות.';
      }
    });
  });
  $('#unlock-reset').addEventListener('click', function () {
    orderChosen = []; $$('[data-order]').forEach(function (b) { b.disabled = false; }); renderOrder();
    $('#unlock-feedback').textContent = 'בחרו את הבלוק הראשון.';
  });

  // CONTACT: service picks fill the form; submit opens WhatsApp if configured, otherwise an email draft.
  var ready = WHATSAPP_NUMBER !== '972500000000';
  var form = $('#cform'), note = $('#wa-note'), svcs = $$('[data-svc]');
  if (ready) {
    var fw = $('#f-wa'); fw.hidden = false; fw.href = 'https://wa.me/' + WHATSAPP_NUMBER; fw.target = '_blank'; fw.rel = 'noopener';
  }
  svcs.forEach(function (b) {
    b.addEventListener('click', function () {
      svcs.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      form.elements.msg.value = 'שלום, אני מתעניין/ת ב: ' + b.dataset.svc;
      form.elements.msg.focus({ preventScroll: true });
    });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.name.value.trim(), contact = form.elements.contact.value.trim(), message = form.elements.msg.value.trim();
    if (!name || !contact || !message) { note.textContent = 'Please fill in all three fields.'; return; }
    var text = message + '\n\n' + name + '\n' + contact;
    if (ready) {
      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      note.textContent = 'Opening WhatsApp with your message.';
    } else {
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('פנייה מהאתר') + '&body=' + encodeURIComponent(text);
      note.textContent = 'Opening an email draft.';
    }
  });
})();
