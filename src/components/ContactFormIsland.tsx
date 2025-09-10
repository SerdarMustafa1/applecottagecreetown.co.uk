import React, { useRef, useState } from 'react';
import siteConfig from '../../site.config';

export default function ContactFormIsland() {
  const [submitted, setSubmitted] = useState(false);
  const startRef = useRef(Date.now());
  const timeRef = useRef<HTMLInputElement>(null);
  const { phone, email } = siteConfig.contact;
  const phoneHref = phone.replace(/\s+/g, '');
  const whatsappHref = `https://wa.me/${phone.replace(/\D/g, '')}`;

  if (submitted) {
    return (
      <div>
        <p>Thanks for your message!</p>
        <div className="mt-4 flex gap-2">
          <a href={`tel:${phoneHref}`} className="bg-gray-200 px-3 py-2 rounded">Call</a>
          <a href={whatsappHref} className="bg-gray-200 px-3 py-2 rounded">WhatsApp</a>
          <a href={`mailto:${email}`} className="bg-gray-200 px-3 py-2 rounded">Email</a>
        </div>
      </div>
    );
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="company"
      onSubmit={(e) => {
        e.preventDefault();
        if (timeRef.current) {
          timeRef.current.value = String(Date.now() - startRef.current);
        }
        setSubmitted(true);
      }}
      className="space-y-4"
      data-testid="contact-form"
    >
      <input type="hidden" name="form-name" value="contact" />
      <input type="hidden" name="timeToComplete" ref={timeRef} />
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Name</label>
        <input id="name" name="name" type="text" className="mt-1 block w-full border rounded p-2" required />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" className="mt-1 block w-full border rounded p-2" required />
      </div>
      <div className="hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
      <div className="flex gap-2">
        <a href={`tel:${phoneHref}`} className="bg-gray-200 px-3 py-2 rounded">Call</a>
        <a href={whatsappHref} className="bg-gray-200 px-3 py-2 rounded">WhatsApp</a>
        <a href={`mailto:${email}`} className="bg-gray-200 px-3 py-2 rounded">Email</a>
      </div>
    </form>
  );
}
