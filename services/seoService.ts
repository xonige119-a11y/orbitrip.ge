import { Language } from '../types';

export const updateSeo = (data: { 
    titleEn: string; 
    titleRu?: string; 
    descEn?: string; 
    descRu?: string; 
    image?: string; 
    language: Language 
}) => {
    const isEn = data.language === Language.EN;
    const title = (isEn ? data.titleEn : data.titleRu) || data.titleEn;
    const description = (isEn ? data.descEn : data.descRu) || "Book private transfers and tours in Georgia directly from local drivers. Safety, comfort, and best prices guaranteed.";
    const image = data.image || "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=1200";
    const url = window.location.href;

    // Update Title
    document.title = title;

    // Helper to update meta tags
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

    // Update Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Update Meta Tags
    setMeta('description', description);
    setMeta('keywords', "Georgia transfer, private driver Tbilisi, Kazbegi tour, Batumi taxi, Gotrip alternative, Orbitrip, travel Georgia");
    
    // Update Open Graph (Facebook/WhatsApp/Telegram previews)
    setOg('og:title', title);
    setOg('og:description', description);
    setOg('og:image', image);
    setOg('og:url', url);
    setOg('og:type', 'website');
    setOg('og:site_name', 'OrbiTrip Georgia');
};

export const resetSeo = (language: Language) => {
    updateSeo({
        titleEn: "Orbitrip - Private Tours & Professional Transfers in Georgia",
        titleRu: "Orbitrip - Частные Туры и Трансферы по Грузии",
        descEn: "Your #1 choice for private travel in Georgia. Professional drivers for Tbilisi transfers, Kazbegi tours, and Batumi trips. Comfortable vehicles, custom routes, and verified local guides.",
        descRu: "Ваш выбор №1 для путешествий по Грузии. Профессиональные водители для трансферов из Тбилиси, туров в Казбеги и поездок в Батуми. Комфортные авто и проверенные гиды.",
        language
    });
};