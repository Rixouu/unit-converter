import React from 'react';

function FavoritesList({ favorites, onRemove, onApply }) {
  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className="favorites">
      <h3>Favorites</h3>
      <ul>
        {favorites.map((favorite, index) => (
          <li key={index}>
            {favorite.category}: {favorite.fromUnit} to {favorite.toUnit}
            <button onClick={() => onApply(favorite)}>Apply</button>
            <button onClick={() => onRemove(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FavoritesList;