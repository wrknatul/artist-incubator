// ============================================
// Planning Phase — Question Templates by Project Type
// ============================================

export type PlanningDomain = 'design' | 'function' | 'performance' | 'seo' | 'strategy' | 'communication';

export interface PlanningOptionEffect {
  design?: number;       // -1 to +1
  function?: number;
  performance?: number;
  seo?: number;
}

export interface PlanningOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
  effects: PlanningOptionEffect;
  industry_fit: string[];  // industries where this option is a good fit
}

export interface PlanningQuestion {
  id: string;
  domain: PlanningDomain;
  priority: number;        // higher = more important (1-10)
  boss_only: boolean;      // always shown to player
  text: string;
  emoji: string;
  options: PlanningOption[];
}

// ---- Strategic questions (boss_only = true, shared across all types) ----

const STRATEGIC_QUESTIONS: PlanningQuestion[] = [
  {
    id: 'approach',
    domain: 'strategy',
    priority: 10,
    boss_only: true,
    text: 'Какой подход к разработке выбрать?',
    emoji: '🎯',
    options: [
      {
        id: 'mvp',
        label: 'MVP',
        emoji: '🚀',
        description: 'Минимальный продукт — быстро, но базово',
        effects: { design: -0.2, function: -0.1, performance: 0.3 },
        industry_fit: ['Крипто', 'B2B SaaS', 'Финтех'],
      },
      {
        id: 'full',
        label: 'Полная версия',
        emoji: '💎',
        description: 'Все фичи сразу — долго, но качественно',
        effects: { design: 0.3, function: 0.4, performance: -0.1 },
        industry_fit: ['Мода', 'Недвижимость', 'Здоровье'],
      },
      {
        id: 'hack',
        label: 'Быстрый хак',
        emoji: '⚡',
        description: 'Скорость важнее качества',
        effects: { design: -0.4, function: -0.3, performance: 0.1, seo: -0.3 },
        industry_fit: ['Развлечения'],
      },
    ],
  },
  {
    id: 'priority',
    domain: 'strategy',
    priority: 9,
    boss_only: true,
    text: 'Что приоритетнее в этом проекте?',
    emoji: '⚖️',
    options: [
      {
        id: 'design_first',
        label: 'Дизайн',
        emoji: '🎨',
        description: 'Визуал, анимации, впечатление',
        effects: { design: 0.5, function: -0.1, performance: -0.2 },
        industry_fit: ['Мода', 'Развлечения', 'Путешествия'],
      },
      {
        id: 'function_first',
        label: 'Функционал',
        emoji: '⚙️',
        description: 'Логика, формы, интеграции',
        effects: { design: -0.1, function: 0.5, performance: 0 },
        industry_fit: ['Финтех', 'B2B SaaS', 'Образование'],
      },
      {
        id: 'perf_first',
        label: 'Перформанс',
        emoji: '🏎️',
        description: 'Скорость загрузки, оптимизация',
        effects: { design: -0.1, function: 0, performance: 0.5, seo: 0.3 },
        industry_fit: ['Еда', 'Крипто', 'Здоровье'],
      },
    ],
  },
  {
    id: 'communication',
    domain: 'communication',
    priority: 8,
    boss_only: true,
    text: 'Как показывать прогресс заказчику?',
    emoji: '💬',
    options: [
      {
        id: 'show_50',
        label: 'Показ на 50%',
        emoji: '📊',
        description: 'Один промежуточный показ',
        effects: { design: 0.1, function: 0.1 },
        industry_fit: [],
      },
      {
        id: 'only_final',
        label: 'Только при сдаче',
        emoji: '📦',
        description: 'Сюрприз — рисково, но быстро',
        effects: { performance: 0.2 },
        industry_fit: [],
      },
      {
        id: 'regular',
        label: 'Регулярно',
        emoji: '🔄',
        description: 'Частые показы — безопасно, но медленнее',
        effects: { design: 0.2, function: 0.2, performance: -0.1 },
        industry_fit: [],
      },
    ],
  },
];

// ---- Domain-specific questions ----

const LANDING_QUESTIONS: PlanningQuestion[] = [
  {
    id: 'hero_style',
    domain: 'design',
    priority: 7,
    boss_only: false,
    text: 'Какой стиль Hero-секции?',
    emoji: '🖼️',
    options: [
      { id: 'hero_minimal', label: 'Минимализм', emoji: '⬜', description: 'Чистый, с одним CTA', effects: { design: 0.3, performance: 0.2 }, industry_fit: ['Финтех', 'B2B SaaS', 'Крипто'] },
      { id: 'hero_video', label: 'Видео-фон', emoji: '🎬', description: 'Эффектно, но тяжело', effects: { design: 0.4, performance: -0.4 }, industry_fit: ['Путешествия', 'Развлечения', 'Мода'] },
      { id: 'hero_interactive', label: 'Интерактив', emoji: '✨', description: 'Анимации и параллакс', effects: { design: 0.5, performance: -0.3, function: 0.1 }, industry_fit: ['Крипто', 'Развлечения'] },
    ],
  },
  {
    id: 'cta_strategy',
    domain: 'function',
    priority: 6,
    boss_only: false,
    text: 'Стратегия CTA-кнопок?',
    emoji: '🔘',
    options: [
      { id: 'cta_single', label: 'Один главный CTA', emoji: '☝️', description: 'Фокус на одном действии', effects: { function: 0.2, design: 0.1 }, industry_fit: ['B2B SaaS', 'Образование'] },
      { id: 'cta_multi', label: 'Несколько CTA', emoji: '🔢', description: 'Разные точки входа', effects: { function: 0.3, design: -0.1 }, industry_fit: ['Еда', 'Здоровье', 'Недвижимость'] },
    ],
  },
  {
    id: 'social_proof',
    domain: 'function',
    priority: 5,
    boss_only: false,
    text: 'Блок социальных доказательств?',
    emoji: '⭐',
    options: [
      { id: 'testimonials', label: 'Отзывы', emoji: '💬', description: 'Цитаты клиентов', effects: { function: 0.2, design: 0.1 }, industry_fit: ['Здоровье', 'Образование', 'Путешествия'] },
      { id: 'logos', label: 'Логотипы партнёров', emoji: '🏢', description: 'Доверие через бренды', effects: { design: 0.2, function: 0.1 }, industry_fit: ['B2B SaaS', 'Финтех'] },
      { id: 'no_proof', label: 'Не добавлять', emoji: '❌', description: 'Экономим время', effects: { performance: 0.1 }, industry_fit: [] },
    ],
  },
  {
    id: 'form_complexity',
    domain: 'function',
    priority: 4,
    boss_only: false,
    text: 'Сложность контактной формы?',
    emoji: '📝',
    options: [
      { id: 'form_simple', label: 'Простая', emoji: '📧', description: 'Имя + email', effects: { function: 0.1, performance: 0.1 }, industry_fit: ['Крипто', 'Развлечения'] },
      { id: 'form_detailed', label: 'Детальная', emoji: '📋', description: 'С выбором услуги и бюджетом', effects: { function: 0.3, design: -0.1 }, industry_fit: ['B2B SaaS', 'Недвижимость', 'Финтех'] },
    ],
  },
  {
    id: 'animation_level',
    domain: 'design',
    priority: 3,
    boss_only: false,
    text: 'Уровень анимаций?',
    emoji: '🎭',
    options: [
      { id: 'anim_none', label: 'Без анимаций', emoji: '⏹️', description: 'Статичный, быстрый', effects: { performance: 0.3, design: -0.2 }, industry_fit: ['Финтех', 'B2B SaaS'] },
      { id: 'anim_subtle', label: 'Лёгкие', emoji: '🌊', description: 'Fade-in при скролле', effects: { design: 0.2, performance: 0 }, industry_fit: ['Здоровье', 'Образование', 'Недвижимость'] },
      { id: 'anim_heavy', label: 'Агрессивные', emoji: '💥', description: 'Много эффектов', effects: { design: 0.3, performance: -0.4 }, industry_fit: ['Развлечения', 'Мода', 'Крипто'] },
    ],
  },
  {
    id: 'seo_approach',
    domain: 'seo',
    priority: 3,
    boss_only: false,
    text: 'Подход к SEO?',
    emoji: '🔍',
    options: [
      { id: 'seo_basic', label: 'Базовый', emoji: '📄', description: 'Мета-теги, заголовки', effects: { seo: 0.2 }, industry_fit: [] },
      { id: 'seo_full', label: 'Полный', emoji: '🏆', description: 'Schema.org, OG, sitemap', effects: { seo: 0.5, performance: -0.1 }, industry_fit: ['Еда', 'Здоровье', 'Недвижимость'] },
    ],
  },
  {
    id: 'mobile_approach',
    domain: 'design',
    priority: 5,
    boss_only: false,
    text: 'Подход к мобильной версии?',
    emoji: '📱',
    options: [
      { id: 'mobile_first', label: 'Mobile First', emoji: '📱', description: 'Сначала мобилка', effects: { design: 0.2, performance: 0.2, seo: 0.1 }, industry_fit: ['Еда', 'Развлечения', 'Путешествия'] },
      { id: 'desktop_first', label: 'Desktop First', emoji: '🖥️', description: 'Сначала десктоп', effects: { design: 0.1, performance: 0 }, industry_fit: ['B2B SaaS', 'Финтех'] },
    ],
  },
  {
    id: 'color_scheme',
    domain: 'design',
    priority: 4,
    boss_only: false,
    text: 'Цветовая схема?',
    emoji: '🎨',
    options: [
      { id: 'color_light', label: 'Светлая', emoji: '☀️', description: 'Чистая, доверительная', effects: { design: 0.1 }, industry_fit: ['Здоровье', 'Образование', 'Недвижимость'] },
      { id: 'color_dark', label: 'Тёмная', emoji: '🌙', description: 'Стильная, премиальная', effects: { design: 0.2 }, industry_fit: ['Крипто', 'Финтех', 'Развлечения'] },
      { id: 'color_brand', label: 'Под бренд', emoji: '🏷️', description: 'Фирменные цвета клиента', effects: { design: 0.3, function: 0.1 }, industry_fit: ['Мода', 'B2B SaaS'] },
    ],
  },
];

const SHOP_QUESTIONS: PlanningQuestion[] = [
  {
    id: 'catalog_layout',
    domain: 'design',
    priority: 7,
    boss_only: false,
    text: 'Макет каталога товаров?',
    emoji: '🛍️',
    options: [
      { id: 'grid', label: 'Сетка', emoji: '⊞', description: 'Классическая сетка карточек', effects: { design: 0.2, performance: 0.1 }, industry_fit: ['Мода', 'Еда'] },
      { id: 'list', label: 'Список', emoji: '☰', description: 'Детальный список', effects: { function: 0.2, design: -0.1 }, industry_fit: ['B2B SaaS', 'Финтех'] },
      { id: 'masonry', label: 'Masonry', emoji: '🧱', description: 'Pinterest-стиль', effects: { design: 0.4, performance: -0.3 }, industry_fit: ['Мода', 'Развлечения'] },
    ],
  },
  {
    id: 'filter_system',
    domain: 'function',
    priority: 7,
    boss_only: false,
    text: 'Система фильтрации?',
    emoji: '🔧',
    options: [
      { id: 'filter_basic', label: 'Базовые фильтры', emoji: '📋', description: 'Категория + цена', effects: { function: 0.2 }, industry_fit: ['Еда', 'Здоровье'] },
      { id: 'filter_advanced', label: 'Расширенные', emoji: '🔬', description: 'Много параметров + поиск', effects: { function: 0.4, performance: -0.2 }, industry_fit: ['Мода', 'Недвижимость', 'B2B SaaS'] },
    ],
  },
  {
    id: 'cart_type',
    domain: 'function',
    priority: 6,
    boss_only: false,
    text: 'Тип корзины?',
    emoji: '🛒',
    options: [
      { id: 'cart_sidebar', label: 'Боковая панель', emoji: '📎', description: 'Не уходить со страницы', effects: { function: 0.2, design: 0.2 }, industry_fit: ['Мода', 'Еда'] },
      { id: 'cart_page', label: 'Отдельная страница', emoji: '📄', description: 'Классический подход', effects: { function: 0.1 }, industry_fit: ['Финтех', 'B2B SaaS'] },
    ],
  },
  {
    id: 'product_page',
    domain: 'design',
    priority: 5,
    boss_only: false,
    text: 'Страница товара?',
    emoji: '📦',
    options: [
      { id: 'product_simple', label: 'Компактная', emoji: '📋', description: 'Фото + описание + кнопка', effects: { design: 0.1, performance: 0.2 }, industry_fit: ['Еда', 'Здоровье'] },
      { id: 'product_rich', label: 'Расширенная', emoji: '🎪', description: 'Галерея, табы, рекомендации', effects: { design: 0.4, function: 0.3, performance: -0.2 }, industry_fit: ['Мода', 'Недвижимость'] },
    ],
  },
  {
    id: 'payment_options',
    domain: 'function',
    priority: 6,
    boss_only: false,
    text: 'Способы оплаты?',
    emoji: '💳',
    options: [
      { id: 'pay_basic', label: 'Карта', emoji: '💳', description: 'Только банковские карты', effects: { function: 0.1 }, industry_fit: [] },
      { id: 'pay_multi', label: 'Мультиоплата', emoji: '🏦', description: 'Карты, СБП, криптовалюта', effects: { function: 0.4, performance: -0.1 }, industry_fit: ['Крипто', 'Финтех'] },
    ],
  },
  // reuse some landing questions
  ...LANDING_QUESTIONS.filter(q => ['seo_approach', 'mobile_approach', 'color_scheme', 'animation_level'].includes(q.id)),
];

const SAAS_QUESTIONS: PlanningQuestion[] = [
  {
    id: 'dashboard_type',
    domain: 'function',
    priority: 7,
    boss_only: false,
    text: 'Тип дашборда?',
    emoji: '📊',
    options: [
      { id: 'dash_simple', label: 'Простой', emoji: '📋', description: 'KPI-карточки + таблица', effects: { function: 0.2, design: 0.1 }, industry_fit: ['Здоровье', 'Образование'] },
      { id: 'dash_analytics', label: 'Аналитический', emoji: '📈', description: 'Графики, чарты, метрики', effects: { function: 0.4, design: 0.3, performance: -0.2 }, industry_fit: ['Финтех', 'B2B SaaS'] },
      { id: 'dash_kanban', label: 'Канбан', emoji: '📌', description: 'Доски и карточки', effects: { function: 0.3, design: 0.2 }, industry_fit: ['B2B SaaS', 'Образование'] },
    ],
  },
  {
    id: 'auth_type',
    domain: 'function',
    priority: 6,
    boss_only: false,
    text: 'Авторизация?',
    emoji: '🔐',
    options: [
      { id: 'auth_email', label: 'Email + пароль', emoji: '📧', description: 'Классическая', effects: { function: 0.1 }, industry_fit: [] },
      { id: 'auth_social', label: 'Соцсети + SSO', emoji: '🔗', description: 'Google, GitHub и т.д.', effects: { function: 0.3, design: 0.1 }, industry_fit: ['B2B SaaS', 'Образование'] },
    ],
  },
  {
    id: 'pricing_page',
    domain: 'design',
    priority: 6,
    boss_only: false,
    text: 'Страница прайсинга?',
    emoji: '💰',
    options: [
      { id: 'pricing_cards', label: '3 плана', emoji: '🃏', description: 'Классические карточки тарифов', effects: { design: 0.2, function: 0.1 }, industry_fit: ['B2B SaaS', 'Образование'] },
      { id: 'pricing_slider', label: 'Калькулятор', emoji: '🧮', description: 'Слайдер с расчётом цены', effects: { function: 0.3, design: 0.2, performance: -0.1 }, industry_fit: ['Финтех', 'Крипто'] },
    ],
  },
  {
    id: 'onboarding',
    domain: 'function',
    priority: 5,
    boss_only: false,
    text: 'Онбординг пользователей?',
    emoji: '👋',
    options: [
      { id: 'onboard_tour', label: 'Тур по продукту', emoji: '🗺️', description: 'Пошаговые подсказки', effects: { function: 0.3, design: 0.2 }, industry_fit: ['B2B SaaS'] },
      { id: 'onboard_video', label: 'Видео-гайд', emoji: '🎥', description: 'Обучающее видео', effects: { function: 0.1, performance: -0.2 }, industry_fit: ['Образование'] },
      { id: 'onboard_none', label: 'Без онбординга', emoji: '🏃', description: 'Сразу в продукт', effects: { performance: 0.1 }, industry_fit: [] },
    ],
  },
  ...LANDING_QUESTIONS.filter(q => ['seo_approach', 'mobile_approach', 'color_scheme', 'animation_level'].includes(q.id)),
];

const PORTFOLIO_QUESTIONS: PlanningQuestion[] = [
  {
    id: 'gallery_style',
    domain: 'design',
    priority: 7,
    boss_only: false,
    text: 'Стиль галереи работ?',
    emoji: '🖼️',
    options: [
      { id: 'gallery_grid', label: 'Сетка', emoji: '⊞', description: 'Аккуратная сетка', effects: { design: 0.2, performance: 0.1 }, industry_fit: ['Финтех', 'Образование'] },
      { id: 'gallery_showcase', label: 'Витрина', emoji: '🎪', description: 'Крупные превью с hover-эффектами', effects: { design: 0.4, performance: -0.2 }, industry_fit: ['Мода', 'Развлечения'] },
      { id: 'gallery_scroll', label: 'Горизонтальный скролл', emoji: '↔️', description: 'Необычная навигация', effects: { design: 0.5, performance: -0.3, function: -0.1 }, industry_fit: ['Мода', 'Развлечения'] },
    ],
  },
  {
    id: 'about_section',
    domain: 'design',
    priority: 5,
    boss_only: false,
    text: 'Блок "О себе"?',
    emoji: '👤',
    options: [
      { id: 'about_minimal', label: 'Минималистичный', emoji: '📝', description: 'Фото + пара предложений', effects: { design: 0.1, performance: 0.1 }, industry_fit: [] },
      { id: 'about_story', label: 'История', emoji: '📖', description: 'Таймлайн карьеры', effects: { design: 0.3, function: 0.1 }, industry_fit: ['Образование'] },
    ],
  },
  ...LANDING_QUESTIONS.filter(q => ['animation_level', 'color_scheme', 'mobile_approach', 'seo_approach', 'hero_style'].includes(q.id)),
];

const BLOG_QUESTIONS: PlanningQuestion[] = [
  {
    id: 'article_layout',
    domain: 'design',
    priority: 7,
    boss_only: false,
    text: 'Макет статей?',
    emoji: '📰',
    options: [
      { id: 'article_classic', label: 'Классический', emoji: '📄', description: 'Текст по центру, как Medium', effects: { design: 0.2, performance: 0.2, seo: 0.1 }, industry_fit: ['Образование', 'Здоровье'] },
      { id: 'article_magazine', label: 'Журнальный', emoji: '📰', description: 'Колонки и врезки', effects: { design: 0.4, performance: -0.1 }, industry_fit: ['Мода', 'Путешествия'] },
    ],
  },
  {
    id: 'content_features',
    domain: 'function',
    priority: 6,
    boss_only: false,
    text: 'Фичи контента?',
    emoji: '✏️',
    options: [
      { id: 'content_basic', label: 'Базовые', emoji: '📋', description: 'Текст + картинки', effects: { function: 0.1, performance: 0.2 }, industry_fit: [] },
      { id: 'content_rich', label: 'Расширенные', emoji: '🎨', description: 'Код-блоки, видео, интерактив', effects: { function: 0.4, design: 0.2, performance: -0.2 }, industry_fit: ['Образование', 'B2B SaaS', 'Крипто'] },
    ],
  },
  {
    id: 'navigation_blog',
    domain: 'function',
    priority: 5,
    boss_only: false,
    text: 'Навигация по блогу?',
    emoji: '🧭',
    options: [
      { id: 'nav_categories', label: 'Категории + теги', emoji: '🏷️', description: 'Фильтрация по тегам', effects: { function: 0.3, seo: 0.2 }, industry_fit: ['Образование', 'Здоровье'] },
      { id: 'nav_search', label: 'Поиск + рекомендации', emoji: '🔍', description: 'Умный поиск по статьям', effects: { function: 0.4, performance: -0.2 }, industry_fit: ['B2B SaaS', 'Крипто'] },
    ],
  },
  ...LANDING_QUESTIONS.filter(q => ['seo_approach', 'mobile_approach', 'color_scheme', 'animation_level'].includes(q.id)),
];

const CORPORATE_QUESTIONS: PlanningQuestion[] = [
  {
    id: 'structure',
    domain: 'function',
    priority: 7,
    boss_only: false,
    text: 'Структура сайта?',
    emoji: '🏗️',
    options: [
      { id: 'struct_onepage', label: 'Одностраничник', emoji: '📃', description: 'Всё на одной странице', effects: { design: 0.1, performance: 0.2 }, industry_fit: ['Развлечения', 'Еда'] },
      { id: 'struct_multi', label: 'Многостраничник', emoji: '📚', description: 'Разделы: о нас, услуги, команда', effects: { function: 0.3, seo: 0.3, performance: -0.1 }, industry_fit: ['Финтех', 'B2B SaaS', 'Недвижимость'] },
    ],
  },
  {
    id: 'team_section',
    domain: 'design',
    priority: 5,
    boss_only: false,
    text: 'Секция команды?',
    emoji: '👥',
    options: [
      { id: 'team_cards', label: 'Карточки', emoji: '🃏', description: 'Фото + должность + соцсети', effects: { design: 0.2, function: 0.1 }, industry_fit: ['Образование', 'Здоровье'] },
      { id: 'team_none', label: 'Без команды', emoji: '❌', description: 'Не показываем', effects: { performance: 0.1 }, industry_fit: ['Крипто', 'Финтех'] },
    ],
  },
  {
    id: 'trust_elements',
    domain: 'function',
    priority: 6,
    boss_only: false,
    text: 'Элементы доверия?',
    emoji: '🛡️',
    options: [
      { id: 'trust_certs', label: 'Сертификаты + партнёры', emoji: '📜', description: 'Логотипы и награды', effects: { design: 0.2, function: 0.1 }, industry_fit: ['Финтех', 'Здоровье', 'B2B SaaS'] },
      { id: 'trust_cases', label: 'Кейсы', emoji: '📊', description: 'Подробные истории успеха', effects: { function: 0.3, design: 0.1 }, industry_fit: ['B2B SaaS', 'Недвижимость'] },
      { id: 'trust_numbers', label: 'Цифры', emoji: '📈', description: '10+ лет, 500+ клиентов', effects: { design: 0.2 }, industry_fit: ['Недвижимость', 'Путешествия'] },
    ],
  },
  ...LANDING_QUESTIONS.filter(q => ['seo_approach', 'mobile_approach', 'color_scheme', 'animation_level', 'form_complexity'].includes(q.id)),
];

// ---- Map project types to question sets ----

const PROJECT_TYPE_QUESTIONS: Record<string, PlanningQuestion[]> = {
  'Лендинг': LANDING_QUESTIONS,
  'Интернет-магазин': SHOP_QUESTIONS,
  'SaaS': SAAS_QUESTIONS,
  'Портфолио': PORTFOLIO_QUESTIONS,
  'Блог': BLOG_QUESTIONS,
  'Корпоративный сайт': CORPORATE_QUESTIONS,
};

/**
 * Get all questions for a given project type, including strategic ones.
 */
export function getQuestionsForProjectType(projectType: string): PlanningQuestion[] {
  const typeQuestions = PROJECT_TYPE_QUESTIONS[projectType] || LANDING_QUESTIONS;
  // Deduplicate by id (strategic + type-specific)
  const allQuestions = [...STRATEGIC_QUESTIONS, ...typeQuestions];
  const seen = new Set<string>();
  return allQuestions.filter(q => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
}
