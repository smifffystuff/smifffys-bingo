import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import { useDatabase } from '../../context/DatabaseContext';
import { useFunctions } from '../../context/FunctionsContext';

import NumberHistory from './NumberHistory';

const CallingGame = () => {
  const { callingGame } = useDatabase();
  const { callNumber, deleteGame } = useFunctions();

  const handleCallNumber = async () => {
    try {
      await callNumber(callingGame.id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteGame = async () => {
    try {
      await deleteGame(callingGame.id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {callingGame && (
        <div className="w-100 text-center">
          <h2>{callingGame.name}</h2>
          <NumberHistory
            numbersCalled={callingGame.numbersCalled}
            oneLine={callingGame.oneLine}
            twoLines={callingGame.twoLines}
            fullHouse={callingGame.fullHouse}
          />
          <h5>Number Of Players {callingGame.players.length}</h5>
          {callingGame.oneLine.allow && (
            <h5>One Line Won {callingGame.oneLine.won ? 'YES' : 'NO'}</h5>
          )}
          {callingGame.twoLines.allow && (
            <h5>Two Lines Won {callingGame.twoLines.won ? 'YES' : 'NO'}</h5>
          )}
          {callingGame.fullHouse.allow && (
            <h5>Full House Won {callingGame.fullHouse.won ? 'YES' : 'NO'}</h5>
          )}
          {callingGame.gameOver && <h4>GAME OVER</h4>}
          <Button variant="primary" onClick={handleCallNumber}>
            Call Next Number
          </Button>
          <Button className="mt-" variant="danger" onClick={handleDeleteGame}>
            Delete Game
          </Button>
        </div>
      )}
      {!callingGame && (
        <>
          <Link to="/" className="btn btn-primary w-100 mt-3">
            No Game In Progress, Return To Home Page
          </Link>
        </>
      )}
    </div>
  );
};

export default CallingGame;
