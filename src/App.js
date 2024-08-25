import React, { useState, useEffect } from 'react';
import GameBoard from './Components/GameBoard';
import PieceSelection from './Components/PieceSelection';
import './Styles/App.css'

const App = () => {
  const [ws, setWs] = useState(null);
  const [gameState, setGameState] = useState({
    board: Array(5).fill(null).map(() => Array(5).fill(null)),
    players: {},
    currentPlayer: 'A'
  });
  const [setupMode, setSetupMode] = useState(true); // Setup mode state
  const [playerAPieces, setPlayerAPieces] = useState([]);
  const [playerBPieces, setPlayerBPieces] = useState([]);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8080');
    setWs(websocket);

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'gameState') {
        setGameState(message.state);
      } else if (message.type === 'invalidMove') {
        alert('Invalid move, please try again.');
      } else if (message.type === 'outOfTurn') {
        alert('It is not your turn.');
      } else if (message.type === 'gameOver') {
        alert(`Game Over! Player ${message.winner} wins!`);
        websocket.close();
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      websocket.close();
    };
  }, []);

  const initializeGame = () => {
    if (ws) {
      const initialSetup = {
        playerA: playerAPieces,
        playerB: playerBPieces,
      };
      ws.send(JSON.stringify({ type: 'initialize', data: initialSetup }));
      setSetupMode(false); // Exit setup mode
    }
  };

  const handlePiecePlacement = (player, piece) => {
    if (player === 'A') {
      setPlayerAPieces((prevPieces) => [...prevPieces, piece]);
    } else {
      setPlayerBPieces((prevPieces) => [...prevPieces, piece]);
    }
  };

  const allSpacesFilled = (pieces, row) => {
    // Check if all 5 spaces in the specified row are filled
    return pieces.filter(piece => piece.position.y === row).length === 5;
  };

  const canStartGame = () => {
    // Check if all spaces on both players' starting rows are filled
    return allSpacesFilled(playerAPieces, 0) && allSpacesFilled(playerBPieces, 4);
  };

  const makeMove = (pieceId, move) => {
    if (ws) {
      ws.send(JSON.stringify({ type: 'move', data: { player: gameState.currentPlayer, pieceId, move } }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800">
      <h1 className="text-3xl font-bold text-purple-400 mb-4">Turn-Based Chess-Like Game</h1>
      {setupMode ? (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Setup Your Pieces</h2>
          <PieceSelection onPiecePlace={handlePiecePlacement} />
          <button
            onClick={initializeGame}
            className={`mt-4 px-4 py-2 text-white rounded ${canStartGame() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 cursor-not-allowed'}`}
            disabled={!canStartGame()} // Disable button if conditions are not met
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-white mb-4">
            Current Turn: <span className={gameState.currentPlayer === 'A' ? 'text-blue-500' : 'text-red-500'}>
              Player {gameState.currentPlayer}
            </span>
          </h2>
          <GameBoard gameState={gameState} onMove={makeMove} currentPlayer={gameState.currentPlayer} />
        </>
      )}
    </div>
  );
};

export default App;
