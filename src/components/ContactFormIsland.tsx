import React, { useState } from 'react';

export default function ContactFormIsland() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Name</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
          className="mt-1 block w-full border rounded p-2"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          required
          className="mt-1 block w-full border rounded p-2"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium">Message</label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Message"
          required
          className="mt-1 block w-full border rounded p-2"
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        Send
      </button>
      {submitted && <div className="mt-2 text-green-600">Thank you for your message!</div>}
    </form>
  );
}
