import React from 'react';
import CardRow from './CardRow';

const Card = ({ card }) => {
  return (
    <div className="bingo-card">
      <div className="bingo-card-play-area">
        {card.rows.map(row => (
          <CardRow key={row.id} row={row} />
        ))}
      </div>
    </div>
  );
};

export default Card;
