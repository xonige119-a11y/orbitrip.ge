
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
    name: 'Dato G.',
    photo: 'https://picsum.photos/seed/driver1/200/200',
    car: 'Toyota Prius (Hybrid)',
    rating: 4.9,
    reviewsCount: 124,
    languages: ['Georgian', 'Russian', 'English'],
    price: 120,
    features: ['Wi-Fi', 'Child Seat', 'Water']
  },
  {
    id: '2',
    name: 'Giorgi M.',
    photo: 'https://picsum.photos/seed/driver2/200/200',
    car: 'Mercedes-Benz E-Class',
    rating: 5.0,
    reviewsCount: 89,
    languages: ['Georgian', 'English'],
    price: 180,
    features: ['Premium Leather', 'Wi-Fi', 'Climate Control']
  },
  {
    id: '3',
    name: 'Levan T.',
    photo: 'https://picsum.photos/seed/driver3/200/200',
    car: 'Mitsubishi Delica (4x4)',
    rating: 4.8,
    reviewsCount: 210,
    languages: ['Georgian', 'Russian'],
    price: 150,
    features: ['Off-road capability', 'Roof Rack', 'Water']
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
