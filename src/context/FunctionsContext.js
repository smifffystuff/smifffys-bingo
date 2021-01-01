import React, { useContext } from 'react';
import { funcs } from '../firebase';

const FunctionsContext = React.createContext();

export const useFunctions = () => {
  return useContext(FunctionsContext);
};

export const FunctionsProvider = ({ children }) => {
  const createNewGame = gameOptions => {
    const gamesCreate = funcs.httpsCallable('games-create');
    return gamesCreate(gameOptions);
  };

  const joinGame = gameId => {
    const gamesJoin = funcs.httpsCallable('games-join');
    console.log(`Trying to join game ${gameId}`);
    return gamesJoin({ gameId });
  };

  const startGame = gameId => {
    const gamesStart = funcs.httpsCallable('games-start');
    console.log(`Trying to start game ${gameId}`);
    return gamesStart({ gameId });
  };

  const leaveGame = gameId => {
    const gamesLeave = funcs.httpsCallable('games-leave');
    console.log(`Trying to leave game ${gameId}`);
    return gamesLeave({ gameId });
  };

  const callNumber = gameId => {
    const gamesCallNumber = funcs.httpsCallable('games-callNumber');
    return gamesCallNumber({ gameId });
  };

  const deleteGame = gameId => {
    const gamesDelete = funcs.httpsCallable('games-delete');
    console.log(`Trying to delete game ${gameId}`);
    return gamesDelete({ gameId });
  };

  const getUserNickname = userId => {
    const userGetNickname = funcs.httpsCallable('users-getNickname');
    return userGetNickname({ userId });
  };

  const value = {
    createNewGame,
    joinGame,
    leaveGame,
    startGame,
    deleteGame,
    callNumber,
    getUserNickname,
  };

  return (
    <FunctionsContext.Provider value={value}>
      {children}
    </FunctionsContext.Provider>
  );
};
