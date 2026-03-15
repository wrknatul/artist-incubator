import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SECTION_TYPES = [
  "hero", "features", "about", "pricing", "gallery",
  "testimonials", "contact", "cta", "faq", "stats", "team", "footer"
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, orderTitle, orderDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Ты — планировщик структуры сайта. Пользователь описывает что ему нужно. Ты предлагаешь план из секций.

Контекст заказа: "${orderTitle}" — ${orderDescription}

Доступные типы секций: ${SECTION_TYPES.join(", ")}

Правила:
- Предложи 4-8 секций в логичном порядке
- hero почти всегда первый, footer последний
- Учитывай тематику заказа
- Для каждой секции дай краткое пояснение что в ней будет

Ответь ТОЛЬКО валидным JSON (без markdown):
{
  "sections": [
    {"type": "hero", "reason": "Главный экран с названием и CTA"},
    {"type": "features", "reason": "3 ключевых преимущества"},
    ...
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429 || status === 402) {
        return new Response(JSON.stringify({ error: status === 429 ? "Rate limit" : "Payment required" }), {
          status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback plan
      parsed = {
        sections: [
          { type: "hero", reason: "Главный экран" },
          { type: "features", reason: "Преимущества" },
          { type: "contact", reason: "Форма связи" },
          { type: "footer", reason: "Подвал сайта" },
        ]
      };
    }

    // Validate section types
    if (parsed.sections) {
      parsed.sections = parsed.sections.filter((s: any) => SECTION_TYPES.includes(s.type));
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
