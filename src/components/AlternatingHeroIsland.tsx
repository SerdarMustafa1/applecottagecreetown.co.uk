import { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (images.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

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
          {image.srcWebp ? (
            <picture>
              <source srcSet={image.srcWebp} type="image/webp" />
              <img 
                src={image.src} 
                alt={image.alt} 
                className="w-full h-[45vh] md:h-[60vh] object-cover"
              />
            </picture>
          ) : (
            <img 
              src={image.src} 
              alt={image.alt} 
              className="w-full h-[45vh] md:h-[60vh] object-cover"
            />
          )}
        </div>
      ))}
      <div className="absolute inset-0 bg-black/30" aria-hidden="true"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </section>
  );
}