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
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        required
        className="input input-bordered w-full"
      />
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        type="email"
        required
        className="input input-bordered w-full"
      />
      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        placeholder="Message"
        required
        className="textarea textarea-bordered w-full"
      />
      <button type="submit" className="btn btn-primary w-full">
        Send
      </button>
      {submitted && <div className="mt-2 text-green-600">Thank you for your message!</div>}
    </form>
  );
}

