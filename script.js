document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('homeReportModal');
  const form = document.getElementById('homeReportForm');
  const formContainer = document.getElementById('homeReportFormContainer');
  const bookPrompt = document.getElementById('bookPrompt');
  const closeBtn = modal ? modal.querySelector('.modal-close') : null;
  const noBookBtn = document.getElementById('noBook');

  // GA4 helper (no-op if GA not loaded)
  const track = (eventName, params = {}) => {
    try { if (typeof window.gtag === 'function') window.gtag('event', eventName, params); } catch (_) {}
  };

  function openModal() {
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    if (form) form.reset();
    if (formContainer) formContainer.classList.remove('hidden');
    if (bookPrompt) bookPrompt.classList.add('hidden');
  }

  document.querySelectorAll('.request-report-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
      track('request_report_click', { location: 'cta' });
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  if (noBookBtn) noBookBtn.addEventListener('click', () => { track('decline_viewing_prompt', { source: 'home_report_modal' }); closeModal(); });

  // Track outbound TidyCal clicks
  document.querySelectorAll('a[href^="https://tidycal.com"]').forEach(a => {
    a.addEventListener('click', () => {
      track('book_viewing_click', { link_url: a.href, outbound: true, transport_type: 'beacon' });
    });
  });

  // Simple math captcha
  const captchaQuestion = document.getElementById('captchaQuestion');
  const captchaAnswer = document.getElementById('captchaAnswer');
  const a = Math.floor(2 + Math.random() * 8);
  const b = Math.floor(1 + Math.random() * 7);
  const answer = a + b;
  if (captchaQuestion) captchaQuestion.textContent = `What is ${a} + ${b}?`;

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Honeypot
      if (form.company && form.company.value) return;
      // Captcha
      if (!captchaAnswer || String(answer) !== String(captchaAnswer.value).trim()) {
        alert('Please answer the security question correctly.');
        return;
      }

      const data = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        phone: form.phone.value,
        hear: form.hear.value
      };
      try {
        const res = await fetch('https://formsubmit.co/ajax/serdar@mustafa-family.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Network response was not ok');

        // Track successful lead + download
        track('generate_lead', { form_id: 'home_report' });
        track('file_download', { file_name: 'Apple-Cottage-Home-Report.pdf', file_extension: 'pdf', link_url: 'home_report.pdf' });

        if (formContainer) formContainer.classList.add('hidden');
        if (bookPrompt) bookPrompt.classList.remove('hidden');
        // Auto-trigger download if file exists
        const link = document.getElementById('downloadReportBtn');
        if (link) {
          try { link.click(); } catch (_) {}
        }
      } catch (err) {
        track('lead_submit_error', { form_id: 'home_report' });
        alert('There was a problem submitting the form. Please try again later.');
      }
    });
  }
});

