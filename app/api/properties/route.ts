import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { Property } from '@/types/property';
import { geocodeLocation } from '@/utils/geocoding';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const propertyData: Omit<Property, 'id' | 'status' | 'service_charge' | 'cleaning_fee' | 'commission_charge'> = await request.json();

    const { latitude, longitude } = await geocodeLocation(propertyData.location);
    
    const property = {
      ...propertyData,
      latitude,
      longitude
    };

    const { data, error } = await supabase
      .from('properties')
      .insert([property])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}