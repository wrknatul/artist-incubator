// ============================================
// Smart Client System — 7 Archetypes + Dynamic Generation
// ============================================

export type ClientArchetype = 'dreamer' | 'micromanager' | 'scrooge' | 'ghost' | 'professional' | 'chameleon' | 'toxic';

export interface ClientTraits {
  vision_clarity: number;      // 1-10: How well they know what they want
  tech_literacy: number;       // 1-10: Technical understanding
  decision_stability: number;  // 1-10: How often they change requirements
  evaluation_honesty: number;  // 1-10: How fair their review is
  payment_discipline: number;  // 1-10: Will they pay fully and on time
  conflict_level: number;      // 1-10: How they react to problems (10=explosive)
  scope_creep: number;         // 1-10: Tendency to add "one more thing"
  responsiveness: number;      // 1-10: How fast they reply
}

export interface ClientProfile {
  archetype: ClientArchetype;
  traits: ClientTraits;
  visibleRating: number;
  ratingIsFake: boolean;
  realRatingOffset: number;
  dialogueTemplates: {
    greeting: string;
    vague_answer: string;
    scope_creep: string;
    angry: string;
    satisfied: string;
    haggle_accept: string;
    haggle_reject: string;
  };
  missingDetails: string[];
  hiddenRequirements: never[]; // deprecated, kept for compat
}



// ---- Archetype Presets ----

const ARCHETYPE_PRESETS: Record<ClientArchetype, { 
  traits: ClientTraits; 
  names: string[]; 
  avatars: string[];
  templates: ClientProfile['dialogueTemplates'];
}> = {
  dreamer: {
    traits: { vision_clarity: 2, tech_literacy: 2, decision_stability: 3, evaluation_honesty: 5, payment_discipline: 6, conflict_level: 3, scope_creep: 8, responsiveness: 7 },
    names: ['Артём Кравцов', 'Алина Седова', 'Денис Марченко'],
    avatars: ['🌈', '✨', '🦄'],
    templates: {
      greeting: 'Привет! У меня ГЕНИАЛЬНАЯ идея! Это будет как Uber, но для...',
      vague_answer: 'Ну, сделайте ВАУ-эффект! Вы же профессионалы, вы разберётесь!',
      scope_creep: 'А знаете что, давайте ещё добавим AI-чат-бота! Это же просто, да?',
      angry: 'Мне не хватает визуального вау-эффекта. Нужна яркая анимация на главной и более сочные цвета.',
      satisfied: 'ВАУ! Это даже лучше, чем в моих мечтах! 🎉',
      haggle_accept: 'Ладно, за гениальную идею не жалко доплатить!',
      haggle_reject: 'Хм, может найду кого подешевле... Хотя ладно, давайте за эту цену.',
    },
  },
  micromanager: {
    traits: { vision_clarity: 8, tech_literacy: 5, decision_stability: 7, evaluation_honesty: 7, payment_discipline: 8, conflict_level: 7, scope_creep: 3, responsiveness: 9 },
    names: ['Ольга Петрова', 'Сергей Волков', 'Наталья Киселёва'],
    avatars: ['🔍', '📐', '👁️'],
    templates: {
      greeting: 'Здравствуйте. У меня подробное ТЗ. Прошу следовать точно.',
      vague_answer: 'Кнопка должна быть #3B82F6, 12px от правого края, с тенью 2px blur.',
      scope_creep: 'Это не скоупкрип, это было в ТЗ на странице 3, пункт 2.1.4.',
      angry: 'Отступы не совпадают с ТЗ. Я писал 14px между карточками, а тут больше. Поправьте.',
      satisfied: 'Хорошо. Всё по ТЗ. Рекомендую.',
      haggle_accept: 'Хм, обосновали. Ладно, поднимем бюджет.',
      haggle_reject: 'Цена обоснована моим ТЗ. Торг неуместен.',
    },
  },
  scrooge: {
    traits: { vision_clarity: 5, tech_literacy: 4, decision_stability: 6, evaluation_honesty: 2, payment_discipline: 3, conflict_level: 6, scope_creep: 9, responsiveness: 6 },
    names: ['Геннадий Фомин', 'Ирина Лебедева', 'Павел Щербаков'],
    avatars: ['💰', '🪙', '📉'],
    templates: {
      greeting: 'Здарова! Задача простая, много не займёт. Бюджет фиксированный.',
      vague_answer: 'Ну это же просто — пара кнопок и текст. Чего там делать-то?',
      scope_creep: 'А добавь ещё форму обратной связи. Это же мелочь, 5 минут.',
      angry: 'За эти деньги я ожидал хотя бы рабочую форму заказа. Её нет — значит доплачивать не за что.',
      satisfied: 'Ну, нормально. Хотя дороговато вышло.',
      haggle_accept: '...Ладно, но только потому что сроки горят.',
      haggle_reject: 'Нет. Цена и так завышена. Другие берут дешевле.',
    },
  },
  ghost: {
    traits: { vision_clarity: 4, tech_literacy: 3, decision_stability: 5, evaluation_honesty: 6, payment_discipline: 5, conflict_level: 2, scope_creep: 3, responsiveness: 1 },
    names: ['Антон Соколов', 'Дарья Новикова', 'Максим Тихонов'],
    avatars: ['👻', '🌫️', '💤'],
    templates: {
      greeting: 'Привет! Вот задача. Ну, в общем, разберётесь. Я на связи... наверное.',
      vague_answer: '... (прочитано)',
      scope_creep: '... Ой, а я думал это само собой. Ну ладно, неважно.',
      angry: 'Хм, я думал на главной будет больше контента. И блок контактов не нашёл.',
      satisfied: 'О, нормально! Сорри что пропадал.',
      haggle_accept: '... Ок.',
      haggle_reject: '... (прочитано)',
    },
  },
  professional: {
    traits: { vision_clarity: 9, tech_literacy: 8, decision_stability: 9, evaluation_honesty: 9, payment_discipline: 9, conflict_level: 2, scope_creep: 1, responsiveness: 8 },
    names: ['Елена Романова', 'Дмитрий Козлов', 'Анна Белова'],
    avatars: ['💼', '⭐', '🎯'],
    templates: {
      greeting: 'Добрый день! Вот ТЗ с референсами. Вопросы — в чат. Дедлайн — по договору.',
      vague_answer: 'Целевая аудитория: женщины 25-35, Москва/Питер. Бренд-бук прилагаю.',
      scope_creep: 'Это вне текущего скоупа. Обсудим в следующей итерации.',
      angry: 'Есть замечания: мета-теги не заполнены, адаптив ломается на планшетах. Давайте поправим.',
      satisfied: 'Отличная работа! Всё по ТЗ, качество на высоте. Рекомендую.',
      haggle_accept: 'Ваши аргументы обоснованы. Согласен на пересмотр бюджета.',
      haggle_reject: 'Бюджет рассчитан по рыночным ставкам. Оставляем.',
    },
  },
  chameleon: {
    traits: { vision_clarity: 6, tech_literacy: 5, decision_stability: 1, evaluation_honesty: 5, payment_discipline: 6, conflict_level: 5, scope_creep: 10, responsiveness: 8 },
    names: ['Кирилл Орлов', 'Виктория Зайцева', 'Роман Ефимов'],
    avatars: ['🦎', '🎭', '🔄'],
    templates: {
      greeting: 'Привет! У меня крутая идея! Хотя подождите, я ещё думаю...',
      vague_answer: 'Я тут подумал... Давайте не так, а по-другому!',
      scope_creep: 'Забудьте что я вчера сказал! У меня новый план — всё переделываем!',
      angry: 'Помните, я просил сменить стиль на минимализм? А тут всё ещё яркие градиенты. Переделайте это.',
      satisfied: 'О, вот ЭТО — то что нужно! (пока не передумал)',
      haggle_accept: 'А давайте! Больше бюджет — больше возможностей!',
      haggle_reject: 'Не-не, бюджет такой. Но зато я не буду менять требования! (спойлер: будет)',
    },
  },
  toxic: {
    traits: { vision_clarity: 5, tech_literacy: 4, decision_stability: 6, evaluation_honesty: 2, payment_discipline: 3, conflict_level: 10, scope_creep: 6, responsiveness: 7 },
    names: ['Игорь Морозов', 'Жанна Крылова', 'Борис Андреев'],
    avatars: ['☠️', '🔥', '💢'],
    templates: {
      greeting: 'Так. Мне нужен сайт. Быстро и качественно. Надеюсь, вы компетентны.',
      vague_answer: 'Я плачу деньги — вы делаете. Что тут непонятного?',
      scope_creep: 'Добавьте ещё это. И не надо мне рассказывать про "скоуп".',
      angry: 'Дизайн выглядит устаревшим. Нужен современный стиль — чистые линии, нормальная типографика.',
      satisfied: 'Ну... сойдёт. Хотя могло быть и лучше.',
      haggle_accept: 'Тц. Ладно. Но за эти деньги — чтоб идеально!',
      haggle_reject: 'Ха! Может вам ещё ключи от квартиры дать? Цена такая.',
    },
  },
};

// ---- TZ Requirements (VISIBLE to the player!) ----

export interface TZRequirement {
  id: string;
  label: string;            // Human-readable name
  description: string;      // Detailed description for the player
  checkKeywords: string[];  // Keywords to check in HTML during review
  category: 'structure' | 'design' | 'interactive' | 'content';
}

// Requirement pools organized by category type
const STRUCTURE_REQUIREMENTS: Omit<TZRequirement, 'id'>[] = [
  { label: 'Hero-секция', description: 'Главный экран с заголовком, подзаголовком и CTA-кнопкой', checkKeywords: ['hero', 'banner', 'cta', 'главн'], category: 'structure' },
  { label: 'Блок преимуществ', description: '3-4 карточки с иконками и описанием преимуществ', checkKeywords: ['feature', 'преимущ', 'benefit', 'advantage', 'card'], category: 'structure' },
  { label: 'Секция "О нас"', description: 'Информация о компании, миссия, история', checkKeywords: ['about', 'о нас', 'о компании', 'миссия'], category: 'structure' },
  { label: 'Контактная секция', description: 'Блок с контактами: телефон, email, адрес', checkKeywords: ['contact', 'контакт', 'телефон', 'email', 'адрес'], category: 'structure' },
  { label: 'Footer с навигацией', description: 'Подвал сайта с ссылками, копирайтом и соцсетями', checkKeywords: ['footer', 'подвал', 'copyright', '©'], category: 'structure' },
  { label: 'Блок отзывов', description: 'Секция с 3-4 отзывами клиентов: фото, имя, цитата', checkKeywords: ['testimonial', 'отзыв', 'review', 'цитата', 'клиент говорит'], category: 'structure' },
  { label: 'Прайс-лист / тарифы', description: 'Таблица тарифов: 3 плана (Базовый / Стандарт / Премиум) с ценами', checkKeywords: ['pricing', 'price', 'тариф', 'план', 'стоимость', '/мес'], category: 'structure' },
  { label: 'FAQ-секция', description: 'Блок часто задаваемых вопросов: 5-6 пунктов с раскрытием', checkKeywords: ['faq', 'вопрос', 'ответ', 'часто спрашивают'], category: 'structure' },
  { label: 'Блок "Наша команда"', description: 'Карточки сотрудников: фото, имя, должность (4 человека)', checkKeywords: ['team', 'команд', 'сотрудник', 'специалист'], category: 'structure' },
  { label: 'Галерея работ', description: 'Сетка из 6-8 изображений с подписями', checkKeywords: ['gallery', 'галерея', 'портфолио', 'наши работы'], category: 'structure' },
  { label: 'Каталог товаров', description: 'Сетка карточек товаров: фото, название, цена, кнопка "В корзину"', checkKeywords: ['product', 'товар', 'catalog', 'каталог', 'корзин', 'cart'], category: 'structure' },
  { label: 'Блог / новости', description: 'Список статей с превью: заголовок, дата, краткое описание', checkKeywords: ['blog', 'блог', 'статья', 'article', 'новост'], category: 'structure' },
  { label: 'Шапка с навигацией', description: 'Фиксированный header с логотипом и меню навигации', checkKeywords: ['header', 'nav', 'navigation', 'menu', 'логотип'], category: 'structure' },
  { label: 'Секция партнёров', description: 'Логотипы партнёров / клиентов в ряд (5-8 штук)', checkKeywords: ['partner', 'партнёр', 'клиент', 'logo', 'бренд'], category: 'structure' },
  { label: 'CTA-баннер', description: 'Промо-блок с призывом к действию и яркой кнопкой', checkKeywords: ['cta', 'banner', 'призыв', 'попробовать', 'начать', 'оставить заявку'], category: 'structure' },
];

const DESIGN_REQUIREMENTS: Omit<TZRequirement, 'id'>[] = [
  { label: 'Тёмная тема', description: 'Тёмный фон (#1a1a2e или подобный), светлый текст, акцентные цвета', checkKeywords: ['dark', '#1', '#2', 'rgb(3', 'rgb(2', 'rgb(1'], category: 'design' },
  { label: 'Градиенты', description: 'Использовать градиенты в кнопках, фонах или заголовках', checkKeywords: ['gradient', 'linear-gradient', 'radial-gradient'], category: 'design' },
  { label: 'Округлые карточки', description: 'Карточки с border-radius: 16px+ и мягкими тенями', checkKeywords: ['border-radius', 'rounded', 'shadow', 'card'], category: 'design' },
  { label: 'Минималистичный стиль', description: 'Много воздуха, чистый дизайн, не более 2-3 цветов', checkKeywords: ['minimal', 'clean', 'padding', 'margin', 'gap'], category: 'design' },
  { label: 'Акцентный цвет', description: 'Яркий акцентный цвет для кнопок и важных элементов (указать какой)', checkKeywords: ['accent', 'primary', 'button', '#', 'rgb', 'hsl'], category: 'design' },
];

const INTERACTIVE_REQUIREMENTS: Omit<TZRequirement, 'id'>[] = [
  { label: 'Форма обратной связи', description: 'Форма с полями: Имя, Email, Сообщение и кнопка "Отправить"', checkKeywords: ['form', 'input', 'textarea', 'submit', 'отправить'], category: 'interactive' },
  { label: 'Мобильное бургер-меню', description: 'На мобильных — меню-гамбургер, которое открывается по клику', checkKeywords: ['burger', 'hamburger', 'mobile-menu', 'toggle', '@media'], category: 'interactive' },
  { label: 'Слайдер / карусель', description: 'Автоматический слайдер на главной: 3-5 слайдов с кнопками', checkKeywords: ['slider', 'carousel', 'слайдер', 'swipe', 'slide'], category: 'interactive' },
  { label: 'Анимации при скролле', description: 'Плавное появление элементов при прокрутке (fade-in, slide-up)', checkKeywords: ['animation', 'animate', 'transition', 'fade', 'keyframe', 'IntersectionObserver'], category: 'interactive' },
  { label: 'Таймер обратного отсчёта', description: 'Таймер до конца акции: дни, часы, минуты, секунды', checkKeywords: ['timer', 'countdown', 'таймер', 'отсчёт', 'setInterval'], category: 'interactive' },
  { label: 'Табы / переключатели', description: 'Переключение контента по вкладкам без перезагрузки', checkKeywords: ['tab', 'таб', 'переключ', 'active', 'onclick'], category: 'interactive' },
  { label: 'Фильтры каталога', description: 'Фильтрация товаров по категории и/или сортировка по цене', checkKeywords: ['filter', 'фильтр', 'сортировк', 'sort', 'категори'], category: 'interactive' },
  { label: 'Модальное окно', description: 'Всплывающее окно (попап) для заявки или подробностей', checkKeywords: ['modal', 'popup', 'dialog', 'модальн', 'попап', 'overlay'], category: 'interactive' },
];

const CONTENT_REQUIREMENTS: Omit<TZRequirement, 'id'>[] = [
  { label: 'Реальный текст (не lorem)', description: 'Весь контент должен быть по теме бизнеса, не placeholder', checkKeywords: ['lorem', 'ipsum'], category: 'content' }, // special: ABSENCE of keywords = pass
  { label: 'Иконки соцсетей', description: 'Иконки Telegram, VK, Instagram в footer', checkKeywords: ['telegram', 'instagram', 'vk', 'facebook', 'social', 'соцсет'], category: 'content' },
  { label: 'Карта проезда', description: 'Встроенная карта Google Maps или Яндекс.Карты', checkKeywords: ['map', 'карта', 'google.com/maps', 'yandex', 'iframe'], category: 'content' },
  { label: 'Видео на главной', description: 'Встроенное видео (YouTube iframe или HTML5 video)', checkKeywords: ['video', 'youtube', 'iframe', 'mp4'], category: 'content' },
  { label: 'Счётчик в цифрах', description: 'Блок "Наши достижения в цифрах": 3-4 метрики (500+ клиентов и т.д.)', checkKeywords: ['counter', 'счётчик', 'достижен', 'клиент', '+', 'цифр'], category: 'content' },
];

function generateTZRequirements(difficulty: 'easy' | 'medium' | 'hard', category: string): TZRequirement[] {
  const counts = {
    easy: { structure: 3, design: 1, interactive: 1, content: 0 },
    medium: { structure: 4, design: 1, interactive: 2, content: 1 },
    hard: { structure: 5, design: 2, interactive: 3, content: 2 },
  };

  const c = counts[difficulty];

  // Boost category-relevant requirements
  const boosts: Record<string, string[]> = {
    'Интернет-магазин': ['Каталог товаров', 'Фильтры каталога', 'Шапка с навигацией'],
    'Лендинг': ['Hero-секция', 'Форма обратной связи', 'CTA-баннер', 'Блок преимуществ'],
    'SaaS': ['Прайс-лист / тарифы', 'FAQ-секция', 'Hero-секция'],
    'Портфолио': ['Галерея работ', 'Блок "Наша команда"', 'Анимации при скролле'],
    'Блог': ['Блог / новости', 'Шапка с навигацией', 'Форма обратной связи'],
    'Корпоративный сайт': ['Блок "Наша команда"', 'Контактная секция', 'Секция партнёров'],
  };
  const boosted = new Set(boosts[category] || []);

  const pickFromPool = (pool: Omit<TZRequirement, 'id'>[], count: number) => {
    const sorted = [...pool].sort((a, b) => {
      const aB = boosted.has(a.label) ? -1 : 0;
      const bB = boosted.has(b.label) ? -1 : 0;
      return aB - bB || Math.random() - 0.5;
    });
    return sorted.slice(0, count);
  };

  const result = [
    ...pickFromPool(STRUCTURE_REQUIREMENTS, c.structure),
    ...pickFromPool(DESIGN_REQUIREMENTS, c.design),
    ...pickFromPool(INTERACTIVE_REQUIREMENTS, c.interactive),
    ...pickFromPool(CONTENT_REQUIREMENTS, c.content),
  ];

  return result.map((r, i) => ({ ...r, id: `tz_${i}_${Date.now()}` }));
}

// ---- Industries ----

export const INDUSTRIES = ['Еда', 'Финтех', 'Образование', 'Крипто', 'Здоровье', 'Мода', 'Путешествия', 'Недвижимость', 'Развлечения', 'B2B SaaS'];

export const PROJECT_TYPES = ['Лендинг', 'Интернет-магазин', 'SaaS', 'Портфолио', 'Блог', 'Корпоративный сайт'];

// Brief templates removed — full TZ is now generated via buildFullTZ()

// ---- Helpers ----

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function jitter(base: number, range: number): number {
  return clamp(base + randInt(-range, range), 1, 10);
}

// ---- Order Generation ----

export function generateClientProfile(archetype?: ClientArchetype): ClientProfile {
  const arch = archetype || pick(Object.keys(ARCHETYPE_PRESETS) as ClientArchetype[]);
  const preset = ARCHETYPE_PRESETS[arch];

  // Apply jitter to base traits
  const traits: ClientTraits = {
    vision_clarity: jitter(preset.traits.vision_clarity, 2),
    tech_literacy: jitter(preset.traits.tech_literacy, 2),
    decision_stability: jitter(preset.traits.decision_stability, 2),
    evaluation_honesty: jitter(preset.traits.evaluation_honesty, 2),
    payment_discipline: jitter(preset.traits.payment_discipline, 2),
    conflict_level: jitter(preset.traits.conflict_level, 2),
    scope_creep: jitter(preset.traits.scope_creep, 2),
    responsiveness: jitter(preset.traits.responsiveness, 2),
  };

  // Fake rating logic: 20% chance rating is inflated
  const realBase = traits.evaluation_honesty >= 7 ? randInt(35, 50) / 10 : randInt(20, 45) / 10;
  const isFake = Math.random() < 0.2;
  const fakeOffset = isFake ? randInt(5, 15) / 10 : 0;
  const visibleRating = Math.min(5, Math.round((realBase + fakeOffset) * 2) / 2);

  return {
    archetype: arch,
    traits,
    visibleRating,
    ratingIsFake: isFake,
    realRatingOffset: -fakeOffset,
    dialogueTemplates: preset.templates,
    missingDetails: [],
    hiddenRequirements: [],
  };
}

export interface GeneratedOrder {
  id: string;
  clientName: string;
  clientAvatar: string;
  title: string;
  description: string;
  budget: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  prompt: string;
  
  industry: string;
  clientProfile: ClientProfile;
  runwayAvatarId?: string;
  requirements: TZRequirement[];
}

const ORDER_TITLES: Record<string, string[]> = {
  'Лендинг': ['Лендинг для {biz}', 'Посадочная страница {biz}', 'Промо-сайт {biz}'],
  'Интернет-магазин': ['Интернет-магазин {biz}', 'Онлайн-шоп {biz}', 'E-commerce для {biz}'],
  'SaaS': ['Лендинг SaaS-продукта', 'Дашборд для {biz}', 'Платформа {biz}'],
  'Портфолио': ['Портфолио для {biz}', 'Сайт-визитка {biz}'],
  'Блог': ['Блог о {biz}', 'Медиа-портал {biz}'],
  'Корпоративный сайт': ['Корпоративный сайт {biz}', 'Бизнес-сайт {biz}'],
};

const BIZ_NAMES: Record<string, string[]> = {
  'Еда': ['кофейни', 'ресторана', 'доставки еды'],
  'Финтех': ['финтех-стартапа', 'банка', 'платёжной системы'],
  'Образование': ['онлайн-школы', 'курсов', 'репетиторов'],
  'Крипто': ['криптокошелька', 'биржи', 'DeFi-проекта'],
  'Здоровье': ['фитнес-клуба', 'клиники', 'wellness-студии'],
  'Мода': ['бренда одежды', 'бутика', 'шоурума'],
  'Путешествия': ['турагентства', 'отеля', 'авиакомпании'],
  'Недвижимость': ['агентства недвижимости', 'застройщика', 'риелтора'],
  'Развлечения': ['ивент-агентства', 'кинотеатра', 'квестов'],
  'B2B SaaS': ['CRM-системы', 'аналитики', 'HR-платформы'],
};

// generateBrief removed — using buildFullTZ instead

function generatePrompt(category: string, industry: string, bizName: string): string {
  return `Создай ${category.toLowerCase()} для ${bizName}. Тематика: ${industry}. Современный дизайн, адаптивная вёрстка, секции: герой, преимущества, о нас, контакты.`;
}

// Runway avatar UUIDs from developer portal
const RUNWAY_AVATAR_IDS: string[] = [
  'cbf35a17-be6a-40dd-adbc-9da13d04ab8a',
];

let orderCounter = 0;

export function generateOrder(forcedArchetype?: ClientArchetype): GeneratedOrder {
  const profile = generateClientProfile(forcedArchetype);
  const preset = ARCHETYPE_PRESETS[profile.archetype];
  const industry = pick(INDUSTRIES);
  const category = pick(PROJECT_TYPES);
  const bizName = pick(BIZ_NAMES[industry]);
  const titleTemplate = pick(ORDER_TITLES[category] || [`${category} для {biz}`]);
  const title = titleTemplate.replace('{biz}', bizName);

  const isScrooge = profile.archetype === 'scrooge';
  const baseBudgets = { easy: [300, 600], medium: [800, 1500], hard: [1800, 3000] };
  const diff: 'easy' | 'medium' | 'hard' = pick(['easy', 'medium', 'hard']);
  const [bMin, bMax] = baseBudgets[diff];
  let budget = randInt(bMin, bMax);
  if (isScrooge) budget = Math.round(budget * 0.7);

  const deadline: Deadline = pick(['tight', 'flexible', 'yesterday']);
  const requirements = generateTZRequirements(diff, category);

  // Build full TZ description from requirements
  const tzDescription = buildFullTZ(category, industry, bizName, requirements);

  const runwayAvatarId = RUNWAY_AVATAR_IDS.length > 0 ? pick(RUNWAY_AVATAR_IDS) : undefined;

  orderCounter++;

  return {
    id: `gen_${orderCounter}_${Date.now()}`,
    clientName: pick(preset.names),
    clientAvatar: pick(preset.avatars),
    title,
    description: tzDescription,
    budget,
    difficulty: diff,
    category,
    prompt: generatePrompt(category, industry, bizName),
    deadline,
    industry,
    clientProfile: profile,
    runwayAvatarId,
    requirements,
  };
}

function buildFullTZ(category: string, industry: string, bizName: string, requirements: TZRequirement[]): string {
  const structureReqs = requirements.filter(r => r.category === 'structure');
  const designReqs = requirements.filter(r => r.category === 'design');
  const interactiveReqs = requirements.filter(r => r.category === 'interactive');
  const contentReqs = requirements.filter(r => r.category === 'content');

  let tz = `${category} для ${bizName} (${industry})\n\n`;
  
  if (structureReqs.length > 0) {
    tz += `📋 Структура:\n`;
    structureReqs.forEach(r => { tz += `• ${r.label} — ${r.description}\n`; });
    tz += '\n';
  }
  if (designReqs.length > 0) {
    tz += `🎨 Дизайн:\n`;
    designReqs.forEach(r => { tz += `• ${r.label} — ${r.description}\n`; });
    tz += '\n';
  }
  if (interactiveReqs.length > 0) {
    tz += `⚡ Интерактив:\n`;
    interactiveReqs.forEach(r => { tz += `• ${r.label} — ${r.description}\n`; });
    tz += '\n';
  }
  if (contentReqs.length > 0) {
    tz += `📝 Контент:\n`;
    contentReqs.forEach(r => { tz += `• ${r.label} — ${r.description}\n`; });
  }

  return tz.trim();
}

export function generateOrderPool(count: number = 10): GeneratedOrder[] {
  const archetypes: ClientArchetype[] = ['dreamer', 'micromanager', 'scrooge', 'ghost', 'professional', 'chameleon', 'toxic'];
  const orders: GeneratedOrder[] = [];

  // First pass: one of each archetype
  const shuffled = [...archetypes].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    orders.push(generateOrder(shuffled[i]));
  }

  // Fill remaining with random archetypes
  while (orders.length < count) {
    orders.push(generateOrder());
  }

  return orders.sort(() => Math.random() - 0.5);
}

// ---- Review Calculation ----

export interface ReviewResult {
  rating: number;       // 1-5 stars
  text: string;
  earned: number;       // money earned (after honesty multiplier on budget)
  xp: number;
  multiplier: number;   // payment multiplier
}

const REVIEW_TEMPLATES: Record<ClientArchetype, { good: string[]; bad: string[] }> = {
  dreamer: {
    good: ['Ребята просто волшебники! Сделали даже лучше, чем я представлял! ✨', 'ВАУ! Это космос! Именно то, что было в моей голове!'],
    bad: ['Мне не хватает вау-эффекта на главной. Хотелось бы более яркий hero-блок и анимации при скролле.', 'Идея хорошая, но дизайн слишком сдержанный для моей ниши. Нужно больше визуала и интерактива.'],
  },
  micromanager: {
    good: ['Профессионалы. Чётко следовали ТЗ. Рекомендую.', 'Все пункты ТЗ выполнены. Качественная работа.'],
    bad: ['Шрифт в заголовках не совпадает с макетом, и отступы между секциями неравномерные. Нужно выровнять.', 'Форма обратной связи не валидирует email, а кнопка CTA слишком маленькая на мобильной версии.'],
  },
  scrooge: {
    good: ['Хорошо сделали, но дороговато 💸', 'Нормально. Хотя за эти деньги ожидал большего.'],
    bad: ['За эту сумму хотелось бы видеть хотя бы рабочую форму заказа и нормальный каталог.', 'Качество среднее — нет фильтров в каталоге, карточки товаров без цен.'],
  },
  ghost: {
    good: ['О, нормально получилось! Сорри что пропадал 😅', 'Ого, а неплохо! Спасибо за терпение.'],
    bad: ['Хм, я ожидал что будет больше контента на главной. И секция "О нас" пустовата.', 'Вроде неплохо, но не хватает контактной формы и карты проезда.'],
  },
  professional: {
    good: ['Отличная команда, соблюдали дедлайны, качество на высоте.', 'Профессиональный подход. Буду обращаться снова.'],
    bad: ['SEO-метатеги отсутствуют, alt-тексты у изображений пустые. Это критично для продвижения.', 'Адаптив ломается на ширине 768px — меню накладывается на контент. Нужно поправить.'],
  },
  chameleon: {
    good: ['Вот ЭТО — то что нужно! Наконец-то поняли мою идею!', 'Круто! Хотя завтра я могу передумать 😄'],
    bad: ['Помните, я потом просил сменить стиль на минимализм? А тут всё ещё градиенты и тени.', 'Я же говорил — убрать слайдер и добавить видео-фон. Это не учтено.'],
  },
  toxic: {
    good: ['Ну... сойдёт. Хотя могло быть лучше.', 'Нормально. Не ожидал, если честно.'],
    bad: ['Дизайн выглядит устаревшим — нужен современный стиль, а не шаблон из 2015. Переделывайте.', 'Половина ссылок ведут в никуда, секция с ценами вообще не заполнена. Это несерьёзно.'],
  },
};

export function calculateReview(
  profile: ClientProfile,
  budget: number,
  negotiatedBudget: number | null,
  consultationCount: number,
  previewRating: number | null,
  finalAiRating: number | null = null,
): ReviewResult {
  const { traits, archetype } = profile;

  let baseScore: number;

  if (finalAiRating !== null) {
    // AI reviewed the site — PRIMARY signal (80% weight)
    // AI rating 1 → score 10, rating 2 → 25, rating 3 → 50, rating 4 → 70, rating 5 → 90
    const aiScoreMap: Record<number, number> = { 1: 10, 2: 25, 3: 50, 4: 70, 5: 90 };
    const aiScore = aiScoreMap[Math.round(clamp(finalAiRating, 1, 5))] || (finalAiRating / 5) * 80 + 10;

    // Communication bonus (small — max +10)
    const consultBonus = Math.min(consultationCount, 5) * 2;

    // Preview bonus — did they show intermediate results?
    const previewBonus = previewRating !== null ? 5 : 0;

    baseScore = aiScore + consultBonus + previewBonus;
  } else {
    // Fallback: no AI review
    baseScore = 20;
    const consultBonus = Math.min(consultationCount, 5) * 4;
    baseScore += consultBonus;

    if (previewRating !== null) {
      baseScore += 10;
      baseScore += (previewRating / 5) * 35;
    } else {
      if (archetype === 'micromanager') baseScore -= 10;
      if (archetype === 'professional') baseScore -= 5;
    }

    if (consultationCount === 0) baseScore -= 15;
  }

  // Missing details penalty
  const missedDetails = Math.max(0, profile.missingDetails.length - Math.floor(consultationCount / 2));
  baseScore -= missedDetails * 3;

  baseScore = clamp(baseScore, 5, 95);

  // Honesty multiplier — distorts the score based on client honesty
  let honestyMul: number;
  if (traits.evaluation_honesty >= 9) honestyMul = 1.0;
  else if (traits.evaluation_honesty >= 6) honestyMul = 0.9 + Math.random() * 0.2;
  else if (traits.evaluation_honesty >= 3) honestyMul = 0.7 + Math.random() * 0.3;
  else honestyMul = 0.5 + Math.random() * 0.3;

  // Noise from vision clarity
  let noiseRange: number;
  if (traits.vision_clarity >= 8) noiseRange = 3;
  else if (traits.vision_clarity >= 4) noiseRange = 7;
  else noiseRange = 12;
  const noise = (Math.random() * 2 - 1) * noiseRange;

  const finalScore = clamp(baseScore * honestyMul + noise, 5, 100);
  const rating = clamp(Math.round((finalScore / 20) * 2) / 2, 1, 5);

  // Payment: harsh for low ratings
  // Rating 1 → 0% payment (client refuses to pay)
  // Rating 2 → 10-20% payment
  // Rating 3 → 40-60% payment
  // Rating 4 → 80-100% payment
  // Rating 5 → 100-120% payment
  let multiplier: number;
  if (rating <= 1) {
    multiplier = 0; // Complete refusal to pay
  } else if (rating <= 2) {
    multiplier = 0.1 + Math.random() * 0.1; // 10-20%
    if (traits.payment_discipline <= 3) multiplier = 0; // Scrooge/toxic won't pay at all
  } else if (rating <= 3) {
    multiplier = 0.4 + Math.random() * 0.2; // 40-60%
    if (traits.payment_discipline <= 3) multiplier *= 0.5; // Bad payers cut it further
  } else if (rating <= 4) {
    multiplier = 0.8 + Math.random() * 0.2; // 80-100%
  } else {
    multiplier = 1.0 + (traits.payment_discipline >= 8 ? Math.random() * 0.2 : 0); // 100-120%
  }

  const actualBudget = negotiatedBudget || budget;
  const earned = Math.round(actualBudget * multiplier);
  const xp = Math.round(rating * 20);

  const templates = REVIEW_TEMPLATES[archetype];
  const text = rating >= 4 ? pick(templates.good) : pick(templates.bad);

  return { rating, text, earned, xp, multiplier };
}

// ---- Bargaining ----

export function attemptBargain(profile: ClientProfile, currentBudget: number): { success: boolean; newBudget: number; message: string } {
  const { archetype, traits } = profile;

  let successChance: number;
  switch (archetype) {
    case 'scrooge': successChance = 0.3; break;
    case 'professional': successChance = 0.5; break;
    case 'ghost': successChance = 0.95; break;
    case 'dreamer': successChance = 0.7; break;
    case 'micromanager': successChance = 0.4; break;
    case 'chameleon': successChance = 0.6; break;
    case 'toxic': successChance = 0.35; break;
    default: successChance = 0.5;
  }

  const success = Math.random() < successChance;
  if (success) {
    const raise = randInt(10, 30) / 100;
    const newBudget = Math.round(currentBudget * (1 + raise));
    return { success: true, newBudget, message: profile.dialogueTemplates.haggle_accept };
  }

  return { success: false, newBudget: currentBudget, message: profile.dialogueTemplates.haggle_reject };
}

// ---- System Prompt Builder for Edge Function ----

export function buildClientSystemPrompt(profile: ClientProfile, orderDescription: string, previewHtml?: string): string {
  const { archetype, traits, dialogueTemplates, missingDetails } = profile;

  const archetypeNames: Record<ClientArchetype, string> = {
    dreamer: 'Мечтатель',
    micromanager: 'Микроменеджер',
    scrooge: 'Скряга',
    ghost: 'Призрак',
    professional: 'Профессионал',
    chameleon: 'Хамелеон',
    toxic: 'Токсик',
  };

  let prompt = `Ты играешь роль заказчика на бирже фриланса. Твой архетип: "${archetypeNames[archetype]}".

ХАРАКТЕРИСТИКИ (скрытые, определяют твоё поведение):
- Ясность видения: ${traits.vision_clarity}/10 ${traits.vision_clarity <= 3 ? '(ты плохо понимаешь чего хочешь, отвечаешь расплывчато)' : traits.vision_clarity >= 8 ? '(ты точно знаешь чего хочешь, даёшь конкретные ответы)' : ''}
- Техническая грамотность: ${traits.tech_literacy}/10 ${traits.tech_literacy <= 3 ? '(ты не разбираешься в технологиях)' : traits.tech_literacy >= 8 ? '(ты технически подкован)' : ''}
- Стабильность решений: ${traits.decision_stability}/10 ${traits.decision_stability <= 3 ? '(ты часто меняешь требования)' : ''}
- Конфликтность: ${traits.conflict_level}/10 ${traits.conflict_level >= 8 ? '(ты агрессивен и груб)' : traits.conflict_level <= 3 ? '(ты спокоен и мягок)' : ''}
- Склонность к скоупкрипу: ${traits.scope_creep}/10

ТВОЙ ЗАКАЗ: ${orderDescription}

СТИЛЬ ОБЩЕНИЯ:
- Типичное приветствие: "${dialogueTemplates.greeting}"
- Если не знаешь ответ: "${dialogueTemplates.vague_answer}"
- Если хочешь добавить фичу: "${dialogueTemplates.scope_creep}"

ПРАВИЛА:
- Отвечай на русском, коротко (2-4 предложения)
- НЕ пиши код — ты заказчик
- Веди себя СТРОГО по архетипу
- Если ясность видения < 4: давай расплывчатые ответы на уточняющие вопросы
- Если ясность видения >= 7: давай конкретные, детальные ответы`;

  if (traits.scope_creep > 5) {
    prompt += `\n\nСКОУПКРИП: С вероятностью ~40% добавляй в ответ "маленькую просьбу" — дополнительную фичу сверх задачи. Подавай это как мелочь: "А ещё добавьте...", "Кстати, а можно ещё..."`;
  }

  if (missingDetails.length > 0) {
    prompt += `\n\nВАЖНО — ПРОПУЩЕННЫЕ ДЕТАЛИ (ты их НЕ упоминаешь сам, но если спросят напрямую — отвечай):
${missingDetails.map(d => `- ${d}`).join('\n')}
Если фрилансер НЕ спросит об этих вещах — это повлияет на оценку. Но сам не подсказывай!`;
  }

  if (previewHtml) {
    const honestyNote = traits.evaluation_honesty <= 4
      ? 'Ты склонен занижать оценку, чтобы выбить скидку.'
      : traits.evaluation_honesty >= 8
      ? 'Ты оцениваешь объективно и справедливо.'
      : '';

    prompt += `\n\nФрилансер показывает превью. HTML:
<site_preview>
${previewHtml.substring(0, 3000)}
</site_preview>

Оцени как заказчик-${archetypeNames[archetype]}. ${honestyNote}
Поставь оценку [ОЦЕНКА: X] от 1 до 5.`;
  }

  return prompt;
}

// ---- Archetype label for UI ----
export function getArchetypeLabel(arch: ClientArchetype): string {
  const labels: Record<ClientArchetype, string> = {
    dreamer: '🌈 Мечтатель', micromanager: '🔍 Микроменеджер', scrooge: '💰 Скряга',
    ghost: '👻 Призрак', professional: '💼 Профессионал', chameleon: '🦎 Хамелеон', toxic: '☠️ Токсик',
  };
  return labels[arch];
}

export function getDeadlineLabel(d: Deadline): { text: string; color: string } {
  switch (d) {
    case 'tight': return { text: 'Жёсткий', color: 'bg-game-warning/20 text-game-warning border-game-warning/30' };
    case 'flexible': return { text: 'Гибкий', color: 'bg-game-success/20 text-game-success border-game-success/30' };
    case 'yesterday': return { text: 'Вчера!', color: 'bg-destructive/20 text-destructive border-destructive/30' };
  }
}
