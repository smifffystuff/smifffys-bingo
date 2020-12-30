import React from 'react';
import Cell from './Cell';

const CardRow = ({ row, called }) => {
  return (
    <div className="bingo-row">
      <Cell number={row.numbers.find(n => n.number < 10)} />
      <Cell
        number={row.numbers.find(n => n.number > 9 && n.number < 20)}
        called={called}
      />
      <Cell
        number={row.numbers.find(n => n.number > 19 && n.number < 30)}
        called={called}
      />
      <Cell
        number={row.numbers.find(n => n.number > 29 && n.number < 40)}
        called={called}
      />
      <Cell
        number={row.numbers.find(n => n.number > 39 && n.number < 50)}
        called={called}
      />
      <Cell
        number={row.numbers.find(n => n.number > 49 && n.number < 60)}
        called={called}
      />
      <Cell
        number={row.numbers.find(n => n.number > 59 && n.number < 70)}
        called={called}
      />
      <Cell
        number={row.numbers.find(n => n.number > 69 && n.number < 80)}
        called={called}
      />
      <Cell number={row.numbers.find(n => n.number > 79)} />
    </div>
  );
};

export default CardRow;
