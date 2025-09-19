import { useState, useEffect, useCallback } from 'react';

interface HeroImage {
  src: string;
  srcWebp?: string;
  alt: string;
}

interface AlternatingHeroIslandProps {
  images: HeroImage[];
  interval?: number;
  children: React.ReactNode;
}

export default function AlternatingHeroIsland({ 
  images, 
  interval = 5000,
  children 
}: AlternatingHeroIslandProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const preloadImages = useCallback(() => {
    images.forEach((image) => {
      const img = new Image();
      img.src = image.srcWebp || image.src;
      if (image.srcWebp) {
        const fallback = new Image();
        fallback.src = image.src;
      }
    });
    setIsLoaded(true);
  }, [images]);

  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  useEffect(() => {
    if (images.length <= 1 || !isLoaded) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval, isLoaded]);

  if (!images.length) {
    return (
      <section id="hero" className="relative">
        <div className="w-full h-[40vh] bg-gray-100" />
        <div className="absolute inset-0 bg-black/30" aria-hidden="true"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </section>
    );
  }

  return (
    <section id="hero" className="relative overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="relative w-full h-[45vh] md:h-[60vh]">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            {image.srcWebp ? (
              <picture>
                <source srcSet={image.srcWebp} type="image/webp" />
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="absolute inset-0 w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  {...(index === 0 ? { fetchpriority: 'high' } : { fetchpriority: 'low' })}
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    const shimmer = img.parentElement?.querySelector('.animate-pulse');
                    if (shimmer) shimmer.remove();
                  }}
                />
              </picture>
            ) : (
              <img 
                src={image.src} 
                alt={image.alt} 
                className="absolute inset-0 w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                {...(index === 0 ? { fetchpriority: 'high' } : { fetchpriority: 'low' })}
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  const shimmer = img.parentElement?.querySelector('.animate-pulse');
                  if (shimmer) shimmer.remove();
                }}
              />
            )}
          </div>
        </div>
      ))}
      <div className="absolute inset-0 bg-black/30" aria-hidden="true"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </section>
  );
}