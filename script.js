/* SGPF DJ HALLI CHURCH — Main Script */
(() => {
  const site = window.SGPF_SITE || {};
  let lenisInstance = null;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ── Lenis Smooth Scroll ─────────────────────────────────────
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      smoothTouch: false,
    });
    lenisInstance = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Handle anchor links with Lenis
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -80 });
        }
      });
    });
  }

  // ── Theme Toggle ────────────────────────────────────────────
  const themeToggle = $("#themeToggle");
  if (themeToggle) {
    const moon = themeToggle.querySelector("#moonIcon");
    const sun = themeToggle.querySelector("#sunIcon");

    const updateIcons = (theme) => {
      if (theme === "light") {
        if (sun) sun.style.display = "none";
        if (moon) moon.style.display = "block";
      } else {
        if (sun) sun.style.display = "block";
        if (moon) moon.style.display = "none";
      }
    };

    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    updateIcons(currentTheme);

    themeToggle.addEventListener("click", () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const newTheme = isLight ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      updateIcons(newTheme);
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
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  $$('.reveal').forEach(el => observer.observe(el));

  // ── Footer huge text trigger ────────────────────────────────
  const footerHuge = $('#footerHuge');
  if (footerHuge) {
    const footerIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          footerHuge.classList.add('active');
          footerIo.unobserve(footerHuge);
        }
      });
    }, { threshold: 0.1 });
    footerIo.observe(footerHuge);
  }

  // ── Mobile menu ─────────────────────────────────────────────
  const navToggle = $(".nav-toggle");
  const navMenu = $("#navMenu");
  const closeMenu = () => {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", "false");
    navMenu.classList.remove("is-open");
  };
  const openMenu = () => {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", "true");
    navMenu.classList.add("is-open");
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMenu();
      else openMenu();
    });

    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (navMenu.contains(t) || navToggle.contains(t)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    $$("#navMenu a").forEach((a) =>
      a.addEventListener("click", () => closeMenu()),
    );
  }

  // ── Set year ────────────────────────────────────────────────
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // ── Fill contact links ──────────────────────────────────────
  const contact = site.contact || {};
  const phoneLink = $("#phoneLink");
  if (phoneLink) {
    const phoneDisplay = contact.phoneDisplay || "+91 00000 00000";
    const phoneDial = contact.phoneDial || phoneDisplay;
    phoneLink.textContent = phoneDisplay;
    phoneLink.setAttribute("href", `tel:${phoneDial}`);
  }

  const instagramLink = $("#instagramLink");
  if (instagramLink) {
    const handle = contact.instagramHandle || "@sgpf_church";
    const url = contact.instagramUrl || "https://www.instagram.com/sgpf_church/";
    instagramLink.textContent = handle;
    instagramLink.setAttribute("href", url);
    instagramLink.setAttribute("target", "_blank");
    instagramLink.setAttribute("rel", "noreferrer");
  }

  $$("[data-contact='addressShort']").forEach((el) => (el.textContent = contact.addressShort || "DJ Halli, Bengaluru"));
  $$("[data-contact='addressFull']").forEach(
    (el) =>
    (el.textContent =
      contact.addressFull || "SGPF DJ Halli Church, DJ Halli, Bengaluru, Karnataka"),
  );

  const mapsLink = $("#mapsLink");
  if (mapsLink) {
    const url = contact.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapsQuery || contact.addressFull || "DJ Halli, Bengaluru")}`;
    mapsLink.setAttribute("href", url);
    mapsLink.setAttribute("target", "_blank");
    mapsLink.setAttribute("rel", "noreferrer");
  }

  const mapsEmbed = $("#mapsEmbed");
  if (mapsEmbed) {
    const q = encodeURIComponent(contact.mapsQuery || contact.addressFull || "DJ Halli, Bengaluru");
    mapsEmbed.setAttribute(
      "src",
      contact.mapsEmbedUrl || `https://www.google.com/maps?q=${q}&output=embed`,
    );
  }

  // ── Weekly poster modal ─────────────────────────────────────
  const openWeeklyPosterBtn = $("#openWeeklyPosterBtn");
  const weeklyPosterModal = $("#weeklyPosterModal");
  const closeWeeklyPosterBtn = $("#closeWeeklyPosterBtn");
  const posterModalContent = weeklyPosterModal ? $(".poster-modal-content", weeklyPosterModal) : null;

  const trapBackgroundScroll = (e) => {
    if (!weeklyPosterModal || weeklyPosterModal.hasAttribute("hidden")) return;
    const path = typeof e.composedPath === "function" ? e.composedPath() : [];
    if (posterModalContent && path.includes(posterModalContent)) return;
    const t = e.target;
    if (t instanceof Element && posterModalContent && posterModalContent.contains(t)) return;
    e.preventDefault();
  };

  const closeWeeklyPosterModal = () => {
    if (!weeklyPosterModal) return;
    weeklyPosterModal.setAttribute("hidden", "");
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
    if (lenisInstance) lenisInstance.start();
    document.removeEventListener("wheel", trapBackgroundScroll, { capture: true });
    document.removeEventListener("touchmove", trapBackgroundScroll, { capture: true });
  };

  const openWeeklyPosterModal = () => {
    if (!weeklyPosterModal) return;
    weeklyPosterModal.removeAttribute("hidden");
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
    if (lenisInstance) lenisInstance.stop();
    document.addEventListener("wheel", trapBackgroundScroll, { passive: false, capture: true });
    document.addEventListener("touchmove", trapBackgroundScroll, { passive: false, capture: true });
  };

  if (openWeeklyPosterBtn && weeklyPosterModal) {
    openWeeklyPosterBtn.addEventListener("click", openWeeklyPosterModal);

    if (closeWeeklyPosterBtn) {
      closeWeeklyPosterBtn.addEventListener("click", closeWeeklyPosterModal);
    }

    weeklyPosterModal.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (t.matches("[data-close-poster-modal]")) {
        closeWeeklyPosterModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !weeklyPosterModal.hasAttribute("hidden")) {
        closeWeeklyPosterModal();
      }
    });
  }

  // ── One-time fasting prayer announcement ────────────────────
  const fastingPrayerAnnouncement = $("#fastingPrayerAnnouncement");
  const announcementGoEventsBtn = $("#announcementGoEventsBtn");
  const announcementCancelBtn = $("#announcementCancelBtn");
  const announcementShownKey = "sgpfFastingPrayerAnnouncementShown";

  const closeAnnouncement = () => {
    if (!fastingPrayerAnnouncement) return;
    fastingPrayerAnnouncement.setAttribute("hidden", "");
    document.documentElement.classList.remove("announcement-open");
    document.body.classList.remove("announcement-open");
    if (lenisInstance) lenisInstance.start();
  };

  const openAnnouncement = () => {
    if (!fastingPrayerAnnouncement) return;
    fastingPrayerAnnouncement.removeAttribute("hidden");
    document.documentElement.classList.add("announcement-open");
    document.body.classList.add("announcement-open");
    if (lenisInstance) lenisInstance.stop();
  };

  if (fastingPrayerAnnouncement && announcementGoEventsBtn) {
    const alreadyShown = localStorage.getItem(announcementShownKey) === "1";

    if (!alreadyShown) {
      window.setTimeout(() => {
        openAnnouncement();
        localStorage.setItem(announcementShownKey, "1");
      }, 5000);
    }

    announcementGoEventsBtn.addEventListener("click", () => {
      closeAnnouncement();
      const eventsTarget = document.querySelector("#events-poster") || document.querySelector("#events");
      if (!eventsTarget) return;
      if (lenisInstance) {
        lenisInstance.scrollTo(eventsTarget, { offset: -80 });
      } else {
        eventsTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    if (announcementCancelBtn) {
      announcementCancelBtn.addEventListener("click", closeAnnouncement);
    }
  }

  // ── Social links ────────────────────────────────────────────
  const socialContainers = $$('#socialLinks, #socialLinks2');
  const social = Array.isArray(site.social) ? site.social : [];
  socialContainers.forEach(container => {
    if (!container) return;
    container.innerHTML = "";
    social.forEach((s) => {
      if (!s?.href || !s?.label) return;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = s.label;
      a.href = s.href;
      a.target = "_blank";
      a.rel = "noreferrer";
      li.appendChild(a);
      container.appendChild(li);
    });
  });

  // ── Events ──────────────────────────────────────────────────
  const eventsList = $("#eventsList");
  const events = Array.isArray(site.events) ? site.events : [];
  if (eventsList) {
    eventsList.innerHTML = "";
    if (events.length === 0) {
      const empty = document.createElement("div");
      empty.className = "card";
      empty.innerHTML = `<h3>No events added yet</h3><p class="muted">Update <code>data/site-data.js</code> to add events.</p>`;
      eventsList.appendChild(empty);
    } else {
      const sorted = [...events].sort((a, b) => String(a.date).localeCompare(String(b.date)));
      sorted.forEach((ev) => {
        const card = document.createElement("article");
        card.className = "card event";

        const when = formatEventDate(ev.date, ev.time);
        const pill = document.createElement("div");
        pill.className = "pill";
        pill.innerHTML = `<span class="pill-dot" aria-hidden="true"></span><span>${escapeHtml(
          when.short,
        )}</span>`;

        const content = document.createElement("div");
        const title = document.createElement("p");
        title.className = "event-title";
        title.textContent = ev.title || "Event";
        const meta = document.createElement("p");
        meta.className = "event-meta";
        meta.textContent = ev.displayLine || [
          when.long,
          ev.location || contact.addressShort || "",
          ev.description || "",
        ]
          .filter(Boolean)
          .join(" • ");
        content.appendChild(title);
        content.appendChild(meta);

        card.appendChild(pill);
        card.appendChild(content);
        eventsList.appendChild(card);
      });
    }
  }

  // ── Sermons ─────────────────────────────────────────────────
  const sermonsGrid = $("#sermonsGrid");
  const sermons = Array.isArray(site.sermons) ? site.sermons : [];
  const instagramReelsUrl = site.instagramReelsUrl || "";
  const instagramHandle = site.instagramHandle || "sgpf_church";

  if (sermonsGrid) {
    sermonsGrid.innerHTML = "";

    if (instagramReelsUrl) {
      const reelsCard = document.createElement("article");
      reelsCard.className = "card sermon sermon-reels";
      reelsCard.innerHTML = `
        <div class="sermon-reels-inner">
          <div class="sermon-reels-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </div>
          <div>
            <p class="sermon-title">Sermons &amp; highlights on Instagram Reels</p>
            <p class="sermon-sub">Watch short messages, worship, and updates from our church.</p>
            <a href="${escapeHtml(instagramReelsUrl)}" class="btn btn-primary" target="_blank" rel="noreferrer">Watch on Instagram @${escapeHtml(instagramHandle)}</a>
          </div>
        </div>
      `;
      sermonsGrid.appendChild(reelsCard);
    }

    sermons.forEach((s) => {
      const card = document.createElement("article");
      card.className = "card sermon";

      // Clickable thumbnail that links to YouTube
      const link = document.createElement("a");
      link.href = s.youtubeUrl || "#";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "sermon-thumb-link";

      const thumbWrap = document.createElement("div");
      thumbWrap.className = "sermon-thumb";

      const img = document.createElement("img");
      img.src = s.thumbnail || "./assets/youtube-thumb.jpg";
      img.alt = s.title ? `Watch SGPF DJ Halli Sermon: ${s.title}` : "Watch Shekinah Gospel Prayer Fellowship on YouTube";
      img.loading = "lazy";

      // Play button overlay
      const playBtn = document.createElement("div");
      playBtn.className = "sermon-play-btn";
      playBtn.setAttribute("aria-hidden", "true");
      playBtn.innerHTML = `<svg viewBox="0 0 68 48" width="68" height="48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.64 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#FF0000"/><path d="M 45,24 27,14 27,34" fill="white"/></svg>`;

      thumbWrap.appendChild(img);
      thumbWrap.appendChild(playBtn);
      link.appendChild(thumbWrap);

      const title = document.createElement("p");
      title.className = "sermon-title";
      title.textContent = s.title || "Sermon";

      const sub = document.createElement("p");
      sub.className = "sermon-sub";
      sub.textContent = [s.speaker, s.date].filter(Boolean).join(" • ");

      card.appendChild(link);
      card.appendChild(title);
      card.appendChild(sub);
      sermonsGrid.appendChild(card);
    });

    if (!instagramReelsUrl && sermons.length === 0) {
      const empty = document.createElement("div");
      empty.className = "card";
      empty.innerHTML = `<h3>No sermons added yet</h3><p class="muted">Add <code>instagramReelsUrl</code> or YouTube links in <code>data/site-data.js</code>.</p>`;
      sermonsGrid.appendChild(empty);
    }
  }

  // ── Gallery ─────────────────────────────────────────────────
  const galleryGrid = $("#galleryGrid");
  const gallery = Array.isArray(site.gallery) ? site.gallery : [];
  if (galleryGrid) {
    galleryGrid.innerHTML = "";
    if (gallery.length === 0) {
      const empty = document.createElement("div");
      empty.className = "card";
      empty.innerHTML = `<h3>No photos yet</h3><p class="muted">Add images under <code>assets/gallery/</code> and list them in <code>data/site-data.js</code>.</p>`;
      galleryGrid.appendChild(empty);
    } else {
      gallery.forEach((g) => {
        const wrap = document.createElement("div");
        wrap.className = "gimg";
        const img = document.createElement("img");
        img.src = g.src;
        img.alt = g.alt || "Gallery image";
        img.loading = "lazy";
        wrap.appendChild(img);
        galleryGrid.appendChild(wrap);
      });
    }
  }

  // ── Contact form (mailto fallback) ──────────────────────────
  const form = $("#contactForm");
  const status = $("#formStatus");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const phone = String(fd.get("phone") || "").trim();
      const message = String(fd.get("message") || "").trim();
      const prayer = fd.get("prayer") === "on";

      const okName = validateRequired("name", name.length > 0);
      const okMessage = validateRequired("message", message.length > 0);
      if (!okName || !okMessage) {
        if (status) status.textContent = "Please fix the highlighted fields.";
        return;
      }

      const to = contact.email || "";
      const subject = `Message from ${name} (${site.churchName || "SGPF DJ HALLI CHURCH"})`;
      const lines = [
        `Name: ${name}`,
        phone ? `Phone: ${phone}` : null,
        `Prayer request: ${prayer ? "Yes" : "No"}`,
        "",
        message,
      ].filter(Boolean);
      const body = lines.join("\n");
      if (to) {
        const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
          subject,
        )}&body=${encodeURIComponent(body)}`;
        if (status) status.textContent = "Opening your email app…";
        window.location.href = mailto;
      } else {
        const insta = contact.instagramUrl || "https://www.instagram.com/sgpf_church/";
        if (status) status.textContent = "Please message us on Instagram.";
        window.open(insta, "_blank", "noopener,noreferrer");
      }
    });
  }

  // ═══════ HELPERS ═══════

  function validateRequired(fieldId, ok) {
    const hint = $(`[data-error-for='${fieldId}']`);
    const input = $(`#${fieldId}`);
    if (hint) hint.hidden = ok;
    if (input) input.setAttribute("aria-invalid", ok ? "false" : "true");
    return ok;
  }

  function youtubeIdFromUrl(url) {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
      const v = u.searchParams.get("v");
      if (v) return v;
      const m = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{6,})/);
      return m ? m[1] : "";
    } catch {
      return "";
    }
  }

  function slugify(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "file";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatEventDate(dateStr, timeStr) {
    const d = safeDateFromYmd(dateStr);
    const time = String(timeStr || "").trim();
    const locale = navigator.language || "en-IN";
    if (!d) return { short: "TBA", long: "Date to be announced" };

    const weekday = d.toLocaleDateString(locale, { weekday: "short" });
    const monthDay = d.toLocaleDateString(locale, { month: "short", day: "numeric" });
    const year = d.getFullYear();
    const long = `${weekday}, ${monthDay} ${year}${time ? ` • ${time}` : ""}`;
    const short = `${monthDay}${time ? ` • ${time}` : ""}`;
    return { short, long };
  }

  function safeDateFromYmd(ymd) {
    const m = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const dt = new Date(y, mo - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  function buildIcs(eventsArr, siteData) {
    const org = (siteData?.churchName || "SGPF DJ HALLI CHURCH").replace(/\r?\n/g, " ");
    const now = new Date();
    const stamp = toIcsDateTimeUtc(now);
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SGPF DJ HALLI CHURCH//Website//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    (eventsArr || []).forEach((ev, i) => {
      const uid = `${slugify(ev?.title || "event")}-${i}-${now.getTime()}@sgpf-dj-halli`;
      const dt = safeDateFromYmd(ev?.date);
      const dtStart = dt ? toIcsDateFloating(dt, ev?.time) : null;
      const summary = (ev?.title || "Event").replace(/\r?\n/g, " ");
      const location = (ev?.location || siteData?.contact?.addressShort || "").replace(/\r?\n/g, " ");
      const description = (ev?.description || "").replace(/\r?\n/g, " ");

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${stamp}`);
      if (dtStart) lines.push(`DTSTART:${dtStart}`);
      lines.push(`SUMMARY:${icsEscape(summary)}`);
      if (location) lines.push(`LOCATION:${icsEscape(location)}`);
      if (description) lines.push(`DESCRIPTION:${icsEscape(description)}`);
      lines.push(`ORGANIZER:CN=${icsEscape(org)}:mailto:${icsEscape(siteData?.contact?.email || "info@example.com")}`);
      lines.push("END:VEVENT");
    });

    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }

  function toIcsDateFloating(dateObj, timeStr) {
    const hhmm = parseTimeTo24h(timeStr);
    const y = dateObj.getFullYear();
    const m = pad2(dateObj.getMonth() + 1);
    const d = pad2(dateObj.getDate());
    const hh = pad2(hhmm?.h ?? 10);
    const mm = pad2(hhmm?.m ?? 0);
    return `${y}${m}${d}T${hh}${mm}00`;
  }

  function toIcsDateTimeUtc(dateObj) {
    const y = dateObj.getUTCFullYear();
    const m = pad2(dateObj.getUTCMonth() + 1);
    const d = pad2(dateObj.getUTCDate());
    const hh = pad2(dateObj.getUTCHours());
    const mm = pad2(dateObj.getUTCMinutes());
    const ss = pad2(dateObj.getUTCSeconds());
    return `${y}${m}${d}T${hh}${mm}${ss}Z`;
  }

  function parseTimeTo24h(timeStr) {
    const s = String(timeStr || "").trim();
    if (!s) return null;
    let m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m) {
      let h = Number(m[1]);
      const min = Number(m[2]);
      const ap = m[3].toUpperCase();
      if (ap === "AM") h = h === 12 ? 0 : h;
      if (ap === "PM") h = h === 12 ? 12 : h + 12;
      return { h, m: min };
    }
    m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (m) return { h: Number(m[1]), m: Number(m[2]) };
    return null;
  }

  function icsEscape(s) {
    return String(s || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function downloadIcs(filename, content) {
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
})();
