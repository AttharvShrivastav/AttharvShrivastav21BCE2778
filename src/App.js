import React, { useState, useEffect } from 'react';
import GameBoard from './Components/GameBoard';
import PieceSelection from './Components/PieceSelection';
import './Styles/App.css'

const App = () => {
  const [ws, setWs] = useState(null);
  const [gameState, setGameState] = useState({
    board: Array(5).fill(null).map(() => Array(5).fill(null)),
    players: {},
    currentPlayer: 'A',
  });
  const [setupMode, setSetupMode] = useState(true);
  const [playerAPieces, setPlayerAPieces] = useState([]);
  const [playerBPieces, setPlayerBPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null); // Track selected piece
  const [potentialMoves, setPotentialMoves] = useState([]); // Track potential moves

  useEffect(() => {
    const websocket = new WebSocket('https://backendforchess.onrender.com');
    setWs(websocket);

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'gameState') {
        setGameState(message.state);
        setSelectedPiece(null); // Deselect piece after move
        setPotentialMoves([]);  // Clear potential moves after move
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
      setSetupMode(false);
    }
  };

  const handlePiecePlacement = (player, piece) => {
    if (player === 'A') {
      setPlayerAPieces((prevPieces) => [...prevPieces, piece]);
    } else {
      setPlayerBPieces((prevPieces) => [...prevPieces, piece]);
    }
  };

  const handleClearBoard = (player) => {
    if (player === 'A') {
      setPlayerAPieces([]);
    } else {
      setPlayerBPieces([]);
    }
  };

  const allSpacesFilled = (pieces, row) => {
    return pieces.filter(piece => piece.position.y === row).length === 5;
  };

  const canStartGame = () => {
    return allSpacesFilled(playerAPieces, 0) && allSpacesFilled(playerBPieces, 4);
  };

  const selectPiece = (piece) => {
    setSelectedPiece(piece);

    // Calculate potential moves based on piece type
    const moves = calculatePotentialMoves(piece);
    setPotentialMoves(moves);
  };

  const calculatePotentialMoves = (piece) => {
    const moves = [];
    const { x, y } = piece.position;

    // Example logic for calculating potential moves for a Pawn
    if (piece.type === 'P') {
      if (piece.player === 'A') {
        if (y > 0) moves.push({ x, y: y - 1 }); // Forward
        if (x > 0) moves.push({ x: x - 1, y }); // Left
        if (x < 4) moves.push({ x: x + 1, y }); // Right
      } else {
        if (y < 4) moves.push({ x, y: y + 1 }); // Forward
        if (x > 0) moves.push({ x: x - 1, y }); // Left
        if (x < 4) moves.push({ x: x + 1, y }); // Right
      }
    }

    // Add more conditions for Hero1 and Hero2 based on their movement rules

    // Filter out moves that are out of bounds or occupied
    return moves.filter(move => isPositionWithinBounds(move.x, move.y) && !gameState.board[move.y][move.x]);
  };

  const isPositionWithinBounds = (x, y) => {
    return x >= 0 && x < 5 && y >= 0 && y < 5;
  };

  const makeMove = (pieceId, move) => {
    if (ws) {
      ws.send(JSON.stringify({ type: 'move', data: { player: gameState.currentPlayer, pieceId, move } }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800">
      <h1 className="text-3xl font-bold text-purple-400 mb-4">Turn-Based Chess-Like Game</h1>
      <h2 className="text-xl font-semibold text-white mb-4">Developed By Attharv Shrivastav</h2>
      {setupMode ? (

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Setup Your Pieces</h2>
          <PieceSelection onPiecePlace={handlePiecePlacement} onClearBoard={handleClearBoard} />
          <button
            onClick={initializeGame}
            className={`mt-4 px-4 py-2 text-white rounded ${canStartGame() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 cursor-not-allowed'}`}
            disabled={!canStartGame()}
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
          <GameBoard
            gameState={gameState}
            onMove={makeMove}
            onSelectPiece={selectPiece}
            selectedPiece={selectedPiece}
            potentialMoves={potentialMoves}
            currentPlayer={gameState.currentPlayer}
          />
        </>
      )}
    </div>
  );
};

export default App;
