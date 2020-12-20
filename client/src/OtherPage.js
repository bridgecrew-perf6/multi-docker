import React from 'react';
import { Link } from 'react-router-dom';

const a = () => {
  return (
    <div>
      Another page 
      <Link to="/">Go back home</Link>
    </div>
  );
};

export default a;