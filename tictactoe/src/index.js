import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    let className = "square";
    if (props.highlight) {
      className += " highlight";
    }
    return (
      <button className={className}
              onClick={props.onClick}>
        {props.value}
      </button>
    );
}

class Board extends React.Component {
  renderSquare(i, highlight) {
    return <Square value={this.props.squares[i]} highlight={highlight}
                   onClick={() => this.props.onClick(i)} />;
  }

  render() {
    let winnerSquares = this.props.winnerSquares;
    let squareNumber = 0;
    let rows = [];
    for (let i=0; i<3; i++) {
      let columns = [];
      for (let j=0; j<3; j++) {
        let highlight = winnerSquares ? winnerSquares.includes(squareNumber) : false;
        columns.push(this.renderSquare(squareNumber++, highlight));
      }
      rows.push(<div className="board-row">{columns}</div>);
    }

    return (
      <div>
        <div className="status">{status}</div>
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        column: null,
        row: null,
      }],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        column: i % 3,
        row: Math.floor(i / 3),
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      reversed: false,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  toggleReverse() {
    // different way to update state, better for updates based on current values of state
    this.setState((state, props) => ({
      reversed: !state.reversed,
    }));
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerLine = calculateWinner(current.squares);
    let winner = winnerLine ? current.squares[winnerLine[0]] : null;

    const moves = history.map((step, move) => {
      const desc = move ? 'Go to move #' + move + " at position (" + step.column + ", " + step.row + ")"
                        : 'Go to game start';
      let className = this.state.stepNumber === move ? "current" : "";
      return(
        <li key={move}>
          <button onClick={() => this.jumpTo(move)} className={className}>{desc}</button>
        </li>
      );
    });
    if (this.state.reversed) {
      moves.reverse();
    }

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (this.state.stepNumber === 9) {
      status = 'Even match';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} winnerSquares={winnerLine}
                 onClick={(i) => this.handleClick(i)}/>
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol reversed={this.state.reversed}>{moves}</ol>
          <button onClick={() => this.toggleReverse()}>Reverse toggle</button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return null;
}
