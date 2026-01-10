import { Tour } from '../types';

export const generateLocalBusinessSchema = () => {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "OrbiTrip Georgia",
    "image": "https://orbitrip.ge/logo.png",
    "description": "Private transfers and tours in Georgia directly from local drivers.",
    "@id": "https://orbitrip.ge",
    "url": "https://orbitrip.ge",
    "telephone": "+995593456876",
    "email": "support@orbitrip.ge",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Tbilisi",
      "addressCountry": "GE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 41.7151,
      "longitude": 44.8271
    },
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    }
  });
};

export const generateTourSchema = (tour: Tour) => {
  // Extract numeric price for schema
  const priceMatch = tour.price.match(/\d+/);
  const numericPrice = priceMatch ? priceMatch[0] : "100";

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": tour.titleEn,
    "description": tour.descriptionEn,
    "image": tour.image,
    "brand": {
      "@type": "Brand",
      "name": "OrbiTrip"
    },
    "offers": {
      "@type": "Offer",
      "price": numericPrice,
      "priceCurrency": "GEL",
      "availability": "https://schema.org/InStock",
      "url": window.location.href
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": tour.rating || 5,
      "reviewCount": tour.reviews?.length || 15
    }
  });
};

export const generateFAQSchema = () => {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Do you provide airport pickup?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, we provide 24/7 airport transfers from Tbilisi, Kutaisi, and Batumi airports."
          }
        },
        {
          "@type": "Question",
          "name": "Can we stop for photos?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! With OrbiTrip, you can stop anywhere for free to take photos, eat, or rest."
          }
        }
      ]
    });
};