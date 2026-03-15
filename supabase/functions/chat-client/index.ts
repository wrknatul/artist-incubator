import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { clientName, clientAvatar, orderDescription, orderPrompt, messages = [], previewHtml } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = `Ты играешь роль заказчика на бирже фриланса. Твои данные:
- Имя: ${clientName}
- Аватар: ${clientAvatar}
- Твой заказ: ${orderDescription}

Ты — клиент, который заказал сайт. Ты общаешься с фрилансером.

ПРАВИЛА ПОВЕДЕНИЯ:
- Отвечай коротко, по-человечески, на русском языке
- Ты можешь уточнять детали, отвечать на вопросы фрилансера
- Давай конкретные пожелания по дизайну, цветам, структуре
- Если фрилансер спрашивает — давай подробное ТЗ
- Будь немного придирчивым, но адекватным
- НЕ пиши код, ты заказчик, а не разработчик
- Отвечай 2-4 предложениями максимум`;

    if (previewHtml) {
      systemPrompt += `\n\nФрилансер показывает тебе превью сайта. Вот HTML код сайта который он сделал:
<site_preview>
${previewHtml.substring(0, 3000)}
</site_preview>

Оцени работу как заказчик:
- Если сайт хороший — похвали, укажи мелкие замечания
- Если плохой — скажи что не нравится конкретно
- Дай конструктивную обратную связь
- Поставь предварительную оценку от 1 до 5 в формате [ОЦЕНКА: X]`;
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

    // Extract rating if present
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
