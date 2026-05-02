/* SGPF DJ HALLI CHURCH — Main Script */
(() => {
  const site = window.SGPF_SITE || {};
  let lenisInstance = null;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ── Lenis Smooth Scroll ─────────────────────────────────────
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      smoothTouch: false,
    });
    lenisInstance = lenis;
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -80 }); }
      });
    });
  }

  // ── Header elevation on scroll ──────────────────────────────
  const header = $(".site-header");
  const setHeaderElevated = () => {
    if (!header) return;
    header.classList.toggle("is-elevated", window.scrollY > 6);
  };
  setHeaderElevated();
  window.addEventListener("scroll", setHeaderElevated, { passive: true });

  // ── Scroll Reveal Animation ─────────────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('active'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
  $$('.reveal').forEach(el => observer.observe(el));

  // ── Footer huge text trigger (works on every page) ─────────
  const footerHuge = $('.footer-huge');
  if (footerHuge) {
    const footerIo = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { footerHuge.classList.add('active'); footerIo.unobserve(footerHuge); } });
    }, { threshold: 0.1 });
    footerIo.observe(footerHuge);
  }

  // ── Mobile menu ─────────────────────────────────────────────
  const navToggle = $(".nav-toggle");
  const navMenu = $("#navMenu");
  const closeMenu = () => { navToggle?.setAttribute("aria-expanded","false"); navMenu?.classList.remove("is-open"); };
  const openMenu = () => { navToggle?.setAttribute("aria-expanded","true"); navMenu?.classList.add("is-open"); };
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => navToggle.getAttribute("aria-expanded")==="true" ? closeMenu() : openMenu());
    document.addEventListener("click", (e) => {
      if (!(e.target instanceof Element)) return;
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
    $$("#navMenu a").forEach(a => a.addEventListener("click", closeMenu));
  }

  // ── Set year ─────────────────────────────────────────────────
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // ── Contact links ─────────────────────────────────────────────
  const contact = site.contact || {};
  const instagramLink = $("#instagramLink");
  if (instagramLink) {
    instagramLink.textContent = contact.instagramHandle || "@sgpf_church";
    instagramLink.href = contact.instagramUrl || "https://www.instagram.com/sgpf_church/";
    instagramLink.target = "_blank"; instagramLink.rel = "noreferrer";
  }
  $$("[data-contact='addressFull']").forEach(el => el.textContent = contact.addressFull || "SGPF DJ Halli Church, DJ Halli, Bengaluru, Karnataka");
  $$("[data-contact='addressShort']").forEach(el => el.textContent = contact.addressShort || "DJ Halli, Bengaluru");

  const mapsLink = $("#mapsLink");
  if (mapsLink) { mapsLink.href = contact.mapsUrl || "#"; mapsLink.target = "_blank"; mapsLink.rel = "noreferrer"; }

  const mapsEmbed = $("#mapsEmbed");
  if (mapsEmbed && contact.mapsEmbedUrl) mapsEmbed.src = contact.mapsEmbedUrl;

  // ── Announcement modal ────────────────────────────────────────
  const fastingModal = $("#fastingPrayerAnnouncement");
  const cancelBtn = $("#announcementCancelBtn");
  const goEventsBtn = $("#announcementGoEventsBtn");
  const shownKey = "sgpfFastingPrayerAnnouncementShown";

  const closeAnnouncement = () => {
    fastingModal?.setAttribute("hidden","");
    if (lenisInstance) lenisInstance.start();
  };
  const openAnnouncement = () => {
    fastingModal?.removeAttribute("hidden");
    if (lenisInstance) lenisInstance.stop();
  };

  if (fastingModal) {
    if (!localStorage.getItem(shownKey)) {
      window.setTimeout(() => { openAnnouncement(); localStorage.setItem(shownKey,"1"); }, 5000);
    }
    cancelBtn?.addEventListener("click", closeAnnouncement);
    goEventsBtn?.addEventListener("click", () => {
      closeAnnouncement();
      const target = document.querySelector("#events-poster") || document.querySelector("#events");
      if (target) { if (lenisInstance) lenisInstance.scrollTo(target,{offset:-80}); else target.scrollIntoView({behavior:"smooth"}); }
    });
  }

  // ── Weekly poster modal ───────────────────────────────────────
  const openPosterBtn = $("#openWeeklyPosterBtn");
  const posterModal = $("#weeklyPosterModal");
  const closePosterBtn = $("#closeWeeklyPosterBtn");

  const closePoster = () => { posterModal?.setAttribute("hidden",""); if (lenisInstance) lenisInstance.start(); };
  const openPoster = () => { posterModal?.removeAttribute("hidden"); if (lenisInstance) lenisInstance.stop(); };

  if (openPosterBtn && posterModal) {
    openPosterBtn.addEventListener("click", openPoster);
    closePosterBtn?.addEventListener("click", closePoster);
    posterModal.addEventListener("click", (e) => { if (e.target.matches("[data-close-poster-modal]")) closePoster(); });
    document.addEventListener("keydown", (e) => { if (e.key==="Escape" && !posterModal.hasAttribute("hidden")) closePoster(); });
  }

  // ── Social links ──────────────────────────────────────────────
  const social = Array.isArray(site.social) ? site.social : [];
  $$('#socialLinks, #socialLinks2').forEach(container => {
    if (!container) return;
    container.innerHTML = "";
    social.forEach(s => {
      if (!s?.href || !s?.label) return;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = s.label; a.href = s.href; a.target = "_blank"; a.rel = "noreferrer";
      li.appendChild(a); container.appendChild(li);
    });
  });

  // ── Events ────────────────────────────────────────────────────
  const eventsList = $("#eventsList");
  const events = Array.isArray(site.events) ? site.events : [];
  if (eventsList) {
    eventsList.innerHTML = "";
    if (events.length === 0) {
      eventsList.innerHTML = `<div class="card"><p class="muted">No upcoming events. Check back soon.</p></div>`;
    } else {
      events.forEach(ev => {
        const card = document.createElement("article");
        card.className = "card event reveal";
        const when = formatEventDate(ev.date, ev.time);
        card.innerHTML = `
          <div class="pill"><span class="pill-dot"></span><span>${escapeHtml(when.short)}</span></div>
          <div>
            <p class="event-title">${escapeHtml(ev.title || "Event")}</p>
            <p class="event-meta">${escapeHtml(ev.displayLine || when.long)}</p>
          </div>`;
        eventsList.appendChild(card);
        observer.observe(card);
      });
    }
  }

  // ── Sermons ───────────────────────────────────────────────────
  const sermonsGrid = $("#sermonsGrid");
  const sermons = Array.isArray(site.sermons) ? site.sermons : [];
  const instagramReelsUrl = site.instagramReelsUrl || "";
  const instagramHandle = site.instagramHandle || "sgpf_church";

  if (sermonsGrid) {
    sermonsGrid.innerHTML = "";

    // Instagram Reels card
    if (instagramReelsUrl) {
      const reelsCard = document.createElement("article");
      reelsCard.className = "card sermon sermon-reels";
      reelsCard.innerHTML = `
        <div class="sermon-reels-inner">
          <div class="sermon-reels-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </div>
          <div>
            <p class="sermon-title">Sermons &amp; highlights on Instagram Reels</p>
            <p class="sermon-sub">Watch short messages, worship, and updates from our church.</p>
            <a href="${escapeHtml(instagramReelsUrl)}" class="btn btn-primary" target="_blank" rel="noreferrer">Watch on Instagram @${escapeHtml(instagramHandle)}</a>
          </div>
        </div>`;
      sermonsGrid.appendChild(reelsCard);
    }

    sermons.forEach(s => {
      const card = document.createElement("article");
      card.className = "card sermon reveal";

      // Auto-generate YouTube thumbnail from URL
      const videoId = youtubeIdFromUrl(s.youtubeUrl || "");
      const thumb = s.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "./assets/youtube-thumb.jpg");

      const link = document.createElement("a");
      link.href = s.youtubeUrl || "#"; link.target = "_blank"; link.rel = "noopener noreferrer";
      link.className = "sermon-thumb-link";

      const thumbWrap = document.createElement("div");
      thumbWrap.className = "sermon-thumb";
      const img = document.createElement("img");
      img.src = thumb;
      img.alt = s.title ? `Watch SGPF sermon: ${s.title}` : "SGPF DJ Halli Church Sermon on YouTube";
      img.loading = "lazy";
      const playBtn = document.createElement("div");
      playBtn.className = "sermon-play-btn";
      playBtn.setAttribute("aria-hidden","true");
      playBtn.innerHTML = `<svg viewBox="0 0 68 48" width="68" height="48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.64 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#FF0000"/><path d="M 45,24 27,14 27,34" fill="white"/></svg>`;

      thumbWrap.appendChild(img); thumbWrap.appendChild(playBtn);
      link.appendChild(thumbWrap);

      const title = document.createElement("p"); title.className = "sermon-title"; title.textContent = s.title || "Sermon";
      const sub = document.createElement("p"); sub.className = "sermon-sub"; sub.textContent = [s.speaker, s.date].filter(Boolean).join(" • ");

      card.appendChild(link); card.appendChild(title); card.appendChild(sub);
      sermonsGrid.appendChild(card);
      observer.observe(card);
    });
  }

  // ── Gallery ───────────────────────────────────────────────────
  const galleryGrid = $("#galleryGrid");
  const gallery = Array.isArray(site.gallery) ? site.gallery : [];
  if (galleryGrid) {
    galleryGrid.innerHTML = "";
    if (gallery.length === 0) {
      galleryGrid.innerHTML = `<div class="card"><p class="muted">Photos coming soon.</p></div>`;
    } else {
      gallery.forEach((g, i) => {
        const wrap = document.createElement("div");
        wrap.className = "gimg reveal";
        const img = document.createElement("img");
        img.src = g.src; img.alt = g.alt || "SGPF church photo"; img.loading = "lazy";
        wrap.appendChild(img); galleryGrid.appendChild(wrap);
        observer.observe(wrap);
      });
    }
  }

  // ── Contact form ──────────────────────────────────────────────
  const form = $("#contactForm");
  const formStatus = $("#formStatus");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = String(new FormData(form).get("name") || "").trim();
      const msg = String(new FormData(form).get("message") || "").trim();
      const phone = String(new FormData(form).get("phone") || "").trim();
      const prayer = new FormData(form).get("prayer") === "on";

      const nameHint = $("[data-error-for='name']");
      const msgHint = $("[data-error-for='message']");
      let ok = true;
      if (!name) { if (nameHint) nameHint.hidden = false; ok = false; } else { if (nameHint) nameHint.hidden = true; }
      if (!msg) { if (msgHint) msgHint.hidden = false; ok = false; } else { if (msgHint) msgHint.hidden = true; }
      if (!ok) { if (formStatus) formStatus.textContent = "Please fill in the required fields."; return; }

      const to = contact.email || "";
      const subject = `Message from ${name} – SGPF DJ Halli Church`;
      const body = [`Name: ${name}`, phone ? `Phone: ${phone}` : null, `Prayer request: ${prayer ? "Yes" : "No"}`, "", msg].filter(x => x !== null).join("\n");

      if (to) {
        if (formStatus) formStatus.textContent = "Opening your email app…";
        window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      } else {
        if (formStatus) formStatus.textContent = "Please message us on Instagram.";
        window.open(contact.instagramUrl || "https://www.instagram.com/sgpf_church/", "_blank", "noopener,noreferrer");
      }
    });
  }

  // ═══════ HELPERS ═══════
  function youtubeIdFromUrl(url) {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.replace("/","");
      const v = u.searchParams.get("v");
      if (v) return v;
      const m = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{6,})/);
      return m ? m[1] : "";
    } catch { return ""; }
  }

  function escapeHtml(str) {
    return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function formatEventDate(dateStr, timeStr) {
    const m = String(dateStr||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return { short: dateStr || "TBA", long: dateStr || "Date TBA" };
    const d = new Date(Number(m[1]), Number(m[2])-1, Number(m[3]));
    const locale = navigator.language || "en-IN";
    const monthDay = d.toLocaleDateString(locale, { month:"short", day:"numeric" });
    const full = d.toLocaleDateString(locale, { weekday:"long", year:"numeric", month:"long", day:"numeric" });
    const time = String(timeStr||"").trim();
    return { short: monthDay + (time ? ` • ${time}` : ""), long: full + (time ? ` • ${time}` : "") };
  }
})();
