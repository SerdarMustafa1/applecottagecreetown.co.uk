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
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Message')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Message'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByText('Send'));
    expect(screen.getByText('Thank you for your message!')).toBeInTheDocument();
  });
});
