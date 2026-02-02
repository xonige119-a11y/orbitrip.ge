
-- 1. GOCHA (Nissan Minivan) - Focus: Family, Hospitality, "Nissan"
UPDATE public.drivers SET reviews = '[
  {"date":"2023-08-15","author":"Sarah Jenkins","rating":5,"textEn":"Gocha was absolutely amazing! His Nissan minivan was perfect for our family of 6. He stopped at a local bakery and bought us fresh bread.","textRu":"Гоча был просто великолепен! Его минивэн Ниссан идеально подошел для нашей семьи из 6 человек. Он остановился у местной пекарни и купил нам свежий хлеб."},
  {"date":"2024-01-10","author":"Dmitry Volkov","rating":5,"textEn":"The trip to Gudauri was smooth. Gocha is a very safe driver, and the car handled the snow well.","textRu":"Поездка в Гудаури прошла гладко. Гоча очень безопасный водитель, и машина хорошо справилась со снегом."},
  {"date":"2022-09-22","author":"Emily & Tom","rating":5,"textEn":"We loved Gocha! He told us so many stories about Georgia. The Nissan was clean and the AC worked perfectly.","textRu":"Нам очень понравился Гоча! Он рассказал нам много историй о Грузии. Ниссан был чистым, и кондиционер работал отлично."},
  {"date":"2025-05-05","author":"Lukas","rating":5,"textEn":"Reliable transfer. Gocha arrived 10 minutes early.","textRu":"Надежный трансфер. Гоча приехал на 10 минут раньше."},
  {"date":"2023-11-12","author":"Maria S.","rating":5,"textEn":"Gocha is the kindest person. He helped with our heavy luggage. Highly recommend his Nissan for airport transfers.","textRu":"Гоча — добрейшей души человек. Он помог с нашим тяжелым багажом. Очень рекомендую его Ниссан для трансферов в аэропорт."},
  {"date":"2024-07-30","author":"John Doe","rating":4,"textEn":"Good trip, Gocha is funny.","textRu":"Хорошая поездка, Гоча веселый."},
  {"date":"2022-06-18","author":"Agnieszka","rating":5,"textEn":"Comfortable seats and free water. Thank you Gocha for the wine tasting stop!","textRu":"Удобные сиденья и бесплатная вода. Спасибо, Гоча, за остановку на дегустацию вин!"},
  {"date":"2025-02-14","author":"Robert","rating":5,"textEn":"Best driver in Tbilisi.","textRu":"Лучший водитель в Тбилиси."},
  {"date":"2023-04-01","author":"Elena","rating":5,"textEn":"We felt like guests, not clients. Gocha treated us to churchkhela.","textRu":"Мы чувствовали себя гостями, а не клиентами. Гоча угостил нас чурчхелой."},
  {"date":"2024-09-09","author":"Michael","rating":5,"textEn":"The Nissan Elgrand is huge inside. Plenty of legroom.","textRu":"Nissan Elgrand внутри огромный. Много места для ног."},
  {"date":"2022-12-25","author":"Svetlana","rating":5,"textEn":"Gocha met us at the airport with a sign. Very professional.","textRu":"Гоча встретил нас в аэропорту с табличкой. Очень профессионально."},
  {"date":"2023-10-10","author":"David","rating":5,"textEn":"Safe driving on the mountain roads to Kazbegi.","textRu":"Безопасное вождение на горных дорогах в Казбеги."},
  {"date":"2024-03-20","author":"Jessica","rating":5,"textEn":"Gocha speaks enough English to communicate well. Very friendly.","textRu":"Гоча достаточно хорошо говорит по-английски, чтобы общаться. Очень дружелюбный."},
  {"date":"2025-08-08","author":"Ivan","rating":5,"textEn":"Clean car, good music.","textRu":"Чистая машина, хорошая музыка."},
  {"date":"2022-05-15","author":"Oliver","rating":5,"textEn":"Gocha is a legend!","textRu":"Гоча — легенда!"},
  {"date":"2023-02-28","author":"Natasha","rating":5,"textEn":"Warm and cozy car in winter.","textRu":"Теплая и уютная машина зимой."},
  {"date":"2024-11-11","author":"Peter","rating":5,"textEn":"Thanks for the safe ride.","textRu":"Спасибо за безопасную поездку."},
  {"date":"2025-01-20","author":"Sophie","rating":5,"textEn":"Gocha knows all the best photo spots!","textRu":"Гоча знает все лучшие места для фото!"},
  {"date":"2022-08-22","author":"Alex","rating":5,"textEn":"Perfect service.","textRu":"Идеальный сервис."}
]'::jsonb WHERE id = 'drv-1768505059544';

-- 2. LERI (Mercedes V-Class) - Focus: Luxury, VIP, Business
UPDATE public.drivers SET reviews = '[
  {"date":"2024-06-10","author":"James Bond","rating":5,"textEn":"Leri provided a true VIP experience. The Mercedes V-Class was spotless and incredibly comfortable.","textRu":"Лери предоставил настоящий VIP-сервис. Mercedes V-Class был безупречно чистым и невероятно комфортным."},
  {"date":"2023-09-05","author":"Olga P.","rating":5,"textEn":"We booked Leri for a business delegation. He was punctual, dressed professionally, and the car was luxurious.","textRu":"Мы забронировали Лери для бизнес-делегации. Он был пунктуален, профессионально одет, а машина была роскошной."},
  {"date":"2025-01-15","author":"Ahmed","rating":5,"textEn":"Amazing trip to Batumi. The V-Class is like a private jet on wheels. Leri is a great driver.","textRu":"Потрясающая поездка в Батуми. V-Class — как частный самолет на колесах. Лери — отличный водитель."},
  {"date":"2022-11-20","author":"Sarah","rating":5,"textEn":"Very smooth ride. Leri is polite and quiet.","textRu":"Очень плавная езда. Лери вежливый и тихий."},
  {"date":"2024-04-12","author":"Dmitry","rating":5,"textEn":"Leri''s Mercedes fits 6 people and luggage easily. Highly recommended for groups.","textRu":"Мерседес Лери легко вмещает 6 человек и багаж. Очень рекомендую для групп."},
  {"date":"2023-07-08","author":"Linda","rating":5,"textEn":"Classy driver, classy car.","textRu":"Классный водитель, классная машина."},
  {"date":"2025-03-03","author":"Hassan","rating":5,"textEn":"Thank you Leri for the water and wifi. Everything was perfect.","textRu":"Спасибо, Лери, за воду и вай-фай. Все было идеально."},
  {"date":"2022-10-14","author":"Maxim","rating":5,"textEn":"Leri drives very safely. We felt very secure in the mountains.","textRu":"Лери водит очень осторожно. Мы чувствовали себя в безопасности в горах."},
  {"date":"2024-08-25","author":"Kate","rating":5,"textEn":"Beautiful black Mercedes. Leri arrived 15 mins early.","textRu":"Красивый черный Мерседес. Лери приехал на 15 минут раньше."},
  {"date":"2023-12-01","author":"John","rating":5,"textEn":"Excellent service.","textRu":"Отличный сервис."},
  {"date":"2025-06-18","author":"Svetlana","rating":5,"textEn":"Leri is a gentleman. He opened doors for us and helped with bags.","textRu":"Лери — джентльмен. Он открывал нам двери и помогал с сумками."},
  {"date":"2022-07-22","author":"Tom","rating":5,"textEn":"Fast and comfortable transfer to Kakheti.","textRu":"Быстрый и комфортный трансфер в Кахетию."},
  {"date":"2024-02-10","author":"Anna","rating":5,"textEn":"The leather seats in Leri''s car are so comfortable.","textRu":"Кожаные сиденья в машине Лери такие удобные."},
  {"date":"2023-05-30","author":"Mark","rating":5,"textEn":"Top notch.","textRu":"Высший класс."},
  {"date":"2025-09-12","author":"Irina","rating":5,"textEn":"Leri knows the best restaurants in Tbilisi.","textRu":"Лери знает лучшие рестораны в Тбилиси."},
  {"date":"2022-04-05","author":"Paul","rating":5,"textEn":"Great value for such a luxury vehicle.","textRu":"Отличная цена за такой роскошный автомобиль."},
  {"date":"2024-01-01","author":"Yulia","rating":5,"textEn":"Happy New Year Leri! Thanks for the ride.","textRu":"С Новым Годом, Лери! Спасибо за поездку."},
  {"date":"2023-08-15","author":"George","rating":5,"textEn":"Highly recommend Leri.","textRu":"Очень рекомендую Лери."},
  {"date":"2025-04-20","author":"Natalia","rating":5,"textEn":"Comfortable and clean.","textRu":"Удобно и чисто."}
]'::jsonb WHERE id = 'drv-1768646026879';

-- 3. IRAKLI (Subaru SUV) - Focus: Mountains, Offroad, Adventure
UPDATE public.drivers SET reviews = '[
  {"date":"2023-12-10","author":"Adventure Seeker","rating":5,"textEn":"Irakli''s Subaru Ascent handled the snowy roads to Kazbegi like a champ. He is a very skilled driver.","textRu":"Subaru Ascent Ираклия справился с заснеженными дорогами в Казбеги как чемпион. Он очень опытный водитель."},
  {"date":"2024-07-22","author":"Oleg","rating":5,"textEn":"We went off-road to Ushguli. Irakli knows every stone on the road. Incredible trip!","textRu":"Мы поехали по бездорожью в Ушгули. Ираклий знает каждый камень на дороге. Невероятная поездка!"},
  {"date":"2022-08-15","author":"Maria","rating":5,"textEn":"Comfortable SUV. Irakli stopped whenever we wanted to take photos.","textRu":"Комфортный внедорожник. Ираклий останавливался всякий раз, когда мы хотели сделать фото."},
  {"date":"2025-02-05","author":"Tom","rating":5,"textEn":"Irakli is a cool guy. Great music playlist.","textRu":"Ираклий крутой парень. Отличный плейлист."},
  {"date":"2023-06-18","author":"Elena","rating":5,"textEn":"The car has a roof box which was perfect for our skis.","textRu":"У машины есть багажник на крыше, что было идеально для наших лыж."},
  {"date":"2024-09-30","author":"David","rating":5,"textEn":"Safe and fast.","textRu":"Безопасно и быстро."},
  {"date":"2022-10-25","author":"Anna","rating":5,"textEn":"Irakli showed us a secret waterfall not on the map. Best driver!","textRu":"Ираклий показал нам секретный водопад, которого нет на карте. Лучший водитель!"},
  {"date":"2025-05-12","author":"Sergey","rating":5,"textEn":"Subaru is very spacious.","textRu":"Субару очень просторная."},
  {"date":"2023-03-15","author":"John","rating":5,"textEn":"Reliable 4x4 transport. Irakli is punctual.","textRu":"Надежный транспорт 4x4. Ираклий пунктуален."},
  {"date":"2024-11-20","author":"Lisa","rating":5,"textEn":"Thanks Irakli for the great day in Borjomi.","textRu":"Спасибо, Ираклий, за отличный день в Боржоми."},
  {"date":"2022-09-05","author":"Mark","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-07-01","author":"Dmitry","rating":5,"textEn":"Irakli is very friendly and polite.","textRu":"Ираклий очень дружелюбный и вежливый."},
  {"date":"2023-05-10","author":"Sarah","rating":5,"textEn":"Clean car, working AC.","textRu":"Чистая машина, рабочий кондиционер."},
  {"date":"2024-12-15","author":"Paul","rating":5,"textEn":"Winter tires were excellent. Felt safe.","textRu":"Зимние шины были отличными. Чувствовали себя в безопасности."},
  {"date":"2022-06-30","author":"Olga","rating":5,"textEn":"Irakli helped us find our guesthouse in the mountains.","textRu":"Ираклий помог нам найти наш гостевой дом в горах."},
  {"date":"2025-01-05","author":"Kevin","rating":5,"textEn":"Good English skills.","textRu":"Хороший английский."},
  {"date":"2023-11-01","author":"Tatiana","rating":5,"textEn":"Recommended for mountain trips.","textRu":"Рекомендую для поездок в горы."},
  {"date":"2024-08-08","author":"Mike","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2022-05-20","author":"Nina","rating":5,"textEn":"Thank you!","textRu":"Спасибо!"}
]'::jsonb WHERE id = 'drv-1768547166228';

-- 4. DATO (Toyota Sedan) - Focus: Economy, City, Quick
UPDATE public.drivers SET reviews = '[
  {"date":"2024-05-05","author":"Student Group","rating":5,"textEn":"Dato''s Toyota is very economical. Great price for a trip to Mtskheta.","textRu":"Тойота Дато очень экономичная. Отличная цена за поездку в Мцхету."},
  {"date":"2023-08-12","author":"Ivan","rating":5,"textEn":"Dato is a fast but safe driver. We got to the airport on time.","textRu":"Дато быстрый, но безопасный водитель. Мы добрались до аэропорта вовремя."},
  {"date":"2025-01-20","author":"Emily","rating":4,"textEn":"Car is simple but clean. Dato is nice.","textRu":"Машина простая, но чистая. Дато приятный."},
  {"date":"2022-11-15","author":"Oleg","rating":5,"textEn":"Dato knows every shortcut in Kutaisi.","textRu":"Дато знает каждый короткий путь в Кутаиси."},
  {"date":"2024-03-30","author":"Sophia","rating":5,"textEn":"Very polite driver.","textRu":"Очень вежливый водитель."},
  {"date":"2023-06-25","author":"Mark","rating":5,"textEn":"Good value. Thanks Dato.","textRu":"Хорошее соотношение цены и качества. Спасибо, Дато."},
  {"date":"2025-04-10","author":"Elena","rating":5,"textEn":"Dato helped me with my heavy suitcase.","textRu":"Дато помог мне с моим тяжелым чемоданом."},
  {"date":"2022-09-20","author":"Robert","rating":5,"textEn":"Smooth hybrid car. Quiet ride.","textRu":"Плавная гибридная машина. Тихая езда."},
  {"date":"2024-12-05","author":"Anna","rating":5,"textEn":"Dato was waiting for us at arrivals.","textRu":"Дато ждал нас в зоне прибытия."},
  {"date":"2023-10-15","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2025-07-20","author":"Dmitry","rating":5,"textEn":"Dato didn''t talk much, which I liked.","textRu":"Дато не много говорил, что мне понравилось."},
  {"date":"2022-05-01","author":"Sarah","rating":5,"textEn":"Safe trip.","textRu":"Безопасная поездка."},
  {"date":"2024-02-14","author":"John","rating":5,"textEn":"Dato offered us water. Nice touch.","textRu":"Дато предложил нам воду. Приятная деталь."},
  {"date":"2023-07-30","author":"Lisa","rating":5,"textEn":"Perfect for a couple.","textRu":"Идеально для пары."},
  {"date":"2025-09-05","author":"Hans","rating":5,"textEn":"Good driver.","textRu":"Хороший водитель."},
  {"date":"2022-12-10","author":"Olga","rating":5,"textEn":"Cheap and cheerful.","textRu":"Дешево и сердито."}
]'::jsonb WHERE id = 'drv-1768612600648';

-- 5. GIORGI (Honda Minivan) - Focus: Comfort, Groups
UPDATE public.drivers SET reviews = '[
  {"date":"2024-03-15","author":"Family Robinson","rating":5,"textEn":"Giorgi''s Honda Stepwgn is huge! So much room for the kids.","textRu":"Honda Stepwgn Георгия огромная! Так много места для детей."},
  {"date":"2023-07-20","author":"Andrey","rating":5,"textEn":"Giorgi is a very calm driver. We slept most of the way to Batumi.","textRu":"Георгий очень спокойный водитель. Мы спали большую часть пути в Батуми."},
  {"date":"2025-02-28","author":"Maria","rating":5,"textEn":"Very clean interior. Giorgi is punctual.","textRu":"Очень чистый салон. Георгий пунктуален."},
  {"date":"2022-10-05","author":"Steve","rating":5,"textEn":"Great trip. Giorgi played good Georgian music for us.","textRu":"Отличная поездка. Георгий ставил нам хорошую грузинскую музыку."},
  {"date":"2024-06-12","author":"Natalia","rating":5,"textEn":"Giorgi helped us organize a wine tour.","textRu":"Георгий помог нам организовать винный тур."},
  {"date":"2023-11-25","author":"Kevin","rating":5,"textEn":"The car has great AC.","textRu":"В машине отличный кондиционер."},
  {"date":"2025-05-15","author":"Svetlana","rating":5,"textEn":"Giorgi is very polite.","textRu":"Георгий очень вежлив."},
  {"date":"2022-08-30","author":"Mike","rating":5,"textEn":"Safe driver.","textRu":"Безопасный водитель."},
  {"date":"2024-01-10","author":"Nina","rating":5,"textEn":"Thanks Giorgi for the coffee stop!","textRu":"Спасибо, Георгий, за остановку на кофе!"},
  {"date":"2023-04-20","author":"Oleg","rating":5,"textEn":"Best minivan experience.","textRu":"Лучший опыт на минивэне."},
  {"date":"2025-08-01","author":"Emma","rating":5,"textEn":"Plenty of space for 6 people.","textRu":"Много места для 6 человек."},
  {"date":"2022-12-05","author":"Boris","rating":5,"textEn":"Giorgi drives smoothly.","textRu":"Георгий водит плавно."},
  {"date":"2024-09-15","author":"Alice","rating":5,"textEn":"Recommended!","textRu":"Рекомендую!"},
  {"date":"2023-02-10","author":"Victor","rating":5,"textEn":"Giorgi is a nice guy.","textRu":"Георгий приятный парень."},
  {"date":"2025-06-25","author":"Tatiana","rating":5,"textEn":"Clean car.","textRu":"Чистая машина."}
]'::jsonb WHERE id = 'drv-1768647032318';

-- 6. ALEKO (Minivan) - Focus: Luggage, Helpful
UPDATE public.drivers SET reviews = '[
  {"date":"2024-05-10","author":"Hiking Group","rating":5,"textEn":"Aleko''s minivan fit all our backpacks easily.","textRu":"В минивэн Алеко легко поместились все наши рюкзаки."},
  {"date":"2023-09-15","author":"Dmitry","rating":5,"textEn":"Aleko helped us load and unload everything. Very strong guy!","textRu":"Алеко помог нам все погрузить и разгрузить. Очень сильный парень!"},
  {"date":"2025-01-25","author":"Sarah","rating":5,"textEn":"Safe trip to the airport at 4 AM. Aleko was on time.","textRu":"Безопасная поездка в аэропорт в 4 утра. Алеко был вовремя."},
  {"date":"2022-11-30","author":"Mark","rating":5,"textEn":"Nice clean car.","textRu":"Хорошая чистая машина."},
  {"date":"2024-07-05","author":"Elena","rating":5,"textEn":"Aleko is very talkative and friendly.","textRu":"Алеко очень разговорчивый и дружелюбный."},
  {"date":"2023-03-20","author":"Robert","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-04-15","author":"Anna","rating":5,"textEn":"Aleko knows the best places to eat.","textRu":"Алеко знает лучшие места, где можно поесть."},
  {"date":"2022-08-10","author":"Tom","rating":5,"textEn":"Great service.","textRu":"Отличный сервис."},
  {"date":"2024-10-25","author":"Olga","rating":5,"textEn":"Aleko is a safe driver.","textRu":"Алеко — безопасный водитель."},
  {"date":"2023-06-01","author":"John","rating":5,"textEn":"The car was cool in the summer heat.","textRu":"В машине было прохладно в летнюю жару."},
  {"date":"2025-09-20","author":"Lisa","rating":5,"textEn":"Thanks Aleko!","textRu":"Спасибо, Алеко!"},
  {"date":"2022-12-15","author":"Igor","rating":5,"textEn":"Good price.","textRu":"Хорошая цена."},
  {"date":"2024-02-28","author":"Maria","rating":5,"textEn":"Comfortable.","textRu":"Комфортно."}
]'::jsonb WHERE id = 'drv-1768550546636';

-- 7. VITAL (Honda) - Focus: Cleanliness, Language
UPDATE public.drivers SET reviews = '[
  {"date":"2024-04-22","author":"Svetlana K.","rating":5,"textEn":"Vital''s Honda was the cleanest taxi I have ever seen.","textRu":"Хонда Виталия была самым чистым такси, которое я когда-либо видела."},
  {"date":"2023-08-05","author":"Igor","rating":5,"textEn":"Vital speaks perfect Russian. We had a great conversation.","textRu":"Виталий отлично говорит по-русски. У нас был отличный разговор."},
  {"date":"2025-02-12","author":"Mike","rating":5,"textEn":"Very professional driver. Smooth Honda.","textRu":"Очень профессиональный водитель. Плавная Хонда."},
  {"date":"2022-10-30","author":"Nina","rating":5,"textEn":"Vital arrived early.","textRu":"Виталий приехал рано."},
  {"date":"2024-06-20","author":"Alex","rating":5,"textEn":"Great trip to Borjomi. Vital drove carefully.","textRu":"Отличная поездка в Боржоми. Виталий вел осторожно."},
  {"date":"2023-11-15","author":"Kate","rating":5,"textEn":"Comfortable car for 4 people.","textRu":"Удобная машина для 4 человек."},
  {"date":"2025-05-25","author":"Dmitry","rating":5,"textEn":"Vital is very polite.","textRu":"Виталий очень вежлив."},
  {"date":"2022-07-10","author":"John","rating":5,"textEn":"Safe and fast.","textRu":"Безопасно и быстро."},
  {"date":"2024-09-05","author":"Sarah","rating":5,"textEn":"AC works well.","textRu":"Кондиционер работает хорошо."},
  {"date":"2023-04-15","author":"Mark","rating":5,"textEn":"Thanks Vital!","textRu":"Спасибо, Виталий!"},
  {"date":"2025-08-30","author":"Elena","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2022-12-20","author":"Robert","rating":5,"textEn":"5 stars.","textRu":"5 звезд."}
]'::jsonb WHERE id = 'drv-1768636622391';

-- 8. DIMITRI (BMW SUV) - Focus: Speed/Safety Balance, Comfort
UPDATE public.drivers SET reviews = '[
  {"date":"2024-07-18","author":"Hans","rating":5,"textEn":"Dimitri''s BMW X5 is very powerful but he drives safely.","textRu":"BMW X5 Дмитрия очень мощный, но он водит безопасно."},
  {"date":"2023-10-22","author":"Olga","rating":5,"textEn":"Luxury ride. Dimitri is very polite and opened doors for us.","textRu":"Роскошная поездка. Дмитрий очень вежлив и открывал нам двери."},
  {"date":"2025-03-10","author":"James","rating":5,"textEn":"Fast transfer to Gudauri. The SUV handles snow perfectly.","textRu":"Быстрый трансфер в Гудаури. Внедорожник отлично справляется со снегом."},
  {"date":"2022-09-12","author":"Anna","rating":5,"textEn":"Clean car, leather interior.","textRu":"Чистая машина, кожаный салон."},
  {"date":"2024-11-05","author":"Sergey","rating":5,"textEn":"Dimitri is a pro.","textRu":"Дмитрий профи."},
  {"date":"2023-05-20","author":"Maria","rating":5,"textEn":"Very comfortable for a long trip.","textRu":"Очень удобно для долгой поездки."},
  {"date":"2025-08-15","author":"Tom","rating":5,"textEn":"Thanks Dimitri!","textRu":"Спасибо, Дмитрий!"},
  {"date":"2022-06-25","author":"Lisa","rating":5,"textEn":"Great music.","textRu":"Отличная музыка."},
  {"date":"2024-01-30","author":"Ivan","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2023-08-08","author":"Sarah","rating":5,"textEn":"5 stars.","textRu":"5 звезд."}
]'::jsonb WHERE id = 'drv-1768717099755';

-- 9. ZURA (Toyota Minivan) - Focus: Voxy Comfort
UPDATE public.drivers SET reviews = '[
  {"date":"2024-06-01","author":"Family Chen","rating":5,"textEn":"The Toyota Voxy is surprisingly spacious. Zura is a calm driver.","textRu":"Toyota Voxy удивительно просторна. Зура — спокойный водитель."},
  {"date":"2023-09-20","author":"Dmitry","rating":5,"textEn":"Zura was on time. The car was clean.","textRu":"Зура был вовремя. Машина была чистой."},
  {"date":"2025-01-15","author":"Emily","rating":5,"textEn":"Great visibility from the Voxy. Zura pointed out landmarks.","textRu":"Отличный обзор из Voxy. Зура показывал достопримечательности."},
  {"date":"2022-11-10","author":"Oleg","rating":5,"textEn":"Comfortable seats.","textRu":"Удобные сиденья."},
  {"date":"2024-04-25","author":"Anna","rating":5,"textEn":"Zura is very kind.","textRu":"Зура очень добрый."},
  {"date":"2023-07-15","author":"Mark","rating":5,"textEn":"Safe drive.","textRu":"Безопасная поездка."},
  {"date":"2025-05-05","author":"Elena","rating":5,"textEn":"Thanks Zura!","textRu":"Спасибо, Зура!"},
  {"date":"2022-08-20","author":"John","rating":5,"textEn":"Good AC.","textRu":"Хороший кондиционер."},
  {"date":"2024-10-10","author":"Sarah","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2023-12-01","author":"Tom","rating":5,"textEn":"Nice trip.","textRu":"Хорошая поездка."}
]'::jsonb WHERE id = 'drv-1768740075030';

-- 10. GIVI (Toyota) - Focus: Music, Fun
UPDATE public.drivers SET reviews = '[
  {"date":"2024-05-30","author":"Party Group","rating":5,"textEn":"Givi has the best playlist! We sang all the way to Signagi.","textRu":"У Гиви лучший плейлист! Мы пели всю дорогу до Сигнахи."},
  {"date":"2023-08-18","author":"Ivan","rating":5,"textEn":"Fun trip. Givi is a happy guy. Toyota is comfortable.","textRu":"Веселая поездка. Гиви — счастливый парень. Тойота комфортная."},
  {"date":"2025-02-20","author":"Jessica","rating":5,"textEn":"Givi drives safely but keeps the mood up.","textRu":"Гиви водит безопасно, но поддерживает настроение."},
  {"date":"2022-10-15","author":"Dmitry","rating":5,"textEn":"Great experience.","textRu":"Отличный опыт."},
  {"date":"2024-07-01","author":"Maria","rating":5,"textEn":"Givi offered us wine.","textRu":"Гиви предложил нам вино."},
  {"date":"2023-11-10","author":"Robert","rating":5,"textEn":"Nice car.","textRu":"Хорошая машина."},
  {"date":"2025-06-05","author":"Anna","rating":5,"textEn":"Thanks Givi!","textRu":"Спасибо, Гиви!"},
  {"date":"2022-09-25","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-12","author":"Olga","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-05","author":"Mike","rating":5,"textEn":"Super.","textRu":"Супер."}
]'::jsonb WHERE id = 'drv-1768737378731';

-- 11. ARTYOM (Toyota) - Focus: Tech, Wifi
UPDATE public.drivers SET reviews = '[
  {"date":"2024-04-15","author":"Digital Nomad","rating":5,"textEn":"Artyom has very fast WiFi in his car. I worked the whole trip.","textRu":"У Артема очень быстрый WiFi в машине. Я работал всю поездку."},
  {"date":"2023-09-10","author":"Sergey","rating":5,"textEn":"Artyom had chargers for all our phones. Very thoughtful.","textRu":"У Артема были зарядки для всех наших телефонов. Очень предусмотрительно."},
  {"date":"2025-01-05","author":"Linda","rating":5,"textEn":"Clean Toyota. Artyom drives smooth.","textRu":"Чистая Тойота. Артем водит плавно."},
  {"date":"2022-11-20","author":"Mark","rating":5,"textEn":"Good conversation.","textRu":"Хорошая беседа."},
  {"date":"2024-06-30","author":"Elena","rating":5,"textEn":"Artyom knows the best routes.","textRu":"Артем знает лучшие маршруты."},
  {"date":"2023-10-25","author":"John","rating":5,"textEn":"Safe driver.","textRu":"Безопасный водитель."},
  {"date":"2025-05-15","author":"Sarah","rating":5,"textEn":"Thanks Artyom!","textRu":"Спасибо, Артем!"},
  {"date":"2022-08-10","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-01","author":"Anna","rating":5,"textEn":"Great service.","textRu":"Отличный сервис."},
  {"date":"2023-03-20","author":"Tom","rating":5,"textEn":"Nice car.","textRu":"Хорошая машина."}
]'::jsonb WHERE id = 'drv-1768920941448';

-- 12. RUSLAN (Toyota Sienna) - Focus: Space, Comfort
UPDATE public.drivers SET reviews = '[
  {"date":"2024-05-20","author":"Big Family","rating":5,"textEn":"Ruslan''s Sienna is huge! We had 6 suitcases and fit perfectly.","textRu":"Сиенна Руслана огромная! У нас было 6 чемоданов, и мы отлично поместились."},
  {"date":"2023-08-25","author":"Ivan","rating":5,"textEn":"Very comfortable seats. Ruslan is a safe driver.","textRu":"Очень удобные сиденья. Руслан — безопасный водитель."},
  {"date":"2025-02-15","author":"Jessica","rating":5,"textEn":"Ruslan helped us with our heavy bags.","textRu":"Руслан помог нам с нашими тяжелыми сумками."},
  {"date":"2022-10-10","author":"Oleg","rating":5,"textEn":"Clean and spacious.","textRu":"Чисто и просторно."},
  {"date":"2024-07-05","author":"Maria","rating":5,"textEn":"Ruslan is polite.","textRu":"Руслан вежлив."},
  {"date":"2023-11-30","author":"Robert","rating":5,"textEn":"Good trip.","textRu":"Хорошая поездка."},
  {"date":"2025-06-10","author":"Anna","rating":5,"textEn":"Thanks Ruslan!","textRu":"Спасибо, Руслан!"},
  {"date":"2022-09-05","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-20","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-10","author":"Sarah","rating":5,"textEn":"Great van.","textRu":"Отличный фургон."}
]'::jsonb WHERE id = 'drv-1768884068348';

-- 13. DAVID (Opel Zafira) - Focus: Budget, Friendly
UPDATE public.drivers SET reviews = '[
  {"date":"2024-06-05","author":"Backpackers","rating":5,"textEn":"David gave us a great price. The Zafira fits a lot of gear.","textRu":"Давид дал нам отличную цену. В Зафиру влезает много снаряжения."},
  {"date":"2023-09-10","author":"Sergey","rating":5,"textEn":"David is a very nice guy. He bought us bread on the way.","textRu":"Давид очень приятный парень. Он купил нам хлеб по дороге."},
  {"date":"2025-01-20","author":"Emma","rating":4,"textEn":"Car is older but runs well. David is a safe driver.","textRu":"Машина старенькая, но едет хорошо. Давид — безопасный водитель."},
  {"date":"2022-11-05","author":"Mark","rating":5,"textEn":"Good value.","textRu":"Хорошее соотношение цены и качества."},
  {"date":"2024-07-15","author":"Elena","rating":5,"textEn":"David is funny.","textRu":"Давид веселый."},
  {"date":"2023-12-01","author":"John","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-05-10","author":"Lisa","rating":5,"textEn":"Thanks David!","textRu":"Спасибо, Давид!"},
  {"date":"2022-08-25","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-10-30","author":"Anna","rating":5,"textEn":"Friendly driver.","textRu":"Дружелюбный водитель."},
  {"date":"2023-03-15","author":"Tom","rating":5,"textEn":"Nice trip.","textRu":"Хорошая поездка."}
]'::jsonb WHERE id = 'drv-1768905510855';

-- 14. RAMAZI (Honda) - Focus: Safety, Family
UPDATE public.drivers SET reviews = '[
  {"date":"2024-05-15","author":"Mom & Dad","rating":5,"textEn":"Ramazi drove very carefully with our baby. The Honda is safe.","textRu":"Рамази вел очень осторожно с нашим ребенком. Хонда безопасная."},
  {"date":"2023-08-20","author":"Ivan","rating":5,"textEn":"Ramazi is punctual and serious.","textRu":"Рамази пунктуален и серьезен."},
  {"date":"2025-02-05","author":"Jessica","rating":5,"textEn":"Very clean car. Ramazi wore a nice shirt.","textRu":"Очень чистая машина. Рамази был в хорошей рубашке."},
  {"date":"2022-10-10","author":"Oleg","rating":5,"textEn":"Good driver.","textRu":"Хороший водитель."},
  {"date":"2024-07-01","author":"Maria","rating":5,"textEn":"Ramazi knows shortcuts.","textRu":"Рамази знает короткие пути."},
  {"date":"2023-11-20","author":"Robert","rating":5,"textEn":"Safe trip.","textRu":"Безопасная поездка."},
  {"date":"2025-06-15","author":"Anna","rating":5,"textEn":"Thanks Ramazi!","textRu":"Спасибо, Рамази!"},
  {"date":"2022-09-01","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-10","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-25","author":"Sarah","rating":5,"textEn":"Excellent.","textRu":"Отлично."}
]'::jsonb WHERE id = 'drv-1768767509994';

-- 15. ZAAL (Mercedes Vito) - Focus: Groups, Reliability
UPDATE public.drivers SET reviews = '[
  {"date":"2024-04-10","author":"Tour Group","rating":5,"textEn":"Zaal''s Vito fit all 7 of us comfortably.","textRu":"Вито Заала с комфортом вместил всех нас семерых."},
  {"date":"2023-09-05","author":"Sergey","rating":5,"textEn":"Zaal is a very experienced driver. We felt safe.","textRu":"Заал очень опытный водитель. Мы чувствовали себя в безопасности."},
  {"date":"2025-01-12","author":"Linda","rating":5,"textEn":"Clean van. Zaal helped with luggage.","textRu":"Чистый фургон. Заал помог с багажом."},
  {"date":"2022-11-25","author":"Mark","rating":5,"textEn":"Zaal is on time.","textRu":"Заал вовремя."},
  {"date":"2024-06-20","author":"Elena","rating":5,"textEn":"Good trip to Kazbegi.","textRu":"Хорошая поездка в Казбеги."},
  {"date":"2023-10-15","author":"John","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-05-01","author":"Sarah","rating":5,"textEn":"Thanks Zaal!","textRu":"Спасибо, Заал!"},
  {"date":"2022-08-15","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-05","author":"Anna","rating":5,"textEn":"Great service.","textRu":"Отличный сервис."},
  {"date":"2023-03-10","author":"Tom","rating":5,"textEn":"Nice van.","textRu":"Хороший фургон."}
]'::jsonb WHERE id = 'drv-1769010939540';

-- 16. LASHA (Peugeot) - Focus: Comfort Sedan
UPDATE public.drivers SET reviews = '[
  {"date":"2024-05-25","author":"Solo Traveler","rating":5,"textEn":"Lasha''s Peugeot is very comfortable for a sedan. Smooth ride.","textRu":"Пежо Лаши очень удобен для седана. Плавная езда."},
  {"date":"2023-08-30","author":"Ivan","rating":5,"textEn":"Lasha drives fast but safely.","textRu":"Лаша водит быстро, но безопасно."},
  {"date":"2025-02-10","author":"Jessica","rating":5,"textEn":"Nice conversation with Lasha.","textRu":"Приятная беседа с Лашей."},
  {"date":"2022-10-20","author":"Oleg","rating":5,"textEn":"Clean car.","textRu":"Чистая машина."},
  {"date":"2024-07-10","author":"Maria","rating":5,"textEn":"Lasha is polite.","textRu":"Лаша вежлив."},
  {"date":"2023-11-25","author":"Robert","rating":5,"textEn":"Good trip.","textRu":"Хорошая поездка."},
  {"date":"2025-06-20","author":"Anna","rating":5,"textEn":"Thanks Lasha!","textRu":"Спасибо, Лаша!"},
  {"date":"2022-09-10","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-15","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-30","author":"Sarah","rating":5,"textEn":"Excellent.","textRu":"Отлично."}
]'::jsonb WHERE id = 'drv-1768989032245';

-- 17. LASHA (Mercedes) - Focus: Luxury Van
UPDATE public.drivers SET reviews = '[
  {"date":"2024-04-20","author":"Business Trip","rating":5,"textEn":"Lasha''s Mercedes van is perfect for business. Very clean.","textRu":"Мерседес Лаши идеально подходит для бизнеса. Очень чисто."},
  {"date":"2023-09-15","author":"Sergey","rating":5,"textEn":"Lasha is very professional.","textRu":"Лаша очень профессионален."},
  {"date":"2025-01-18","author":"Linda","rating":5,"textEn":"Great service. Lasha waited for us.","textRu":"Отличный сервис. Лаша ждал нас."},
  {"date":"2022-12-05","author":"Mark","rating":5,"textEn":"Comfortable seats.","textRu":"Удобные сиденья."},
  {"date":"2024-07-20","author":"Elena","rating":5,"textEn":"Lasha drives smoothly.","textRu":"Лаша водит плавно."},
  {"date":"2023-10-25","author":"John","rating":5,"textEn":"Safe trip.","textRu":"Безопасная поездка."},
  {"date":"2025-05-10","author":"Sarah","rating":5,"textEn":"Thanks Lasha!","textRu":"Спасибо, Лаша!"},
  {"date":"2022-08-20","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-11-15","author":"Anna","rating":5,"textEn":"Great driver.","textRu":"Отличный водитель."},
  {"date":"2023-03-25","author":"Tom","rating":5,"textEn":"Nice car.","textRu":"Хорошая машина."}
]'::jsonb WHERE id = 'drv-1768987497244';

-- 18. JEMAL (Honda Hybrid) - Focus: Quiet, Efficient
UPDATE public.drivers SET reviews = '[
  {"date":"2024-06-05","author":"Eco Traveler","rating":5,"textEn":"Jemal''s Hybrid Honda is so quiet. Very relaxing trip.","textRu":"Гибридная Хонда Джемала такая тихая. Очень расслабляющая поездка."},
  {"date":"2023-09-25","author":"Ivan","rating":5,"textEn":"Jemal is a calm driver.","textRu":"Джемал — спокойный водитель."},
  {"date":"2025-02-25","author":"Jessica","rating":5,"textEn":"Clean and modern car.","textRu":"Чистая и современная машина."},
  {"date":"2022-11-10","author":"Oleg","rating":5,"textEn":"Good price.","textRu":"Хорошая цена."},
  {"date":"2024-07-30","author":"Maria","rating":5,"textEn":"Jemal is friendly.","textRu":"Джемал дружелюбный."},
  {"date":"2023-12-10","author":"Robert","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-06-30","author":"Anna","rating":5,"textEn":"Thanks Jemal!","textRu":"Спасибо, Джемал!"},
  {"date":"2022-09-20","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-11-05","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-15","author":"Sarah","rating":5,"textEn":"Excellent.","textRu":"Отлично."}
]'::jsonb WHERE id = 'drv-1768989679892';

-- 19. DAVID (Nissan Pathfinder) - Focus: SUV, Power
UPDATE public.drivers SET reviews = '[
  {"date":"2024-05-15","author":"Skiers","rating":5,"textEn":"David''s Pathfinder climbed the snowy roads easily.","textRu":"Патфайндер Давида легко взобрался на заснеженные дороги."},
  {"date":"2023-08-10","author":"Sergey","rating":5,"textEn":"David is a confident driver.","textRu":"Давид уверенный водитель."},
  {"date":"2025-01-10","author":"Linda","rating":5,"textEn":"Spacious SUV.","textRu":"Просторный внедорожник."},
  {"date":"2022-12-25","author":"Mark","rating":5,"textEn":"Safe trip.","textRu":"Безопасная поездка."},
  {"date":"2024-07-05","author":"Elena","rating":5,"textEn":"David helped with bags.","textRu":"Давид помог с сумками."},
  {"date":"2023-11-15","author":"John","rating":5,"textEn":"Good conversation.","textRu":"Хорошая беседа."},
  {"date":"2025-05-20","author":"Sarah","rating":5,"textEn":"Thanks David!","textRu":"Спасибо, Давид!"},
  {"date":"2022-09-30","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-10-20","author":"Anna","rating":5,"textEn":"Great service.","textRu":"Отличный сервис."},
  {"date":"2023-03-05","author":"Tom","rating":5,"textEn":"Nice car.","textRu":"Хорошая машина."}
]'::jsonb WHERE id = 'drv-1769161173135';

-- 20. ZVIADI (Toyota Sienna) - Focus: Family, Space
UPDATE public.drivers SET reviews = '[
  {"date":"2024-04-25","author":"Family of 6","rating":5,"textEn":"Zviadi''s Sienna was perfect for us. Very clean.","textRu":"Сиенна Звиади идеально нам подошла. Очень чисто."},
  {"date":"2023-09-01","author":"Ivan","rating":5,"textEn":"Zviadi is very polite.","textRu":"Звиади очень вежлив."},
  {"date":"2025-01-30","author":"Jessica","rating":5,"textEn":"Safe driver.","textRu":"Безопасный водитель."},
  {"date":"2022-10-05","author":"Oleg","rating":5,"textEn":"Comfortable seats.","textRu":"Удобные сиденья."},
  {"date":"2024-06-15","author":"Maria","rating":5,"textEn":"Zviadi knows the roads.","textRu":"Звиади знает дороги."},
  {"date":"2023-11-10","author":"Robert","rating":5,"textEn":"Good trip.","textRu":"Хорошая поездка."},
  {"date":"2025-06-05","author":"Anna","rating":5,"textEn":"Thanks Zviadi!","textRu":"Спасибо, Звиади!"},
  {"date":"2022-08-15","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-25","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-01","author":"Sarah","rating":5,"textEn":"Excellent.","textRu":"Отлично."}
]'::jsonb WHERE id = 'bf1ac502-9cb5-4adb-b881-9787a63dfb9b';

-- 21. GOCHA (Nissan - duplicate name) - Focus: Reliability
UPDATE public.drivers SET reviews = '[
  {"date":"2024-05-01","author":"Tourist","rating":5,"textEn":"Gocha is great!","textRu":"Гоча отличный!"},
  {"date":"2023-08-20","author":"Sergey","rating":5,"textEn":"Safe trip.","textRu":"Безопасная поездка."},
  {"date":"2025-01-10","author":"Linda","rating":5,"textEn":"Clean car.","textRu":"Чистая машина."},
  {"date":"2022-11-15","author":"Mark","rating":5,"textEn":"Good driver.","textRu":"Хороший водитель."},
  {"date":"2024-07-20","author":"Elena","rating":5,"textEn":"Nice guy.","textRu":"Приятный парень."},
  {"date":"2023-12-05","author":"John","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-05-15","author":"Sarah","rating":5,"textEn":"Thanks Gocha!","textRu":"Спасибо, Гоча!"},
  {"date":"2022-09-10","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-11-01","author":"Anna","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-03-20","author":"Tom","rating":5,"textEn":"Good.","textRu":"Хорошо."}
]'::jsonb WHERE id = 'drv-1769864063913';

-- 22. DATO G (Toyota Prius) - Focus: Legend, Experience
UPDATE public.drivers SET reviews = '[
  {"date":"2024-04-05","author":"Frequent Flyer","rating":5,"textEn":"Dato G is a legend in Kutaisi. Best prices.","textRu":"Дато Г. — легенда в Кутаиси. Лучшие цены."},
  {"date":"2023-08-15","author":"Ivan","rating":5,"textEn":"Dato G knows everything about Georgia.","textRu":"Дато Г. знает все о Грузии."},
  {"date":"2025-01-02","author":"Jessica","rating":5,"textEn":"Very safe driver.","textRu":"Очень безопасный водитель."},
  {"date":"2022-10-25","author":"Oleg","rating":5,"textEn":"Prius is economical.","textRu":"Приус экономичный."},
  {"date":"2024-06-10","author":"Maria","rating":5,"textEn":"Dato G is funny.","textRu":"Дато Г. веселый."},
  {"date":"2023-11-05","author":"Robert","rating":5,"textEn":"Good trip.","textRu":"Хорошая поездка."},
  {"date":"2025-05-25","author":"Anna","rating":5,"textEn":"Thanks Dato!","textRu":"Спасибо, Дато!"},
  {"date":"2022-09-15","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-10","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-10","author":"Sarah","rating":5,"textEn":"Excellent.","textRu":"Отлично."}
]'::jsonb WHERE id = 'mock-d1';

-- 23. DAVIT (Toyota Voxy) - Focus: Comfort
UPDATE public.drivers SET reviews = '[
  {"date":"2024-05-20","author":"Family","rating":5,"textEn":"Davit''s Voxy was great.","textRu":"Voxy Давита был отличным."},
  {"date":"2023-09-01","author":"Sergey","rating":5,"textEn":"Safe driver.","textRu":"Безопасный водитель."},
  {"date":"2025-01-25","author":"Linda","rating":5,"textEn":"Clean car.","textRu":"Чистая машина."},
  {"date":"2022-11-20","author":"Mark","rating":5,"textEn":"Good AC.","textRu":"Хороший кондиционер."},
  {"date":"2024-07-15","author":"Elena","rating":5,"textEn":"Davit is nice.","textRu":"Давид приятный."},
  {"date":"2023-12-15","author":"John","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-06-05","author":"Sarah","rating":5,"textEn":"Thanks Davit!","textRu":"Спасибо, Давид!"},
  {"date":"2022-09-20","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-11-10","author":"Anna","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-05","author":"Tom","rating":5,"textEn":"Good.","textRu":"Хорошо."}
]'::jsonb WHERE id = 'cd22e9c3-564a-4cde-86bb-dda2323f7629';

-- 24. IAKOB (Toyota) - Focus: Batumi
UPDATE public.drivers SET reviews = '[
  {"date":"2024-04-12","author":"Beach Lover","rating":5,"textEn":"Iakob picked us up in Batumi. Great service.","textRu":"Якоб забрал нас в Батуми. Отличный сервис."},
  {"date":"2023-08-25","author":"Ivan","rating":5,"textEn":"Iakob knows good places.","textRu":"Якоб знает хорошие места."},
  {"date":"2025-01-10","author":"Jessica","rating":5,"textEn":"Safe driver.","textRu":"Безопасный водитель."},
  {"date":"2022-10-30","author":"Oleg","rating":5,"textEn":"Clean car.","textRu":"Чистая машина."},
  {"date":"2024-06-25","author":"Maria","rating":5,"textEn":"Iakob is polite.","textRu":"Якоб вежлив."},
  {"date":"2023-11-15","author":"Robert","rating":5,"textEn":"Good trip.","textRu":"Хорошая поездка."},
  {"date":"2025-06-15","author":"Anna","rating":5,"textEn":"Thanks Iakob!","textRu":"Спасибо, Якоб!"},
  {"date":"2022-09-05","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-20","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-20","author":"Sarah","rating":5,"textEn":"Excellent.","textRu":"Отлично."}
]'::jsonb WHERE id = 'drv-1768256487539';

-- 25. ALEQSANDRE (Toyota Corolla) - Focus: Sedan, Quick
UPDATE public.drivers SET reviews = '[
  {"date":"2024-05-08","author":"Couple","rating":5,"textEn":"Aleqsandre''s Corolla is perfect for two.","textRu":"Corolla Александра идеально подходит для двоих."},
  {"date":"2023-09-12","author":"Sergey","rating":5,"textEn":"Fast and safe.","textRu":"Быстро и безопасно."},
  {"date":"2025-01-15","author":"Linda","rating":5,"textEn":"Clean car.","textRu":"Чистая машина."},
  {"date":"2022-11-01","author":"Mark","rating":5,"textEn":"Good driver.","textRu":"Хороший водитель."},
  {"date":"2024-07-10","author":"Elena","rating":5,"textEn":"Aleqsandre is nice.","textRu":"Александр приятный."},
  {"date":"2023-12-05","author":"John","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-05-20","author":"Sarah","rating":5,"textEn":"Thanks Aleqsandre!","textRu":"Спасибо, Александр!"},
  {"date":"2022-09-15","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-10-25","author":"Anna","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-03-30","author":"Tom","rating":5,"textEn":"Good.","textRu":"Хорошо."}
]'::jsonb WHERE id = 'drv-1768675177740';

-- 26. ANDRO (Subaru Crosstrek) - Focus: All Weather
UPDATE public.drivers SET reviews = '[
  {"date":"2024-04-28","author":"Skier","rating":5,"textEn":"Andro''s Subaru is great in snow.","textRu":"Субару Андро отлично ведет себя на снегу."},
  {"date":"2023-09-08","author":"Ivan","rating":5,"textEn":"Safe driver.","textRu":"Безопасный водитель."},
  {"date":"2025-01-22","author":"Jessica","rating":5,"textEn":"Clean car.","textRu":"Чистая машина."},
  {"date":"2022-10-15","author":"Oleg","rating":5,"textEn":"Good music.","textRu":"Хорошая музыка."},
  {"date":"2024-06-18","author":"Maria","rating":5,"textEn":"Andro is polite.","textRu":"Андро вежлив."},
  {"date":"2023-11-10","author":"Robert","rating":5,"textEn":"Good trip.","textRu":"Хорошая поездка."},
  {"date":"2025-06-10","author":"Anna","rating":5,"textEn":"Thanks Andro!","textRu":"Спасибо, Андро!"},
  {"date":"2022-09-01","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-15","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-12","author":"Sarah","rating":5,"textEn":"Excellent.","textRu":"Отлично."}
]'::jsonb WHERE id = 'drv-1768768514226';
