import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AlternatingHeroIsland from '../../src/components/AlternatingHeroIsland';

// Mock timers
vi.useFakeTimers();

const mockImages = [
  { src: '/image1.jpg', alt: 'Image 1' },
  { src: '/image2.jpg', srcWebp: '/image2.webp', alt: 'Image 2' },
  { src: '/image3.jpg', alt: 'Image 3' }
];

describe('AlternatingHeroIsland', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.useFakeTimers();
  });

  it('renders hero section with children', () => {
    render(
      <AlternatingHeroIsland images={mockImages}>
        <div data-testid="hero-content">Hero Content</div>
      </AlternatingHeroIsland>
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByTestId('hero-content')).toBeInTheDocument();
  });

  it('renders fallback when no images provided', () => {
    render(
      <AlternatingHeroIsland images={[]}>
        <div data-testid="hero-content">Hero Content</div>
      </AlternatingHeroIsland>
    );

    const heroSection = screen.getByRole('banner');
    expect(heroSection).toBeInTheDocument();
    expect(screen.getByTestId('hero-content')).toBeInTheDocument();
  });

  it('renders all images with correct attributes', () => {
    render(
      <AlternatingHeroIsland images={mockImages}>
        <div>Content</div>
      </AlternatingHeroIsland>
    );

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    
    // First image should have eager loading
    expect(images[0]).toHaveAttribute('loading', 'eager');
    expect(images[0]).toHaveAttribute('fetchpriority', 'high');
    
    // Other images should have lazy loading
    expect(images[1]).toHaveAttribute('loading', 'lazy');
    expect(images[1]).toHaveAttribute('fetchpriority', 'low');
  });

  it('renders WebP sources when available', () => {
    render(
      <AlternatingHeroIsland images={mockImages}>
        <div>Content</div>
      </AlternatingHeroIsland>
    );

    const pictures = document.querySelectorAll('picture');
    expect(pictures).toHaveLength(1); // Only image2 has WebP
    
    const source = pictures[0].querySelector('source');
    expect(source).toHaveAttribute('srcset', '/image2.webp');
    expect(source).toHaveAttribute('type', 'image/webp');
  });

  it('alternates images at specified interval', async () => {
    render(
      <AlternatingHeroIsland images={mockImages} interval={1000}>
        <div>Content</div>
      </AlternatingHeroIsland>
    );

    const images = screen.getAllByRole('img');
    
    // Initially first image should be visible
    expect(images[0].parentElement).toHaveClass('opacity-100');
    expect(images[1].parentElement).toHaveClass('opacity-0');
    
    // After interval, second image should be visible
    vi.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(images[0].parentElement).toHaveClass('opacity-0');
      expect(images[1].parentElement).toHaveClass('opacity-100');
    });
    
    // After another interval, third image should be visible
    vi.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(images[1].parentElement).toHaveClass('opacity-0');
      expect(images[2].parentElement).toHaveClass('opacity-100');
    });
  });

  it('cycles back to first image after last image', async () => {
    render(
      <AlternatingHeroIsland images={mockImages} interval={1000}>
        <div>Content</div>
      </AlternatingHeroIsland>
    );

    const images = screen.getAllByRole('img');
    
    // Advance through all images
    vi.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(images[2].parentElement).toHaveClass('opacity-0');
      expect(images[0].parentElement).toHaveClass('opacity-100');
    });
  });

  it('does not start timer with single image', () => {
    const singleImage = [{ src: '/single.jpg', alt: 'Single' }];
    
    render(
      <AlternatingHeroIsland images={singleImage}>
        <div>Content</div>
      </AlternatingHeroIsland>
    );

    vi.advanceTimersByTime(10000);
    
    const images = screen.getAllByRole('img');
    expect(images[0].parentElement).toHaveClass('opacity-100');
  });

  it('has proper accessibility attributes', () => {
    render(
      <AlternatingHeroIsland images={mockImages}>
        <div>Content</div>
      </AlternatingHeroIsland>
    );

    const heroSection = document.getElementById('hero');
    expect(heroSection).toBeInTheDocument();
    expect(heroSection).toHaveAttribute('id', 'hero');
    
    const images = screen.getAllByRole('img');
    images.forEach((img, index) => {
      expect(img).toHaveAttribute('alt', mockImages[index].alt);
    });
    
    const overlay = document.querySelector('[aria-hidden="true"]');
    expect(overlay).toBeInTheDocument();
  });

  it('cleans up timer on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    
    const { unmount } = render(
      <AlternatingHeroIsland images={mockImages}>
        <div>Content</div>
      </AlternatingHeroIsland>
    );

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});