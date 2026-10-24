/* ═══════════════════════════════════════════════════════════════
   ASK PASTOR - FORM LOGIC & GOOGLE SHEETS INTEGRATION
   ═══════════════════════════════════════════════════════════════
   
   PRIVACY NOTES:
   - No analytics/tracking scripts on this page.
   - Question text is never sent to analytics or error-reporting.
   - Honeypot field for spam protection.
   - Client-side rate limiting (no IPs stored).
   - Server-side idempotency via submission ID.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── CONFIG ─────────────────────────────────────────────────
  const CONSENT_VERSION = 'v1.0';
  const MAX_CHARS = 2000;
  const RATE_LIMIT_MS = 30000; // 30 seconds between submissions
  const RATE_LIMIT_KEY = 'sgpf_ap_last_submit';

  // ── DOM REFS ───────────────────────────────────────────────
  const form = document.getElementById('askPastorForm');
  const formCard = document.getElementById('askPastorFormCard');
  const successCard = document.getElementById('askPastorSuccess');
  const textarea = document.getElementById('ap-question');
  const charCount = document.getElementById('ap-char-count');
  const charCounter = document.getElementById('ap-char-counter');
  const questionHint = document.getElementById('ap-question-hint');
  const consentCheckbox = document.getElementById('ap-consent');
  const consentHint = document.getElementById('ap-consent-hint');
  const submitBtn = document.getElementById('ap-submit-btn');
  const submitText = submitBtn?.querySelector('.ap-submit-text');
  const submitArrow = submitBtn?.querySelector('.ap-submit-arrow');
  const formStatus = document.getElementById('ap-form-status');
  const askAnotherBtn = document.getElementById('ap-ask-another');
  const honeypot = form?.querySelector('[name="website"]');

  if (!form || !textarea || !submitBtn) return;

  // ── LOAD WEBHOOK URL FROM site-data.json ──────────────────
  const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzUavc1EgRJoGvI3scSDL-f3fT8DLlwFD5mgjy2zwzGcFQ6MVSac6XcruvTe11fqVo-iw/exec';
  let webhookUrl = DEFAULT_WEBHOOK_URL;

  async function loadConfig() {
    try {
      const site = window.SGPF_SITE || {};
      // Use configured webhook or fallback to default
      webhookUrl = (site.askPastor && site.askPastor.googleSheetsWebhookUrl) ||
                   DEFAULT_WEBHOOK_URL;
    } catch (e) {
      // Keep DEFAULT_WEBHOOK_URL
    }
  }

  // Wait for SGPF_SITE to be available
  function waitForSiteData() {
    return new Promise((resolve) => {
      if (window.SGPF_SITE) return resolve();
      // Poll briefly for site data
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.SGPF_SITE || attempts > 30) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  waitForSiteData().then(loadConfig);

  // ── CHARACTER COUNTER ──────────────────────────────────────
  textarea.addEventListener('input', updateCharCounter);

  function updateCharCounter() {
    const len = textarea.value.length;
    charCount.textContent = len.toLocaleString('en-IN');

    charCounter.classList.remove('ap-char-warning', 'ap-char-limit');
    if (len >= MAX_CHARS) {
      charCounter.classList.add('ap-char-limit');
    } else if (len >= MAX_CHARS * 0.9) {
      charCounter.classList.add('ap-char-warning');
    }

    // Clear error state on typing
    if (len > 0) {
      textarea.classList.remove('ap-field-error');
      if (questionHint) questionHint.hidden = true;
    }
  }

  // ── CLEAR CONSENT ERROR ON CHECK ───────────────────────────
  consentCheckbox.addEventListener('change', () => {
    if (consentCheckbox.checked) {
      consentCheckbox.classList.remove('ap-field-error');
      if (consentHint) consentHint.hidden = true;
    }
  });

  // ── GENERATE SUBMISSION ID ─────────────────────────────────
  function generateSubmissionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `ap_${timestamp}_${random}`;
  }

  // ── RATE LIMITING ──────────────────────────────────────────
  function isRateLimited() {
    try {
      const last = parseInt(sessionStorage.getItem(RATE_LIMIT_KEY) || '0', 10);
      return (Date.now() - last) < RATE_LIMIT_MS;
    } catch {
      return false;
    }
  }

  function recordSubmission() {
    try {
      sessionStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
    } catch {
      // sessionStorage unavailable
    }
  }

  // ── SMOOTH SCROLL ──────────────────────────────────────────
  function scrollToElement(el) {
    const offset = 100;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  // ── SET FORM STATE ─────────────────────────────────────────
  function setSubmitting(submitting) {
    submitBtn.disabled = submitting;
    if (submitText) submitText.textContent = submitting ? 'Submitting…' : 'Submit My Question';
    if (submitArrow) submitArrow.style.display = submitting ? 'none' : 'inline-block';
  }

  function setStatus(message, isError) {
    if (formStatus) {
      formStatus.textContent = message;
      formStatus.style.color = isError ? '#ef4444' : '';
    }
  }

  // ── SHOW SUCCESS ───────────────────────────────────────────
  function showSuccess() {
    formCard.hidden = true;
    successCard.hidden = false;
    scrollToElement(successCard);
    // Announce to screen readers
    successCard.setAttribute('role', 'alert');
  }

  function showForm() {
    successCard.hidden = true;
    formCard.hidden = false;
    form.reset();
    updateCharCounter();
    setStatus('', false);
    scrollToElement(formCard);
    successCard.removeAttribute('role');
    textarea.focus();
  }

  // ── ASK ANOTHER ────────────────────────────────────────────
  if (askAnotherBtn) {
    askAnotherBtn.addEventListener('click', showForm);
  }

  // ── FORM SUBMISSION ────────────────────────────────────────
  let currentSubmissionId = null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot check
    if (honeypot && honeypot.value.trim() !== '') return;

    // Validate
    const question = textarea.value.trim();
    let valid = true;

    if (!question) {
      textarea.classList.add('ap-field-error');
      if (questionHint) questionHint.hidden = false;
      valid = false;
    } else {
      textarea.classList.remove('ap-field-error');
      if (questionHint) questionHint.hidden = true;
    }

    if (!consentCheckbox.checked) {
      consentCheckbox.classList.add('ap-field-error');
      if (consentHint) consentHint.hidden = false;
      valid = false;
    } else {
      consentCheckbox.classList.remove('ap-field-error');
      if (consentHint) consentHint.hidden = true;
    }

    if (!valid) {
      setStatus('Please complete the required fields.', true);
      // Focus first invalid field
      if (!question) {
        textarea.focus();
      } else if (!consentCheckbox.checked) {
        consentCheckbox.focus();
      }
      return;
    }

    // Rate limit
    if (isRateLimited()) {
      setStatus('Please wait a moment before submitting again.', true);
      return;
    }

    // Check webhook
    if (!webhookUrl) {
      // Try loading again
      await loadConfig();
      if (!webhookUrl) {
        setStatus('The submission service is not yet configured. Please try again later.', true);
        return;
      }
    }

    // Generate idempotency ID (reuse on retry)
    if (!currentSubmissionId) {
      currentSubmissionId = generateSubmissionId();
    }

    // Build payload
    const topic = form.querySelector('[name="topic"]')?.value || '';
    const language = form.querySelector('[name="language"]')?.value || '';
    const now = new Date();

    const payload = new FormData();
    payload.append('submissionId', currentSubmissionId);
    payload.append('question', question);
    payload.append('topic', topic);
    payload.append('language', language);
    payload.append('consentGiven', 'Yes');
    payload.append('consentVersion', CONSENT_VERSION);
    payload.append('consentTimestamp', now.toISOString());
    payload.append('submittedAt', now.toISOString());
    payload.append('page', 'ask-pastor');
    payload.append('formType', 'ask-pastor');

    // Submit
    setSubmitting(true);
    setStatus('Sending your question…', false);

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: payload,
      });

      // With no-cors we can't read the response, but if fetch didn't throw,
      // the request was sent. Mark success.
      recordSubmission();
      currentSubmissionId = null;
      showSuccess();
    } catch (error) {
      // Preserve question text — don't clear the form
      setStatus('Something went wrong. Your question is saved here — please try again.', true);
    } finally {
      setSubmitting(false);
    }
  });

  // ── HERO CTA SMOOTH SCROLL ─────────────────────────────────
  const heroCta = document.querySelector('.ap-hero-btn');
  if (heroCta) {
    heroCta.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('askForm');
      if (target) {
        scrollToElement(target);
        // Focus the textarea after scroll
        setTimeout(() => textarea.focus(), 600);
      }
    });
  }

})();
