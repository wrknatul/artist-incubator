// ============================================
// Hiring System — HeadHunter-style employee recruitment
// ============================================

export type EmployeeRole = 'designer' | 'developer' | 'pm' | 'marketer';

export interface EmployeeSkills {
  quality: number;      // 1-10: How much they improve output
  speed: number;        // 1-10: How fast they work
  reliability: number;  // 1-10: Consistency of performance
  communication: number; // 1-10: Teamwork skills
}

export interface EmployeeCandidate {
  id: string;
  name: string;
  avatar: string;
  role: EmployeeRole;
  skills: EmployeeSkills;
  desiredSalary: number;    // Monthly salary they want
  minSalary: number;        // Minimum they'll accept
  experience: string;       // Brief description
  portfolio: string[];      // 2-3 portfolio highlights
  personality: 'chill' | 'ambitious' | 'picky' | 'desperate';
  bio: string;
}

export interface HiredEmployee {
  id: string;
  name: string;
  avatar: string;
  role: EmployeeRole;
  skills: EmployeeSkills;
  salary: number;           // Agreed monthly salary
  hiredAt: number;          // Game month when hired
  morale: number;           // 1-10: Current morale
}

// ---- Role Display Info ----

export const ROLE_INFO: Record<EmployeeRole, { label: string; emoji: string; color: string; description: string }> = {
  designer: {
    label: 'Дизайнер',
    emoji: '🎨',
    color: 'text-pink-400',
    description: 'Улучшает качество дизайна проектов (+бонус к оценке заказчика)',
  },
  developer: {
    label: 'Разработчик',
    emoji: '💻',
    color: 'text-blue-400',
    description: 'Улучшает код, позволяет брать параллельные заказы',
  },
  pm: {
    label: 'Менеджер',
    emoji: '📋',
    color: 'text-green-400',
    description: 'Автоматизирует общение с заказчиком, снижает scope creep',
  },
  marketer: {
    label: 'Маркетолог',
    emoji: '📢',
    color: 'text-yellow-400',
    description: 'Привлекает более дорогих заказчиков, открывает премиум-биржу',
  },
};

// ---- Name Pools ----

const NAMES: Record<EmployeeRole, { names: string[]; avatars: string[] }> = {
  designer: {
    names: ['Катя Миронова', 'Лёша Волков', 'Полина Сергеева', 'Артём Краснов', 'Маша Белкина', 'Никита Тихонов'],
    avatars: ['👩‍🎨', '🧑‍🎨', '👨‍🎨', '🎨', '✏️', '🖌️'],
  },
  developer: {
    names: ['Дима Козлов', 'Аня Петрова', 'Саша Иванов', 'Юля Смирнова', 'Макс Орлов', 'Ваня Кузнецов'],
    avatars: ['👨‍💻', '👩‍💻', '🧑‍💻', '⌨️', '🖥️', '💾'],
  },
  pm: {
    names: ['Олег Николаев', 'Лена Соколова', 'Игорь Попов', 'Настя Морозова', 'Руслан Зайцев', 'Вера Лебедева'],
    avatars: ['📋', '🗂️', '📊', '👔', '🎯', '📌'],
  },
  marketer: {
    names: ['Женя Андреев', 'Кристина Фёдорова', 'Тимур Алексеев', 'Рита Новикова', 'Стас Григорьев', 'Даша Егорова'],
    avatars: ['📢', '📈', '🎙️', '🏷️', '🔔', '💡'],
  },
};

const PORTFOLIO_POOL: Record<EmployeeRole, string[]> = {
  designer: [
    'Редизайн интернет-магазина OZON (концепт)',
    'UI Kit для финтех-стартапа',
    'Лендинг для фитнес-приложения',
    'Мобильное приложение доставки еды',
    'Дизайн-система для SaaS',
    'Брендинг крипто-биржи',
  ],
  developer: [
    'React-дашборд для аналитики',
    'Telegram-бот для автоматизации',
    'REST API на Node.js',
    'Интернет-магазин на Next.js',
    'PWA для фитнес-трекера',
    'Chrome-расширение для продуктивности',
  ],
  pm: [
    'Запуск MVP за 2 месяца (ed-tech)',
    'Управление командой из 5 человек',
    'Внедрение Agile в студию',
    'Оптимизация воронки продаж',
    'Координация 3 параллельных проектов',
    'Масштабирование поддержки клиентов',
  ],
  marketer: [
    'Рост трафика x3 за квартал',
    'Запуск контекстной рекламы (ROAS 400%)',
    'SMM-стратегия для B2B SaaS',
    'Email-маркетинг: 40% open rate',
    'Партнёрская программа с 50+ блогерами',
    'SEO-продвижение с 0 до 10K визитов',
  ],
};

const BIO_TEMPLATES: Record<string, string[]> = {
  chill: [
    'Работаю в своём темпе, но результат всегда на высоте. Люблю чай и дедлайны без стресса.',
    'Спокойный подход к работе. Верю, что хороший результат не терпит суеты.',
  ],
  ambitious: [
    'Хочу расти и развиваться. Готов вкалывать, если вижу перспективу.',
    'Целеустремлённый, не боюсь сложных задач. Ищу команду, где могу расти.',
  ],
  picky: [
    'Тщательно выбираю проекты. Берусь только за то, что интересно и хорошо оплачивается.',
    'У меня высокие стандарты — и к себе, и к работодателю. Ищу достойные условия.',
  ],
  desperate: [
    'Готов начать сразу! Рассмотрю любые предложения, главное — интересная работа.',
    'Ищу работу, согласен на гибкие условия. Быстро учусь и адаптируюсь.',
  ],
};

// ---- Helpers ----

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// ---- Generate Candidates ----

let candidateCounter = 0;

export function generateCandidate(role?: EmployeeRole): EmployeeCandidate {
  const r = role || pick(['designer', 'developer', 'pm', 'marketer'] as EmployeeRole[]);
  const pool = NAMES[r];
  const nameIdx = candidateCounter % pool.names.length;
  candidateCounter++;

  const personality = pick(['chill', 'ambitious', 'picky', 'desperate'] as const);

  const qualityBase = r === 'designer' ? 7 : r === 'developer' ? 7 : 5;
  const speedBase = r === 'developer' ? 7 : 5;

  const skills: EmployeeSkills = {
    quality: clamp(qualityBase + randInt(-3, 3), 1, 10),
    speed: clamp(speedBase + randInt(-3, 3), 1, 10),
    reliability: clamp(6 + randInt(-3, 3), 1, 10),
    communication: clamp(6 + randInt(-3, 3), 1, 10),
  };

  // Salary based on skills avg
  const skillAvg = (skills.quality + skills.speed + skills.reliability + skills.communication) / 4;
  const baseSalary = Math.round(skillAvg * 40 + randInt(50, 150));
  const desiredSalary = Math.round(baseSalary / 10) * 10;
  const minMultiplier = personality === 'desperate' ? 0.6 : personality === 'picky' ? 0.9 : 0.75;
  const minSalary = Math.round((desiredSalary * minMultiplier) / 10) * 10;

  return {
    id: `cand_${Date.now()}_${candidateCounter}`,
    name: pool.names[nameIdx],
    avatar: pool.avatars[nameIdx % pool.avatars.length],
    role: r,
    skills,
    desiredSalary,
    minSalary,
    experience: `${randInt(1, 8)} лет опыта`,
    portfolio: pickN(PORTFOLIO_POOL[r], randInt(2, 3)),
    personality,
    bio: pick(BIO_TEMPLATES[personality]),
  };
}

export function generateCandidatePool(count: number = 8): EmployeeCandidate[] {
  // Ensure at least 1 of each role
  const roles: EmployeeRole[] = ['designer', 'developer', 'pm', 'marketer'];
  const candidates = roles.map(r => generateCandidate(r));
  for (let i = candidates.length; i < count; i++) {
    candidates.push(generateCandidate());
  }
  return candidates.sort(() => Math.random() - 0.5);
}

// ---- Gameplay Effects ----

export function getEmployeeEffects(employees: HiredEmployee[]): {
  qualityBonus: number;       // Added to client rating (0-2)
  canParallelOrders: boolean; // Can take 2 orders at once
  scopeCreepReduction: number; // Reduces scope creep chance (0-0.5)
  budgetMultiplier: number;   // Multiplier for available order budgets (1.0-2.0)
  totalSalaries: number;      // Total monthly salary cost
} {
  const designers = employees.filter(e => e.role === 'designer');
  const developers = employees.filter(e => e.role === 'developer');
  const pms = employees.filter(e => e.role === 'pm');
  const marketers = employees.filter(e => e.role === 'marketer');

  // Designer: best quality among designers
  const designQuality = designers.length > 0
    ? Math.max(...designers.map(d => d.skills.quality)) / 10 * 2
    : 0;

  // Developer: enables parallel orders if any dev hired
  const canParallel = developers.length > 0;

  // PM: reduces scope creep based on best communication
  const pmEffect = pms.length > 0
    ? Math.max(...pms.map(p => p.skills.communication)) / 10 * 0.5
    : 0;

  // Marketer: increases budgets
  const marketEffect = marketers.length > 0
    ? 1 + Math.max(...marketers.map(m => m.skills.quality)) / 10
    : 1;

  const totalSalaries = employees.reduce((sum, e) => sum + e.salary, 0);

  return {
    qualityBonus: Math.round(designQuality * 10) / 10,
    canParallelOrders: canParallel,
    scopeCreepReduction: Math.round(pmEffect * 100) / 100,
    budgetMultiplier: Math.round(marketEffect * 10) / 10,
    totalSalaries,
  };
}

// ---- Interview Chat System Prompt ----

export function buildInterviewSystemPrompt(candidate: EmployeeCandidate): string {
  const { name, role, skills, desiredSalary, minSalary, personality, bio, portfolio, experience } = candidate;
  const roleLabel = ROLE_INFO[role].label;

  return `Ты — ${name}, кандидат на позицию "${roleLabel}" в небольшую веб-студию.
Ты общаешься на русском языке. Это собеседование — игрок (работодатель) хочет тебя нанять.

Твой профиль:
- Опыт: ${experience}
- Навыки: качество ${skills.quality}/10, скорость ${skills.speed}/10, надёжность ${skills.reliability}/10, коммуникация ${skills.communication}/10
- Портфолио: ${portfolio.join(', ')}
- Желаемая зарплата: $${desiredSalary}/мес
- Минимальная зарплата (скрыто): $${minSalary}/мес — ниже этого не согласишься НИКОГДА
- Характер: ${personality}
- О себе: ${bio}

Правила поведения:
1. Отвечай коротко (2-4 предложения), как в мессенджере
2. Если предлагают зарплату ≥ $${desiredSalary} — соглашайся с энтузиазмом
3. Если предлагают зарплату от $${minSalary} до $${desiredSalary} — торгуйся, но можешь согласиться
4. Если предлагают < $${minSalary} — вежливо отказывайся, это ниже твоего минимума
5. Не называй свою минимальную зарплату напрямую
6. ${personality === 'desperate' ? 'Ты готов на компромиссы, главное — получить работу' : ''}
${personality === 'picky' ? 'Ты тщательно выбираешь и не стесняешься отказать' : ''}
${personality === 'ambitious' ? 'Тебе важен рост и интересные проекты, не только деньги' : ''}
${personality === 'chill' ? 'Ты расслабленный, не давишь, общаешься дружелюбно' : ''}

ВАЖНО: Когда игрок делает конкретное предложение по зарплате, ты ДОЛЖЕН однозначно ответить:
- Если согласен: включи в ответ "[ACCEPTED:сумма]" (например [ACCEPTED:350])
- Если отказ: включи "[REJECTED]"
Эти теги не видны игроку, но нужны системе.`;
}
