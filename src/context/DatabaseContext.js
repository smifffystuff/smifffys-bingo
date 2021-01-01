import React, { useContext, useState, useEffect } from 'react';
import { db } from '../firebase';

import { useAuth } from './AuthContext';
import { useFunctions } from './FunctionsContext';

const DatabaseContext = React.createContext();

export const useDatabase = () => {
  return useContext(DatabaseContext);
};

export const DatabaseProvider = ({ children }) => {
  const [games, setGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [callingGame, setCallingGame] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const unsubscribe = db.collection('games').onSnapshot(snapshot => {
      const newGames = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      let gotCurrentGame = false;
      let gotCallingGame = false;
      newGames.forEach(game => {
        if (
          currentUser &&
          game.players.some(player => player.id === currentUser.uid)
        ) {
          const cards = game.players.find(
            player => player.id === currentUser.uid
          ).cards;
          gotCurrentGame = true;
          setCurrentGame({
            id: game.id,
            owner: game.owner,
            name: game.name,
            cards,
            numbersCalled: game.numbersCalled,
            oneLine: game.oneLine,
            twoLines: game.twoLines,
            fullHouse: game.fullHouse,
          });
        }
        if (currentUser && game.caller === currentUser.uid) {
          gotCallingGame = true;
          setCallingGame(game);
        }
      });
      if (!gotCallingGame) {
        setCallingGame(null);
      }
      if (!gotCurrentGame) {
        setCurrentGame(null);
      }
      setGames(newGames);
    });
    return unsubscribe;
  }, [currentUser]);

  const value = {
    games,
    currentGame,
    callingGame,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};
