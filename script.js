document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('homeReportModal');
  const form = document.getElementById('homeReportForm');
  const formContainer = document.getElementById('homeReportFormContainer');
  const bookPrompt = document.getElementById('bookPrompt');
  const closeBtn = modal.querySelector('.modal-close');
  const noBookBtn = document.getElementById('noBook');

  // GA4 helper (no-op if GA not loaded)
  const track = (eventName, params = {}) => {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
      }
    } catch (_) {}
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
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
