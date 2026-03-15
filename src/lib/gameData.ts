export interface FreelanceOrder {
  id: string;
  clientName: string;
  clientAvatar: string;
  title: string;
  description: string;
  budget: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  prompt: string; // What the AI client wants built
}

export interface GameState {
  balance: number;
  reputation: number;
  completedOrders: number;
  currentOrder: FreelanceOrder | null;
  ownedItems: string[];
  month: number; // game months passed
  introDone: boolean;
}

export const FREELANCE_ORDERS: FreelanceOrder[] = [
  {
    id: '1',
    clientName: 'Иван Петров',
    clientAvatar: '👨‍💼',
    title: 'Лендинг для кофейни',
    description: 'Нужен красивый лендинг для моей кофейни "Бариста". Тёплые цвета, меню, контакты.',
    budget: 500,
    difficulty: 'easy',
    category: 'Лендинг',
    prompt: 'Создай лендинг для кофейни "Бариста". Тёплые коричневые тона, секция с меню кофе, секция "О нас", контакты и карта. Стильный и уютный дизайн.',
  },
  {
    id: '2',
    clientName: 'Мария Сидорова',
    clientAvatar: '👩‍💻',
    title: 'Портфолио фотографа',
    description: 'Минималистичный сайт-портфолио с галереей работ и формой обратной связи.',
    budget: 800,
    difficulty: 'easy',
    category: 'Портфолио',
    prompt: 'Создай минималистичное портфолио фотографа. Чёрно-белая тема, большие фото, сетка галереи, секция "Обо мне" и контактная форма.',
  },
  {
    id: '3',
    clientName: 'СтартапХаб',
    clientAvatar: '🚀',
    title: 'Лендинг SaaS продукта',
    description: 'Посадочная страница для нашего B2B инструмента аналитики. Нужна секция с фичами, pricing и CTA.',
    budget: 1500,
    difficulty: 'medium',
    category: 'SaaS',
    prompt: 'Создай лендинг для SaaS аналитики "DataPulse". Современный тёмный дизайн, hero секция с CTA, блок фич с иконками, таблица цен (3 плана), секция отзывов, футер.',
  },
  {
    id: '4',
    clientName: 'FitLife',
    clientAvatar: '💪',
    title: 'Лендинг фитнес-приложения',
    description: 'Яркий лендинг для мобильного фитнес-приложения с секцией загрузки.',
    budget: 1000,
    difficulty: 'medium',
    category: 'Мобильное приложение',
    prompt: 'Создай яркий лендинг для фитнес-приложения "FitLife". Градиенты оранжевый-фиолетовый, мокап телефона, секция фич, отзывы пользователей, кнопки App Store/Google Play.',
  },
  {
    id: '5',
    clientName: 'CryptoVault',
    clientAvatar: '🔐',
    title: 'Лендинг криптокошелька',
    description: 'Футуристичный лендинг для криптовалютного кошелька с акцентом на безопасность.',
    budget: 2500,
    difficulty: 'hard',
    category: 'Финтех',
    prompt: 'Создай футуристичный лендинг для криптокошелька "CryptoVault". Тёмная тема с неоновыми акцентами, анимированный hero, секция безопасности, как это работает (3 шага), FAQ, футер с соцсетями.',
  },
];

export const INITIAL_GAME_STATE: GameState = {
  balance: 0,
  reputation: 0,
  completedOrders: 0,
  currentOrder: null,
};
