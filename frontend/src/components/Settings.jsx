import React from 'react';
import GridSelector from './GridSelector';

const Settings = () => {
  return (
    <div className='flex flex-col items-center bg-neutral-800 min-h-screen'>
      <h2 className='mt-16 mb-4 text-center font-bold text-3xl'>Settings</h2>
      <GridSelector />
    </div>
  );
};

export default Settings;