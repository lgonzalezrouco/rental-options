export type Property = {
  id: number;
  name: string;
  price_per_month: number;
  location: string;
  rooms: number;
  bathrooms: number;
  square_meters?: number | null;
  status: string;
  service_charge?: number | null;
  cleaning_fee?: number | null;
  commission_charge?: number | null;
  latitude: number;
  longitude: number;
  is_approximated: boolean;
  url: string;
  is_favorite: boolean;
}

export type StatusOption = {
  value: string;
  label: string;
  color: string;
  bgColor: string;
}

export type PropertyCardProps = {
  property: Property;
  onStatusChange: (propertyId: number, newStatus: string) => void;
  onEdit: (property: Property) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isHovered?: boolean;
  onFavoriteToggle: (isFavorite: boolean) => void;
}

export type SortOption = {
  field: 'price_per_month' | 'status' | 'rooms';
  direction: 'asc' | 'desc';
  label: string;
}

export type FilterOptions = {
  status: string[];
  showFavorites: boolean;
  rooms: number | null;
}

export type ActiveFilters = {
  sort: SortOption | null;
  filters: FilterOptions;
} 