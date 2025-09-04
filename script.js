document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('homeReportModal');
  const form = document.getElementById('homeReportForm');
  const formContainer = document.getElementById('homeReportFormContainer');
  const bookPrompt = document.getElementById('bookPrompt');
  const closeBtn = modal.querySelector('.modal-close');
  const noBookBtn = document.getElementById('noBook');
  const captchaQuestion = document.getElementById('captchaQuestion');
  const captchaAnswer = document.getElementById('captchaAnswer');

  // Analytics helper: prefer dataLayer events for GTM; fallback to gtag
  const track = (eventName, params = {}) => {
    try {
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push(Object.assign({ event: eventName }, params));
      } else if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
      }
    } catch (_) {}
  };

  // Consent handled by Silktide; GA4 loaded in head with Consent Mode defaults

  // Ensure modal elements start hidden (defensive)
  if (modal && !modal.classList.contains('hidden')) modal.classList.add('hidden');
  if (bookPrompt && !bookPrompt.classList.contains('hidden')) bookPrompt.classList.add('hidden');

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

  // No local cookie banner logic (Silktide handles UI and storage)

  // Simple math captcha
  const a = Math.floor(2 + Math.random() * 8);
  const b = Math.floor(1 + Math.random() * 7);
  const answer = a + b;
  if (captchaQuestion) captchaQuestion.textContent = `What is ${a} + ${b}?`;

  // Lightbox for gallery images
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCap = document.getElementById('lightboxCaption');
  const lbClose = document.querySelector('.lightbox-close');
  const lbPrev = document.querySelector('.lightbox-prev');
  const lbNext = document.querySelector('.lightbox-next');

  const galleryImgs = Array.from(document.querySelectorAll('.gallery img'));
  let currentIndex = -1;
  const getCaption = (imgEl) => {
    const fig = imgEl.closest('figure');
    const fc = fig ? fig.querySelector('figcaption') : null;
    return (fc && fc.textContent.trim()) || imgEl.alt || '';
  };
  const showAt = (idx) => {
    if (!lb || !lbImg) return;
    if (idx < 0) idx = galleryImgs.length - 1;
    if (idx >= galleryImgs.length) idx = 0;
    currentIndex = idx;
    const imgEl = galleryImgs[currentIndex];
    lbImg.src = imgEl.src;
    lbImg.alt = imgEl.alt || '';
    if (lbCap) lbCap.textContent = getCaption(imgEl);
  };
  const openLightbox = (idxOrImg) => {
    const idx = typeof idxOrImg === 'number' ? idxOrImg : galleryImgs.indexOf(idxOrImg);
    if (idx < 0) return;
    showAt(idx);
    lb.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    const imgEl = galleryImgs[idx];
    track('lightbox_open', { src: imgEl.src, alt: imgEl.alt || '' });
  };
  const closeLightbox = () => {
    if (!lb) return;
    lb.classList.add('hidden');
    document.body.style.overflow = '';
  };
  const nextImg = () => showAt(currentIndex + 1);
  const prevImg = () => showAt(currentIndex - 1);

  galleryImgs.forEach((img, i) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openLightbox(i));
  });
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', prevImg);
  if (lbNext) lbNext.addEventListener('click', nextImg);
  if (lb) lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  window.addEventListener('keydown', (e) => {
    if (lb && lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImg();
    if (e.key === 'ArrowLeft') prevImg();
  });

  // Sticky CTA -> open report modal
  document.querySelectorAll('.js-open-report').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
      track('request_report_click', { location: 'sticky_cta' });
    });
  });

  // Register Interest form
  // Register Interest form removed per request

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
      // Track successful lead + download
      track('generate_lead', { form_id: 'home_report' });
      track('home_report_download', { file: 'HR-Apple-Cottage.pdf' });

      // Trigger PDF download
      const link = document.createElement('a');
      link.href = 'HR-Apple-Cottage.pdf';
      link.download = 'HR-Apple-Cottage.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      formContainer.classList.add('hidden');
      bookPrompt.classList.remove('hidden');
    } catch (err) {
      track('lead_submit_error', { form_id: 'home_report' });
      alert('There was a problem submitting the form. Please try again later.');
    }
  });
});
  // Social sharing buttons
  const shareBtns = document.querySelectorAll('.js-share');
  const copyBtn = document.querySelector('.js-copy');
  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent('Apple Cottage, Creetown');
  shareBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-platform');
      let url = '';
      if (p === 'facebook') url = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
      if (p === 'x') url = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
      if (p === 'whatsapp') url = `https://api.whatsapp.com/send?text=${pageTitle}%20${pageUrl}`;
      if (p === 'email') url = `mailto:?subject=${pageTitle}&body=${pageUrl}`;
      if (url) window.open(url, '_blank', 'noopener');
    });
  });
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(window.location.href);
        } else {
          const ta = document.createElement('textarea');
          ta.value = window.location.href; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        }
        alert('Link copied');
      } catch (_) {}
    });
  }
