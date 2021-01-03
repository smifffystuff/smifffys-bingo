const { v4: uuid } = require('uuid');

exports.gerenateCards = () => {
  let failed = true;
  let rows = [];
  const playerCards = [];
  while (failed) {
    failed = false;
    // console.log('Generating');
    const availableNumbers = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26, 27, 18, 29],
      [30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
      [40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
      [50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
      [60, 61, 62, 63, 64, 65, 66, 67, 68, 69],
      [70, 71, 72, 73, 74, 75, 76, 77, 78, 79],
      [80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
    ];
    rows = [];
    for (let r = 0; r < 18; r++) {
      const row = [];
      const availableCols = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(
        c => availableNumbers[c].length > 0
      );
      if (availableCols.length < 5) {
        failed = true;
        break;
      }
      for (let i = 0; i < 5; i++) {
        const thisColIndex = Math.floor(Math.random() * availableCols.length);
        const thisCol = availableCols[thisColIndex];
        availableCols.splice(thisColIndex, 1);
        const numberIndex = Math.floor(
          Math.random() * availableNumbers[thisCol].length
        );
        const number = availableNumbers[thisCol][numberIndex];
        availableNumbers[thisCol].splice(numberIndex, 1);
        row.push({ number: Number(number), called: false });
      }
      rows.push(row.sort((a, b) => Number(a.number) - Number(b.number)));
    }
  }
  let cardNum = -1;
  for (let r = 0; r < 18; r++) {
    if (r % 3 === 0) {
      cardNum++;
      playerCards.push({
        id: uuid(),
        rows: [],
        remaining: 15,
      });
    }
    playerCards[cardNum].rows.push({
      id: uuid(),
      numbers: rows[r],
      remaining: 5,
    });
  }
  return playerCards;
};
