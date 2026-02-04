// script.js

async function loadPartial(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return false;

  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  el.innerHTML = await res.text();
  return true;
}

function wireDrawer() {
  const menuBtn = document.getElementById("menuBtn");
  const closeBtn = document.getElementById("closeBtn");
  const backdrop = document.getElementById("backdrop");

  // If the page doesn't have the drawer bits, bail.
  if (!menuBtn || !backdrop) return;

  function openDrawer() {
    document.body.classList.add("drawer-open");
    menuBtn.setAttribute("aria-expanded", "true");
    if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
  }

  function closeDrawer() {
    document.body.classList.remove("drawer-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.focus();
  }

  menuBtn.addEventListener("click", () => {
    document.body.classList.contains("drawer-open") ? closeDrawer() : openDrawer();
  });

  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("drawer-open")) closeDrawer();
  });

  // Drawer link behavior:
  // - If href is "#section" => smooth scroll (same page)
  // - Else normal navigation (but close drawer immediately for UX)
  document.addEventListener("click", (e) => {
    const a = e.target.closest(".drawer a");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href) return;

    if (href.startsWith("#")) {
      e.preventDefault();
      closeDrawer();
      const target = document.querySelector(href);
      if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      return;
    }

    // For cross-page links like "index.html#contact", let navigation happen.
    closeDrawer();
  });
}

function resolveDrawerRoutes() {
  // Single source of truth for where each thing currently lives.
  // Change these as your site evolves.
  const ROUTES = {
    home: { page: "index.html", hash: "" }, // or "" if you want top-of-page
    philosophy: { page: "philosophy.html", hash: "" },
    technology: { page: "technology.html", hash: "" },
    software: { page: "software.html", hash: "" },
    corporateSvcs: { page: "corporateSvcs.html", hash: "" },
    smallBusinessSvcs: { page: "smallBusinessSvcs.html", hash: "" },
    contact: { page: "contact.html", hash: "" }, // later: { page: "contact.html", hash: "" }
  };

  const currentPage = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  document.querySelectorAll(".drawer [data-route]").forEach((a) => {
    const key = a.getAttribute("data-route");
    const dest = ROUTES[key];
    if (!dest) return;

    const page = (dest.page || "").toLowerCase();
    const hash = dest.hash || "";

    // If destination page is the current page, use hash-only so your smooth scroll works.
    // Otherwise use page+hash to navigate normally.
    if (page === currentPage) {
      a.setAttribute("href", hash || "#");
    } else {
      a.setAttribute("href", `${dest.page}${hash}`);
    }
  });
}


function wireSmoothScrollButtons() {
  document.querySelectorAll("[data-scroll]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sel = btn.getAttribute("data-scroll");
      const el = sel ? document.querySelector(sel) : null;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function wireReveal() {
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if (!revealEls.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  
revealEls.forEach((el, i) => {
  const delay = el.dataset.revealDelay
    ? Number(el.dataset.revealDelay)
    : Math.min(i * 70, 280);

  el.style.transitionDelay = `${delay}ms`;
  io.observe(el);
});


  // revealEls.forEach((el, i) => {
  //   el.style.transitionDelay = `${Math.min(i * 70, 280)}ms`;
  //   io.observe(el);
  // });
}

function wireFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function wireFormSuccessNotice() {
  const statusEl = document.querySelector(".form-status");
  if (!statusEl) return;

  const params = new URLSearchParams(window.location.search);
  if (params.get("sent") === "1") {
    statusEl.textContent = "Your message was sent successfully.";
  }
}

function demoSubmit() {
  const note = document.getElementById("formNote");
  if (note) note.textContent = "Form captured (demo). If you paste your real form endpoint, I’ll wire it up.";
}
window.demoSubmit = demoSubmit;

document.addEventListener("DOMContentLoaded", async () => {
  // Load shared drawer first (so #closeBtn and #backdrop exist)
  await loadPartial("#drawerMount", "partials/drawer.html");
  await loadPartial("#brandTileMount", "partials/brand-tile.html");

  // Now wire behaviors
  resolveDrawerRoutes();
  wireDrawer();
  wireSmoothScrollButtons();
  wireReveal();
  wireFooterYear();
  wireFormSuccessNotice();
});

/* Contact form: AJAX submit to Formspree with inline feedback */
document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('.contact-form');
  forms.forEach(form => {
    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    const clearStatus = () => {
      statusEl.textContent = '';
      statusEl.classList.remove('success', 'error');
      statusEl.removeAttribute('tabindex');
    };

    const showStatus = (msg, type = '') => {
      clearStatus();
      if (!msg) return;
      statusEl.classList.add(type);
      // append message text and a dismiss button
      const textNode = document.createTextNode(msg + ' ');
      statusEl.appendChild(textNode);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'status-dismiss';
      btn.setAttribute('aria-label', 'Dismiss message');
      btn.textContent = 'Dismiss';
      btn.addEventListener('click', () => {
        clearStatus();
        submitBtn.focus();
      }, { once: true });
      statusEl.appendChild(btn);
      // make it focusable so screen readers announce it
      statusEl.setAttribute('tabindex', '0');
      statusEl.focus();
    };

    form.addEventListener('submit', async (e) => {
      if (!form.checkValidity()) {
        // let browser show validation UI
        return;
      }
      e.preventDefault();
      // clear any previous messages
      clearStatus();
      submitBtn.disabled = true;
      statusEl.textContent = 'Sending…';
      const formData = new FormData(form);
      try {
        const resp = await fetch(form.action, {
          method: form.method || 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
        if (resp.ok) {
          form.reset();
          showStatus('Thank you — your email has been sent.', 'success');
        } else {
          const data = await resp.json();
          showStatus(data?.error || 'Sorry — there was a problem sending your message.', 'error');
        }
      } catch (err) {
        showStatus('Network error — please try again.', 'error');
          } finally {
            submitBtn.disabled = false;
          }
        });
      });
    });
