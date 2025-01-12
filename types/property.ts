export type Property = {
  id: number;
  name: string;
  price_per_month: number;
  location: string;
  rooms: number;
  bathrooms: number;
  square_meters: number;
  status: string;
  service_charge: number;
  cleaning_fee: number;
  commission_charge: number;
  latitude: number;
  longitude: number;
  is_approximated: boolean;
  url: string;
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
} 