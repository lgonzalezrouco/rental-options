import { XMarkIcon } from '@heroicons/react/24/outline';
import { ActiveFilters, StatusOption } from '@/types/property';

type FilterChipsProps = {
  activeFilters: ActiveFilters;
  statusOptions: StatusOption[];
  onRemoveFilter: (type: 'sort' | 'status' | 'favorites' | 'rooms') => void;
  onRemoveStatusFilter: (status: string) => void;
}

export default function FilterChips({ 
  activeFilters, 
  statusOptions,
  onRemoveFilter,
  onRemoveStatusFilter
}: FilterChipsProps) {
  if (!activeFilters.sort && !activeFilters.filters.showFavorites && 
      !activeFilters.filters.rooms && activeFilters.filters.status.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {/* Sort Chip */}
      {activeFilters.sort && (
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          <span>{activeFilters.sort.label}</span>
          <button
            onClick={() => onRemoveFilter('sort')}
            className="p-0.5 hover:bg-blue-200 rounded-full transition-colors"
            title="Remove sort"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Status Chips */}
      {activeFilters.filters.status.map((status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        if (!statusOption) return null;
        
        return (
          <div 
            key={status}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${statusOption.bgColor} ${statusOption.color}`}
          >
            <span>{statusOption.label}</span>
            <button
              onClick={() => onRemoveStatusFilter(status)}
              className="p-0.5 hover:bg-opacity-20 hover:bg-gray-700 rounded-full transition-colors"
              title={`Remove ${statusOption.label} filter`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        );
      })}

      {/* Favorites Chip */}
      {activeFilters.filters.showFavorites && (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
          <span>Favorites only</span>
          <button
            onClick={() => onRemoveFilter('favorites')}
            className="p-0.5 hover:bg-yellow-200 rounded-full transition-colors"
            title="Remove favorites filter"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Rooms Chip */}
      {activeFilters.filters.rooms && (
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
          <span>{activeFilters.filters.rooms} rooms</span>
          <button
            onClick={() => onRemoveFilter('rooms')}
            className="p-0.5 hover:bg-gray-200 rounded-full transition-colors"
            title="Remove rooms filter"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
} 