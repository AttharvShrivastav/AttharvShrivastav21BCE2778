import React, { useState } from 'react';

const PieceSelection = ({ onPiecePlace }) => {
  const [currentPlayer, setCurrentPlayer] = useState('A');
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [piecesOnBoard, setPiecesOnBoard] = useState({
    A: [],
    B: [],
  });

  const handlePieceSelect = (type) => {
    setSelectedPiece(type);
  };

  const handlePlacePiece = (position) => {
    if (selectedPiece) {
      if ((currentPlayer === 'A' && position.y === 0) || (currentPlayer === 'B' && position.y === 4)) {
        const piece = {
          id: `${currentPlayer}-${selectedPiece}-${position.x}-${position.y}`,
          type: selectedPiece,
          position,
        };
        onPiecePlace(currentPlayer, piece);

        // Update pieces on board immediately
        setPiecesOnBoard((prev) => ({
          ...prev,
          [currentPlayer]: [...prev[currentPlayer], piece],
        }));
        setSelectedPiece(null); // Reset selection after placing
      } else {
        alert(`Player ${currentPlayer} can only place pieces on row ${currentPlayer === 'A' ? '0' : '4'}.`);
      }
    }
  };

  const switchPlayer = () => {
    setCurrentPlayer(currentPlayer === 'A' ? 'B' : 'A');
    setSelectedPiece(null); // Reset selection when switching players
  };

  const clearBoard = () => {
    setPiecesOnBoard((prev) => ({
      ...prev,
      [currentPlayer]: [],
    }));
    onPiecePlace(currentPlayer, []); // Clear board for the current player
    setSelectedPiece(null); // Reset selection after clearing
  };

  const renderPiece = (x, y) => {
    const piece = piecesOnBoard[currentPlayer].find((p) => p.position.x === x && p.position.y === y);
    return piece ? <span className="text-lg font-bold">{piece.type}</span> : null;
  };

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => handlePieceSelect('P')}
          className={`px-4 py-2 rounded ${selectedPiece === 'P' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}
        >
          Pawn
        </button>
        <button
          onClick={() => handlePieceSelect('H1')}
          className={`px-4 py-2 rounded ${selectedPiece === 'H1' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}
        >
          Hero1
        </button>
        <button
          onClick={() => handlePieceSelect('H2')}
          className={`px-4 py-2 rounded ${selectedPiece === 'H2' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}
        >
          Hero2
        </button>
        <button onClick={clearBoard} className="px-4 py-2 bg-red-500 text-white rounded">
          Clear Board
        </button>
      </div>
      <div className="grid grid-cols-5 gap-1 mb-4">
        {Array(5)
          .fill(null)
          .map((_, y) =>
            Array(5)
              .fill(null)
              .map((_, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`w-16 h-16 border flex items-center justify-center bg-white ${
                    (currentPlayer === 'A' && y === 0) || (currentPlayer === 'B' && y === 4)
                      ? 'cursor-pointer'
                      : 'opacity-50'
                  }`}
                  onClick={() => handlePlacePiece({ x, y })}
                >
                  {renderPiece(x, y)}
                </div>
              ))
          )}
      </div>
      <button onClick={switchPlayer} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
        Switch to Player {currentPlayer === 'A' ? 'B' : 'A'}
      </button>
    </div>
  );
};

export default PieceSelection;
