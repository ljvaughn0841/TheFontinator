import React from 'react';
import Slider from './Slider';

const sliderConfigs = [
  { key: 'formality',      label: 'Formality' },
  { key: 'age',            label: 'Age' },
  { key: 'energy',         label: 'Energy' },
  { key: 'warmth',         label: 'Warmth' },
  { key: 'expressiveness', label: 'Expressiveness' },
];

const SliderPanel = ({ values, onChange }) => (

  // Add something to select sliders of interest and hide the rest

  <div className='flex flex-col gap-1'>
    {sliderConfigs.map(cfg => (
      <Slider
        key={cfg.key}
        label={cfg.label}
        min={0}
        max={100}
        value={values[cfg.key]}
        onChange={(range) => onChange({ [cfg.key]: range })}
      />
    ))}
  </div>
);

export default SliderPanel;