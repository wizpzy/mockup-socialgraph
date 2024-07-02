// src/App.js
import React from 'react';
import MapComponent from './Components/MapComponent';
import './App.css';
import Header from './Components/Header';
import Mapbox from './Components/Mapbox';

function App() {
  return (
    <div className="App">
      <Header />
      <Mapbox />
    </div>
  );
}

export default App;
