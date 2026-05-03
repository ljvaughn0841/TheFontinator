import { useState, useEffect } from 'react';
import axios from 'axios';
import FontBox from './FontBox';

function Results({ fontFilters }) {
  const [fontList, setFontList] = useState(null);
  const [error, setError] = useState(null);

useEffect(() => {
  axios.post('/api/getclosestfonts', { fontFilters })
    .then(response => {
      console.log(response.data.fonts);
      setFontList(response.data.fonts);
    })
    .catch(err => setError(err.message));
  }, [fontFilters]); // compares by value, not reference

  if (error) return <div>Error: {error}</div>;
  if (!fontList) return <div>Loading...</div>;

  return (
    <div>
    {fontList.map((fontName, i) => (
      <FontBox key={i} fontName={fontName} />
    ))}
  </div>
  );
}

export default Results;
