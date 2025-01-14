import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { ActiveFilters, SortOption, StatusOption } from '@/types/property';

type FilterPanelProps = {
  isOpen: boolean;
  statusOptions: StatusOption[];
  onApply: (filters: ActiveFilters) => void;
  onClose: () => void;
  activeFilters: ActiveFilters;
}

const sortOptions: SortOption[] = [
  { field: 'price_per_month', direction: 'desc', label: 'Price (High to Low)' },
  { field: 'price_per_month', direction: 'asc', label: 'Price (Low to High)' },
  { field: 'status', direction: 'asc', label: 'Status (A-Z)' },
  { field: 'rooms', direction: 'desc', label: 'Rooms (Most to Least)' },
  { field: 'rooms', direction: 'asc', label: 'Rooms (Least to Most)' },
];

export default function FilterPanel({ 
  isOpen, 
  statusOptions, 
  onApply, 
  onClose,
  activeFilters 
}: FilterPanelProps) {
  const handleSortChange = (option: SortOption) => {
    const newSort = activeFilters.sort?.field === option.field && 
                   activeFilters.sort?.direction === option.direction
      ? null
      : option;

    onApply({
      sort: newSort,
      filters: activeFilters.filters
    });
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = activeFilters.filters.status.includes(status)
      ? activeFilters.filters.status.filter(s => s !== status)
      : [...activeFilters.filters.status, status];
    
    onApply({
      sort: activeFilters.sort,
      filters: {
        ...activeFilters.filters,
        status: newStatus
      }
    });
  };

  const handleFavoritesToggle = () => {
    onApply({
      sort: activeFilters.sort,
      filters: {
        ...activeFilters.filters,
        showFavorites: !activeFilters.filters.showFavorites
      }
    });
  };

  const handleRoomsChange = (value: string) => {
    onApply({
      sort: activeFilters.sort,
      filters: {
        ...activeFilters.filters,
        rooms: value ? Number(value) : null
      }
    });
  };

  return (
    <div className={`
      overflow-hidden transition-all duration-300
      ${isOpen ? 'max-h-[500px] border-b' : 'max-h-0'}
    `}>
      <div className="bg-white p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FunnelIcon className="h-5 w-5" />
            Sort & Filter
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Close filters panel"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Sort Section */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Sort by</h4>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <button
                key={`${option.field}-${option.direction}`}
                onClick={() => handleSortChange(option)}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                  activeFilters.sort?.field === option.field && activeFilters.sort?.direction === option.direction
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
                {option.direction === 'asc' ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Section */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Filter by</h4>
          
          {/* Status Filter */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusToggle(status.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    activeFilters.filters.status.includes(status.value)
                      ? status.bgColor + ' ' + status.color
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Favorites Filter */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">Show only</label>
            <button
              onClick={handleFavoritesToggle}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                activeFilters.filters.showFavorites
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Favorites
            </button>
          </div>

          {/* Rooms Filter */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">Number of rooms</label>
            <select
              title="Select number of rooms"
              value={activeFilters.filters.rooms || ''}
              onChange={(e) => handleRoomsChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:border-gray-400 
                transition-colors appearance-none"
            >
              <option value="">Any number of rooms</option>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>{num} {num === 1 ? 'room' : 'rooms'}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
} 