import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, sectionType, sectionLabel, currentElements, currentColorScheme, currentSubtitle, orderTitle, orderDescription, availableColorSchemes } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Ты — помощник для визуального конструктора сайтов. Пользователь редактирует секцию "${sectionLabel}" (тип: ${sectionType}).

Контекст заказа: "${orderTitle}" — ${orderDescription}

Текущие настройки секции:
- Заголовок: "${currentSubtitle || sectionLabel}"
- Цветовая схема: ${currentColorScheme}
- Элементы: ${currentElements.map((e: any) => `${e.label}: ${e.enabled ? 'вкл' : 'выкл'}`).join(', ')}

Доступные цветовые схемы: ${availableColorSchemes.join(', ')}

Пользователь просит внести изменения. Ответь ТОЛЬКО валидным JSON (без markdown, без \`\`\`):
{
  "subtitle": "новый заголовок или null если не меняется",
  "colorScheme": "id схемы или null если не меняется",
  "elements": [{"label": "точное название элемента", "enabled": true/false}]
}

В elements включи ТОЛЬКО те элементы, статус которых нужно ИЗМЕНИТЬ. Названия элементов должны ТОЧНО совпадать с текущими.`;

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
    
    // Parse JSON from response, handling possible markdown wrapping
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {};
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
