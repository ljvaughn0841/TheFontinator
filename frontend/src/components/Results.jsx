import { useState, useEffect } from 'react';
import axios from 'axios';

function Results() {
  const [font, setFont] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/featured-font')
      .then(response => setFont(response.data.font))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!font) return <div>Loading...</div>;

  return (
    <div>Font: {font}</div>
  );
}

export default Results;
