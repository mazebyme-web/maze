(function () {
  'use strict';
  var P = window.MAZE_PROJECTS || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var grid = $('#grid'), overlay = $('#case'), body = $('#case-body'), opener = null;

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function he(tag, cls, txt) { var e = el(tag, cls, txt); e.lang = 'he'; e.dir = 'rtl'; return e; }

  // ---- visual per tile type (real image if provided, labelled placeholder otherwise)
  function visual(p) {
    var v = el('span', 'vis v' + p.type);
    v.setAttribute('aria-hidden', p.images.length ? null : 'true');
    if (p.images.length) {
      p.images.slice(0, p.type === 'C' ? 4 : 1).forEach(function (im) {
        var i = el('img'); i.src = im.src; i.alt = im.alt || ''; i.loading = 'lazy'; v.appendChild(i);
      });
      return v;
    }
    if (p.type === 'C') { for (var k = 1; k <= 4; k++) v.appendChild(el('i', 'strip', 'V' + k)); }
    else if (p.type === 'D') { v.appendChild(el('b', 'giant', 'OPENS DOORS.')); }
    else { v.appendChild(el('b', 'giant', p.n)); v.appendChild(el('em', 'pend', 'IMAGE PENDING')); }
    return v;
  }

  function tile(p) {
    var li = el('li', 'tile t' + p.type); li.dataset.cats = p.cats.join(' ');
    var b = el('button'); b.type = 'button'; b.dataset.id = p.id;
    b.setAttribute('aria-label', 'Open file ' + p.n + ': ' + p.title);
    b.appendChild(visual(p));
    var meta = el('span', 'meta');
    meta.appendChild(el('small', 'tech', p.n + ' / ' + p.cats.join(' · ').toUpperCase() + (p.pending ? ' / PENDING' : '')));
    meta.appendChild(el('strong', 'ttl', p.title));
    meta.appendChild(el('small', 'lbl', p.label));
    var more = he('span', 'more', p.desc); more.appendChild(el('u', null, ' ↗')); meta.appendChild(more);
    b.appendChild(meta);
    li.appendChild(b);
    return li;
  }
  P.forEach(function (p) { grid.appendChild(tile(p)); });

  // ---- filters
  var count = $('#arch-count'), empty = $('#arch-empty');
  function filter(f) {
    var n = 0;
    $$('.tile', grid).forEach(function (t) {
      var show = f === 'all' || t.dataset.cats.split(' ').indexOf(f) > -1;
      t.hidden = !show; if (show) { n++; t.classList.remove('in'); void t.offsetWidth; t.classList.add('in'); }
    });
    $$('[data-f]', $('.filters')).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.f === f ? 'true' : 'false'); });
    empty.hidden = n > 0;
    count.textContent = n + ' of ' + P.length + ' files · ' + f.toUpperCase();
  }
  $$('[data-f]').forEach(function (b) { b.addEventListener('click', function () { filter(b.dataset.f); }); });
  filter('all');

  // ---- rearrange: mirrored alternative composition of the same files
  var rb = $('#rearrange');
  rb.addEventListener('click', function () {
    var on = grid.classList.toggle('alt'); rb.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  // ---- project detail overlay
  function open(p, trigger) {
    opener = trigger; body.textContent = '';
    $('#h-case').textContent = p.n + ' - ' + p.title;
    body.appendChild(el('p', 'tech', p.label.toUpperCase() + ' · ' + p.cats.join(' · ').toUpperCase()));
    var art = he('div', 'he-block'); art.appendChild(he('p', 'he-lead', p.desc));
    if (p.type === 'A') {
      [['התדריך', 'יתווסף: העסק, הדרישות והאתגר העיצובי.'], ['הזהות', 'יתווסף: לוגו, שפה חזותית, טיפוגרפיה וצבעים.'],
       ['המערכת', 'יתווסף: יישומי מותג, כרטיס ביקור דיגיטלי, אתר ומובייל.'], ['החשיבה', 'יתווסף: ההיגיון מאחורי ההחלטות, במילים שלך.']]
        .forEach(function (s) { art.appendChild(he('h3', null, s[0])); art.appendChild(he('p', null, s[1])); });
    }
    body.appendChild(art);
    if (p.images.length) p.images.forEach(function (im) { var i = el('img', 'detail-img'); i.src = im.src; i.alt = im.alt || ''; i.loading = 'lazy'; body.appendChild(i); });
    else body.appendChild(el('div', 'ph', 'IMAGES PENDING'));
    if (p.deliverables.length) { var d = el('ul', 'dl'); p.deliverables.forEach(function (x) { d.appendChild(el('li', null, x)); }); body.appendChild(el('p', 'tech', 'DELIVERABLES')); body.appendChild(d); }
    if (p.needs.length) { var n = el('ul', 'dl'); p.needs.forEach(function (x) { n.appendChild(el('li', null, x)); }); body.appendChild(el('p', 'tech', 'ASSETS STILL NEEDED')); body.appendChild(n); }
    var cta = el('a', 'btn solid', 'YOUR TURN - LET’S TALK'); cta.href = '#contact'; cta.dataset.close = '1'; body.appendChild(cta);
    overlay.hidden = false; document.body.style.overflow = 'hidden'; overlay.scrollTop = 0; $('.close', overlay).focus();
  }
  function close() { overlay.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus(); }
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-id]'); if (!b) return;
    open(P.filter(function (p) { return p.id === b.dataset.id; })[0], b);
  });
  overlay.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      var f = $$('a,button', overlay), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
