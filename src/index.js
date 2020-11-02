import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


let Square = (props) => {
  return (
    <button 
      className={'square' + (props.highlight ? ' highlight' : '')}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  )
}

class Board extends React.Component {

  renderSquare(i) {
    const winLine = this.props.winLine;
    return (
      <Square
        key={i} 
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight={winLine && winLine.includes(i)}
      />
    );
  }

  render() {

    // Use two loops to make the squares
    const boardSize = 3;
    let squares = [];
    for(let i=0; i<boardSize; ++i) {
      let row = [];
      for(let j=0; j<boardSize; ++j) {
        row.push(this.renderSquare(i * boardSize + j));
      }
      squares.push(<div key={i} className="board-row">{row}</div>);
    }
    
    return (
      <div>{squares}</div>
    )
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      isAscending: true,
    };
  }

  handleClick(i) {

    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        locations: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  handleToggleOrder() {
    this.setState({
      isAscending: !this.state.isAscending,
    })
  }
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winInfo = calculateWinner(current.squares);
    const isDraw = winInfo.isDraw;
    const winner = calculateWinner(current.squares).winner;

    const moves = history.map((step, move) => {
      const locations = step.locations;
      const col = 1 + locations % 3;
      const row = 1 + Math.floor(locations/3);
      const desc = move ?
        `Go to move #${move} (${col}, ${row})` :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {move === this.state.stepNumber ? <b>{desc}</b> : desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (isDraw) {
      status = 'It is a Draw!';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winLine={winInfo.line}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.handleToggleOrder()}>{this.state.isAscending ? 'Ascending' : 'Descending'}</button>
          <ol>{this.state.isAscending ? moves : moves.reverse()}</ol>
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

      return {
        winner: squares[a],
        line: lines[i],
      }
    } 
  }
  let isDraw = true; 
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      isDraw = false;
      break;
    }
  } 
  return {
    winner: null,
    isDraw: isDraw,
    line: null,
  }
}