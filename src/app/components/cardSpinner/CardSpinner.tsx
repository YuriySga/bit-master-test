import React from 'react';

import './cardSpinner.scss';

export const CardSpinner = () => {
  return (
    <div className="cardSpinner position-fixed vw-100 vh-100">
      <div className="d-flex justify-content-center h-100 align-items-center">
        <div className="spinner-border cardSpinner-spinner" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  );
}
