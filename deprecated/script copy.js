

    const root = document.documentElement;
    const menuBtn = document.getElementById('menuBtn');
    const closeBtn = document.getElementById('closeBtn');
    const backdrop = document.getElementById('backdrop');

    function openDrawer(){
      document.body.classList.add('drawer-open');
      menuBtn.setAttribute('aria-expanded','true');
      // focus close for accessibility
      setTimeout(()=>closeBtn.focus(), 50);
    }
    function closeDrawer(){
      document.body.classList.remove('drawer-open');
      menuBtn.setAttribute('aria-expanded','false');
      menuBtn.focus();
    }

    menuBtn.addEventListener('click', () => {
      document.body.classList.contains('drawer-open') ? closeDrawer() : openDrawer();
    });
    closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
    window.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && document.body.classList.contains('drawer-open')) closeDrawer();
    });

    // Smooth scroll buttons/links
    document.querySelectorAll('[data-scroll]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const sel = btn.getAttribute('data-scroll');
        const el = document.querySelector(sel);
        if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      });
    });
    document.querySelectorAll('.drawer a').forEach(a=>{
      a.addEventListener('click', (e)=>{
        const href = a.getAttribute('href');
        if(href && href.startsWith('#')){
          e.preventDefault();
          closeDrawer();
          const el = document.querySelector(href);
          if(el) setTimeout(()=>el.scrollIntoView({behavior:'smooth', block:'start'}), 80);
        }
      });
    });

    // Staggered reveal using IntersectionObserver
    const revealEls = Array.from(document.querySelectorAll('.reveal'));
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach((el, i)=>{
      el.style.transitionDelay = `${Math.min(i*70, 280)}ms`;
      io.observe(el);
    });

    // Demo form submission note
    function demoSubmit(){
      const note = document.getElementById('formNote');
      note.textContent = "Form captured (demo). If you paste your real form endpoint, I’ll wire it up.";
    }
    window.demoSubmit = demoSubmit;

    document.getElementById('year').textContent = new Date().getFullYear();
  