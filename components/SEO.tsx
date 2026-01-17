import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image = 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=1200', 
  url = window.location.href, 
  type = 'website',
  keywords
}) => {
  useEffect(() => {
    // 1. Update Title
    document.title = title.includes('OrbiTrip') ? title : `${title} | OrbiTrip Georgia`;

    // 2. Helper to set meta tags
    const setMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const setOg = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Set Standard Meta Tags
    setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);

    // 4. Set Open Graph (Facebook/Social)
    setOg('og:title', title);
    setOg('og:description', description);
    setOg('og:image', image);
    setOg('og:url', url);
    setOg('og:type', type);
    setOg('og:site_name', 'OrbiTrip Georgia');

    // 5. Set Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    // 6. Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

  }, [title, description, image, url, type, keywords]);

  return null;
};

export default SEO;