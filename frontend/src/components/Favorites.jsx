import React from 'react';
import FontBox from './FontBox';

const Favorites = ({favoritesList, toggleFavorite}) => {
  return (
    <div className="">
      <h2 className='mt-16 mb-4 text-center font-bold text-3xl'>Favorites</h2>
      {favoritesList.map((fontName, i) => (
        <FontBox key={i} fontName={fontName} toggleFavorite={toggleFavorite} favoritesList={favoritesList} />
      ))}
    </div>
  );
};

export default Favorites;