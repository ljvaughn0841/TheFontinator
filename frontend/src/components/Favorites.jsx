import React from 'react';
import FontBox from './FontBox';

const Favorites = ({favoritesList, toggleFavorite}) => {
  const font_test = "Zhi Mang Xing"
  return (
    <div className="">
      <h2 className='mt-16 mb-4 text-center font-bold text-3xl'>Favorites</h2>
      <FontBox 
      fontName = {font_test} // For testing just using this random font
      toggleFavorite = {toggleFavorite}
      />
    </div>
  );
};

export default Favorites;