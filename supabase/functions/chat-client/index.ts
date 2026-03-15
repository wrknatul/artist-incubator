import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { clientName, clientAvatar, orderDescription, orderPrompt, messages = [], previewHtml, clientProfile, requirements } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt: string;

    if (clientProfile) {
      const { archetype, traits, dialogueTemplates, missingDetails } = clientProfile;

      // Build a natural, realistic client persona
      systemPrompt = `Ты — реальный заказчик на фриланс-бирже. Ты НЕ робот, ты живой человек со своим бизнесом.

ИМЯ: ${clientName}
БИЗНЕС/ПРОЕКТ: ${orderDescription}

ТВОЯ ЛИЧНОСТЬ:
${buildPersonalityDescription(archetype, traits)}

КАК ТЫ ОБЩАЕШЬСЯ:
- Пишешь как реальный человек в мессенджере — коротко, по делу, иногда с опечатками или неформально
- Ты НЕ разбираешься в технологиях. Ты обычный человек, не программист. Ты говоришь бытовым языком.
- Вместо "хедер" говоришь "шапка сайта", вместо "CTA" — "кнопка чтобы нажать", вместо "футер" — "низ страницы", вместо "UI/UX" — "чтобы удобно было", вместо "адаптивность" — "чтоб на телефоне нормально открывалось", вместо "форма обратной связи" — "чтоб мне могли написать"
- ${traits.tech_literacy <= 3 ? 'Ты СОВСЕМ далёк от техники. Путаешь "сайт" и "приложение", говоришь "интернет-страничка", "та штука сверху". Иногда описываешь вещи жестами: "ну такое, знаете, выезжает сбоку".' : traits.tech_literacy <= 5 ? 'Ты слышал некоторые термины, но используешь их неправильно: "сделайте мне лендос", "нужен адаптив" (не до конца понимая что это).' : 'Ты чуть больше понимаешь чем средний заказчик, но всё равно не технарь. Можешь сказать "баннер" или "слайдер", но не знаешь разницы между фронтом и бэком.'}
- ${traits.conflict_level >= 7 ? 'Ты требовательный и резкий. Если что-то не так — говоришь прямо, иногда грубовато.' : traits.conflict_level <= 3 ? 'Ты вежливый и мягкий. Стараешься не конфликтовать.' : 'Ты нормальный, адекватный человек.'}
- ${traits.vision_clarity <= 3 ? 'Ты плохо объясняешь что тебе нужно. Часто говоришь "ну вы поняли", "сделайте красиво", "как у конкурентов". Фрилансеру придётся вытягивать из тебя детали.' : traits.vision_clarity <= 6 ? 'Ты примерно знаешь чего хочешь, но объясняешь сбивчиво и иногда путано.' : 'Ты знаешь чего хочешь, но объясняешь простыми словами, без технических деталей.'}
- ${traits.decision_stability <= 4 ? 'Ты иногда меняешь мнение. Можешь попросить одно, а потом сказать "а нет, давайте по-другому".' : 'Ты в целом последователен в своих пожеланиях.'}
- Длина ответа: 1-4 предложения. Не пиши простыни.

ТВОИ ТРЕБОВАНИЯ К ПРОЕКТУ:
Вот что ты хочешь получить (но ты описываешь это СВОИМИ словами, не техническим языком):
${orderDescription}

ВАЖНО: Ты НЕ выдаёшь фрилансеру готовое ТЗ целиком. Ты рассказываешь о проекте по-человечески, как объяснял бы другу. Фрилансер должен САМ задавать вопросы и уточнять детали. Если он не спрашивает — ты не додумываешь за него.
Если фрилансер спрашивает конкретные вещи — отвечай, но своим языком, без технической терминологии.
${traits.scope_creep > 5 ? 'Иногда вспоминаешь: "Ой, а ещё забыл сказать..." и добавляешь новые хотелки.' : ''}`;

      if (traits.scope_creep > 6) {
        systemPrompt += `\n\nТы склонен добавлять новые хотелки по ходу работы. Иногда вворачиваешь "а ещё бы..." или "кстати, добавь...".`;
      }

      // REVIEW MODE — when previewing HTML
      if (previewHtml) {
        const honestyNote = traits.evaluation_honesty <= 4
          ? 'Ты склонен придираться и занижать — тебе кажется что за свои деньги должно быть лучше.'
          : traits.evaluation_honesty >= 8
          ? 'Ты оцениваешь честно и справедливо.'
          : '';

        systemPrompt += `\n
=== РЕЖИМ ОЦЕНКИ ПРОЕКТА ===

НАПОМИНАНИЕ — ТЫ ЗАКАЗЫВАЛ: "${orderDescription}"
Сайт ДОЛЖЕН быть именно на эту тему. Если сайт совсем про другое (заказывал доставку еды — сделали крипто-биржу) — это провал, оценка 1-2.

Фрилансер показывает готовый сайт. Ты ОБЯЗАН ВНИМАТЕЛЬНО прочитать ВЕСЬ HTML-код ниже от начала до конца, прежде чем делать выводы.

<site_html>
${previewHtml}
</site_html>

КРИТИЧЕСКИ ВАЖНО — ИНСТРУКЦИЯ ПО АНАЛИЗУ:

1. ПРОЧИТАЙ ВЕСЬ КОД ЦЕЛИКОМ. Не останавливайся на первых 20 строках. Элементы могут быть ВНИЗУ страницы — в footer, в отдельных секциях, в конце документа.

2. Для КАЖДОГО пункта ТЗ ниже — ищи по ВСЕМУ документу. Форма может быть внизу. Цены могут быть в таблице в середине. Отзывы могут быть перед footer.

3. Ищи НЕ ТОЛЬКО точные слова, но и СИНОНИМЫ и HTML-СТРУКТУРЫ:
   - "форма обратной связи" = <form>, <input>, "Имя", "Email", "Сообщение", "Отправить", "contact", "feedback", "submit", "Связаться"
   - "галерея" = <img>, "gallery", слайдер, карусель, несколько картинок подряд
   - "цены/прайс" = <table>, "₽", "руб", "price", "тариф", "стоимость", числа с валютой
   - "отзывы" = "отзыв", "review", "testimonial", "клиент говорит", цитаты
   - "контакты" = "телефон", "email", "адрес", "@", "+7", "tel:", "mailto:"

4. Если нашёл элемент — запомни ГДЕ он (в какой секции). Если НЕ нашёл — перечитай код ещё раз перед тем как утверждать что его нет.`;

        if (requirements && requirements.length > 0) {
          systemPrompt += `\n\nПУНКТЫ ТЗ ДЛЯ ПРОВЕРКИ:`;
          for (const r of requirements) {
            systemPrompt += `\n- "${r.label}": ищи теги/слова: ${r.checkKeywords.join(', ')} (а также любые синонимы и похожие конструкции!)`;
          }
          systemPrompt += `\n
ПОДСЧЁТ: из ${requirements.length} пунктов ТЗ сколько РЕАЛЬНО присутствуют в HTML?
Для каждого пункта напиши себе мысленно: НАЙДЕН / НЕ НАЙДЕН.
- Все найдены → до 5
- 1-2 не найдены → до 4  
- Половина не найдена → до 3
- Большинство не найдено → до 2`;
        }

        systemPrompt += `\n
ФОРМАТ ОТВЕТА:
Напиши 2-4 предложения как реальный заказчик:
- Что конкретно понравилось (назови секции которые ты ВИДИШЬ в коде)
- Чего не хватает (ТОЛЬКО если ты ТОЧНО уверен что этого нет — перепроверь!)
- Поставь оценку: [ОЦЕНКА: X]

ЗАПРЕТ: НЕ говори что чего-то нет, если ты не проверил ВЕСЬ код. Лучше перехвали, чем ошибочно скажи что чего-то не хватает.

Пиши от первого лица, как человек.`;
      }

      // Final instruction
      systemPrompt += `\n\nГЛАВНОЕ ПРАВИЛО: ты НЕ ИИ-ассистент. Ты заказчик. Не помогай фрилансеру, не пиши код, не давай технических инструкций. Ты описываешь ЧТО хочешь, а КАК — это его работа.`;

    } else {
      // Legacy fallback
      systemPrompt = `Ты заказчик на бирже фриланса. Имя: ${clientName}. Заказ: ${orderDescription}.
Отвечай коротко, на русском, 2-4 предложения. Ты заказчик, НЕ разработчик.`;

      if (previewHtml) {
        systemPrompt += `\n\nПревью сайта:\n${previewHtml.substring(0, 3000)}\n\nОцени [ОЦЕНКА: X] от 1 до 5.`;
      }
    }

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Use stronger model for reviews (analyzing HTML needs more reasoning)
    const model = previewHtml ? "google/gemini-2.5-flash" : "google/gemini-2.5-flash";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: aiMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Хм, давай попробуем ещё раз.";

    const ratingMatch = content.match(/\[ОЦЕНКА:\s*(\d)\]/);
    const rating = ratingMatch ? parseInt(ratingMatch[1]) : null;

    return new Response(JSON.stringify({ 
      message: content.replace(/\[ОЦЕНКА:\s*\d\]/, '').trim(),
      rating 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Build a natural personality description from archetype + traits
function buildPersonalityDescription(archetype: string, traits: any): string {
  const parts: string[] = [];

  switch (archetype) {
    case 'dreamer':
      parts.push('Ты мечтатель — у тебя грандиозные идеи, но ты плохо понимаешь как они реализуются. Тебе нравятся красивые слова: "инновационный", "disruptive", "как у Apple".');
      break;
    case 'micromanager':
      parts.push('Ты контрол-фрик — тебе важна каждая деталь. Ты присылаешь скриншоты с пометками, указываешь точные отступы и цвета. Ты знаешь чего хочешь.');
      break;
    case 'scrooge':
      parts.push('Ты скупой — тебе кажется что всё стоит дешевле. "Да тут работы на час" — твоя любимая фраза. Пытаешься выбить скидку на всё.');
      break;
    case 'ghost':
      parts.push('Ты пропадаешь — отвечаешь редко и коротко. Иногда просто "ок" или "норм". Тебе лень расписывать.');
      break;
    case 'professional':
      parts.push('Ты опытный заказчик — чётко формулируешь задачи, уважаешь чужое время, платишь вовремя. С тобой приятно работать.');
      break;
    case 'chameleon':
      parts.push('Ты постоянно меняешь мнение — сегодня хочешь минимализм, завтра максимализм. "А давайте по-другому!" — твоя коронная фраза.');
      break;
    case 'toxic':
      parts.push('Ты токсичный заказчик — считаешь что все фрилансеры некомпетентны. Ты резкий, требовательный, иногда хамишь.');
      break;
  }

  if (traits.vision_clarity <= 3) {
    parts.push('Ты сам толком не знаешь, чего хочешь. На вопросы отвечаешь расплывчато: "ну чтоб красиво", "на ваше усмотрение".');
  } else if (traits.vision_clarity >= 8) {
    parts.push('Ты чётко знаешь, что хочешь. Отвечаешь конкретно, с деталями и примерами.');
  }

  if (traits.decision_stability <= 3) {
    parts.push('Ты часто передумываешь и меняешь требования после того, как уже согласовал.');
  }

  return parts.join(' ');
}