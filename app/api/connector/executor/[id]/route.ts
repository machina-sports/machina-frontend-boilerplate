/**
 * API Route: /api/connector/executor/[id]
 *
 * Proxy for Machina API connector executor endpoint
 * POST /connector/executor/{id}
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MACHINA_API_URL = process.env.MACHINA_API_URL || 'https://api-staging.machina.gg';
const MACHINA_API_KEY = process.env.MACHINA_API_KEY || '';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const contentType = req.headers.get('content-type') || '';

    let response;

    if (contentType.toLowerCase().includes('multipart/form-data')) {
      // Forward the raw request body as an arrayBuffer to preserve the multipart boundary
      const buffer = await req.arrayBuffer();
      response = await fetch(`${MACHINA_API_URL}/connector/executor/${id}`, {
        method: 'POST',
        headers: {
          'X-Api-Token': MACHINA_API_KEY,
          'Content-Type': contentType,
        },
        body: buffer,
      });
    } else {
      const body = await req.json();
      response = await fetch(`${MACHINA_API_URL}/connector/executor/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Token': MACHINA_API_KEY,
        },
        body: JSON.stringify(body),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Machina API error (connector):', response.status, errorText);

      return NextResponse.json(
        {
          status: false,
          error: 'Failed to execute connector',
          details: errorText,
          status_code: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error proxying connector executor:', error);

    return NextResponse.json(
      {
        status: false,
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
