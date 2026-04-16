import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const apiKey = process.env.MACHINA_API_KEY;
    if (!apiKey) {
      console.error('MACHINA_API_KEY is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const response = await fetch('https://machina-podcasts-machina-sports-podcast.org.machina.gg/agent/executor/podcast-digest-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Token': apiKey,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Machina API error:', response.status, errorText);
      return NextResponse.json({ error: `Machina API error: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating digest:', error);
    return NextResponse.json({ error: 'Failed to generate digest' }, { status: 500 });
  }
}
