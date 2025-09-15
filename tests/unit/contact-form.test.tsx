import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { describe, it, expect } from 'vitest';
import ContactFormIsland from '../../src/components/ContactFormIsland.tsx';

describe('ContactFormIsland', () => {
  it('renders form and has no a11y violations', async () => {
    const { container } = render(<ContactFormIsland />);
    expect(screen.getByLabelText(/name/i)).toBeTruthy();
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toHaveLength(0);
  });

  it('renders form fields and submits', () => {
    render(<ContactFormIsland />);
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
  expect(nameInput).toBeTruthy();
  expect(emailInput).toBeTruthy();
  expect(messageInput).toBeTruthy();

    fireEvent.change(nameInput, { target: { value: 'John' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Hello' } });
  const [submitBtn] = screen.getAllByRole('button', { name: /send/i });
  fireEvent.click(submitBtn);
  expect(screen.getByText('Thank you for your message!')).toBeTruthy();
  });
});
