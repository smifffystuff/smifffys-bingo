import React from 'react';
import Card from './Card';

const CardGrid = ({ cards }) => {
  return (
    <div className="bingo-grid">
      {cards
        .sort((a, b) => Number(a.remaining) - Number(b.remaining))
        .map((card, index) => (
          <Card key={card.id} card={card} index={index} />
        ))}
    </div>
  );
};

export default CardGrid;
