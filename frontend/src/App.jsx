import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Center from './components/Center'
import Settings from './components/Settings'
import Favorites from './components/Favorites'

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  // Filters represent the Upper and Lower boundaries used in Sliders 
  const [fontFilters, setFontFilters] = useState({
    formality: [0, 100],
    age:  [0, 100],
    energy: [0, 100],
    warmth:[0, 100],
    expressiveness: [0, 100]
  });

  const handleFilterChange = (slice) => {
  setFontFilters(prev => ({ ...prev, ...slice }));
  };

  // Shared: Center / Settings writes this, Settings uses this in graphics
  const [selectedFonts, setSelectedFonts] = useState(null);

  // 
  const [closestFonts, setClosestFonts] = useState(null);

  // Shared: Favorites writes this, Center needs to show heart icons
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (font) => {
    setFavorites(prev =>
      prev.includes(font) ? prev.filter(f => f !== font) : [...prev, font]
    );
  };


  return (
    <Router>
      <div className="grid grid-cols-4 w-screen">
        <div>
          <Settings 
            values = {fontFilters}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-span-2">
          <Center 
          fontFilters = {fontFilters}/>
        </div>
        <div>
          <Favorites 
            favoritesList = {favorites}
            toggleFavorite = {toggleFavorite}
          />
        </div>
      </div>
    </Router>
  )
}

export default App