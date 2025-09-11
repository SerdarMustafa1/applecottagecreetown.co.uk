import React, { useEffect, useRef, useState } from 'react';

export default function ContactFormIsland() {
  const [submitted, setSubmitted] = useState(false);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const timeField = (e.currentTarget.querySelector('input[name="timeToComplete"]') as HTMLInputElement | null);
    if (timeField) {
      timeField.value = String(Math.max(0, Math.round((Date.now() - startRef.current) / 1000)));
    }
    setSubmitted(true);
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="form-name" value="contact" />
      <input type="hidden" name="timeToComplete" value="" />
      <p className="hidden" aria-hidden="true">
        <label className="block text-sm font-medium text-gray-700">
          Don’t fill this out if you’re human:
          <input name="bot-field" className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600" />
        </label>
      </p>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          id="name"
          name="name"
          placeholder="Name"
          required
          className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          required
          className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          id="message"
          name="message"
          placeholder="Message"
          required
          rows={5}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
        />
      </div>
      <button
        type="submit"
        className="inline-flex w-full justify-center rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        Send
      </button>
      <p className="text-xs text-gray-600">
        We’ll use your details only to respond to your enquiry about Apple Cottage and won’t share them with third parties.
      </p>
      {submitted && (
        <div role="status" className="mt-2 text-green-700">Thank you for your message!</div>
      )}
    </form>
  );
}
