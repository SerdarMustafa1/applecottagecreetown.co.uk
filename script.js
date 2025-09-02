document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('homeReportModal');
  const form = document.getElementById('homeReportForm');
  const formContainer = document.getElementById('homeReportFormContainer');
  const bookPrompt = document.getElementById('bookPrompt');
  const closeBtn = modal.querySelector('.modal-close');
  const noBookBtn = document.getElementById('noBook');
  const banner = document.getElementById('cookieBanner');
  const cookieAccept = document.getElementById('cookieAccept');
  const cookieReject = document.getElementById('cookieReject');
  const captchaQuestion = document.getElementById('captchaQuestion');
  const captchaAnswer = document.getElementById('captchaAnswer');

  // GA4 helper (no-op if GA not loaded)
  const track = (eventName, params = {}) => {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
      }
    } catch (_) {}
  };

  // Consent management
  const getConsent = () => localStorage.getItem('cookieConsent');
  const setConsent = (value) => localStorage.setItem('cookieConsent', value);
  const loadGA = () => {
    if (window.gtag) return; // already loaded
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-LHB9R5TLL1';
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-LHB9R5TLL1');
  };

  function openModal() {
    modal.classList.remove('hidden');
  }

  function closeModal() {
    modal.classList.add('hidden');
    form.reset();
    formContainer.classList.remove('hidden');
    bookPrompt.classList.add('hidden');
  }

  document.querySelectorAll('.request-report-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
      track('request_report_click', { location: 'cta' });
    });
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  noBookBtn.addEventListener('click', closeModal);
  noBookBtn.addEventListener('click', () => {
    track('decline_viewing_prompt', { source: 'home_report_modal' });
  });

  // Track clicks to TidyCal (outbound)
  document.querySelectorAll('a[href^="https://tidycal.com"]').forEach(a => {
    a.addEventListener('click', () => {
      track('book_viewing_click', {
        link_url: a.href,
        outbound: true,
        transport_type: 'beacon'
      });
    });
  });

  // Show cookie banner if no decision yet
  const consent = getConsent();
  if (!consent) {
    banner.classList.remove('hidden');
  } else if (consent === 'accepted') {
    loadGA();
  }
  cookieAccept?.addEventListener('click', () => {
    setConsent('accepted');
    banner.classList.add('hidden');
    loadGA();
  });
  cookieReject?.addEventListener('click', () => {
    setConsent('rejected');
    banner.classList.add('hidden');
  });

  // Simple math captcha
  const a = Math.floor(2 + Math.random() * 8);
  const b = Math.floor(1 + Math.random() * 7);
  const answer = a + b;
  if (captchaQuestion) captchaQuestion.textContent = `What is ${a} + ${b}?`;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Abort if honeypot filled
    if (form.company && form.company.value) {
      return; // silently drop
    }
    // Validate captcha
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
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Network response was not ok');

      // Trigger PDF download
      const link = document.createElement('a');
      link.href = 'home_report.pdf';
      link.download = 'Apple-Cottage-Home-Report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Track successful lead + download
      track('generate_lead', { form_id: 'home_report' });
      track('file_download', {
        file_name: 'Apple-Cottage-Home-Report.pdf',
        file_extension: 'pdf',
        link_url: 'home_report.pdf'
      });

      formContainer.classList.add('hidden');
      bookPrompt.classList.remove('hidden');
    } catch (err) {
      track('lead_submit_error', { form_id: 'home_report' });
      alert('There was a problem submitting the form. Please try again later.');
    }
  });
});
