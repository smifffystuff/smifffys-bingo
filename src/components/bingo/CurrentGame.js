import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import { useDatabase } from '../../context/DatabaseContext';
import { useFunctions } from '../../context/FunctionsContext';
import CardGrid from './CardGrid';
import NumberHistory from './NumberHistory';
import ChatPanel from '../chat/ChatPanel';

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

  return (
    <>
      {currentGame && (
        <div className="d-flex flex-column text-center border border-dark">
          <h2 className="w-100 text-center mt-5">{currentGame.name}</h2>
          <Button onClick={() => handleLeaveGame(currentGame.id)}>
            Leave Game
          </Button>
          <NumberHistory
            numbersCalled={currentGame.numbersCalled}
            oneLine={currentGame.oneLine}
            twoLines={currentGame.twoLines}
            fullHouse={currentGame.fullHouse}
          />
          <div className="d-flex flex-row align-self-center flex-grow-1 border border-primary">
            <CardGrid cards={currentGame.cards} />
            <ChatPanel />
          </div>
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
