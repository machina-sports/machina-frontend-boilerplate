import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MACHINA_API_URL = process.env.MACHINA_API_URL || 'https://api-staging.machina.gg';
const MACHINA_API_KEY = process.env.MACHINA_API_KEY || '';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET endpoint for fetching a thread/document by ID
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Thread ID is required' }, { status: 400 });
    }

    console.log('[Thread GET] Fetching thread:', id);

    // Fetch thread from Machina API using the direct document endpoint
    const response = await fetch(`${MACHINA_API_URL}/document/${id}`, {
      method: 'GET',
      headers: {
        'X-Api-Token': MACHINA_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback to search if direct document fetch fails
      console.log('[Thread GET] Direct fetch failed, trying search...');
      const isObjectId = id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
      const filters = isObjectId ? { _id: id } : { document_id: id, name: 'thread' };

      const searchResponse = await fetch(`${MACHINA_API_URL}/document/search`, {
        method: 'POST',
        headers: {
          'X-Api-Token': MACHINA_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters,
          page: 1,
          page_size: 1,
        }),
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('[Thread GET] Machina API error (search):', searchResponse.status, errorText);
        return NextResponse.json(
          { error: 'Failed to fetch thread', details: errorText },
          { status: searchResponse.status }
        );
      }

      const searchData = await searchResponse.json();
      if (searchData.data && searchData.data.length > 0) {
        return NextResponse.json({ thread: searchData.data[0] });
      }

      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const threadData = await response.json();
    return NextResponse.json({ thread: threadData });
  } catch (error) {
    console.error('[Thread GET] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}
