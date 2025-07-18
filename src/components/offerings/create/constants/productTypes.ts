import { ProductCategory } from '../types/createOfferingTypes';

export const PRODUCT_TYPES: ProductCategory[] = [
  {
    category: 'Transportation & Tours',
    types: [
      { id: 'seat', name: 'Bus Tours', description: 'Fixed seating with pickup locations', icon: '🚌' },
      { id: 'capacity', name: 'Boat Cruises', description: 'Total capacity limits with group pricing', icon: '⛵' },
      { id: 'open', name: 'Walking Tours', description: 'Open capacity with per-person pricing', icon: '🚶' }
    ]
  },
  {
    category: 'Activities & Experiences',
    types: [
      { id: 'open', name: 'Adventure Activities', description: 'Outdoor experiences and activities', icon: '🏔️' },
      { id: 'timeslot', name: 'Classes & Workshops', description: 'Scheduled sessions with instructors', icon: '🎓' },
      { id: 'equipment', name: 'Equipment Rental', description: 'Gear and equipment rentals', icon: '🚴' }
    ]
  },
  {
    category: 'Packages & Bundles',
    types: [
      { id: 'package', name: 'Multi-Activity Packages', description: 'Combine multiple offerings', icon: '📦' }
    ]
  }
];

export const getProductTypeName = (productType: string | undefined): string => {
  if (!productType) return 'Unknown';
  
  const typeNames = {
    seat: 'Bus Tour',
    capacity: 'Boat Cruise',
    open: 'Walking Tour',
    equipment: 'Equipment Rental',
    package: 'Multi-Activity Package',
    timeslot: 'Class/Workshop'
  };
  return typeNames[productType as keyof typeof typeNames] || 'Unknown';
}; 