import React from 'react';
import GridSelector from './GridSelector';
import SliderPanel from './SliderPanel';

const Settings = ({ values, onChange }) => {
  return (
    <div className='flex flex-col items-center bg-neutral-800 min-h-screen'>
      <h2 className='mt-16 mb-4 text-center font-bold text-3xl'>Settings</h2>
      {/* Temporarily hiding the Grid Selector to focus on sliders */}
      <GridSelector />

      {/* SELECTOR FOR SLIDERS */}

      {/* SLIDERS  */}
      <SliderPanel
      values = {values} 
      onChange={onChange}
      />


    </div>
  );
};

export default Settings;