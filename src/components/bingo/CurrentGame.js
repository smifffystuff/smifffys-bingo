import React from 'react';
import { Link } from 'react-router-dom';

import { useDatabase } from '../../context/DatabaseContext';
import CardGrid from './CardGrid';
import NumberHistory from './NumberHistory';

const CurrentGame = () => {
  const { currentGame } = useDatabase();

  return (
    <>
      {currentGame && (
        <div className="w-100 text-center">
          <h2 className="w-100 text-center mt-5">{currentGame.name}</h2>
          <NumberHistory
            numbersCalled={currentGame.numbersCalled}
            oneLine={currentGame.oneLine}
            twoLines={currentGame.twoLines}
            fullHouse={currentGame.fullHouse}
          />
          <CardGrid cards={currentGame.cards} />
        </div>
      )}
      {!currentGame && (
        <>
          <Link to="/" className="btn btn-primary w-100 mt-3">
            No Game In Progress, Return To Home Page
          </Link>
        </>
      )}
    </>
  );
};

export default CurrentGame;
