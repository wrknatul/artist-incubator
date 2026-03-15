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
      // Smart client system — build prompt from profile
      const { archetype, traits, dialogueTemplates, missingDetails } = clientProfile;

      const archetypeNames: Record<string, string> = {
        dreamer: 'Мечтатель', micromanager: 'Микроменеджер', scrooge: 'Скряга',
        ghost: 'Призрак', professional: 'Профессионал', chameleon: 'Хамелеон', toxic: 'Токсик',
      };

      systemPrompt = `Ты играешь роль заказчика на бирже фриланса. Твой архетип: "${archetypeNames[archetype] || archetype}".
Имя: ${clientName}
Аватар: ${clientAvatar}

ХАРАКТЕРИСТИКИ (определяют твоё поведение):
- Ясность видения: ${traits.vision_clarity}/10 ${traits.vision_clarity <= 3 ? '(ты плохо понимаешь чего хочешь)' : traits.vision_clarity >= 8 ? '(ты точно знаешь чего хочешь)' : ''}
- Техническая грамотность: ${traits.tech_literacy}/10
- Стабильность решений: ${traits.decision_stability}/10 ${traits.decision_stability <= 3 ? '(часто меняешь требования)' : ''}
- Конфликтность: ${traits.conflict_level}/10 ${traits.conflict_level >= 8 ? '(ты агрессивен)' : traits.conflict_level <= 3 ? '(ты мягок)' : ''}
- Склонность к скоупкрипу: ${traits.scope_creep}/10

ЗАКАЗ: ${orderDescription}

СТИЛЬ:
- Приветствие: "${dialogueTemplates?.greeting || ''}"
- Расплывчатый ответ: "${dialogueTemplates?.vague_answer || ''}"
- Скоупкрип: "${dialogueTemplates?.scope_creep || ''}"

ПРАВИЛА:
- Отвечай на русском, коротко (2-4 предложения)
- НЕ пиши код — ты заказчик
- Веди себя СТРОГО по архетипу
- Если ясность видения < 4: расплывчатые ответы
- Если ясность >= 7: конкретные ответы с деталями`;

      if (traits.scope_creep > 5) {
        systemPrompt += `\n\nСКОУПКРИП: С вероятностью ~40% добавляй "маленькую просьбу" сверх задачи.`;
      }

      if (missingDetails && missingDetails.length > 0) {
        systemPrompt += `\n\nПРОПУЩЕННЫЕ ДЕТАЛИ (НЕ упоминай сам, но если спросят — отвечай):
${missingDetails.map((d: string) => `- ${d}`).join('\n')}`;
      }

      if (previewHtml) {
        const honestyNote = traits.evaluation_honesty <= 4
          ? 'Ты склонен занижать оценку, чтобы выбить скидку.'
          : traits.evaluation_honesty >= 8
          ? 'Ты оцениваешь объективно и справедливо.'
          : '';

        systemPrompt += `\n\nФрилансер показывает тебе готовый сайт. Вот HTML:
<site_preview>
${previewHtml.substring(0, 4000)}
</site_preview>

КРИТЕРИИ ОЦЕНКИ (СТРОГО СЛЕДУЙ):

1. СООТВЕТСТВИЕ ЗАКАЗУ (самый важный критерий!):
   - Сайт ВООБЩЕ не по теме заказа (другая тематика, другой тип бизнеса) → [ОЦЕНКА: 1]
   - Тема правильная, но тип сайта другой (просили магазин — сделали лендинг) → [ОЦЕНКА: 2]
   - Тема правильная, тип правильный, но есть пустые секции или placeholder-контент → [ОЦЕНКА: 3]
   - Соответствует заказу, контент заполнен, но есть замечания по дизайну → [ОЦЕНКА: 4]
   - Полностью соответствует, хороший дизайн, все секции на месте → [ОЦЕНКА: 5]

2. ОБРАТНАЯ СВЯЗЬ:
   - ВСЕГДА конкретно описывай что хорошо и что можно улучшить
   - Называй конкретные секции, элементы, цвета
   - НЕ пиши абстрактно "не то" или "не нравится" — описывай ЧТО ИМЕННО не так
   - Если оценка 3-4: укажи 1-2 конкретных улучшения, которые поднимут оценку

ВАЖНО: Если тематика сайта НЕ СОВПАДАЕТ с заказом — ЭТО АВТОМАТИЧЕСКИ 1 ЗВЕЗДА!

${honestyNote}
Поставь оценку СТРОГО по критериям в формате [ОЦЕНКА: X] (от 1 до 5).
Объясни свою оценку в 2-3 предложениях, КОНКРЕТНО указывая что хорошо и что не так.`;
      }
    } else {
      // Legacy fallback
      systemPrompt = `Ты играешь роль заказчика на бирже фриланса.
- Имя: ${clientName}
- Аватар: ${clientAvatar}
- Заказ: ${orderDescription}

ПРАВИЛА:
- Отвечай коротко, на русском
- Ты заказчик, НЕ разработчик
- 2-4 предложения максимум`;

      if (previewHtml) {
        systemPrompt += `\n\nПревью сайта:
<site_preview>
${previewHtml.substring(0, 3000)}
</site_preview>

Оцени и поставь [ОЦЕНКА: X] от 1 до 5.`;
      }
    }

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
