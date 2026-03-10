/* SGPF DJ HALLI CHURCH — Main Script */
(() => {
  const site = window.SGPF_SITE || {};

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

  const emailLink = $("#emailLink");
  if (emailLink) {
    const email = contact.email || "info@example.com";
    emailLink.textContent = email;
    emailLink.setAttribute("href", `mailto:${email}`);
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
        meta.textContent = [
          when.long,
          ev.location || contact.addressShort || "",
          ev.description || "",
        ]
          .filter(Boolean)
          .join(" • ");
        content.appendChild(title);
        content.appendChild(meta);

        const addBtn = document.createElement("button");
        addBtn.type = "button";
        addBtn.className = "btn btn-ghost";
        addBtn.textContent = "Add to calendar";
        addBtn.addEventListener("click", () => {
          downloadIcs(`${slugify(ev.title || "event")}.ics`, buildIcs([ev], site));
        });

        card.appendChild(pill);
        card.appendChild(content);
        card.appendChild(addBtn);
        eventsList.appendChild(card);
      });
    }
  }

  // ── Download all events calendar ────────────────────────────
  const downloadCalendarBtn = $("#downloadCalendarBtn");
  if (downloadCalendarBtn) {
    downloadCalendarBtn.addEventListener("click", () => {
      downloadIcs("sgpf-dj-halli-events.ics", buildIcs(events, site));
    });
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
          <div class="sermon-reels-icon" aria-hidden="true"></div>
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
      const id = youtubeIdFromUrl(s.youtubeUrl || "");
      const card = document.createElement("article");
      card.className = "card sermon";

      const ratio = document.createElement("div");
      ratio.className = "ratio";

      if (id) {
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}`;
        iframe.title = s.title ? `Sermon: ${s.title}` : "Sermon video";
        iframe.loading = "lazy";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allowFullscreen = true;
        ratio.appendChild(iframe);
      } else {
        ratio.style.display = "grid";
        ratio.style.placeItems = "center";
        ratio.style.color = "white";
        ratio.textContent = "Add a valid YouTube link";
      }

      const title = document.createElement("p");
      title.className = "sermon-title";
      title.textContent = s.title || "Sermon";

      const sub = document.createElement("p");
      sub.className = "sermon-sub";
      sub.textContent = [s.speaker, s.date].filter(Boolean).join(" • ");

      card.appendChild(ratio);
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

      const to = contact.email || "info@example.com";
      const subject = `Message from ${name} (${site.churchName || "SGPF DJ HALLI CHURCH"})`;
      const lines = [
        `Name: ${name}`,
        phone ? `Phone: ${phone}` : null,
        `Prayer request: ${prayer ? "Yes" : "No"}`,
        "",
        message,
      ].filter(Boolean);
      const body = lines.join("\n");
      const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;

      if (status) status.textContent = "Opening your email app…";
      window.location.href = mailto;
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
