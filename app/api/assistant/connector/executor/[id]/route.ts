/**
 * API Route: /api/assistant/connector/executor/[id]
 *
 * Proxy for Machina API connector executor endpoint
 * POST /connector/executor/{id}
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MACHINA_API_URL = process.env.MACHINA_API_URL || 'https://api-staging.machina.gg';
const MACHINA_API_KEY = process.env.MACHINA_API_KEY || '';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.toLowerCase().includes('multipart/form-data')) {
      const buffer = await req.arrayBuffer();

      const response = await fetch(`${MACHINA_API_URL}/connector/executor/${id}`, {
        method: 'POST',
        headers: {
          'X-Api-Token': MACHINA_API_KEY,
          'Content-Type': contentType,
        },
        body: buffer,
      });

      if (!response.ok) {
        const errorText = await response.text();

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
    } else {
      const body = await req.json();
      const response = await fetch(`${MACHINA_API_URL}/connector/executor/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Token': MACHINA_API_KEY,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { status: false, error: 'Failed to execute connector', details: errorText },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { status: false, error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}
