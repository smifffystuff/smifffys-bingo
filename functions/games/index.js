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

  if (gameSnapshot.exists) {
    const game = gameSnapshot.data();
    const currentPlayers = game.players;
    const bingoCards = gerenateCards();
    return gameRef.set(
      {
        players: [
          ...currentPlayers,
          { id: context.auth.uid, cards: bingoCards },
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
    const twoLines = game.twoLines;
    const fullHouse = game.fullHouse;
    let gameOver = game.gameOver;
    const numberIndex = Math.round(Math.random() * numbersAvailable.length);
    const number = numbersAvailable[numberIndex];
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
