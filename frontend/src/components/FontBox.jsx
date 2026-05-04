/**
 * Renders a box with:
 *  The actual font (request font from google API then render)
 *  Like, Dislike, And Heart Buttons
 */

import { useEffect, useState } from 'react';

const loadedFonts = new Set();

    const Star = ({ color = "gold", size = 24, onClick }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
    );

function FontBox({ fontName, toggleFavorite, favoritesList }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const isFavorited = favoritesList?.includes(fontName) ?? false;

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
    <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.15)] my-2 mx-5 bg-[rgba(255,255,255,0.05)] flex items-center gap-4">
      <Star className = "z-10 flex-none" color={isFavorited ? "gold" : "gray"} size={40} onClick={() => toggleFavorite(fontName)} style={{ cursor: 'pointer' }} />
      <p
        style={{
          fontFamily: `'${fontName}'`,
          opacity: loaded ? 1 : 0,         // hide until font is ready
          transition: 'opacity 0.3s ease',  // fade in when loaded
        }}
        className="text-white text-2xl z-20 flex-auto"
      >
        {fontName}
      </p>
      {/* Placeholder for Like/Dislike Area */}
      <div className='w-[40px]'></div>
    </div>
  );
}

export default FontBox;