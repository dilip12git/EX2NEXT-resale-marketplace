
import React from 'react';
import './Loader.css'; 
import { PacmanLoader } from 'react-spinners';

const Loader = () => (
  <div className="loader-container">
  <PacmanLoader color="#0066FF" />
  </div>
);

export default Loader;
