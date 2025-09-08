import { NextResponse } from 'next/server';

// In-memory cache
const cache = new Map<string, { imageUrl: string; timestamp: number }>();
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  // Check cache first
  const cached = cache.get(query);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
    return NextResponse.json({ imageUrl: cached.imageUrl });
  }

  const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

  if (!PEXELS_API_KEY) {
    return NextResponse.json({ error: 'PEXELS_API_KEY is not set in environment variables' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      // If rate limited, don't cache error, just return it
      if (response.status === 429) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
      }
      const errorData = await response.json();
      console.error('Pexels API error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch image from Pexels', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    const imageUrl = data.photos[0]?.src?.medium;

    if (imageUrl) {
      // Store in cache
      cache.set(query, { imageUrl, timestamp: Date.now() });
      return NextResponse.json({ imageUrl });
    } else {
      return NextResponse.json({ error: 'No image found for the given query' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching from Pexels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}