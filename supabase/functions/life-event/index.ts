import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { balance, month, completedOrders, customChoice, eventContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt: string;
    let userPrompt: string;

    if (customChoice && eventContext) {
      // Player wrote a custom response to an event
      systemPrompt = `Ты — игровой мастер симулятора жизни фрилансера "Max Freelance Pain". Игрок столкнулся с жизненной ситуацией и написал свой вариант действия.

Твоя задача — оценить его ответ и определить последствия.

ПРАВИЛА:
- Ответь СТРОГО в JSON формате
- Определи финансовое последствие (от -100 до +50, обычно отрицательное — жизнь дорогая)
- Напиши короткий забавный результат (1-2 предложения)
- Будь креативным и саркастичным

JSON формат:
{
  "result": "Описание что произошло",
  "balanceChange": число,
  "emoji": "подходящий эмодзи"
}`;

      userPrompt = `Ситуация: ${eventContext}
Игрок выбрал: "${customChoice}"
Баланс игрока: $${balance}

Ответь ТОЛЬКО валидным JSON.`;
    } else {
      // Generate a new random life event
      systemPrompt = `Ты — игровой мастер симулятора жизни фрилансера "Max Freelance Pain". Генерируй случайные ЖИЗНЕННЫЕ события — НЕ про работу и заказы, а про повседневную жизнь фрилансера.

ПРАВИЛА:
- События должны быть БЫТОВЫМИ, ЖИЗНЕННЫМИ, смешными и узнаваемыми
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО генерировать события про заказы, клиентов, дедлайны, код или работу!
- Каждое событие имеет финансовое последствие
- Два варианта ответа: один разумный, один рискованный/смешной
- У каждого варианта своё финансовое последствие
- Суммы должны быть реалистичными (от -150 до +30)
- ТЕМЫ (выбирай РАЗНЫЕ каждый раз):
  * Еда и готовка (доставка, холодильник сломался, попробовал готовить)
  * Коммуналка и квартира (соседи, ремонт, затопило, таракан)
  * Домашние животные (кот разбил, собака сожрала)
  * Здоровье (зуб, спина, бессонница, спортзал)
  * Транспорт (такси, велосипед, пробки)
  * Гаджеты и техника (наушники, монитор, телефон упал)
  * Подписки и сервисы (Netflix, Spotify, VPN)
  * Друзья и семья (день рождения, свадьба, вписка)
  * Соседи и быт (шум, мусор, посылка)
  * Прокрастинация и хобби (игры, сериалы, курсы)
  * Отношения (свидание, Tinder, ссора)
  * Погода и природа (дождь, жара, аллергия)
  * Случайности (нашёл деньги, потерял ключи, лотерея)
  * Внешний вид (стрижка, одежда, обувь)
  * Психология (выгорание, тревожность, мотивация)

СТРОГО JSON формат:
{
  "emoji": "🍕",
  "title": "Краткое название",
  "description": "Описание ситуации (1-2 предложения, от первого лица)",
  "option1": {
    "label": "Вариант 1 (короткий, 3-5 слов)",
    "result": "Что произошло (1 предложение)",
    "balanceChange": число
  },
  "option2": {
    "label": "Вариант 2 (короткий, 3-5 слов)",
    "result": "Что произошло (1 предложение)", 
    "balanceChange": число
  }
}`;

      userPrompt = `Сгенерируй одно случайное жизненное событие для фрилансера.
Месяц жизни: ${month}
Баланс: $${balance}
Выполнено заказов: ${completedOrders}

${balance < 200 ? 'Игрок на мели — событие может быть связано с безденежьем.' : ''}
${month > 6 ? 'Игрок уже опытный — события могут быть сложнее.' : ''}

Ответь ТОЛЬКО валидным JSON.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("life-event error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
