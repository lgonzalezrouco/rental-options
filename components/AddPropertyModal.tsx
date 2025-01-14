'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

const propertySchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  price_per_month: z.number()
    .min(1, 'Price must be greater than 0')
    .max(100000, 'Price must be less than 100,000'),
  location: z.string()
    .min(2, 'Location must be at least 2 characters'),
  rooms: z.number()
    .min(1, 'Must have at least 1 room')
    .max(20, 'Must have less than 20 rooms'),
  bathrooms: z.number()
    .min(1, 'Must have at least 1 bathroom')
    .max(10, 'Must have less than 10 bathrooms'),
  square_meters: z.number()
    .min(1, 'Must be at least 1 square meter')
    .max(1000, 'Must be less than 1000 square meters')
    .nullable()
    .optional(),
  url: z.string()
    .url('Must be a valid URL'),
  is_approximated: z.boolean()
});

type PropertyFormData = z.infer<typeof propertySchema>;

type AddPropertyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PropertyFormData) => void;
};

export default function AddPropertyModal({ isOpen, onClose, onSubmit }: AddPropertyModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      is_approximated: false
    }
  });

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

  const onSubmitForm = async (data: PropertyFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  if (!isOpen) return null;

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
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Add New Property</h2>
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
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              {...register('name')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Price per month */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Price per month</label>
            <input
              type="number"
              {...register('price_per_month', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            />
            {errors.price_per_month && (
              <p className="mt-1 text-sm text-red-600">{errors.price_per_month.message}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              {...register('location')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          {/* Is approximated */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('is_approximated')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Location is approximated
            </label>
          </div>

          {/* Rooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Rooms</label>
            <input
              type="number"
              {...register('rooms', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            />
            {errors.rooms && (
              <p className="mt-1 text-sm text-red-600">{errors.rooms.message}</p>
            )}
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
            <input
              type="number"
              {...register('bathrooms', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            />
            {errors.bathrooms && (
              <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
            )}
          </div>

          {/* Square meters */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Square meters</label>
            <input
              type="number"
              {...register('square_meters', { 
                setValueAs: (value) => {
                  if (value === '') return null;
                  const num = Number(value);
                  return isNaN(num) ? null : num;
                }
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            />
            {errors.square_meters && (
              <p className="mt-1 text-sm text-red-600">{errors.square_meters.message}</p>
            )}
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700">URL</label>
            <input
              type="url"
              {...register('url')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
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
              Add Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 