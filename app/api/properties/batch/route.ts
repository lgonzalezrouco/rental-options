import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { Property } from '@/types/property';
import { geocodeLocation } from '@/utils/geocoding';

type ValidationError = {
  row: number;
  errors: string[];
};

type CSVRow = Record<string, string>;

function validateRow(row: CSVRow, rowIndex: number): ValidationError | null {
  const errors: string[] = [];

  // Required string fields
  ['name', 'location', 'url'].forEach(field => {
    if (!row[field] || typeof row[field] !== 'string') {
      errors.push(`${field} is required and must be a string`);
    }
  });

  // Required numeric fields
  ['price_per_month', 'rooms', 'bathrooms'].forEach(field => {
    const value = Number(row[field]);
    if (isNaN(value)) {
      errors.push(`${field} must be a valid number`);
    }
  });

  // Optional numeric fields
  ['square_meters', 'service_charge', 'cleaning_fee', 'commission_charge'].forEach(field => {
    if (row[field] !== '' && row[field] !== null && isNaN(Number(row[field]))) {
      errors.push(`${field} must be a valid number if provided`);
    }
  });

  return errors.length > 0 ? { row: rowIndex, errors } : null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Validate all rows first
    const validationErrors: ValidationError[] = [];
    const validProperties: Omit<Property, 'id'>[] = [];

    // Process rows sequentially to avoid rate limiting with geocoding
    for (let index = 0; index < dataRows.length; index++) {
      const row = dataRows[index];
      if (row.length !== headers.length) {
        validationErrors.push({
          row: index + 1,
          errors: ['Invalid number of columns']
        });
        continue;
      }

      const propertyData = Object.fromEntries(
        headers.map((header, i) => [header.trim(), row[i].trim()])
      ) as CSVRow;

      const validationError = validateRow(propertyData, index + 1);
      if (validationError) {
        validationErrors.push(validationError);
      } else {
        try {
          // Geocode the location
          const { latitude, longitude } = await geocodeLocation(propertyData.location);

          validProperties.push({
            name: propertyData.name,
            location: propertyData.location,
            url: propertyData.url,
            status: 'available',
            price_per_month: Number(propertyData.price_per_month),
            rooms: Number(propertyData.rooms),
            bathrooms: Number(propertyData.bathrooms),
            square_meters: propertyData.square_meters ? Number(propertyData.square_meters) : null,
            service_charge: propertyData.service_charge ? Number(propertyData.service_charge) : null,
            cleaning_fee: propertyData.cleaning_fee ? Number(propertyData.cleaning_fee) : null,
            commission_charge: propertyData.commission_charge ? Number(propertyData.commission_charge) : null,
            latitude,
            longitude,
            is_favorite: false,
            is_approximated: false
          });
        } catch (error) {
          console.error('Error geocoding location:', error);
          validationErrors.push({
            row: index + 1,
            errors: ['Failed to geocode location']
          });
        }
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }

    // Insert all valid properties
    const { data, error } = await supabase
      .from('properties')
      .insert(validProperties)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Successfully imported ${data.length} properties`,
      properties: data
    }, { status: 201 });
  } catch (error) {
    console.error('Error processing batch upload:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 