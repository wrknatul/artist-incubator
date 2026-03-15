import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RUNWAY_API_BASE = 'https://api.dev.runwayml.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const RUNWAYML_API_SECRET = Deno.env.get('RUNWAYML_API_SECRET');
  if (!RUNWAYML_API_SECRET) {
    return new Response(JSON.stringify({ error: 'RUNWAYML_API_SECRET is not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { avatarId } = await req.json();
    if (!avatarId) {
      return new Response(JSON.stringify({ error: 'avatarId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Create session
    const createResp = await fetch(`${RUNWAY_API_BASE}/v1/realtime_sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAYML_API_SECRET}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        model: 'gwm1_avatars',
        avatar: { type: 'custom', avatarId },
      }),
    });

    if (!createResp.ok) {
      const errText = await createResp.text();
      console.error('Runway create session error:', createResp.status, errText);
      return new Response(JSON.stringify({ error: `Runway API error: ${createResp.status}`, details: errText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { id: sessionId } = await createResp.json();

    // 2. Poll until ready (max 60s)
    let sessionKey: string | undefined;
    for (let i = 0; i < 60; i++) {
      const pollResp = await fetch(`${RUNWAY_API_BASE}/v1/realtime_sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${RUNWAYML_API_SECRET}`,
          'X-Runway-Version': '2024-11-06',
        },
      });

      if (!pollResp.ok) {
        const t = await pollResp.text();
        console.error('Runway poll error:', pollResp.status, t);
        break;
      }

      const session = await pollResp.json();

      if (session.status === 'READY') {
        sessionKey = session.sessionKey;
        break;
      }

      if (session.status === 'FAILED') {
        return new Response(JSON.stringify({ error: 'Session failed', details: session.failure }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    if (!sessionKey) {
      return new Response(JSON.stringify({ error: 'Session timed out' }), {
        status: 504,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Consume session to get WebRTC credentials
    const consumeResp = await fetch(`${RUNWAY_API_BASE}/v1/realtime_sessions/${sessionId}/consume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionKey}`,
        'X-Runway-Version': '2024-11-06',
      },
    });

    if (!consumeResp.ok) {
      const t = await consumeResp.text();
      console.error('Runway consume error:', consumeResp.status, t);
      return new Response(JSON.stringify({ error: 'Failed to consume session' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const credentials = await consumeResp.json();

    return new Response(JSON.stringify({
      sessionId,
      serverUrl: credentials.url,
      token: credentials.token,
      roomName: credentials.roomName,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('runway-session error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
