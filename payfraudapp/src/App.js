import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Form from './Form';


function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
        </header>
        <Routes>
          <Route path="/" element={<Form />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
