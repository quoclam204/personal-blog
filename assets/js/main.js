// Theme handling
const html = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');
const mobileBtn = document.getElementById('mobile-toggle');
const drawer = document.getElementById('drawer');
const links = document.querySelectorAll('.nav-link, .drawer-link');
const progress = document.getElementById('progress');

function setIcon() {
  if (!themeBtn) return;
  themeBtn.innerHTML = html.classList.contains('light')
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4M5.6 18.4l1.4-1.4m10-10 1.4-1.4" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" fill="currentColor"/></svg>';
}

(function initTheme(){
  const saved = localStorage.getItem('theme');
  if (saved) {
    html.classList.toggle('light', saved === 'light');
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    html.classList.add('light');
  }
  setIcon();
})();

themeBtn?.addEventListener('click', () => {
  html.classList.toggle('light');
  localStorage.setItem('theme', html.classList.contains('light') ? 'light' : 'dark');
  setIcon();
});

// Mobile drawer
mobileBtn?.addEventListener('click', () => {
  const open = drawer.style.display === 'flex';
  drawer.style.display = open ? 'none' : 'flex';
  drawer.setAttribute('aria-hidden', open ? 'true' : 'false');
});
drawer?.addEventListener('click', (e) => {
  if (e.target.classList.contains('drawer-link')) {
    drawer.style.display = 'none';
    drawer.setAttribute('aria-hidden', 'true');
  }
});

// Scroll progress
function onScroll() {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progressRatio = height > 0 ? (scrollTop / height) : 0;
  progress.style.transform = `scaleX(${progressRatio})`;
}
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Scrollspy & reveal
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const header = document.getElementById('header');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.getAttribute('id');
    const theme = entry.target.getAttribute('data-theme') || 'dark';
    // reveal animation
    entry.target.querySelectorAll('.reveal').forEach(el => {
      if (entry.isIntersecting) el.classList.add('in');
    });
    // spy + header theme
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
      header?.setAttribute('data-over', theme);
    }
  });
}, { threshold: 0.66 });

sections.forEach(s => observer.observe(s));

// Footer year
document.getElementById('y').textContent = new Date().getFullYear();

// Contact form (front-end validation only)
const form = document.getElementById('contact-form');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  let ok = true;

  const show = (el, cond) => el.style.display = cond ? 'block' : 'none';
  show(form.querySelector('#name + .error'), !name);
  show(form.querySelector('#email + .error'), !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  show(form.querySelector('#message + .error'), !message);
  ok = name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && message;

  if (ok) {
    alert('Cảm ơn bạn! Mình sẽ phản hồi sớm.');
    form.reset();
  }
});


// Hero parallax
(() => {
  const hero = document.getElementById('home');
  if (!hero) return;
  let raf = 0;
  function onPointer(e){
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      hero.style.setProperty('--tilt-x', (y * 6).toFixed(2) + 'deg');
      hero.style.setProperty('--tilt-y', (-x * 6).toFixed(2) + 'deg');
      hero.querySelectorAll('[data-parallax]').forEach((el, i) => {
        const depth = (i + 1) * 6;
        el.style.transform = `translate3d(${(x * depth).toFixed(2)}px, ${(y * depth).toFixed(2)}px, 0)`;
      });
    });
  }
  hero.addEventListener('pointermove', onPointer);
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--tilt-x', '0deg');
    hero.style.setProperty('--tilt-y', '0deg');
    hero.querySelectorAll('[data-parallax]').forEach(el => el.style.transform = '');
  });
})();


// --- Custom tweaks (Aug 2025) ---
(function syncHeaderHeight(){
  const header = document.getElementById('header');
  function setH(){
    if (!header) return;
    const h = header.offsetHeight || 72;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  }
  setH();
  new ResizeObserver(setH).observe(header);
  window.addEventListener('resize', setH);
})();


// ==== Accurate ScrollSpy & Smooth anchor with header offset ====
(function() {
  const header = document.querySelector('#header');
  const links = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  const sections = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  function headerH() { return header?.offsetHeight || 72; }

  // Smooth click with offset (more "nhạy")
  links.forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.pageYOffset - (headerH() + 12);
      window.scrollTo({ top: y, behavior: 'smooth' });
      // Update active immediately for responsiveness
      setActiveLink(id);
      history.replaceState(null, '', id);
    }, {passive: false});
  });

  // Helper to set active link
  function setActiveLink(id) {
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
  }

  // IntersectionObserver: center-weighted, offset by header
  const thresholds = Array.from({length: 21}, (_,i)=> i/20); // 0..1 step .05
  const observer = new IntersectionObserver((entries) => {
    // Pick the entry with max intersectionRatio that is intersecting
    const visible = entries.filter(en => en.isIntersecting);
    if (!visible.length) return;
    visible.sort((a,b) => b.intersectionRatio - a.intersectionRatio);
    const top = visible[0].target;
    const id = '#' + top.id;
    setActiveLink(id);
  }, {
    // Offset top by header height, bottom by 55% of viewport to emphasize center region
    root: null,
    rootMargin: () => `-${headerH() + 8}px 0px -55% 0px`,
    threshold: thresholds
  });

  sections.forEach(sec => observer.observe(sec));

  // Add a scrolled class to header for visual state
  const onScroll = () => {
    if (window.scrollY > 2) header?.classList.add('scrolled');
    else header?.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, {passive: true});
  onScroll();
})();

