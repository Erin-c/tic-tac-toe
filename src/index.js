import React from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faPlus } from '@fortawesome/free-solid-svg-icons'
import './index.css';

function Square(props){
  return (
    <button
      className="square"
      onClick={props.onClick}
      style={{backgroundColor: props.winningSequence ? '#8ABD91' : 'transparent'}}
    >
      {props.value}
    </button>
  );
}


class Board extends React.Component {

  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={()=> {this.props.onClick(i)}}
        key={i}
        winningSequence={this.props.winningSequence && this.props.winningSequence.includes(i)}
      />
    );
  }

  render() {
    let rows = [];
    for(let i = 0; i < 3; i++){
      let squares = [];
      for (let j = 0; j < 3; j++) {
        squares = squares.concat(this.renderSquare(3*i+j));
      }
      rows = rows.concat(<div key={i} className="board-row">{squares}</div>);
    }
    
    return(rows);
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.lastItem = React.createRef();
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        location: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      reverse: false,
    }
  }

  handleClick(i){
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const location = i;
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if(calculateWinner(squares) || squares[i]){
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        location: location,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  reverse(){
    this.setState({
      reverse: !this.state.reverse,
    })
  }

  reset(){
    this.setState({
      history:[{
        squares: Array(9).fill(null),
        location: null,
      }],
      stepNumber:0,
      xIsNext: true,
      reverse: false,
    })
  }

  scrollToBottom = () => {
    if(!this.state.reverse)
    {
      this.lastItem.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares)?.player;
    const moves = history.map((step, move) => {
      const desc = move ?
      'Go to move # ' + move + ' (' + (step.location % 3 + 1) + ',' + (step.location < 3 ? '1' : (step.location < 6 ? '2' : '3')) + ')':
      'Go to game start';
      return (
        <li key={move}>
          <button className="goToButton" onClick={() => this.jumpTo(move)} style={{fontWeight: (move === this.state.stepNumber) ? 'bold' : 'normal'}}>{desc}</button>
        </li>
      )
    });
    let status;
    if(winner){
      status = 'Winner: ' + winner;
    }
    else if(this.state.stepNumber === 9){
      status = 'Its a draw';
    }
    else{
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    return (
      <div className="game-container">
        <div className="header">
          <h3 className="title">Tic-Tac-Toe</h3>
          <button className="button-ui new" onClick={() => this.reset()}><FontAwesomeIcon icon={faPlus}/> New Game</button>
        </div>
        <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i)=> this.handleClick(i)}
            winningSequence={calculateWinner(current.squares)?.sequence}
          />
        </div>
        <div className="game-info">
          <div className="status">
            <div>{ status }</div>
            <button className="button-ui" onClick={() => this.reverse()}>Sort Moves <FontAwesomeIcon icon={faSort} /> </button>
          </div>
          <div className="moves-container">
            <ul>
              { this.state.reverse ? moves.reverse() : moves }
              <li className="last-move" ref={this.lastItem}></li>
            </ul>
          </div>
        </div>
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
        sequence: lines[i], 
        player: squares[a]
      };
    }
  }
  return null;
}