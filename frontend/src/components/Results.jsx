import { useState, useEffect } from 'react';
import axios from 'axios';
import FontBox from './FontBox';

function Results({ fontFilters, selectedFonts, setSelectedFonts }) {
  const [error, setError] = useState(null);

useEffect(() => {
  axios.post('/api/getclosestfonts', { fontFilters })
    .then(response => {
      console.log(response.data.fonts);
      setSelectedFonts(response.data.fonts);
    })
    .catch(err => setError(err.message));
  }, [fontFilters]); // compares by value, not reference

  if (error) return <div>Error: {error}</div>;
  if (!selectedFonts) return <div>Loading...</div>;

  return (
    <div>
    {selectedFonts.map((fontName, i) => (
      <FontBox key={i} fontName={fontName} />
    ))}
  </div>
  );
}

export default Results;
