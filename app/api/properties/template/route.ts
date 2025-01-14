import { NextResponse } from 'next/server';

const headers = [
  'name',
  'price_per_month',
  'location',
  'rooms',
  'bathrooms',
  'square_meters',
  'service_charge',
  'cleaning_fee',
  'commission_charge',
  'url'
];

const exampleData = [
  'Beautiful Apartment',
  '1500',
  'Example Street 123',
  '2',
  '1',
  '75',
  '100',
  '50',
  '75',
  'https://example.com/listing'
];

export async function GET() {
  try {
    // Create CSV content with headers and example row
    const csvContent = [
      headers.join(','),
      exampleData.join(',')
    ].join('\n');

    // Create response with CSV content
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=property-template.csv'
      }
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 