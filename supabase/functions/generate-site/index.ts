import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userMessage, messages = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a web developer AI that generates complete HTML pages.
The user (a freelancer) will describe what they need. You have NO prior knowledge of any project or client — you only know what the user tells you.

Generate a COMPLETE, single-file HTML page with inline CSS and any needed inline JS based SOLELY on what the user describes.

IMPORTANT RULES:
- Return ONLY the HTML code, nothing else
- The HTML must be a complete document with <!DOCTYPE html>, <html>, <head>, <body>
- All CSS must be inline in a <style> tag
- All JS must be inline in a <script> tag
- Make it visually impressive and professional
- Use placeholder images from https://picsum.photos/ for any images
- The page must be fully responsive
- If the user's instructions are vague, do your best interpretation

After the HTML, add a brief message on a new line starting with "MESSAGE:" describing what you built.`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
      { role: "user", content: userMessage },
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
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract HTML and message
    let html = content;
    let message = "Сайт сгенерирован! Посмотри превью справа →";

    // Try to extract HTML from code blocks
    const htmlMatch = content.match(/```html\s*([\s\S]*?)```/);
    if (htmlMatch) {
      html = htmlMatch[1].trim();
    } else if (content.includes("<!DOCTYPE") || content.includes("<html")) {
      // Try to extract just the HTML part
      const msgMatch = content.match(/MESSAGE:\s*(.*)/);
      if (msgMatch) {
        message = msgMatch[1].trim();
        html = content.replace(/MESSAGE:.*/, "").trim();
      }
    }

    // Clean up any remaining markdown
    html = html.replace(/^```\w*\n?/, "").replace(/\n?```$/, "").trim();

    return new Response(JSON.stringify({ html, message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
