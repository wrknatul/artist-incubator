// ============================================
// Visual Site Builder — Section Templates & HTML Generation
// ============================================

export type SectionType = 
  | 'hero' | 'features' | 'about' | 'pricing' | 'gallery' 
  | 'testimonials' | 'contact' | 'cta' | 'faq' | 'team' 
  | 'stats' | 'footer';

export interface SectionElement {
  id: string;
  label: string;
  enabled: boolean;
}

export interface BuilderSection {
  id: string;
  type: SectionType;
  title: string;
  subtitle: string;
  colorScheme: string;
  elements: SectionElement[];
}

export interface SectionTemplate {
  type: SectionType;
  label: string;
  icon: string;
  description: string;
  defaultElements: Omit<SectionElement, 'id'>[];
}

export const COLOR_SCHEMES = [
  { id: 'light', label: 'Светлая', bg: '#ffffff', text: '#1a1a2e', accent: '#4361ee' },
  { id: 'dark', label: 'Тёмная', bg: '#1a1a2e', text: '#e8e8e8', accent: '#4cc9f0' },
  { id: 'warm', label: 'Тёплая', bg: '#fef9ef', text: '#2d2a32', accent: '#e07a5f' },
  { id: 'cool', label: 'Холодная', bg: '#f0f4f8', text: '#1b2a4a', accent: '#3a86a8' },
  { id: 'bold', label: 'Яркая', bg: '#0f0e17', text: '#fffffe', accent: '#ff6e6c' },
  { id: 'nature', label: 'Природа', bg: '#f4f1de', text: '#3d405b', accent: '#81b29a' },
  { id: 'corporate', label: 'Корпорат', bg: '#ffffff', text: '#2b2d42', accent: '#d90429' },
  { id: 'pastel', label: 'Пастель', bg: '#fdf6f0', text: '#4a4e69', accent: '#b5838d' },
];

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    type: 'hero',
    label: 'Hero / Шапка',
    icon: '🏠',
    description: 'Главный экран с заголовком и CTA',
    defaultElements: [
      { label: 'Логотип', enabled: true },
      { label: 'Навигация', enabled: true },
      { label: 'Заголовок H1', enabled: true },
      { label: 'Подзаголовок', enabled: true },
      { label: 'Кнопка CTA', enabled: true },
      { label: 'Фоновое изображение', enabled: false },
    ],
  },
  {
    type: 'features',
    label: 'Преимущества',
    icon: '⭐',
    description: 'Блок с ключевыми фичами/преимуществами',
    defaultElements: [
      { label: 'Заголовок секции', enabled: true },
      { label: 'Иконки', enabled: true },
      { label: '3 карточки', enabled: true },
      { label: '4 карточки', enabled: false },
      { label: 'Описания', enabled: true },
    ],
  },
  {
    type: 'about',
    label: 'О нас / О проекте',
    icon: '📝',
    description: 'Информация о компании или проекте',
    defaultElements: [
      { label: 'Заголовок', enabled: true },
      { label: 'Текст-описание', enabled: true },
      { label: 'Изображение', enabled: true },
      { label: 'Список пунктов', enabled: false },
      { label: 'Кнопка "Подробнее"', enabled: false },
    ],
  },
  {
    type: 'pricing',
    label: 'Цены / Тарифы',
    icon: '💰',
    description: 'Таблица цен или тарифные планы',
    defaultElements: [
      { label: 'Заголовок', enabled: true },
      { label: '2 тарифа', enabled: false },
      { label: '3 тарифа', enabled: true },
      { label: 'Цены в рублях', enabled: true },
      { label: 'Список фич', enabled: true },
      { label: 'Кнопка "Выбрать"', enabled: true },
      { label: 'Выделенный тариф', enabled: true },
    ],
  },
  {
    type: 'gallery',
    label: 'Галерея / Портфолио',
    icon: '🖼️',
    description: 'Сетка изображений или работ',
    defaultElements: [
      { label: 'Заголовок', enabled: true },
      { label: 'Сетка 2x2', enabled: false },
      { label: 'Сетка 3x2', enabled: true },
      { label: 'Подписи к фото', enabled: true },
      { label: 'Hover-эффекты', enabled: true },
    ],
  },
  {
    type: 'testimonials',
    label: 'Отзывы',
    icon: '💬',
    description: 'Блок с отзывами клиентов',
    defaultElements: [
      { label: 'Заголовок', enabled: true },
      { label: 'Аватары', enabled: true },
      { label: 'Имена клиентов', enabled: true },
      { label: 'Текст отзывов', enabled: true },
      { label: 'Звёздочки рейтинга', enabled: false },
    ],
  },
  {
    type: 'contact',
    label: 'Контакты / Форма',
    icon: '📧',
    description: 'Форма обратной связи и контактные данные',
    defaultElements: [
      { label: 'Заголовок', enabled: true },
      { label: 'Поле "Имя"', enabled: true },
      { label: 'Поле "Email"', enabled: true },
      { label: 'Поле "Сообщение"', enabled: true },
      { label: 'Поле "Телефон"', enabled: false },
      { label: 'Кнопка "Отправить"', enabled: true },
      { label: 'Карта / Адрес', enabled: false },
    ],
  },
  {
    type: 'cta',
    label: 'Призыв к действию',
    icon: '🎯',
    description: 'Яркий блок с призывом (CTA)',
    defaultElements: [
      { label: 'Заголовок', enabled: true },
      { label: 'Описание', enabled: true },
      { label: 'Кнопка', enabled: true },
      { label: 'Фон-акцент', enabled: true },
    ],
  },
  {
    type: 'faq',
    label: 'FAQ / Вопросы',
    icon: '❓',
    description: 'Частые вопросы и ответы',
    defaultElements: [
      { label: 'Заголовок', enabled: true },
      { label: 'Аккордеон', enabled: true },
      { label: '4 вопроса', enabled: true },
      { label: '6 вопросов', enabled: false },
    ],
  },
  {
    type: 'stats',
    label: 'Цифры / Статистика',
    icon: '📊',
    description: 'Блок с ключевыми цифрами',
    defaultElements: [
      { label: 'Заголовок', enabled: true },
      { label: '3 счётчика', enabled: true },
      { label: '4 счётчика', enabled: false },
      { label: 'Иконки', enabled: true },
      { label: 'Анимация', enabled: false },
    ],
  },
  {
    type: 'team',
    label: 'Команда',
    icon: '👥',
    description: 'Карточки членов команды',
    defaultElements: [
      { label: 'Заголовок', enabled: true },
      { label: 'Фото', enabled: true },
      { label: 'Имена', enabled: true },
      { label: 'Должности', enabled: true },
      { label: 'Соцсети', enabled: false },
    ],
  },
  {
    type: 'footer',
    label: 'Футер',
    icon: '📎',
    description: 'Нижняя часть сайта',
    defaultElements: [
      { label: 'Логотип', enabled: true },
      { label: 'Навигация', enabled: true },
      { label: 'Соцсети', enabled: true },
      { label: 'Копирайт', enabled: true },
      { label: 'Email', enabled: false },
      { label: 'Телефон', enabled: false },
    ],
  },
];

let _idCounter = 0;
export function createSection(type: SectionType): BuilderSection {
  const template = SECTION_TEMPLATES.find(t => t.type === type)!;
  _idCounter++;
  return {
    id: `section-${_idCounter}-${Date.now()}`,
    type,
    title: template.label,
    subtitle: '',
    colorScheme: 'light',
    elements: template.defaultElements.map((el, i) => ({
      ...el,
      id: `el-${_idCounter}-${i}`,
    })),
  };
}

// Generate HTML from builder sections + order context
export function generateHtmlFromSections(
  sections: BuilderSection[],
  orderTitle: string,
  orderDescription: string,
): string {
  const getScheme = (id: string) => COLOR_SCHEMES.find(c => c.id === id) || COLOR_SCHEMES[0];

  const sectionHtmls = sections.map(section => {
    const scheme = getScheme(section.colorScheme);
    const enabled = section.elements.filter(e => e.enabled).map(e => e.label.toLowerCase());
    const has = (keyword: string) => enabled.some(e => e.includes(keyword));

    switch (section.type) {
      case 'hero': return buildHero(scheme, has, section, orderTitle);
      case 'features': return buildFeatures(scheme, has, section, orderDescription);
      case 'about': return buildAbout(scheme, has, section, orderDescription);
      case 'pricing': return buildPricing(scheme, has, section);
      case 'gallery': return buildGallery(scheme, has, section);
      case 'testimonials': return buildTestimonials(scheme, has, section);
      case 'contact': return buildContact(scheme, has, section);
      case 'cta': return buildCTA(scheme, has, section);
      case 'faq': return buildFAQ(scheme, has, section);
      case 'stats': return buildStats(scheme, has, section);
      case 'team': return buildTeam(scheme, has, section);
      case 'footer': return buildFooter(scheme, has, section);
      default: return '';
    }
  });

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${orderTitle}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', system-ui, sans-serif; line-height: 1.6; }
img { max-width: 100%; height: auto; }
a { text-decoration: none; color: inherit; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.btn { display: inline-block; padding: 12px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; font-size: 16px; transition: opacity 0.2s; }
.btn:hover { opacity: 0.9; }
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.card { border-radius: 12px; padding: 32px; }
input, textarea { width: 100%; padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; margin-bottom: 12px; font-family: inherit; }
textarea { min-height: 120px; resize: vertical; }
@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
}
</style>
</head>
<body>
${sectionHtmls.join('\n')}
</body>
</html>`;
}

type HasFn = (kw: string) => boolean;
type Scheme = typeof COLOR_SCHEMES[0];

function buildHero(s: Scheme, has: HasFn, sec: BuilderSection, title: string) {
  return `<section style="background:${s.bg};color:${s.text};padding:80px 0;min-height:60vh;display:flex;align-items:center;">
<div class="container" style="text-align:center;">
${has('логотип') ? `<div style="font-size:24px;font-weight:700;color:${s.accent};margin-bottom:16px;">● ${title}</div>` : ''}
${has('навигация') ? `<nav style="margin-bottom:40px;display:flex;gap:24px;justify-content:center;"><a href="#" style="color:${s.text}">Главная</a><a href="#" style="color:${s.text}">О нас</a><a href="#" style="color:${s.text}">Услуги</a><a href="#" style="color:${s.text}">Контакты</a></nav>` : ''}
${has('заголовок') ? `<h1 style="font-size:48px;font-weight:800;margin-bottom:16px;line-height:1.2;">${sec.subtitle || title}</h1>` : ''}
${has('подзаголовок') ? `<p style="font-size:20px;opacity:0.8;max-width:600px;margin:0 auto 32px;">Профессиональные решения для вашего бизнеса</p>` : ''}
${has('кнопка') ? `<a class="btn" style="background:${s.accent};color:#fff;" href="#">Узнать больше</a>` : ''}
</div></section>`;
}

function buildFeatures(s: Scheme, has: HasFn, sec: BuilderSection, desc: string) {
  const count = has('4 карточки') ? 4 : 3;
  const gridClass = count === 4 ? 'grid-4' : 'grid-3';
  const icons = ['🚀', '⚡', '🛡️', '🎯'];
  const titles = ['Быстро', 'Надёжно', 'Безопасно', 'Точно'];
  return `<section style="background:${s.bg};color:${s.text};padding:80px 0;">
<div class="container">
${has('заголовок') ? `<h2 style="text-align:center;font-size:36px;margin-bottom:48px;">Наши преимущества</h2>` : ''}
<div class="${gridClass}">
${Array.from({length: count}, (_, i) => `<div class="card" style="background:${s.bg};border:1px solid ${s.accent}22;text-align:center;">
${has('иконки') ? `<div style="font-size:40px;margin-bottom:16px;">${icons[i]}</div>` : ''}
<h3 style="font-size:20px;margin-bottom:8px;color:${s.accent};">${titles[i]}</h3>
${has('описания') ? `<p style="opacity:0.7;font-size:14px;">Высокое качество и внимание к деталям в каждом проекте</p>` : ''}
</div>`).join('\n')}
</div></div></section>`;
}

function buildAbout(s: Scheme, has: HasFn, sec: BuilderSection, desc: string) {
  return `<section style="background:${s.bg};color:${s.text};padding:80px 0;">
<div class="container" style="display:flex;gap:48px;align-items:center;flex-wrap:wrap;">
${has('изображение') ? `<div style="flex:1;min-width:300px;"><div style="background:${s.accent}22;border-radius:16px;height:300px;display:flex;align-items:center;justify-content:center;font-size:64px;">📷</div></div>` : ''}
<div style="flex:1;min-width:300px;">
${has('заголовок') ? `<h2 style="font-size:36px;margin-bottom:16px;">О нас</h2>` : ''}
${has('текст') ? `<p style="opacity:0.8;margin-bottom:16px;font-size:16px;line-height:1.8;">${desc || 'Мы команда профессионалов с многолетним опытом работы. Наша цель — предоставить лучший сервис для каждого клиента.'}</p>` : ''}
${has('список') ? `<ul style="list-style:none;padding:0;"><li style="padding:8px 0;">✅ Опыт более 10 лет</li><li style="padding:8px 0;">✅ 500+ довольных клиентов</li><li style="padding:8px 0;">✅ Индивидуальный подход</li></ul>` : ''}
${has('подробнее') ? `<a class="btn" style="background:${s.accent};color:#fff;margin-top:16px;" href="#">Подробнее</a>` : ''}
</div></div></section>`;
}

function buildPricing(s: Scheme, has: HasFn, sec: BuilderSection) {
  const count = has('2 тарифа') ? 2 : 3;
  const names = ['Базовый', 'Стандарт', 'Премиум'];
  const prices = has('рублях') ? ['990 ₽', '2 490 ₽', '4 990 ₽'] : ['$9', '$29', '$59'];
  return `<section style="background:${s.bg};color:${s.text};padding:80px 0;">
<div class="container">
${has('заголовок') ? `<h2 style="text-align:center;font-size:36px;margin-bottom:48px;">Тарифы</h2>` : ''}
<div class="grid-${count}" style="max-width:${count * 350}px;margin:0 auto;">
${Array.from({length: count}, (_, i) => {
  const highlighted = has('выделенный') && i === (count === 3 ? 1 : 0);
  return `<div class="card" style="background:${highlighted ? s.accent : s.bg};color:${highlighted ? '#fff' : s.text};border:2px solid ${s.accent};text-align:center;${highlighted ? 'transform:scale(1.05);' : ''}">
<h3 style="font-size:22px;margin-bottom:8px;">${names[i]}</h3>
<div style="font-size:36px;font-weight:800;margin:16px 0;">${prices[i]}</div>
<p style="font-size:14px;opacity:0.7;margin-bottom:16px;">в месяц</p>
${has('список фич') ? `<ul style="list-style:none;padding:0;margin-bottom:24px;text-align:left;"><li style="padding:6px 0;">✓ Функция А</li><li style="padding:6px 0;">✓ Функция Б</li><li style="padding:6px 0;">${i > 0 ? '✓' : '✗'} Функция В</li></ul>` : ''}
${has('выбрать') ? `<a class="btn" style="background:${highlighted ? '#fff' : s.accent};color:${highlighted ? s.accent : '#fff'};" href="#">Выбрать</a>` : ''}
</div>`;}).join('\n')}
</div></div></section>`;
}

function buildGallery(s: Scheme, has: HasFn, sec: BuilderSection) {
  const is3x2 = has('3x2');
  const count = is3x2 ? 6 : 4;
  const cols = is3x2 ? 3 : 2;
  return `<section style="background:${s.bg};color:${s.text};padding:80px 0;">
<div class="container">
${has('заголовок') ? `<h2 style="text-align:center;font-size:36px;margin-bottom:48px;">Галерея</h2>` : ''}
<div class="grid-${cols}">
${Array.from({length: count}, (_, i) => `<div style="position:relative;border-radius:12px;overflow:hidden;${has('hover') ? 'transition:transform 0.3s;cursor:pointer;' : ''}">
<div style="background:${s.accent}${(15 + i * 8).toString(16)};height:220px;display:flex;align-items:center;justify-content:center;font-size:48px;">🖼️</div>
${has('подписи') ? `<p style="padding:12px;font-size:14px;text-align:center;">Проект ${i + 1}</p>` : ''}
</div>`).join('\n')}
</div></div></section>`;
}

function buildTestimonials(s: Scheme, has: HasFn, sec: BuilderSection) {
  const reviews = [
    { name: 'Анна К.', text: 'Отличная работа! Всё сделали быстро и качественно.' },
    { name: 'Дмитрий П.', text: 'Профессиональный подход, рекомендую всем.' },
    { name: 'Елена М.', text: 'Превзошли все ожидания. Буду обращаться снова.' },
  ];
  return `<section style="background:${s.bg};color:${s.text};padding:80px 0;">
<div class="container">
${has('заголовок') ? `<h2 style="text-align:center;font-size:36px;margin-bottom:48px;">Отзывы клиентов</h2>` : ''}
<div class="grid-3">
${reviews.map(r => `<div class="card" style="background:${s.bg};border:1px solid ${s.accent}33;">
${has('аватар') ? `<div style="width:48px;height:48px;border-radius:50%;background:${s.accent}33;display:flex;align-items:center;justify-content:center;margin-bottom:12px;">👤</div>` : ''}
${has('звёздочк') ? `<div style="color:${s.accent};margin-bottom:8px;">★★★★★</div>` : ''}
<p style="font-style:italic;opacity:0.8;margin-bottom:12px;">"${r.text}"</p>
${has('имена') ? `<p style="font-weight:600;color:${s.accent};">— ${r.name}</p>` : ''}
</div>`).join('\n')}
</div></div></section>`;
}

function buildContact(s: Scheme, has: HasFn, sec: BuilderSection) {
  return `<section style="background:${s.bg};color:${s.text};padding:80px 0;">
<div class="container" style="max-width:600px;">
${has('заголовок') ? `<h2 style="text-align:center;font-size:36px;margin-bottom:32px;">Свяжитесь с нами</h2>` : ''}
<form onsubmit="event.preventDefault();" style="display:flex;flex-direction:column;">
${has('имя') ? `<input type="text" placeholder="Ваше имя" style="border-color:${s.accent}44;">` : ''}
${has('email') ? `<input type="email" placeholder="Email" style="border-color:${s.accent}44;">` : ''}
${has('телефон') ? `<input type="tel" placeholder="Телефон" style="border-color:${s.accent}44;">` : ''}
${has('сообщение') ? `<textarea placeholder="Сообщение" style="border-color:${s.accent}44;"></textarea>` : ''}
${has('отправить') ? `<button class="btn" type="submit" style="background:${s.accent};color:#fff;margin-top:8px;">Отправить</button>` : ''}
</form>
${has('карта') || has('адрес') ? `<div style="margin-top:32px;text-align:center;opacity:0.7;"><p>📍 Москва, ул. Примерная, д. 1</p><p>📞 +7 (999) 123-45-67</p><p>✉️ info@example.com</p></div>` : ''}
</div></section>`;
}

function buildCTA(s: Scheme, has: HasFn, sec: BuilderSection) {
  return `<section style="background:${has('фон') ? s.accent : s.bg};color:${has('фон') ? '#fff' : s.text};padding:80px 0;text-align:center;">
<div class="container">
${has('заголовок') ? `<h2 style="font-size:36px;margin-bottom:16px;">${sec.subtitle || 'Готовы начать?'}</h2>` : ''}
${has('описание') ? `<p style="font-size:18px;opacity:0.9;margin-bottom:32px;max-width:500px;margin-left:auto;margin-right:auto;">Свяжитесь с нами прямо сейчас и получите бесплатную консультацию</p>` : ''}
${has('кнопка') ? `<a class="btn" style="background:${has('фон') ? '#fff' : s.accent};color:${has('фон') ? s.accent : '#fff'};font-size:18px;padding:16px 48px;" href="#">Связаться</a>` : ''}
</div></section>`;
}

function buildFAQ(s: Scheme, has: HasFn, sec: BuilderSection) {
  const count = has('6 вопрос') ? 6 : 4;
  const faqs = [
    ['Как начать работу?', 'Свяжитесь с нами через форму или позвоните — мы обсудим детали проекта.'],
    ['Сколько стоит?', 'Стоимость зависит от объёма работ. Мы предоставим точную оценку после обсуждения.'],
    ['Какие сроки?', 'Стандартные сроки — от 2 до 4 недель в зависимости от сложности проекта.'],
    ['Есть ли гарантии?', 'Да, мы предоставляем гарантию на все выполненные работы.'],
    ['Можно ли вносить правки?', 'Конечно! 2 раунда правок включены в стоимость.'],
    ['Работаете ли вы с регионами?', 'Да, мы работаем со всей Россией и СНГ.'],
  ];
  return `<section style="background:${s.bg};color:${s.text};padding:80px 0;">
<div class="container" style="max-width:800px;">
${has('заголовок') ? `<h2 style="text-align:center;font-size:36px;margin-bottom:48px;">Частые вопросы</h2>` : ''}
${faqs.slice(0, count).map(([q, a]) => `<details style="border-bottom:1px solid ${s.accent}22;padding:16px 0;cursor:pointer;">
<summary style="font-weight:600;font-size:16px;">${q}</summary>
<p style="margin-top:8px;opacity:0.8;font-size:14px;">${a}</p>
</details>`).join('\n')}
</div></section>`;
}

function buildStats(s: Scheme, has: HasFn, sec: BuilderSection) {
  const count = has('4 счётчика') ? 4 : 3;
  const stats = [
    { icon: '🏆', num: '500+', label: 'Проектов' },
    { icon: '😊', num: '300+', label: 'Клиентов' },
    { icon: '⭐', num: '4.9', label: 'Рейтинг' },
    { icon: '📅', num: '10+', label: 'Лет опыта' },
  ];
  return `<section style="background:${s.bg};color:${s.text};padding:80px 0;text-align:center;">
<div class="container">
${has('заголовок') ? `<h2 style="font-size:36px;margin-bottom:48px;">Наши цифры</h2>` : ''}
<div class="grid-${count}" style="max-width:${count * 250}px;margin:0 auto;">
${stats.slice(0, count).map(st => `<div>
${has('иконки') ? `<div style="font-size:40px;margin-bottom:8px;">${st.icon}</div>` : ''}
<div style="font-size:36px;font-weight:800;color:${s.accent};">${st.num}</div>
<div style="opacity:0.7;margin-top:4px;">${st.label}</div>
</div>`).join('\n')}
</div></div></section>`;
}

function buildTeam(s: Scheme, has: HasFn, sec: BuilderSection) {
  const members = [
    { name: 'Иван Петров', role: 'Директор' },
    { name: 'Мария Сидорова', role: 'Дизайнер' },
    { name: 'Алексей Козлов', role: 'Разработчик' },
  ];
  return `<section style="background:${s.bg};color:${s.text};padding:80px 0;">
<div class="container">
${has('заголовок') ? `<h2 style="text-align:center;font-size:36px;margin-bottom:48px;">Наша команда</h2>` : ''}
<div class="grid-3">
${members.map(m => `<div style="text-align:center;">
${has('фото') ? `<div style="width:120px;height:120px;border-radius:50%;background:${s.accent}22;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:48px;">👤</div>` : ''}
${has('имена') ? `<h3 style="font-size:18px;margin-bottom:4px;">${m.name}</h3>` : ''}
${has('должност') ? `<p style="color:${s.accent};font-size:14px;">${m.role}</p>` : ''}
${has('соцсет') ? `<div style="margin-top:8px;display:flex;gap:12px;justify-content:center;font-size:18px;"><a href="#">📘</a><a href="#">💼</a><a href="#">📸</a></div>` : ''}
</div>`).join('\n')}
</div></div></section>`;
}

function buildFooter(s: Scheme, has: HasFn, sec: BuilderSection) {
  return `<footer style="background:${s.bg};color:${s.text};padding:40px 0;border-top:1px solid ${s.accent}22;">
<div class="container" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
<div>
${has('логотип') ? `<div style="font-size:18px;font-weight:700;color:${s.accent};">● Сайт</div>` : ''}
${has('копирайт') ? `<p style="font-size:12px;opacity:0.5;margin-top:4px;">© 2025 Все права защищены</p>` : ''}
</div>
${has('навигация') ? `<nav style="display:flex;gap:16px;font-size:14px;"><a href="#" style="opacity:0.7;">Главная</a><a href="#" style="opacity:0.7;">О нас</a><a href="#" style="opacity:0.7;">Контакты</a></nav>` : ''}
<div>
${has('соцсет') ? `<div style="display:flex;gap:12px;font-size:20px;"><a href="#">📘</a><a href="#">💼</a><a href="#">📸</a></div>` : ''}
${has('email') ? `<p style="font-size:12px;opacity:0.6;">info@example.com</p>` : ''}
${has('телефон') ? `<p style="font-size:12px;opacity:0.6;">+7 (999) 123-45-67</p>` : ''}
</div>
</div></footer>`;
}
