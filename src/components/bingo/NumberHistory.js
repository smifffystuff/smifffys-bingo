import React, { useState, useEffect } from 'react';

const NumberHistory = ({ numbersCalled, oneLine, twoLines, fullHouse }) => {
  const [playingFor, setPlayingFor] = useState();

  useEffect(() => {
    let currentStage = '';
    if (oneLine.allow && !oneLine.won) {
      currentStage = 'One Line';
    } else if (twoLines.allow && !twoLines.won) {
      currentStage = 'Two Lines';
    } else if (fullHouse.allow && !fullHouse.won) {
      currentStage = 'A Full House';
    } else {
      currentStage = 'Nothing Because The Game Is Over!';
    }
    setPlayingFor(currentStage);
  }, [oneLine, twoLines, fullHouse]);

  return (
    <>
      <div className="w-100 text-center">Number History</div>
      <h4>Currently Playing For {playingFor}</h4>
      <div className="number-history-list text-center">
        {numbersCalled.slice(0, 8).map(number => (
          <div className="number-history-list-number" key={number}>
            {number}
          </div>
        ))}
      </div>
    </>
  );
};

export default NumberHistory;
