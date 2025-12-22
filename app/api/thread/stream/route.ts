import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MACHINA_API_URL = process.env.MACHINA_API_URL || 'https://api-staging.machina.gg';
const MACHINA_API_KEY = process.env.MACHINA_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extract target and type from URL parameters
    const { searchParams } = new URL(req.url);
    const target = searchParams.get('target') || 'machina-assistant-executor';
    const type = searchParams.get('type') || 'agent';

    // Check if this is an agent or workflow request
    const isAgent = type === 'agent';

    // Forward request to Flask backend streaming endpoint (agent-specific or workflow-specific)
    const endpoint = isAgent
      ? `${MACHINA_API_URL}/agent/stream/${target}`
      : `${MACHINA_API_URL}/workflow/stream/${target}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Token': MACHINA_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ type: 'error', content: `Backend error: ${response.status}` }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create a readable stream that logs chunks as they pass through
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is null');
    }

    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.close();
              break;
            }

            // Decode and log chunks for debugging
            const text = decoder.decode(value, { stream: true });
            buffer += text;

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const parsed = JSON.parse(line);
                } catch (e) {
                  // Not JSON, skip logging
                }
              }
            }

            // Forward the chunk to the client
            controller.enqueue(value);
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Stream the response back to the client (NDJSON format)
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        type: 'error',
        content: error instanceof Error ? error.message : 'Stream failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
