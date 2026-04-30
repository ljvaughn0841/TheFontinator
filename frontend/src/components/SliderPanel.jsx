import React from 'react';
import Slider from './Slider';

const sliderConfigs = [
  { key: 'formality',      label: 'Formality' },
  { key: 'age',            label: 'Age' },
  { key: 'energy',         label: 'Energy' },
  { key: 'warmth',         label: 'Warmth' },
  { key: 'expressiveness', label: 'Expressiveness' },
];

const SliderPanel = ({ values, onChange }) => {
  // Add something to select sliders of interest and hide the rest
  if (!values) return null;
  return (
    <div className='flex flex-col gap-1'>
      {sliderConfigs.map(cfg => (
        <Slider
          key={cfg.key}
          sliderKey={cfg.key}          // ← new
          label={cfg.label}
          min={0}
          max={100}
          value={values[cfg.key]}
          onChange={(range) => onChange({ [cfg.key]: range })}
          fontFilters={values}
        />
      ))}
    </div>
  );
};


export default SliderPanel;