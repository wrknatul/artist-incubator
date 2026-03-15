import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { clientName, clientAvatar, orderDescription, orderPrompt, messages = [], previewHtml, clientProfile, hiddenRequirements } = await req.json();
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
- ${traits.tech_literacy >= 7 ? 'Ты разбираешься в технологиях, используешь термины: адаптив, CTA, UI/UX, конверсия' : traits.tech_literacy >= 4 ? 'Ты немного понимаешь в вебе, но не эксперт' : 'Ты далёк от технологий, говоришь бытовым языком — "кнопочка", "картинка", "чтоб красиво"'}
- ${traits.conflict_level >= 7 ? 'Ты требовательный и резкий. Если что-то не так — говоришь прямо, иногда грубовато.' : traits.conflict_level <= 3 ? 'Ты вежливый и мягкий. Стараешься не конфликтовать.' : 'Ты нормальный, адекватный человек.'}
- Длина ответа: 1-4 предложения. Не пиши простыни.

ТВОИ ТРЕБОВАНИЯ К ПРОЕКТУ:`;

      // Add hidden requirements as the client's actual wishes
      if (clientProfile.hiddenRequirements && clientProfile.hiddenRequirements.length > 0) {
        systemPrompt += `\nВот что тебе РЕАЛЬНО нужно в проекте (это твои настоящие пожелания):`;
        for (const req of clientProfile.hiddenRequirements) {
          systemPrompt += `\n- ${req.label}: ${req.hint}`;
        }
        
        if (!previewHtml) {
          systemPrompt += `\n
КАК РАСКРЫВАТЬ ТРЕБОВАНИЯ:
- Если фрилансер спрашивает "что нужно на сайте?" / "какие секции?" / "расскажи подробнее" — расскажи о 2-3 требованиях естественно, как обычный заказчик
- Если спрашивает про конкретную вещь (форма, отзывы, прайс) — отвечай конкретно  
- НЕ выдавай ВСЕ требования одним списком — в реальной жизни заказчик тоже не пишет идеальное ТЗ сразу
- Если фрилансер вообще не спрашивает и сразу делает — его проблемы, ты не обязан подсказывать`;
        }
      }

      if (missingDetails && missingDetails.length > 0) {
        systemPrompt += `\n\nДополнительные детали (расскажешь, если спросят): ${missingDetails.join(', ')}`;
      }

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

Фрилансер показывает готовый сайт. Ты ВНИМАТЕЛЬНО изучаешь HTML-код.

<site_html>
${previewHtml.substring(0, 8000)}
</site_html>

ИНСТРУКЦИЯ ПО ОЦЕНКЕ:

Шаг 1. ТЕМАТИКА — сайт вообще про то, что ты заказывал?
- Если сайт про совершенно другое (заказывал кофейню — сделали крипто) → сразу [ОЦЕНКА: 1]

Шаг 2. АНАЛИЗ HTML — реально прочитай код и найди:
- Какие секции есть (header, hero, features, pricing, contacts, footer и т.д.)
- Есть ли формы (<form>, <input>)
- Есть ли интерактив (слайдеры, табы, аккордеоны)
- Есть ли изображения, иконки
- Адаптивный ли дизайн (@media, responsive классы)
- Качество контента — реальный текст или lorem ipsum / placeholder

Шаг 3. ПРОВЕРЬ ОБЯЗАТЕЛЬНЫЕ ЭЛЕМЕНТЫ:`;

        if (hiddenRequirements && hiddenRequirements.length > 0) {
          for (const r of hiddenRequirements) {
            systemPrompt += `\n- ${r.label}: ищи в HTML теги/слова: ${r.checkKeywords.join(', ')}`;
          }
          systemPrompt += `\n
Посчитай: из ${hiddenRequirements.length} элементов сколько РЕАЛЬНО есть в HTML?
- Найдены все → возможна оценка 5
- Найдены большинство → максимум 4  
- Найдена половина → максимум 3
- Почти ничего → максимум 2`;
        }

        systemPrompt += `\n
Шаг 4. ИТОГОВАЯ ОЦЕНКА:
- [ОЦЕНКА: 5] — всё на месте, тема верная, все элементы, хороший дизайн
- [ОЦЕНКА: 4] — хорошо, но 1-2 вещи можно улучшить или не хватает  
- [ОЦЕНКА: 3] — базово работает, но многого не хватает
- [ОЦЕНКА: 2] — сильно не дотягивает, много пропущено
- [ОЦЕНКА: 1] — не по теме или пустышка

${honestyNote}

ФОРМАТ ОТВЕТА:
Напиши 2-4 предложения как реальный заказчик. Укажи КОНКРЕТНО:
- Что понравилось (назови секции/элементы)
- Чего не хватает (назови конкретно)
- Поставь оценку в формате [ОЦЕНКА: X]

Пиши от первого лица, как человек, а не как робот-оценщик.`;
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