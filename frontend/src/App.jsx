import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Center from './components/Center'
import Settings from './components/Settings'
import Favorites from './components/Favorites'

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <div className="grid grid-cols-4 w-screen">
        <div>
          <Settings />
        </div>
        <div className="col-span-2">
          <Center />
        </div>
        <div>
          <Favorites />
        </div>
      </div>
    </Router>
  )
}

export default App