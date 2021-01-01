import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import { useDatabase } from '../../context/DatabaseContext';
import { useFunctions } from '../../context/FunctionsContext';
import CardGrid from './CardGrid';
import NumberHistory from './NumberHistory';

const CurrentGame = () => {
  const { currentGame } = useDatabase();
  const { leaveGame, getUserNickname } = useFunctions();
  const history = useHistory();

  const handleLeaveGame = async gameId => {
    try {
      await leaveGame(gameId);
      history.push('/');
    } catch (error) {
      console.error(error);
    }
  };
  console.log(currentGame);

  return (
    <>
      {currentGame && (
        <div className="w-100 text-center">
          <h2 className="w-100 text-center mt-5">...{currentGame.name}</h2>
          <Button
            variant="link"
            onClick={() => handleLeaveGame(currentGame.id)}
          >
            Leave Game
          </Button>
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
