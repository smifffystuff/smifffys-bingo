const functions = require('firebase-functions');
const admin = require('firebase-admin');
// admin.initializeApp();

const { gerenateCards } = require('../utils/cardGenerator');

exports.create = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only auithenticated users can create new games'
    );
  }
  if (data.name.length > 30) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'game names must be no more that 30 characters long'
    );
  }
  const numbersAvailable = [];
  for (let i = 1; i <= 90; i++) {
    numbersAvailable.push(i);
  }
  return admin
    .firestore()
    .collection('games')
    .add({
      emulator: true,
      name: data.name,
      color: data.color,
      oneLine: {
        allow: data.oneLine,
        won: false,
        winner: '',
      },
      twoLines: {
        allow: data.twoLines,
        won: false,
        winner: '',
      },
      fullHouse: {
        allow: data.fullHouse,
        won: false,
        winner: '',
      },
      owner: context.auth.uid,
      inProgress: false,
      started: false,
      gameOver: false,
      numbersCalled: [],
      numbersAvailable,
      players: [],
    });
});

exports.join = functions.https.onCall(async (data, context) => {
  console.log(`Joining game ${data.gameId}`);
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only auithenticated users can create new games'
    );
  }
  if (!data.gameId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'you must specifiy a game to join'
    );
  }
  const gameRef = admin.firestore().collection('games').doc(data.gameId);
  const gameSnapshot = await gameRef.get();
  const player = await admin.auth().getUser(context.auth.uid);

  if (gameSnapshot.exists) {
    const game = gameSnapshot.data();
    const currentPlayers = game.players;
    const bingoCards = gerenateCards();
    if (currentPlayers.some(player => player.id === context.auth.uid)) {
      console.log('Player already in game, re-joing');
      return game;
    }
    return gameRef.set(
      {
        players: [
          ...currentPlayers,
          { id: context.auth.uid, cards: bingoCards, name: player.displayName },
        ],
      },
      { merge: true }
    );
  } else {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'game does not exist'
    );
  }
});

exports.leave = functions.https.onCall(async (data, context) => {
  if (!data.gameId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'you must specifiy a game to leave'
    );
  }
  const gameRef = admin.firestore().collection('games').doc(data.gameId);
  const gameSnapshot = await gameRef.get();

  if (gameSnapshot.exists) {
    const game = gameSnapshot.data();
    const currentPlayers = game.players;
    if (!currentPlayers.includes(context.auth.uid)) {
      return gameRef.set(
        {
          players: currentPlayers.filter(
            player => player.id !== context.auth.uid
          ),
        },
        { merge: true }
      );
    }
    throw new functions.https.HttpsError(
      'invalid-argument',
      'player not in this game'
    );
  } else {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'game does not exist'
    );
  }
});

exports.start = functions.https.onCall(async (data, context) => {
  if (!data.gameId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'you must specifiy a game to start'
    );
  }
  const gameRef = admin.firestore().collection('games').doc(data.gameId);
  const gameSnapshot = await gameRef.get();

  if (gameSnapshot.exists) {
    const game = gameSnapshot.data();
    return gameRef.set(
      {
        caller: context.auth.uid,
        inProgress: true,
      },
      { merge: true }
    );
  } else {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'game does not exist'
    );
  }
});

exports.callNumber = functions.https.onCall(async (data, context) => {
  if (!data.gameId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'you must specifiy a game to start'
    );
  }
  const gameRef = admin.firestore().collection('games').doc(data.gameId);
  const gameSnapshot = await gameRef.get();

  if (gameSnapshot.exists) {
    const game = gameSnapshot.data();

    const numbersAvailable = game.numbersAvailable;
    const numbersCalled = game.numbersCalled;
    const oneLine = game.oneLine;
    const oneLineWasWon = oneLine.won;
    const twoLines = game.twoLines;
    const twoLinesWasWon = twoLines.won;
    const fullHouse = game.fullHouse;
    const fullHouseWasWon = fullHouse.won;
    let gameOver = game.gameOver;
    if (gameOver) {
      console.log('Game over so not doing anything');
      return {
        numbersAvailable,
        numbersCalled,
      };
    }
    const numberIndex = Math.floor(Math.random() * numbersAvailable.length);
    console.log(numberIndex, numbersAvailable.length);
    const number = numbersAvailable[numberIndex];
    console.log(`Calling number ${number}`);
    numbersAvailable.splice(numberIndex, 1);
    numbersCalled.unshift(number);
    const players = game.players;

    players.forEach(player => {
      player.cards.forEach(card => {
        card.rows.forEach(row => {
          row.numbers.forEach(num => {
            if (num.number === number) {
              num.called = true;
              row.remaining -= 1;
              card.remaining -= 1;
            }
          });
        });
        const completeRows = card.rows.filter(row => row.remaining === 0)
          .length;
        if (oneLine.allow && !oneLine.won && completeRows === 1) {
          oneLine.won = true;
          oneLine.winner = player.id;
        }
        if (twoLines.allow && !twoLines.won && completeRows === 2) {
          twoLines.won = true;
          twoLines.winner = player.id;
        }
        if (fullHouse.allow && !fullHouse.won && completeRows === 3) {
          fullHouse.won = true;
          fullHouse.winner = player.id;
        }
      });
    });

    if (
      ((fullHouse.allow && fullHouse.won) || !fullHouse.allow) &&
      ((twoLines.allow && twoLines.won) || !twoLines.allow) &&
      ((oneLine.allow && oneLine.won) || !oneLine.allow)
    ) {
      gameOver = true;
    }

    if (!oneLineWasWon && oneLine.won) {
      const winner = await admin.auth().getUser(oneLine.winner);
      oneLine.winnerName = winner.displayName;
    }

    if (!twoLinesWasWon && twoLines.won) {
      const winner = await admin.auth().getUser(twoLines.winner);
      twoLines.winnerName = winner.displayName;
    }

    if (!fullHouseWasWon && fullHouse.won) {
      const winner = await admin.auth().getUser(fullHouse.winner);
      fullHouse.winnerName = winner.displayName;
    }

    await gameRef.set(
      {
        numbersAvailable,
        numbersCalled,
        players,
        started: true,
        oneLine,
        twoLines,
        fullHouse,
        gameOver,
      },
      { merge: true }
    );

    return {
      numbersAvailable,
      numbersCalled,
    };
  } else {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'game does not exist'
    );
  }
});

exports.delete = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only auithenticated users can create new games'
    );
  }
  if (!data.gameId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'you must specifiy a game to join'
    );
  }
  const gameRef = admin.firestore().collection('games').doc(data.gameId);
  const gameSnapshot = await gameRef.get();

  if (gameSnapshot.exists) {
    return gameRef.delete();
  } else {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'game does not exist'
    );
  }
});
