/* Renders the top list of fonts that match your search
 * Allows you to favorite fonts
 *
 * In the future if you think that fonts match or don't match your search 
 * allows for voting (like / dislike) to update the semantic scores for fonts.
 * This'll help make results more accurate since the classification scores via CLIP needs improvement
 */
import React from 'react';
import Results from './Results';

function Center({ fontFilters, selectedFonts, setSelectedFonts, favoritesList, toggleFavorite }) {
  return (
    <div className='px-14'>
      <h1 className='font-bold mt-12'>The Fontinator</h1>
      {/* <pre>{JSON.stringify(fontFilters, null, 2)}</pre> */}
      <Results 
        fontFilters = {fontFilters} 
        selectedFonts = {selectedFonts}
        setSelectedFonts = {setSelectedFonts}
        favoritesList = {favoritesList}
        toggleFavorite = {toggleFavorite}
      />
    </div>
  );
}

export default Center;
