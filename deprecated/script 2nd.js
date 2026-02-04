// script.js

function wireDrawer() {
  const menuBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('closeBtn');
  const backdrop = document.getElementById('backdrop');

  // If this page doesn't have the drawer markup, just bail.
  if (!menuBtn || !backdrop) return;

  function openDrawer() {
    document.body.classList.add('drawer-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
  }

  function closeDrawer() {
    document.body.classList.remove('drawer-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.focus();
  }

  menuBtn.addEventListener('click', () => {
    document.body.classList.contains('drawer-open') ? closeDrawer() : openDrawer();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) closeDrawer();
  });

  // Use event delegation so it still works even if nav links change later
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.drawer a');
    if (!a) return;

    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      closeDrawer();
      const el = document.querySelector(href);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } else {
      // Normal navigation: still close the drawer for nicer UX
      closeDrawer();
    }
  });
}

function wireSmoothScrollButtons() {
  document.querySelectorAll('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sel = btn.getAttribute('data-scroll');
      const el = sel ? document.querySelector(sel) : null;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function wireReveal() {
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if (!revealEls.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 70, 280)}ms`;
    io.observe(el);
  });
}

function wireFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function demoSubmit() {
  const note = document.getElementById('formNote');
  if (note) note.textContent = "Form captured (demo). If you paste your real form endpoint, I’ll wire it up.";
}
window.demoSubmit = demoSubmit;

document.addEventListener('DOMContentLoaded', () => {
  wireDrawer();
  wireSmoothScrollButtons();
  wireReveal();
  wireFooterYear();
});
