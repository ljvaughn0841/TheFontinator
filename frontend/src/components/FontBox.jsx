/**
 * Renders a box with:
 *  The actual font (request font from google API then render)
 *  Like, Dislike, And Heart Buttons
 */

import { useEffect, useState } from 'react';

function FontBox({ fontName, toggleFavorite }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fontName) return;

    const loadFont = async () => {
      try {
        // Format font name for Google Fonts URL — spaces become +
        const formatted = fontName.trim().replace(/\s+/g, '+');
        const url = `https://fonts.googleapis.com/css2?family=${formatted}&display=swap`;

        // Inject a <link> tag into the document head
        // Check if it's already there first to avoid duplicates
        const existingLink = document.querySelector(`link[href="${url}"]`);
        if (existingLink) {
          setLoaded(true);
          return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = () => setLoaded(true);
        link.onerror = () => setError(true);
        document.head.appendChild(link);

      } catch (err) {
        console.error(`Failed to load font: ${fontName}`, err);
        setError(true);
      }
    };

    loadFont();
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