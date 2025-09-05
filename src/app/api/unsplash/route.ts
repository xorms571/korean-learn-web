import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json({ error: 'UNSPLASH_ACCESS_KEY is not set in environment variables' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Unsplash API error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch image from Unsplash', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    const imageUrl = data.results[0]?.urls?.small;

    if (imageUrl) {
      return NextResponse.json({ imageUrl });
    } else {
      return NextResponse.json({ error: 'No image found for the given query' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching from Unsplash:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}