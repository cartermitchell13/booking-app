import React from 'react';
import { AlertCircle } from 'lucide-react';
import { StepComponentProps } from '../types/createOfferingTypes';
import { getProductTypeName } from '../constants';
import { SeatBasedConfig } from '../product-configs/SeatBasedConfig';

// Import other config components when created
// import { CapacityBasedConfig } from '../product-configs/CapacityBasedConfig';
// import { OpenConfig } from '../product-configs/OpenConfig';
// import { EquipmentConfig } from '../product-configs/EquipmentConfig';
// import { PackageConfig } from '../product-configs/PackageConfig';
// import { TimeslotConfig } from '../product-configs/TimeslotConfig';

export const ConfigurationStep: React.FC<StepComponentProps> = ({ formData, updateFormData }) => {
  const productType = formData.productType;
  const config = formData.productConfig || {};

  const updateConfig = (field: string, value: any) => {
    updateFormData('productConfig', {
      ...config,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Product Configuration</h2>
        <p className="text-gray-600">
          Configure settings specific to your {getProductTypeName(productType)} offering
        </p>
      </div>

      {productType === 'seat' && <SeatBasedConfig config={config} updateConfig={updateConfig} />}
      {/* TODO: Add other product configurations */}
      {/* {productType === 'capacity' && <CapacityBasedConfig config={config} updateConfig={updateConfig} />}
      {productType === 'open' && <OpenConfig config={config} updateConfig={updateConfig} />}
      {productType === 'equipment' && <EquipmentConfig config={config} updateConfig={updateConfig} />}
      {productType === 'package' && <PackageConfig config={config} updateConfig={updateConfig} />}
      {productType === 'timeslot' && <TimeslotConfig config={config} updateConfig={updateConfig} />} */}
      
      {!productType && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <p className="text-gray-600">Please select a product type in Step 1 to configure your offering.</p>
        </div>
      )}
    </div>
  );
}; 