import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function PATCH(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const params = await context.params;
  const id = params.id;

  try {
    const data = await request.json();
    const { status, service_charge, cleaning_fee, commission_charge, is_favorite } = data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (service_charge !== undefined) updateData.service_charge = service_charge;
    if (cleaning_fee !== undefined) updateData.cleaning_fee = cleaning_fee;
    if (commission_charge !== undefined) updateData.commission_charge = commission_charge;
    if (is_favorite !== undefined) updateData.is_favorite = is_favorite;

    const { data: property, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Error updating property' },
      { status: 500 }
    );
  }
}