/* MAZE spatial navigation: one state object drives the camera, the exits dock, the mini map and history. */
(function () {
  'use strict';
  // ---- The maze: rooms on a grid (x → east, y ↓ south) and the corridors between them
  var G = {
    rooms: { entry: { x: 0, y: 0, l: 'ENTRY' }, fix: { x: 1, y: 0, l: 'FIX THIS', m: 'FIX' }, paths: { x: 0, y: 1, l: 'PATHS' },
             archive: { x: 1, y: 1, l: 'ARCHIVE' }, case: { x: 2, y: 1, l: 'CASE' }, about: { x: 1, y: 2, l: 'ABOUT' }, contact: { x: 1, y: 3, l: 'EXIT' } },
    edges: [['entry', 'paths'], ['paths', 'archive'], ['archive', 'fix'], ['entry', 'fix'], ['archive', 'case'], ['archive', 'about'], ['about', 'contact']]
  };
  var S = { cur: 'entry', visited: { entry: 1 }, trav: {}, caseOpen: false, prog: 0, left: false };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = $('#stage'), dock = $('#dock'), map = $('#map'), panel = $('#map-panel'), you = $('#you'), live = $('#map-live');
  var ids = Object.keys(G.rooms), rooms = {}, nodes = {}, lines = {};
  var NW = 44, NH = 24, GX = 58, GY = 38, PAD = 8;

  function nb(id) {
    return G.edges.filter(function (e) { return e.indexOf(id) > -1; })
      .map(function (e) { return e[0] === id ? e[1] : e[0]; })
      .filter(function (n) { return n !== 'case' || S.caseOpen; });
  }
  function ek(a, b) { return [a, b].sort().join('|'); }
  function route(a, b) { // shortest corridor path (BFS)
    var q = [[a]], seen = {}; seen[a] = 1;
    while (q.length) {
      var p = q.shift(), last = p[p.length - 1];
      if (last === b) return p;
      nb(last).forEach(function (n) { if (!seen[n]) { seen[n] = 1; q.push(p.concat(n)); } });
    }
    return [a, b];
  }
  function dir(a, b) { var A = G.rooms[a], B = G.rooms[b]; return B.x > A.x ? 'east' : B.x < A.x ? 'west' : B.y > A.y ? 'south' : 'north'; }
  var ARR = { east: '→', west: '←', south: '↓', north: '↑' };
  function known(id) {
    if (S.visited[id]) return true;
    if (id === 'case') return S.caseOpen;
    return nb(id).some(function (n) { return S.visited[n]; });
  }

  // ---- Build rooms (wrap content so tall rooms scroll without clipping)
  ids.forEach(function (id) {
    var el = document.getElementById(id), g = G.rooms[id];
    el.classList.add('room'); el.style.setProperty('--x', g.x); el.style.setProperty('--y', g.y); el.tabIndex = -1;
    if (id !== 'case') {
      var w = document.createElement('div'); w.className = 'room-in';
      while (el.firstChild) w.appendChild(el.firstChild);
      el.appendChild(w);
    } else el.hidden = false;
    rooms[id] = el;
    el._top = 0;
    el.addEventListener('scroll', function () { el._top = el.scrollTop; if (S.cur === id) progress(); }, { passive: true });
  });

  // ---- Mini map
  var svgNS = 'http://www.w3.org/2000/svg', svg = $('#map-svg');
  svg.setAttribute('viewBox', '0 0 176 154'); svg.setAttribute('width', 176); svg.setAttribute('height', 154);
  function cx(id) { return PAD + G.rooms[id].x * GX + NW / 2; }
  function cy(id) { return PAD + G.rooms[id].y * GY + NH / 2; }
  G.edges.forEach(function (e) {
    var l = document.createElementNS(svgNS, 'line');
    l.setAttribute('x1', cx(e[0])); l.setAttribute('y1', cy(e[0])); l.setAttribute('x2', cx(e[1])); l.setAttribute('y2', cy(e[1]));
    svg.appendChild(l); lines[ek(e[0], e[1])] = l;
  });
  ids.forEach(function (id) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'node'; b.textContent = G.rooms[id].m || G.rooms[id].l;
    b.style.left = (PAD + G.rooms[id].x * GX) + 'px'; b.style.top = (PAD + G.rooms[id].y * GY) + 'px';
    b.addEventListener('click', function () { if (!b.disabled) go(id); });
    panel.appendChild(b); nodes[id] = b;
  });
  $('#map-toggle').addEventListener('click', function () {
    var t = this, open = t.getAttribute('aria-expanded') !== 'true';
    t.setAttribute('aria-expanded', open); map.classList.toggle('open', open);
  });

  var raf = false;
  function progress() {
    if (raf) return; raf = true;
    requestAnimationFrame(function () {
      var r = rooms[S.cur], max = r.scrollHeight - r.clientHeight;
      S.prog = max > 4 ? Math.min(1, r.scrollTop / max) : 0; raf = false; dot();
    });
  }
  function dot() { // the dot sits inside the current node and slides down it as the visitor scrolls the room
    you.style.transform = 'translate(' + (cx(S.cur) - 4) + 'px,' + (PAD + G.rooms[S.cur].y * GY + 3 + S.prog * (NH - 14)) + 'px)';
  }

  function render() {
    // exits dock
    dock.textContent = '';
    nb(S.cur).forEach(function (n) {
      var d = dir(S.cur, n), b = document.createElement('button'); b.type = 'button'; b.className = 'dock-b';
      var label = S.cur === 'case' ? 'BACK TO ARCHIVE' : G.rooms[n].l;
      b.textContent = ARR[d] + ' ' + label; b.setAttribute('aria-label', 'Go ' + d + ' to ' + G.rooms[n].l);
      b.addEventListener('click', function () { go(n); });
      dock.appendChild(b);
    });
    // map state
    ids.forEach(function (id) {
      var n = nodes[id], k = known(id);
      n.className = 'node' + (id === S.cur ? ' here' : S.visited[id] ? ' visited' : k ? ' known' : ' locked');
      n.disabled = !k;
      n.setAttribute('aria-label', G.rooms[id].l + (id === S.cur ? ', you are here' : S.visited[id] ? ', visited' : k ? ', discovered' : ', not discovered yet'));
      if (id === S.cur) n.setAttribute('aria-current', 'location'); else n.removeAttribute('aria-current');
    });
    G.edges.forEach(function (e) { var k = ek(e[0], e[1]); lines[k].setAttribute('class', S.trav[k] ? 'seen' : (known(e[0]) && known(e[1])) ? 'open' : 'dim'); });
    map.hidden = !S.left;
    live.textContent = 'Location: ' + G.rooms[S.cur].l;
    dot();
  }

  // ---- Movement
  function go(id, o) {
    o = o || {};
    if (!G.rooms[id]) return;
    if (id === 'case' && !S.caseOpen) id = 'archive';
    if (id === S.cur) return;
    var p = route(S.cur, id);
    for (var i = 0; i < p.length - 1; i++) { S.trav[ek(p[i], p[i + 1])] = 1; S.visited[p[i]] = 1; }
    S.visited[id] = 1; S.cur = id; if (id !== 'entry') S.left = true; rooms[id]._top = rooms[id].scrollTop;
    stage.style.setProperty('--cx', G.rooms[id].x); stage.style.setProperty('--cy', G.rooms[id].y);
    ids.forEach(function (r) { if (r === id) rooms[r].removeAttribute('inert'); else rooms[r].setAttribute('inert', ''); });
    if (o.push !== false) history.pushState({ room: id }, '', '#' + id);
    var r = rooms[id], max = r.scrollHeight - r.clientHeight; S.prog = max > 4 ? r.scrollTop / max : 0;
    render();
    document.body.dataset.room = id;
    if (!o.nofocus) r.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('maze:change', { detail: { room: id, visited: S.visited } }));
  }
  function openCase() { S.caseOpen = true; rooms.case.scrollTop = 0; go('case'); }
  function closeCase() { if (history.state && history.state.room === 'case') history.back(); else go('archive'); }

  // ---- Inputs
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (G.rooms[id]) { e.preventDefault(); go(id); }
  });
  window.addEventListener('popstate', function (e) {
    var h = location.hash.slice(1), r = (e.state && e.state.room) || (G.rooms[h] ? h : 'entry');
    if (r === 'case' && !S.caseOpen) r = 'archive';
    go(r, { push: false });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && S.cur === 'case') return closeCase();
    if (!e.altKey) return;
    var want = { ArrowRight: 'east', ArrowLeft: 'west', ArrowDown: 'south', ArrowUp: 'north' }[e.key];
    if (!want) return;
    var t = nb(S.cur).filter(function (n) { return dir(S.cur, n) === want; })[0];
    if (t) { e.preventDefault(); go(t); }
  });
  // Vertical scrolling continues through the maze: a fresh push past the top or bottom edge of a room walks to the room above or below.
  // Scrolling inside a room is untouched; momentum from a scroll that began mid-room never triggers a move.
  var acc = 0, lastW = 0, startEdge = false, lock = false;
  function vnb(d) { return nb(S.cur).filter(function (n) { return dir(S.cur, n) === d; })[0]; }
  function atEdgeKnown(r, d) { return d === 'south' ? r._top + r.clientHeight >= r.scrollHeight - 2 : r._top <= 1; } // position before the current wheel gesture scrolled it
  function atEdge(r, d) { return d === 'south' ? r.scrollTop + r.clientHeight >= r.scrollHeight - 2 : r.scrollTop <= 1; }
  function push(d) { var t = vnb(d); if (t && !lock) { lock = true; go(t); setTimeout(function () { lock = false; }, 900); } }
  ids.forEach(function (id) {
    var r = rooms[id], ty = null, tx = 0, te = null;
    r.addEventListener('wheel', function (e) {
      if (S.cur !== id || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      var d = e.deltaY > 0 ? 'south' : 'north', now = Date.now();
      if (now - lastW > 200) { startEdge = atEdgeKnown(r, d); acc = 0; }
      lastW = now;
      if (!startEdge || !vnb(d)) return;
      acc += Math.abs(e.deltaY);
      if (acc > (id === 'entry' ? 40 : 120)) { acc = 0; push(d); }
    }, { passive: true });
    r.addEventListener('touchstart', function (e) { ty = e.touches[0].clientY; tx = e.touches[0].clientX; te = { south: atEdge(r, 'south'), north: atEdge(r, 'north') }; }, { passive: true });
    r.addEventListener('touchend', function (e) {
      if (ty === null || S.cur !== id) return;
      var dy = ty - e.changedTouches[0].clientY, dx = tx - e.changedTouches[0].clientX; ty = null;
      if (Math.abs(dy) < 80 || Math.abs(dy) < Math.abs(dx) * 1.5) return;
      var d = dy > 0 ? 'south' : 'north';
      if (vnb(d) && te && te[d] && atEdge(r, d)) push(d);
    }, { passive: true });
  });

  // The browser may scroll the (overflow hidden) world to a #hash target or a focused element: always snap it back, the camera is the only mover
  var world = $('#world');
  function unscroll() { if (world.scrollLeft || world.scrollTop) { world.scrollLeft = 0; world.scrollTop = 0; } }
  world.addEventListener('scroll', unscroll, { passive: true });
  window.addEventListener('hashchange', unscroll); window.addEventListener('load', unscroll);

  // ---- Start (supports deep links like #archive)
  ids.forEach(function (id) { if (id !== 'entry') rooms[id].setAttribute('inert', ''); });
  stage.style.setProperty('--cx', 0); stage.style.setProperty('--cy', 0);
  var h0 = location.hash.slice(1);
  history.replaceState({ room: 'entry' }, '', location.pathname + location.search);
  unscroll(); render(); document.body.dataset.room = 'entry';
  if (G.rooms[h0] && h0 !== 'entry' && h0 !== 'case') go(h0, { nofocus: true });

  window.MazeNav = { go: go, openCase: openCase, closeCase: closeCase, graph: G, state: S, current: function () { return S.cur; } };
})();
