
import React from 'react';

interface StepsIndicatorProps {
  currentStep: number;
  steps?: number;
}

const StepsIndicator = ({ currentStep, steps = 3 }: StepsIndicatorProps) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center">
        {Array.from({ length: steps }).map((_, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <div className={`w-16 h-1 ${currentStep > index ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            )}
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepsIndicator;
