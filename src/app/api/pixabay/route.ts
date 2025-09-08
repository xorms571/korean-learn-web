import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

  if (!PIXABAY_API_KEY) {
    return NextResponse.json({ error: 'PIXABAY_API_KEY is not set in environment variables' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3&lang=ko`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Pixabay API error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch image from Pixabay', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    const imageUrl = data.hits[0]?.webformatURL;

    if (imageUrl) {
      return NextResponse.json({ imageUrl });
    } else {
      return NextResponse.json({ error: 'No image found for the given query' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching from Pixabay:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
