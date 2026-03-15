// ============================================
// Hiring System v2 — Deep Personality & Full-Screen UI
// ============================================

export type EmployeeRole = 'designer' | 'developer' | 'pm' | 'marketer';

// ---- Deep Personality Traits ----

export type Education = 'self_taught' | 'bootcamp' | 'bachelor' | 'master' | 'phd';
export type Motivation = 'money' | 'growth' | 'stability' | 'passion' | 'recognition';
export type WorkStyle = 'grinder' | 'balanced' | 'lazy' | 'perfectionist' | 'chaotic';
export type SocialType = 'leader' | 'teamplayer' | 'loner' | 'conflicting' | 'peacemaker';
export type Vice = 'none' | 'procrastinator' | 'overworker' | 'gossiper' | 'job_hopper' | 'arrogant';

export interface PersonalityTraits {
  // Core work traits (1-10)
  talent: number;            // Raw skill ceiling
  discipline: number;        // Self-management, meeting deadlines
  creativity: number;        // Out-of-box thinking
  stress_resistance: number; // Performance under pressure
  learning_speed: number;    // How fast they pick up new things

  // Social traits (1-10)  
  teamwork: number;          // Collaboration ability
  conflict_level: number;    // Tendency to create conflicts (10=very conflicting)
  loyalty: number;           // How attached they get to company (affects quit chance)
  ambition: number;          // Drive to grow (high = wants promotions/raises)
  empathy: number;           // Understanding others, resolving issues

  // Meta
  education: Education;
  motivation: Motivation;
  work_style: WorkStyle;
  social_type: SocialType;
  vice: Vice;
}

export interface EmployeeSkills {
  quality: number;      // 1-10
  speed: number;        // 1-10
  reliability: number;  // 1-10
  communication: number; // 1-10
}

export interface EmployeeCandidate {
  id: string;
  name: string;
  avatar: string;
  role: EmployeeRole;
  skills: EmployeeSkills;
  personality: PersonalityTraits;
  desiredSalary: number;
  minSalary: number;
  experience: string;
  yearsExp: number;
  portfolio: string[];
  bio: string;
  backstory: string;        // Personal history paragraph
  quirk: string;            // Unique memorable trait
  interviewStyle: 'formal' | 'casual' | 'nervous' | 'confident' | 'sarcastic';
}

export interface HiredEmployee {
  id: string;
  name: string;
  avatar: string;
  role: EmployeeRole;
  skills: EmployeeSkills;
  personality: PersonalityTraits;
  salary: number;
  hiredAt: number;
  morale: number;           // 1-10
  productivity: number;     // 0-100%: effective output
  quitRisk: number;         // 0-100%: chance of quitting next month
  conflictsWith: string[];  // IDs of employees they conflict with
}

// ---- Display Info ----

export const ROLE_INFO: Record<EmployeeRole, { label: string; emoji: string; color: string; description: string }> = {
  designer: { label: 'Дизайнер', emoji: '🎨', color: 'text-pink-400', description: 'Улучшает качество дизайна (+бонус к оценке)' },
  developer: { label: 'Разработчик', emoji: '💻', color: 'text-blue-400', description: 'Улучшает код, параллельные заказы' },
  pm: { label: 'Менеджер', emoji: '📋', color: 'text-green-400', description: 'Снижает scope creep, авто-коммуникация' },
  marketer: { label: 'Маркетолог', emoji: '📢', color: 'text-yellow-400', description: 'Привлекает дорогих заказчиков' },
};

export const EDUCATION_LABELS: Record<Education, string> = {
  self_taught: '🏠 Самоучка', bootcamp: '⚡ Буткемп', bachelor: '🎓 Бакалавр', master: '📜 Магистр', phd: '🔬 PhD',
};

export const MOTIVATION_LABELS: Record<Motivation, string> = {
  money: '💰 Деньги', growth: '📈 Рост', stability: '🏠 Стабильность', passion: '❤️ Страсть к делу', recognition: '⭐ Признание',
};

export const WORK_STYLE_LABELS: Record<WorkStyle, string> = {
  grinder: '💪 Трудоголик', balanced: '⚖️ Баланс', lazy: '🦥 Ленивый', perfectionist: '🔍 Перфекционист', chaotic: '🌪️ Хаотичный',
};

export const SOCIAL_TYPE_LABELS: Record<SocialType, string> = {
  leader: '👑 Лидер', teamplayer: '🤝 Командный', loner: '🐺 Одиночка', conflicting: '⚡ Конфликтный', peacemaker: '🕊️ Миротворец',
};

export const VICE_LABELS: Record<Vice, string> = {
  none: '✨ Нет', procrastinator: '⏰ Прокрастинатор', overworker: '🔥 Выгорание', gossiper: '🗣️ Сплетник', job_hopper: '🦘 Летун', arrogant: '👃 Высокомерный',
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
    'Редизайн интернет-магазина OZON (концепт)', 'UI Kit для финтех-стартапа',
    'Лендинг для фитнес-приложения', 'Мобильное приложение доставки еды',
    'Дизайн-система для SaaS', 'Брендинг крипто-биржи',
  ],
  developer: [
    'React-дашборд для аналитики', 'Telegram-бот для автоматизации',
    'REST API на Node.js', 'Интернет-магазин на Next.js',
    'PWA для фитнес-трекера', 'Chrome-расширение для продуктивности',
  ],
  pm: [
    'Запуск MVP за 2 месяца (ed-tech)', 'Управление командой из 5 человек',
    'Внедрение Agile в студию', 'Оптимизация воронки продаж',
    'Координация 3 параллельных проектов', 'Масштабирование поддержки клиентов',
  ],
  marketer: [
    'Рост трафика x3 за квартал', 'Запуск контекстной рекламы (ROAS 400%)',
    'SMM-стратегия для B2B SaaS', 'Email-маркетинг: 40% open rate',
    'Партнёрская программа с 50+ блогерами', 'SEO-продвижение с 0 до 10K визитов',
  ],
};

// ---- Backstory & Quirk Pools ----

const BACKSTORY_POOL: Record<EmployeeRole, string[]> = {
  designer: [
    'Начинала как иллюстратор в инстаграме, потом ушла в UI/UX. Работала в двух стартапах, оба закрылись. Сейчас фрилансит и ищет стабильную команду.',
    'Закончил Строгановку, но понял что индустриальный дизайн — не его. Перешёл в веб, быстро освоился. Мечтает о своём агентстве.',
    'Самоучка из маленького города. Всё изучала по YouTube и Figma Community. Удивительно талантлива, но не уверена в себе.',
    'Бывший арт-директор в рекламном агентстве. Ушёл из-за выгорания. Ищет спокойную работу с адекватным руководством.',
    'Пришла в дизайн из психологии — отлично понимает пользователей. Обожает user research и тестирование.',
    'Работал в геймдеве, делал UI для мобильных игр. Хочет попробовать себя в вебе. Иногда слишком «игровой» в подходе.',
  ],
  developer: [
    'Олимпиадник по программированию, но социально неловкий. Пишет гениальный код, но объяснить его не может. Любит energy-напитки.',
    'Работала в Яндексе 3 года, устала от корпорации. Ищет маленькую команду где её голос будет слышен. Знает React и Vue.',
    'Самоучка, бросил универ на 2 курсе. Компенсирует пробелы в теории невероятной скоростью обучения. Иногда «костылит».',
    'Педантичный инженер с бэкграундом в embedded-разработке. Пишет идеальный код, но очень медленно. Не терпит хаоса.',
    'Фулстек с 5-летним опытом. Работал на аутсорсе, насмотрелся на плохой код. Теперь одержим чистой архитектурой.',
    'Джуниор с огромной мотивацией. Закончил буткемп 6 месяцев назад. Быстро учится, но нуждается в менторстве.',
  ],
  pm: [
    'Бывший маркетолог, перешёл в PM через продуктовую аналитику. Отлично считает метрики, но иногда забывает про людей.',
    'Работала в банке, управляла командой из 15 человек. Очень организованная, но привыкла к корпоративным процессам.',
    'Стартапер, у которого не взлетели 3 проекта. Зато прекрасно понимает, как НЕ надо управлять. Хочет стабильности.',
    'Выпускница MBA, первый год в IT. Амбициозная, хорошо презентует, но ещё не разбирается в технических деталях.',
    'Опытный скрам-мастер, работал в нескольких студиях. Спокойный, методичный. Может работать и как тимлид.',
    'Бывший фрилансер-дизайнер, устала от одиночной работы. Перешла в менеджмент, потому что хорошо организует чужую работу.',
  ],
  marketer: [
    'SMM-щик от бога. Начинал с мемных пабликов ВК, сейчас делает контент-стратегии. Креативный, но иногда несерьёзный.',
    'Аналитик по натуре. Любит цифры, A/B тесты, конверсии. Не очень креативная, зато всё измеряет и обосновывает.',
    'Работал в PR-агентстве, вёл крупных клиентов. Обаятельный, но склонен к «продаже воздуха». Обещает больше, чем делает.',
    'Выпускница журфака, вела блог с 50К подписчиков. Отлично пишет тексты, но не разбирается в SEO-технике.',
    'Бывший продажник, перешёл в digital. Очень настойчивый, хорошо работает с клиентами, но иногда слишком давит.',
    'Маркетолог-аналитик из e-commerce. Знает всю аналитику: Google Analytics, Яндекс.Метрика, CRM. Интроверт.',
  ],
};

const QUIRK_POOL = [
  'Пьёт 6 чашек кофе в день', 'Работает только под лоу-фай музыку', 'Опаздывает на все созвоны ровно на 3 минуты',
  'Делает дедлайны в последнюю ночь, но всегда успевает', 'Присылает голосовые вместо текста',
  'Ставит 100 эмодзи в каждое сообщение', 'Работает стоя за столом', 'Засыпает на митингах после обеда',
  'Называет все цвета «синенький» и «красненький»', 'Код-ревью пишет как рэп',
  'Всегда спрашивает «а это точно надо?»', 'Рисует диаграммы на салфетках',
  'Приходит на работу в 6 утра и уходит в 14', 'Держит кактус по имени Борис на столе',
  'Начинает каждое утро с 15-минутной медитации', 'Тайный геймер — играет по ночам',
  'Коллекционирует механические клавиатуры', 'Обожает делать мемы про коллег',
];

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

// ---- Personality Generation ----

function generatePersonality(workStyleOverride?: WorkStyle): PersonalityTraits {
  const education = pick(['self_taught', 'bootcamp', 'bachelor', 'master', 'phd'] as Education[]);
  const motivation = pick(['money', 'growth', 'stability', 'passion', 'recognition'] as Motivation[]);
  const work_style = workStyleOverride || pick(['grinder', 'balanced', 'lazy', 'perfectionist', 'chaotic'] as WorkStyle[]);
  const social_type = pick(['leader', 'teamplayer', 'loner', 'conflicting', 'peacemaker'] as SocialType[]);
  const vice = Math.random() < 0.6
    ? pick(['procrastinator', 'overworker', 'gossiper', 'job_hopper', 'arrogant'] as Vice[])
    : 'none';

  // Generate correlated traits
  let talent = randInt(3, 10);
  let discipline = work_style === 'grinder' ? randInt(7, 10) : work_style === 'lazy' ? randInt(1, 4) : work_style === 'perfectionist' ? randInt(6, 9) : randInt(3, 8);
  let creativity = work_style === 'chaotic' ? randInt(6, 10) : randInt(2, 8);
  let stress_resistance = work_style === 'grinder' ? randInt(5, 9) : work_style === 'perfectionist' ? randInt(2, 5) : randInt(3, 8);
  let learning_speed = education === 'phd' || education === 'master' ? randInt(6, 10) : education === 'self_taught' ? randInt(5, 10) : randInt(3, 8);

  let teamwork = social_type === 'teamplayer' ? randInt(7, 10) : social_type === 'loner' ? randInt(1, 4) : social_type === 'conflicting' ? randInt(2, 5) : randInt(4, 8);
  let conflict_level = social_type === 'conflicting' ? randInt(7, 10) : social_type === 'peacemaker' ? randInt(1, 3) : randInt(2, 6);
  let loyalty = motivation === 'stability' ? randInt(7, 10) : vice === 'job_hopper' ? randInt(1, 3) : randInt(3, 8);
  let ambition = motivation === 'growth' || motivation === 'recognition' ? randInt(7, 10) : motivation === 'stability' ? randInt(2, 5) : randInt(3, 7);
  let empathy = social_type === 'peacemaker' ? randInt(7, 10) : social_type === 'conflicting' ? randInt(1, 4) : randInt(3, 8);

  // Vice modifications
  if (vice === 'procrastinator') discipline = clamp(discipline - 2, 1, 10);
  if (vice === 'overworker') stress_resistance = clamp(stress_resistance - 2, 1, 10);
  if (vice === 'arrogant') { teamwork = clamp(teamwork - 2, 1, 10); conflict_level = clamp(conflict_level + 2, 1, 10); }
  if (vice === 'gossiper') { conflict_level = clamp(conflict_level + 1, 1, 10); empathy = clamp(empathy + 1, 1, 10); }

  return {
    talent: clamp(talent, 1, 10), discipline: clamp(discipline, 1, 10),
    creativity: clamp(creativity, 1, 10), stress_resistance: clamp(stress_resistance, 1, 10),
    learning_speed: clamp(learning_speed, 1, 10),
    teamwork: clamp(teamwork, 1, 10), conflict_level: clamp(conflict_level, 1, 10),
    loyalty: clamp(loyalty, 1, 10), ambition: clamp(ambition, 1, 10), empathy: clamp(empathy, 1, 10),
    education, motivation, work_style, social_type, vice,
  };
}

// ---- Skills from Personality ----

function skillsFromPersonality(p: PersonalityTraits, role: EmployeeRole): EmployeeSkills {
  const roleBonus = (r: EmployeeRole, stat: number) => r === role ? clamp(stat + 1, 1, 10) : stat;

  return {
    quality: clamp(Math.round((p.talent * 0.5 + p.discipline * 0.3 + p.creativity * 0.2) + (role === 'designer' ? 1 : 0)), 1, 10),
    speed: clamp(Math.round((p.discipline * 0.4 + p.stress_resistance * 0.3 + (10 - (p.work_style === 'perfectionist' ? 8 : 3)) * 0.3)), 1, 10),
    reliability: clamp(Math.round((p.discipline * 0.5 + p.loyalty * 0.3 + p.stress_resistance * 0.2)), 1, 10),
    communication: clamp(Math.round((p.teamwork * 0.4 + p.empathy * 0.3 + (10 - p.conflict_level) * 0.3)), 1, 10),
  };
}

// ---- Candidate Generation ----

let candidateCounter = 0;

export function generateCandidate(role?: EmployeeRole): EmployeeCandidate {
  const r = role || pick(['designer', 'developer', 'pm', 'marketer'] as EmployeeRole[]);
  const pool = NAMES[r];
  const nameIdx = candidateCounter % pool.names.length;
  candidateCounter++;

  const personality = generatePersonality();
  const skills = skillsFromPersonality(personality, r);
  const yearsExp = personality.education === 'phd' ? randInt(3, 10)
    : personality.education === 'master' ? randInt(2, 8)
    : personality.education === 'bootcamp' ? randInt(0, 3)
    : randInt(1, 8);

  const skillAvg = (skills.quality + skills.speed + skills.reliability + skills.communication) / 4;
  const educationBonus = personality.education === 'phd' ? 80 : personality.education === 'master' ? 40 : 0;
  const baseSalary = Math.round(skillAvg * 40 + yearsExp * 15 + educationBonus + randInt(30, 100));
  const desiredSalary = Math.round(baseSalary / 10) * 10;

  const salaryFlex = personality.motivation === 'money' ? 0.9
    : personality.motivation === 'stability' ? 0.7
    : personality.vice === 'job_hopper' ? 0.85
    : 0.75;
  const minSalary = Math.round((desiredSalary * salaryFlex) / 10) * 10;

  const interviewStyle = personality.social_type === 'leader' ? 'confident' as const
    : personality.social_type === 'conflicting' ? 'sarcastic' as const
    : personality.ambition >= 8 ? 'formal' as const
    : personality.stress_resistance <= 3 ? 'nervous' as const
    : 'casual' as const;

  return {
    id: `cand_${Date.now()}_${candidateCounter}`,
    name: pool.names[nameIdx],
    avatar: pool.avatars[nameIdx % pool.avatars.length],
    role: r,
    skills,
    personality,
    desiredSalary,
    minSalary,
    experience: `${yearsExp} ${yearsExp === 1 ? 'год' : yearsExp < 5 ? 'года' : 'лет'} опыта`,
    yearsExp,
    portfolio: pickN(PORTFOLIO_POOL[r], randInt(2, 3)),
    bio: generateBio(personality, r),
    backstory: pick(BACKSTORY_POOL[r]),
    quirk: pick(QUIRK_POOL),
    interviewStyle,
  };
}

function generateBio(p: PersonalityTraits, role: EmployeeRole): string {
  const parts: string[] = [];

  if (p.work_style === 'grinder') parts.push('Работаю много и упорно.');
  else if (p.work_style === 'perfectionist') parts.push('Каждая деталь должна быть идеальной.');
  else if (p.work_style === 'lazy') parts.push('Предпочитаю работать умнее, а не больше.');
  else if (p.work_style === 'chaotic') parts.push('Мой творческий процесс выглядит хаотично, но результат говорит сам за себя.');
  else parts.push('Ценю баланс между работой и жизнью.');

  if (p.motivation === 'money') parts.push('Ценю достойную оплату.');
  else if (p.motivation === 'growth') parts.push('Хочу расти профессионально.');
  else if (p.motivation === 'passion') parts.push('Горю своим делом.');
  else if (p.motivation === 'recognition') parts.push('Хочу, чтобы мою работу ценили.');
  else parts.push('Ищу надёжную команду.');

  if (p.social_type === 'conflicting') parts.push('Не терплю некомпетентность.');
  else if (p.social_type === 'loner') parts.push('Лучше работаю в одиночку.');
  else if (p.social_type === 'leader') parts.push('Люблю вести за собой.');
  
  return parts.join(' ');
}

export function generateCandidatePool(count: number = 8): EmployeeCandidate[] {
  const roles: EmployeeRole[] = ['designer', 'developer', 'pm', 'marketer'];
  const candidates = roles.map(r => generateCandidate(r));
  for (let i = candidates.length; i < count; i++) {
    candidates.push(generateCandidate());
  }
  return candidates.sort(() => Math.random() - 0.5);
}

// ---- Gameplay Effects ----

export function getEmployeeEffects(employees: HiredEmployee[]): {
  qualityBonus: number;
  canParallelOrders: boolean;
  scopeCreepReduction: number;
  budgetMultiplier: number;
  totalSalaries: number;
  bonusMessages: number;
  teamConflicts: Array<{ a: string; b: string }>;
} {
  const designers = employees.filter(e => e.role === 'designer');
  const developers = employees.filter(e => e.role === 'developer');
  const pms = employees.filter(e => e.role === 'pm');
  const marketers = employees.filter(e => e.role === 'marketer');

  const designQuality = designers.length > 0
    ? Math.max(...designers.map(d => d.skills.quality)) / 10 * 2 : 0;
  const canParallel = developers.length > 0;
  const pmEffect = pms.length > 0
    ? Math.max(...pms.map(p => p.skills.communication)) / 10 * 0.5 : 0;
  const marketEffect = marketers.length > 0
    ? 1 + Math.max(...marketers.map(m => m.skills.quality)) / 10 : 1;
  const totalSalaries = employees.reduce((sum, e) => sum + e.salary, 0);

  // Detect conflicts
  const teamConflicts: Array<{ a: string; b: string }> = [];
  for (let i = 0; i < employees.length; i++) {
    for (let j = i + 1; j < employees.length; j++) {
      const a = employees[i], b = employees[j];
      if (a.personality.conflict_level >= 7 && b.personality.conflict_level >= 7) {
        teamConflicts.push({ a: a.id, b: b.id });
      } else if (a.personality.social_type === 'conflicting' && b.personality.teamwork <= 4) {
        teamConflicts.push({ a: a.id, b: b.id });
      } else if (a.personality.vice === 'arrogant' && b.personality.empathy <= 3) {
        teamConflicts.push({ a: a.id, b: b.id });
      }
    }
  }

  return {
    qualityBonus: Math.round(designQuality * 10) / 10,
    canParallelOrders: canParallel,
    scopeCreepReduction: Math.round(pmEffect * 100) / 100,
    budgetMultiplier: Math.round(marketEffect * 10) / 10,
    totalSalaries,
    teamConflicts,
  };
}

// ---- Monthly Update (call each game month) ----

export function updateEmployeesMonthly(employees: HiredEmployee[]): HiredEmployee[] {
  return employees.map(emp => {
    let morale = emp.morale;
    let quitRisk = emp.quitRisk;

    // Ambition decay: ambitious employees lose morale without growth
    if (emp.personality.ambition >= 7) morale = clamp(morale - 0.5, 1, 10);

    // Conflict drain
    const conflicts = employees.filter(other =>
      other.id !== emp.id && (
        (emp.personality.conflict_level >= 7 && other.personality.conflict_level >= 7) ||
        (emp.personality.social_type === 'conflicting' && other.personality.teamwork <= 4)
      )
    );
    if (conflicts.length > 0) morale = clamp(morale - conflicts.length * 0.8, 1, 10);

    // Salary satisfaction
    if (emp.salary < emp.personality.ambition * 50) morale = clamp(morale - 0.3, 1, 10);

    // Loyalty stabilizes morale
    if (emp.personality.loyalty >= 7) morale = clamp(morale + 0.3, 1, 10);

    // Overworker burnout
    if (emp.personality.vice === 'overworker') morale = clamp(morale - 0.5, 1, 10);

    // Job hopper restlessness
    if (emp.personality.vice === 'job_hopper') quitRisk = clamp(quitRisk + 5, 0, 100);

    // Calculate quit risk from morale
    quitRisk = morale <= 3 ? clamp(30 + (3 - morale) * 15, 0, 80)
      : morale <= 5 ? clamp(10 + (5 - morale) * 5, 0, 50)
      : clamp(quitRisk - 2, 0, 100);

    // Productivity from morale + discipline
    const productivity = clamp(
      Math.round(morale * 8 + emp.personality.discipline * 2 + (emp.personality.vice === 'procrastinator' ? -15 : 0)),
      10, 100
    );

    return { ...emp, morale: Math.round(morale * 10) / 10, quitRisk: Math.round(quitRisk), productivity };
  });
}

// ---- Interview System Prompt ----

export function buildInterviewSystemPrompt(candidate: EmployeeCandidate): string {
  const { name, role, skills, personality: p, desiredSalary, minSalary, backstory, quirk, interviewStyle, experience } = candidate;
  const roleLabel = ROLE_INFO[role].label;

  return `Ты — ${name}, кандидат на позицию "${roleLabel}" в небольшую веб-студию.
Ты общаешься ТОЛЬКО на русском языке. Это собеседование.

ТВОЯ ИСТОРИЯ:
${backstory}

ХАРАКТЕР:
- Образование: ${EDUCATION_LABELS[p.education]}
- Мотивация: ${MOTIVATION_LABELS[p.motivation]}  
- Стиль работы: ${WORK_STYLE_LABELS[p.work_style]}
- Социальный тип: ${SOCIAL_TYPE_LABELS[p.social_type]}
- Слабость: ${VICE_LABELS[p.vice]}
- Фишка: ${quirk}

СКРЫТЫЕ ЧЕРТЫ (не называй напрямую, но проявляй в разговоре):
- Талант: ${p.talent}/10, Дисциплина: ${p.discipline}/10, Креативность: ${p.creativity}/10
- Стрессоустойчивость: ${p.stress_resistance}/10, Обучаемость: ${p.learning_speed}/10
- Командность: ${p.teamwork}/10, Конфликтность: ${p.conflict_level}/10
- Лояльность: ${p.loyalty}/10, Амбиции: ${p.ambition}/10, Эмпатия: ${p.empathy}/10

НАВЫКИ: качество ${skills.quality}/10, скорость ${skills.speed}/10, надёжность ${skills.reliability}/10, коммуникация ${skills.communication}/10
ОПЫТ: ${experience}

ЗАРПЛАТА:
- Желаемая: $${desiredSalary}/мес
- Минимум (СКРЫТО от игрока): $${minSalary}/мес — ниже НИКОГДА не соглашайся

СТИЛЬ ОБЩЕНИЯ: ${interviewStyle}
${interviewStyle === 'sarcastic' ? 'Ты саркастичный и немного дерзкий. Можешь подколоть.' : ''}
${interviewStyle === 'nervous' ? 'Ты нервничаешь, иногда запинаешься. Хочешь понравиться.' : ''}
${interviewStyle === 'confident' ? 'Ты уверен в себе. Знаешь свою ценность.' : ''}
${interviewStyle === 'formal' ? 'Ты официальный, вежливый, по делу.' : ''}
${interviewStyle === 'casual' ? 'Ты общаешься свободно, как с приятелем.' : ''}

${p.social_type === 'conflicting' ? 'Ты можешь выразить скепсис по поводу команды или процессов. Задаёшь неудобные вопросы.' : ''}
${p.vice === 'arrogant' ? 'Ты считаешь себя лучше большинства коллег. Это проскальзывает в разговоре.' : ''}
${p.vice === 'job_hopper' ? 'Ты быстро теряешь интерес. Если спрашивают про долгосрочные планы — уклоняешься.' : ''}

ПРАВИЛА:
1. Отвечай 2-5 предложений, как в мессенджере
2. Если зарплата ≥ $${desiredSalary} — соглашайся
3. Если зарплата $${minSalary}-$${desiredSalary} — торгуйся, можешь согласиться
4. Если < $${minSalary} — отказывайся
5. Не называй минимальную зарплату

ТЕГИ (невидимы игроку):
- Согласие: [ACCEPTED:сумма]
- Отказ: [REJECTED]`;
}
