import React from 'react';

const Cell = ({ number }) => {
  return (
    <div
      className="bingo-cell"
      style={{ backgroundColor: number && number.called && 'darkgray' }}
    >
      {number ? number.number : ''}
    </div>
  );
};

export default Cell;
