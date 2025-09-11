import React from 'react';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { describe, it, expect } from 'vitest';
import ContactFormIsland from '../../src/components/ContactFormIsland';

describe('ContactFormIsland', () => {
  it('renders form and has no a11y violations', async () => {
    const { container } = render(<ContactFormIsland />);
    expect(screen.getByLabelText(/name/i)).toBeTruthy();
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toHaveLength(0);
  });
});
