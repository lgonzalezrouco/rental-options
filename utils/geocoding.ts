interface GeocodingResult {
  latitude: number;
  longitude: number;
}

export async function geocodeLocation(location: string): Promise<GeocodingResult> {
  try {
    // Add Barcelona to the search query to focus on Barcelona area
    const encodedQuery = encodeURIComponent(location);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('Location not found');
    }

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
} 