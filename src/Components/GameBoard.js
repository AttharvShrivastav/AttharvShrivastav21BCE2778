import React, { useState } from 'react';

const GameBoard = ({ gameState, onMove, currentPlayer }) => {
  const [selectedPiece, setSelectedPiece] = useState(null);

  const renderBoard = () => {
    return gameState.board.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        const piece = getPieceAt(gameState, colIndex, rowIndex);
        const isSelected = selectedPiece && selectedPiece.id === piece?.id;
        const pieceColor = piece ? (piece.player === 'A' ? 'text-blue-500' : 'text-red-500') : '';

        return (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`w-16 h-16 border flex items-center justify-center bg-white ${
              isSelected ? 'bg-blue-200' : ''
            }`}
            onClick={() => handleCellClick(colIndex, rowIndex)}
          >
            {piece ? (
              <span className={`text-lg font-bold ${pieceColor}`}>{piece.type}</span>
            ) : null}
          </div>
        );
      })
    );
  };

  const getPieceAt = (state, x, y) => {
    for (const player in state.players) {
      for (const piece of state.players[player].pieces) {
        if (piece.position.x === x && piece.position.y === y) {
          return { ...piece, player }; // Include player info for color coding
        }
      }
    }
    return null;
  };

  const handleCellClick = (colIndex, rowIndex) => {
    const piece = getPieceAt(gameState, colIndex, rowIndex);
    if (piece && piece.player === currentPlayer) {  // Ensure piece belongs to current player
      setSelectedPiece(piece);
    }
  };

  const handleMove = (move) => {
    if (selectedPiece) {
      onMove(selectedPiece.id, move); // Pass piece ID instead of type
      setSelectedPiece(null); // Reset selected piece after move
    }
  };

  const renderMoveButtons = (type) => {
    const moveOptions = getMoveOptions(type);
    return moveOptions.map((move) => (
      <button
        key={move}
        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => handleMove(move)}
      >
        {move}
      </button>
    ));
  };

  const getMoveOptions = (type) => {
    switch (type) {
      case 'P': // Pawn moves
        return ['L', 'R', 'F', 'B'];
      case 'H1': // Hero1 moves
        return ['L', 'R', 'F', 'B'];
      case 'H2': // Hero2 moves
        return ['FL', 'FR', 'BL', 'BR'];
      default:
        return [];
    }
  };

  return (
    <div>
      <div className="grid grid-cols-5 gap-1 mb-4">{renderBoard()}</div>
      {selectedPiece && (
        <div className="flex space-x-2">
          {renderMoveButtons(selectedPiece.type)}
        </div>
      )}
    </div>
  );
};

export default GameBoard;
