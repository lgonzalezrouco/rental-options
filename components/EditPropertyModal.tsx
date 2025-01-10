'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { Property } from '@/types/property';

const editPropertySchema = z.object({
  service_charge: z.number()
    .min(0, 'Service charge must be 0 or greater')
    .max(1000, 'Service charge must be less than 1,000'),
  cleaning_fee: z.number()
    .min(0, 'Cleaning fee must be 0 or greater')
    .max(1000, 'Cleaning fee must be less than 1,000'),
  commission_charge: z.number()
    .min(0, 'Commission must be 0 or greater')
    .max(1000, 'Commission must be less than 1,000'),
});

type EditPropertyFormData = z.infer<typeof editPropertySchema>;

type EditPropertyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (propertyId: number, data: EditPropertyFormData) => void;
  property: Property | null;
};

export default function EditPropertyModal({ isOpen, onClose, onSubmit, property }: EditPropertyModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<EditPropertyFormData>({
    resolver: zodResolver(editPropertySchema)
  });

  // Set initial values when property changes
  useEffect(() => {
    if (property) {
      setValue('service_charge', property.service_charge);
      setValue('cleaning_fee', property.cleaning_fee);
      setValue('commission_charge', property.commission_charge);
    }
  }, [property, setValue]);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const onSubmitForm = async (data: EditPropertyFormData) => {
    if (!property) return;
    
    await onSubmit(property.id, data);
    reset();
    onClose();
  };

  if (!isOpen || !property) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit Property Fees</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            title="Close modal"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="p-4 space-y-4">
          {/* Property Name (non-editable) */}
          <div className="bg-gray-50 p-3 rounded-md border border-gray-700">
            <p className="text-sm text-gray-500">Editing fees for:</p>
            <p className="font-medium text-gray-900">{property.name}</p>
          </div>

          {/* Service Charge */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Service Charge</label>
            <input
              type="number"
              {...register('service_charge', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            />
            {errors.service_charge && (
              <p className="mt-1 text-sm text-red-600">{errors.service_charge.message}</p>
            )}
          </div>

          {/* Cleaning Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Cleaning Fee</label>
            <input
              type="number"
              {...register('cleaning_fee', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            />
            {errors.cleaning_fee && (
              <p className="mt-1 text-sm text-red-600">{errors.cleaning_fee.message}</p>
            )}
          </div>

          {/* Commission Charge */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Commission</label>
            <input
              type="number"
              {...register('commission_charge', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            />
            {errors.commission_charge && (
              <p className="mt-1 text-sm text-red-600">{errors.commission_charge.message}</p>
            )}
          </div>

          <div className="pt-4 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Update Fees
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 