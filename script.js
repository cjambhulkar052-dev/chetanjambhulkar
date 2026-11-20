(function () {
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('theme');
    if (saved) root.setAttribute('data-theme', saved);
  } catch (e) {}

  document.querySelector('.theme-btn').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  var menu = document.getElementById('menu');
  var btn = document.querySelector('.menu-btn');
  btn.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('open'); btn.setAttribute('aria-expanded', false); }
  });

  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  document.getElementById('yr').textContent = new Date().getFullYear();
})();

/* journey map */
(function () {
  var map = document.getElementById('journey-map');
  if (!map) return;
  var svg = map.querySelector('.jsvg'), track = map.querySelector('.track'), trail = map.querySelector('.trail');
  var walker = document.getElementById('walker'), stops = [].slice.call(map.querySelectorAll('.stop'));
  var pts = [], len = 0, y0 = 0, yN = 1, timer, wW = 56, wH = 84;

  function build() {
    var mr = map.getBoundingClientRect(), mobile = window.innerWidth <= 760;
    wW = mobile ? 42 : 56; wH = mobile ? 63 : 84;
    pts = stops.map(function (s) {
      var r = s.querySelector('.pin').getBoundingClientRect();
      return { x: r.left + r.width / 2 - mr.left, y: r.top + r.height / 2 - mr.top };
    });
    var amp = mobile ? 14 : 70, d = 'M' + pts[0].x + ' ' + pts[0].y;
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], h = (b.y - a.y) / 3, s = i % 2 ? 1 : -1;
      d += ' C' + (a.x + amp * s) + ' ' + (a.y + h) + ' ' + (b.x - amp * s) + ' ' + (b.y - h) + ' ' + b.x + ' ' + b.y;
    }
    track.setAttribute('d', d); trail.setAttribute('d', d);
    len = track.getTotalLength();
    trail.style.strokeDasharray = len;
    y0 = pts[0].y; yN = pts[pts.length - 1].y;
    update();
  }

  function update() {
    if (!len) return;
    var mr = map.getBoundingClientRect();
    var target = window.innerHeight * 0.55 - mr.top;
    var p = Math.min(1, Math.max(0, (target - y0) / (yN - y0)));
    var pt = track.getPointAtLength(p * len), ahead = track.getPointAtLength(Math.min(len, p * len + 4));
    walker.style.transform = 'translate(' + (pt.x - wW / 2) + 'px,' + (pt.y - wH + 4) + 'px)';
    if (Math.abs(ahead.x - pt.x) > 0.2) walker.classList.toggle('back', ahead.x < pt.x);
    trail.style.strokeDashoffset = len * (1 - p);
    stops.forEach(function (s, i) { s.classList.toggle('on', pts[i].y <= pt.y + 2); });
    walker.classList.add('walking');
    clearTimeout(timer);
    timer = setTimeout(function () { walker.classList.remove('walking'); }, 160);
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', build);
  window.addEventListener('load', build);
  build();
})();
