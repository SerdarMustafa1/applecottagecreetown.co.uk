import React, { useState } from 'react';

export default function ContactFormIsland() {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) {
    return <p>Thanks for your message!</p>;
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4" data-testid="contact-form">
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
<<<<<<< HEAD
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
=======
        <input id="company" name="company" type="text" />
>>>>>>> 6809f54 (feat: scaffold core site structure)
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
    </form>
  );
}
