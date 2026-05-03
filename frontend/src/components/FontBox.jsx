/**
 * Renders a box with:
 *  The actual font (request font from google API then render)
 *  Like, Dislike, And Heart Buttons
 */

import { useEffect, useState } from 'react';

const loadedFonts = new Set();

function FontBox({ fontName, toggleFavorite }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

useEffect(() => {
  if (!fontName) return;

  // Reset state when fontName changes — clears any previous error
  setLoaded(false);
  setError(false);

  if (loadedFonts.has(fontName)) {
    setLoaded(true);
    return;
  }

  const formatted = fontName.trim().replace(/\s+/g, '+');
  const url = `https://fonts.googleapis.com/css2?family=${formatted}&display=swap`;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  link.onload = () => {
    loadedFonts.add(fontName);
    setLoaded(true);
  };
  link.onerror = () => setError(true);
  document.head.appendChild(link);

}, [fontName]); // re-runs if fontName prop changes

  if (error) return (
    <div className="p-4 text-white/40 text-sm">
      Could not load {fontName}
    </div>
  );

  return (
    <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.15)] my-2 mx-5 bg-[rgba(255,255,255,0.05)]">
      <p
        style={{
          fontFamily: `'${fontName}'`,
          opacity: loaded ? 1 : 0,         // hide until font is ready
          transition: 'opacity 0.3s ease',  // fade in when loaded
        }}
        className="text-white text-2xl"
      >
        {fontName}
      </p>
    </div>
  );
}

export default FontBox;