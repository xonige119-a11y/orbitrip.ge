import React, { useState } from 'react';
import { Language, BlogPost } from '../types';

interface BlogListProps {
  language: Language;
  onBookRoute?: (from: string, to: string) => void;
}

const AUTHOR_NAME_EN = "Vlada Marsheva";
const AUTHOR_NAME_RU = "Влада Маршева";

const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    titleEn: 'Tbilisi to Batumi: Train vs Private Transfer',
    titleRu: 'Тбилиси — Батуми: Поезд или Частный Трансфер?',
    excerptEn: 'The distance between Tbilisi and Batumi is about 380 km. While the train is popular, it stops only at stations. A private transfer allows you to stop at Surami for "Nazuki" sweet bread, visit Prometheus Cave on the way, or simply relax.',
    excerptRu: 'Расстояние между Тбилиси и Батуми около 380 км. Хотя поезд популярен, он останавливается только на станциях. Частный трансфер позволяет остановиться в Сурами за сладким хлебом "Назуки" или посетить пещеру Прометея.',
    image: 'https://images.unsplash.com/photo-1590418606746-0188b23f6052?auto=format&fit=crop&q=80&w=800',
    date: 'July 02, 2025',
    category: 'HOW TO GET THERE',
    authorEn: AUTHOR_NAME_EN,
    authorRu: AUTHOR_NAME_RU,
    tags: ['Tbilisi', 'Batumi', 'Transfer'],
    relatedRoute: { from: 'Tbilisi', to: 'Batumi' }
  },
  {
    id: '2',
    titleEn: 'Gudauri Ski Resort: How to get there safely',
    titleRu: 'Горнолыжный курорт Гудаури: Как добраться безопасно',
    excerptEn: 'Gudauri is 120km from Tbilisi, but the Georgian Military Highway can be tricky in winter. Marshrutkas are cheap but often crowded and unsafe on snowy roads. Hiring a professional driver with a proper 4x4 vehicle ensures safety.',
    excerptRu: 'Гудаури находится в 120 км от Тбилиси, но Военно-Грузинская дорога может быть сложной зимой. Маршрутки дешевы, но часто переполнены. Наем профессионального водителя с 4x4 гарантирует безопасность.',
    image: 'https://images.unsplash.com/photo-1549525281-229202a6438b?auto=format&fit=crop&q=80&w=800',
    date: 'March 07, 2025',
    category: 'HOW TO GET THERE',
    authorEn: AUTHOR_NAME_EN,
    authorRu: AUTHOR_NAME_RU,
    tags: ['Gudauri', 'Tbilisi', 'Ski'],
    relatedRoute: { from: 'Tbilisi', to: 'Gudauri' }
  },
  {
    id: '3',
    titleEn: 'Kutaisi Airport to Batumi: Direct Transfer Guide',
    titleRu: 'Аэропорт Кутаиси — Батуми: Гид по прямому трансферу',
    excerptEn: 'Landing in Kutaisi (KUT) is a great budget option, but it is 2 hours away from the sea. Don\'t waste time haggling with taxi drivers. Book a fixed-price transfer in advance.',
    excerptRu: 'Прилет в Кутаиси (KUT) — отличный бюджетный вариант, но до моря ехать 2 часа. Не тратьте время на торговлю с таксистами. Закажите трансфер с фиксированной ценой заранее.',
    image: 'https://images.unsplash.com/photo-1574007804473-b26569eb2105?auto=format&fit=crop&q=80&w=800',
    date: 'July 18, 2025',
    category: 'HOW TO GET THERE',
    authorEn: AUTHOR_NAME_EN,
    authorRu: AUTHOR_NAME_RU,
    tags: ['Batumi', 'Kutaisi', 'Airport'],
    relatedRoute: { from: 'Kutaisi International Airport (KUT)', to: 'Batumi' }
  },
  {
    id: '4',
    titleEn: 'Sights of Georgia: 6 Beaten Paths Off the Tourist Trail',
    titleRu: 'Достопримечательности Грузии: 6 неизбитых маршрутов',
    excerptEn: 'Discover unusual sights of Georgia on the way from big cities: Vani Archeological Museum, David Gareji Desert Monasteries, Mtirala National Park, Nokalakevi Fortress, and Dashbashi Canyon.',
    excerptRu: 'Посмотреть необычные достопримечательности Грузии по пути из больших городов: Археологический музей Вани, пустынные монастыри Давид-Гареджи, нацпарк Мтирала, крепость Нокалакеви и каньон Дашбаши.',
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=800',
    date: 'July 02, 2025',
    category: 'ROUTES',
    authorEn: AUTHOR_NAME_EN,
    authorRu: AUTHOR_NAME_RU,
    tags: ['Georgia', 'Routes', 'Dashbashi']
  },
  {
    id: '5',
    titleEn: 'Tbilisi to Kazbegi: The Must-See Route',
    titleRu: 'Тбилиси — Казбеги: Обязательный маршрут',
    excerptEn: 'The road to Kazbegi is an excursion itself. You must stop at Ananuri Fortress, the Friendship Monument in Gudauri, and taste the best Khinkali in Pasanauri.',
    excerptRu: 'Дорога в Казбеги — это сама по себе экскурсия. Обязательно остановитесь у крепости Ананури, Арки Дружбы в Гудаури и попробуйте лучшие хинкали в Пасанаури.',
    image: 'https://images.unsplash.com/photo-1532297118357-e6f7902d2948?auto=format&fit=crop&q=80&w=800',
    date: 'July 15, 2025',
    category: 'ROUTES',
    authorEn: AUTHOR_NAME_EN,
    authorRu: AUTHOR_NAME_RU,
    tags: ['Tbilisi', 'Kazbegi', 'Mountains'],
    relatedRoute: { from: 'Tbilisi', to: 'Kazbegi (Stepantsminda)' }
  },
  {
    id: '6',
    titleEn: 'What to see in Signagi: City of Love',
    titleRu: 'Что посмотреть в Сигнахи: Город Любви',
    excerptEn: 'Signagi is famous for its 24/7 wedding house and Italian-style streets. It offers breathtaking views of the Alazani Valley. Perfect for a day trip from Tbilisi.',
    excerptRu: 'Сигнахи славится своим круглосуточным ЗАГСом и улочками в итальянском стиле. Отсюда открывается захватывающий вид на Алазанскую долину. Идеально для однодневной поездки.',
    image: 'https://images.unsplash.com/photo-1583313988636-58849780072b?auto=format&fit=crop&q=80&w=800',
    date: 'July 18, 2025',
    category: 'WHAT TO SEE',
    authorEn: AUTHOR_NAME_EN,
    authorRu: AUTHOR_NAME_RU,
    tags: ['Signagi', 'Kakheti', 'Wine'],
    relatedRoute: { from: 'Tbilisi', to: 'Signagi' }
  }
];

const TAGS_EN = ["How to get there", "Tbilisi", "What to see", "Kutaisi", "Batumi", "Kakheti", "Mtskheta", "Borjomi", "Signagi", "Mestia", "Zugdidi", "Attractions", "Tsalka", "Tskaltubo", "Georgia", "Gori", "Gudauri", "Svaneti", "Dashbashi"];
const TAGS_RU = ["Как добраться", "Тбилиси", "Что посмотреть", "Кутаиси", "Батуми", "Кахети", "Мцхета", "Боржоми", "Сигнахи", "Местиа", "Зугдиди", "достопримечательности", "Цалка", "Цхалтубо", "Грузия", "Гори", "Гудаури", "Сванетия", "Дашбаши"];

const BlogList: React.FC<BlogListProps> = ({ language, onBookRoute }) => {
  const [email, setEmail] = useState('');
  const tags = language === Language.EN ? TAGS_EN : TAGS_RU;
  
  const isEn = language === Language.EN;
  const featuredPost = MOCK_POSTS[0];
  const regularPosts = MOCK_POSTS.slice(1);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert(isEn ? 'Subscribed successfully!' : 'Вы успешно подписались!');
    setEmail('');
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      
      {/* --- HERO SECTION (Featured Article) --- */}
      <div className="relative h-[500px] w-full overflow-hidden group cursor-pointer">
          <div className="absolute inset-0">
              <img 
                src={featuredPost.image} 
                alt="Featured" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90"></div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto flex flex-col justify-end h-full">
              <span className="inline-block bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded mb-4 w-fit">
                  {isEn ? "Featured Story" : "Главная Тема"}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight shadow-sm max-w-3xl">
                  {isEn ? featuredPost.titleEn : featuredPost.titleRu}
              </h1>
              <p className="text-gray-300 text-lg md:text-xl line-clamp-2 max-w-2xl mb-6">
                  {isEn ? featuredPost.excerptEn : featuredPost.excerptRu}
              </p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-300">
                  <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mr-2 border border-white/30">
                          {featuredPost.authorEn?.charAt(0)}
                      </div>
                      <span>{isEn ? featuredPost.authorEn : featuredPost.authorRu}</span>
                  </div>
                  <span>{featuredPost.date}</span>
                  <span>5 min read</span>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* --- MAIN CONTENT: GRID LAYOUT --- */}
          <div className="lg:w-2/3">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 border-l-4 border-indigo-600 pl-4">
                    {isEn ? "Latest Stories" : "Последние Истории"}
                </h2>
                <div className="flex space-x-2">
                    {/* Filter buttons could go here */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {regularPosts.map(post => (
                    <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group">
                        <div className="relative h-48 overflow-hidden">
                            <img 
                                src={post.image} 
                                alt={post.titleEn} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-gray-800 shadow-sm">
                                {post.category}
                            </div>
                        </div>
                        
                        <div className="p-6 flex flex-col flex-grow">
                            <div className="text-xs text-gray-400 mb-2 flex items-center space-x-2">
                                <span>{post.date}</span>
                                <span>•</span>
                                <span>{isEn ? post.authorEn : post.authorRu}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                {isEn ? post.titleEn : post.titleRu}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow">
                                {isEn ? post.excerptEn : post.excerptRu}
                            </p>
                            
                            {/* CTA ACTION */}
                            {post.relatedRoute && (
                                <div className="mt-auto pt-4 border-t border-gray-50">
                                    <button 
                                        onClick={() => onBookRoute && onBookRoute(post.relatedRoute!.from, post.relatedRoute!.to)}
                                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-lg text-sm transition flex items-center justify-center group/btn"
                                    >
                                        <span className="mr-2">🚖</span>
                                        {isEn ? "Check Transfer Prices" : "Узнать Цены на Трансфер"}
                                        <svg className="w-4 h-4 ml-1 opacity-0 group-hover/btn:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center">
                <button className="inline-flex items-center text-gray-500 font-bold hover:text-indigo-600 transition border-b-2 border-transparent hover:border-indigo-600 pb-1">
                    {isEn ? "Load More Articles" : "Загрузить больше"}
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>
          </div>

          {/* --- RIGHT SIDEBAR (Sticky) --- */}
          <div className="lg:w-1/3 space-y-8">
             <div className="sticky top-24 space-y-8">
                
                {/* Newsletter */}
                <div className="bg-gray-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">{isEn ? "Don't miss a trip!" : "Не пропустите!"}</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            {isEn ? "Get exclusive routes and hidden gems directly to your inbox." : "Эксклюзивные маршруты и скрытые локации на вашу почту."}
                        </p>
                        <form onSubmit={handleSubscribe} className="space-y-3">
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                            <button type="submit" className="w-full bg-white text-gray-900 font-bold py-3 rounded-lg hover:bg-gray-100 transition text-sm">
                                {isEn ? "Subscribe" : "Подписаться"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Topics / Tags */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                        {isEn ? "Explore by Topic" : "Темы"}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {tags.slice(0, 15).map((tag, idx) => (
                            <span 
                                key={idx} 
                                className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition cursor-pointer"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-2">
                        {isEn ? "Ready to explore?" : "Готовы к путешествию?"}
                    </h4>
                    <p className="text-xs text-indigo-700 mb-4">
                        {isEn ? "Find a driver for your custom route now." : "Найдите водителя для вашего маршрута сейчас."}
                    </p>
                    <button className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-indigo-700 transition shadow-md">
                        {isEn ? "Plan My Trip" : "Спланировать Поездку"}
                    </button>
                </div>

             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BlogList;