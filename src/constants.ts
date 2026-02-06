
import { Driver, Testimonial, Offer } from './types';

export const CITIES = [
  'Tbilisi',
  'Batumi',
  'Kutaisi',
  'Gudauri',
  'Kazbegi',
  'Mestia',
  'Signagi',
  'Borjomi',
  'Akhaltsikhe',
  'Kobuleti'
];

export const MOCK_DRIVERS: Driver[] = [
  {
    id: '1',
    email: 'dato@example.com',
    name: 'Dato G.',
    city: 'tbilisi',
    photoUrl: 'https://picsum.photos/seed/driver1/200/200',
    carModel: 'Toyota Prius (Hybrid)',
    carPhotoUrl: 'https://picsum.photos/seed/car1/400/250',
    vehicleType: 'Sedan',
    rating: 4.9,
    reviewCount: 124,
    reviews: [],
    languages: ['Georgian', 'Russian', 'English'],
    pricePerKm: 1.0,
    basePrice: 30,
    features: ['Wi-Fi', 'Child Seat', 'Water'],
    status: 'ACTIVE',
    blockedDates: []
  },
  {
    id: '2',
    email: 'giorgi@example.com',
    name: 'Giorgi M.',
    city: 'tbilisi',
    photoUrl: 'https://picsum.photos/seed/driver2/200/200',
    carModel: 'Mercedes-Benz E-Class',
    carPhotoUrl: 'https://picsum.photos/seed/car2/400/250',
    vehicleType: 'Sedan',
    rating: 5.0,
    reviewCount: 89,
    reviews: [],
    languages: ['Georgian', 'English'],
    pricePerKm: 1.5,
    basePrice: 50,
    features: ['Premium Leather', 'Wi-Fi', 'Climate Control'],
    status: 'ACTIVE',
    blockedDates: []
  },
  {
    id: '3',
    email: 'levan@example.com',
    name: 'Levan T.',
    city: 'kutaisi',
    photoUrl: 'https://picsum.photos/seed/driver3/200/200',
    carModel: 'Mitsubishi Delica (4x4)',
    carPhotoUrl: 'https://picsum.photos/seed/car3/400/250',
    vehicleType: 'Minivan',
    rating: 4.8,
    reviewCount: 210,
    reviews: [],
    languages: ['Georgian', 'Russian'],
    pricePerKm: 1.2,
    basePrice: 40,
    features: ['Off-road capability', 'Roof Rack', 'Water'],
    status: 'ACTIVE',
    blockedDates: []
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    author: 'Alexey D.',
    initial: 'A',
    rating: 5,
    text: 'Прекрасный водитель: спокойный, вежливый. Машина чистая.'
  },
  {
    id: '2',
    author: 'Sarah J.',
    initial: 'S',
    rating: 5,
    text: 'Comfortable trip from Kutaisi to Batumi. Driver Dato was very punctual.'
  },
  {
    id: '3',
    author: 'Mikhail K.',
    initial: 'M',
    rating: 5,
    text: 'Потрясающий тур в Казбеги! Было много времени для фото и остановок.'
  }
];

export const OFFERS: Offer[] = [
  { id: '1', title: 'Быстрый план', icon: '⏱️', description: 'Для тех, кто ценит время', category: 'Express' },
  { id: '2', title: 'Премиум', icon: '⭐', description: 'Лучшие автомобили и сервис', category: 'Premium' },
  { id: '3', title: 'Долгие туры', icon: '🗺️', description: 'Исследуйте всю Грузию', category: 'Travel' },
  { id: '4', title: 'Для семьи', icon: '👨‍👩‍👧‍👦', description: 'Детские кресла и простор', category: 'Family' },
  { id: '5', title: 'История', icon: '👑', description: 'Культурные памятники', category: 'Culture' },
  { id: '6', title: 'Романтика', icon: '❤️', description: 'Для влюбленных пар', category: 'Romance' }
];
