
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Center from './components/Center'

import { BrowserRouter as Router } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <header>
          <h1 className="font-bold">THE FONTINATOR</h1>
        </header>
      </div>
    </Router>
  )
}

export default App