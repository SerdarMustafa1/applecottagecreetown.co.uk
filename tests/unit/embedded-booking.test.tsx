import { render, fireEvent, screen } from '@testing-library/react';
import EmbeddedBookingForm from '../../src/components/EmbeddedBookingForm.astro';

test('EmbeddedBookingForm submits and shows success', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
  render(<EmbeddedBookingForm /> as any);
  const name = screen.getByLabelText(/Your name/i);
  const email = screen.getByLabelText(/Email/i);
  fireEvent.change(name, { target: { value: 'Test User' } });
  fireEvent.change(email, { target: { value: 'test@example.com' } });
  const submit = screen.getByRole('button', { name: /request viewing/i });
  fireEvent.click(submit);
  const result = await screen.findByText(/Thanks — we will reply same day./i);
  expect(result).toBeInTheDocument();
});
