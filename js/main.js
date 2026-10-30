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
    rev.style.setProperty('--r', (window.innerWidth < 600 ? 72 : 118) + 'px');
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

  // MINI CHALLENGES: simple, customer-first choices in everyday language.
  var gameTabs = $$('[data-game]'), gamePanels = $$('[data-panel]');
  gameTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      gameTabs.forEach(function (t) { t.setAttribute('aria-pressed', t === tab ? 'true' : 'false'); });
      gamePanels.forEach(function (panel) { panel.hidden = panel.dataset.panel !== tab.dataset.game; });
    });
  });

  var needCopy = {
    service: 'הגיוני לגמרי. לפני הכול, חשוב להבין אם העסק בכלל מציע את מה שאתם מחפשים. לכן כדאי להסביר בפשטות מה מקבלים.',
    price: 'מחיר יכול להיות שיקול חשוב. אם אי אפשר לפרסם מחיר קבוע, אפשר לפחות להסביר מה משפיע עליו ואיך מקבלים הצעת מחיר.',
    trust: 'ברור. כשמפקידים עבודה או כסף בידי עסק, רוצים לדעת מי עומד מאחוריו. תמונות, ניסיון והמלצות יכולים לעזור לבנות ביטחון.'
  };
  $$('[data-need]').forEach(function (choice) {
    choice.addEventListener('click', function () {
      $$('[data-need]').forEach(function (b) { b.setAttribute('aria-pressed', b === choice ? 'true' : 'false'); });
      $('#need-feedback').textContent = needCopy[choice.dataset.need];
    });
  });

  var adCopy = {
    a: 'המודעה הזאת נראית חגיגית, אבל לא ממש מספרת מה עושים, למי זה מתאים ומתי. כשצריך לנחש, קל להמשיך לגלול.',
    b: 'זו בחירה ברורה יותר: מבינים מה מקבלים, למי זה מתאים ומתי. לא חייבים להעמיס מידע — רק לתת את הפרטים שעוזרים להחליט.'
  };
  $$('[data-ad]').forEach(function (choice) {
    choice.addEventListener('click', function () {
      $$('[data-ad]').forEach(function (b) { b.setAttribute('aria-pressed', b === choice ? 'true' : 'false'); });
      $('#ad-feedback').textContent = adCopy[choice.dataset.ad];
    });
  });

  var nextCopy = {
    contact: 'מעולה. אם הגעתם עד לכאן, כדאי שיהיה קל למצוא דרך ליצור קשר — בלי לחפש ובלי לנחש.',
    more: 'בחירה טבעית. דוגמאות אמיתיות עוזרות להבין את איכות העבודה ולדמיין מה העסק יכול לעשות גם בשבילכם.',
    about: 'גם זה חשוב. סיפור קצר ואנושי יכול לעזור להבין מי העסק, איך הוא עובד ולמי השירות מתאים.'
  };
  $$('[data-next]').forEach(function (choice) {
    choice.addEventListener('click', function () {
      $$('[data-next]').forEach(function (b) { b.setAttribute('aria-pressed', b === choice ? 'true' : 'false'); });
      $('#next-feedback').textContent = nextCopy[choice.dataset.next];
    });
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
