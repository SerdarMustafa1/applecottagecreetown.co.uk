document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('homeReportModal');
  const form = document.getElementById('homeReportForm');
  const formContainer = document.getElementById('homeReportFormContainer');
  const bookPrompt = document.getElementById('bookPrompt');
  const closeBtn = modal.querySelector('.modal-close');
  const noBookBtn = document.getElementById('noBook');

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
    });
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  noBookBtn.addEventListener('click', closeModal);

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

      formContainer.classList.add('hidden');
      bookPrompt.classList.remove('hidden');
    } catch (err) {
      alert('There was a problem submitting the form. Please try again later.');
    }
  });
});
