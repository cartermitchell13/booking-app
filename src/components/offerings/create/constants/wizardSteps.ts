import { 
  Settings, 
  FileText, 
  Calendar, 
  DollarSign, 
  Image, 
  CheckCircle 
} from 'lucide-react';
import { WizardStep } from '../types/createOfferingTypes';

export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'Business Type', description: 'Choose your offering type', icon: Settings, isRequired: true },
  { id: 2, title: 'Basic Info', description: 'Name and description', icon: FileText, isRequired: true },
  { id: 3, title: 'Configuration', description: 'Product-specific settings', icon: Settings, isRequired: true },
  { id: 4, title: 'Scheduling', description: 'Availability and dates', icon: Calendar, isRequired: true },
  { id: 5, title: 'Pricing', description: 'Pricing and policies', icon: DollarSign, isRequired: true },
  { id: 6, title: 'Media', description: 'Photos and marketing', icon: Image, isRequired: true },
  { id: 7, title: 'Review', description: 'Final review and publish', icon: CheckCircle, isRequired: true }
]; 