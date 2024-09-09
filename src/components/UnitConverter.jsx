import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { convertUnits, conversionRates } from '../utils/conversionUtils';
import { conversionFormulas } from '../utils/conversionFormulas';
import './UnitConverter.css';

function UnitConverter() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState('light');
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('kilometer');
  const [value, setValue] = useState('');
  const [result, setResult] = useState('');
  const [precision, setPrecision] = useState(4);
  const [formula, setFormula] = useState('');
  const [recentConversions, setRecentConversions] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  useEffect(() => {
    const units = Object.keys(conversionRates[category]);
    setFromUnit(units[0]);
    setToUnit(units[1]);
  }, [category]);

  useEffect(() => {
    const formulaKey = `${fromUnit}-${toUnit}`;
    const reverseFormulaKey = `${toUnit}-${fromUnit}`;
    let formula = conversionFormulas[category]?.[formulaKey];
    if (!formula) {
      formula = conversionFormulas[category]?.[reverseFormulaKey];
      if (formula) {
        formula = formula.replace(/(\w+)\s*=\s*(\w+)/, '$2 = $1');
      }
    }
    setFormula(formula || t('formulaNotAvailable'));
  }, [category, fromUnit, toUnit, t]);

  const formatResult = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    if (Math.abs(numValue) >= 1e9 || Math.abs(numValue) < 1e-9) {
      return numValue.toExponential(precision);
    }
    return numValue.toFixed(precision);
  };

  const handleConvert = () => {
    if (!value) return;
    const convertedValue = convertUnits(parseFloat(value), fromUnit, toUnit, category);
    const newResult = formatResult(convertedValue);
    setResult(newResult);
    
    const newConversion = {
      from: `${value} ${t(`units.${fromUnit}`)}`,
      to: `${newResult} ${t(`units.${toUnit}`)}`,
      category,
      timestamp: new Date().getTime()
    };
    
    setRecentConversions(prev => [newConversion, ...prev.slice(0, 4)]);
  };

  const clearRecentConversions = () => {
    setRecentConversions([]);
  };

  const handleSwapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setValue(result);
    setResult('');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  const toggleFavorite = (conversion) => {
    setFavorites(prevFavorites => {
      const existingIndex = prevFavorites.findIndex(fav => 
        fav.from === conversion.from && fav.to === conversion.to
      );
      if (existingIndex >= 0) {
        // Remove from favorites if already exists
        return prevFavorites.filter((_, index) => index !== existingIndex);
      } else {
        // Add to favorites
        return [...prevFavorites, conversion];
      }
    });
  };

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  return (
    <div className={`unit-converter ${theme}`}>
      <header>
        <h1>unitConverter</h1>
        <div className="controls">
          <select className="language-select" value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <div className="converter-layout">
        <div className="main-panel">
          <select className="category-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {Object.keys(conversionRates).map((cat) => (
              <option key={cat} value={cat}>{t(`categories.${cat}`)}</option>
            ))}
          </select>

          <div className="conversion-inputs">
            <div className="input-row full-width">
              <div className="input-group full-width">
                <label>From:</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter value"
                  className="full-width"
                />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
                  {Object.keys(conversionRates[category]).map((unit) => (
                    <option key={unit} value={unit}>{t(`units.${unit}`)}</option>
                  ))}
                </select>
              </div>
              <button className="swap-button" onClick={handleSwapUnits}>↔</button>
              <div className="input-group">
                <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
                  {Object.keys(conversionRates[category]).map((unit) => (
                    <option key={unit} value={unit}>{t(`units.${unit}`)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="conversion-controls">
            <div className="precision-control">
              <label htmlFor="precision">Decimal places:</label>
              <select
                id="precision"
                value={precision}
                onChange={(e) => setPrecision(parseInt(e.target.value))}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
            <button className="convert-button" onClick={handleConvert}>Convert</button>
          </div>

          <div className="result-display">
            <h3>Result:</h3>
            <p className="result">{result}</p>
          </div>
        </div>

        <div className="sidebar">
          <div className="formula-display">
            <h3>Conversion Formula</h3>
            <p>{formula}</p>
          </div>

          {favorites.length > 0 && (
            <div className="favorites">
              <h3>Favorites</h3>
              <ul>
                {favorites.map((favorite, index) => (
                  <li key={index}>
                    {favorite.from} = {favorite.to}
                    <button 
                      className="favorite-button favorited"
                      onClick={() => toggleFavorite(favorite)}
                    >
                      ★
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="recent-conversions">
            <div className="recent-conversions-header">
              <h3>Recent Conversions</h3>
              {recentConversions.length > 0 && (
                <button className="clear-button" onClick={clearRecentConversions}>
                  Clear
                </button>
              )}
            </div>
            <ul>
              {recentConversions.map((conversion, index) => (
                <li key={index}>
                  {conversion.from} = {conversion.to}
                  <button 
                    className={`favorite-button ${favorites.some(fav => 
                      fav.from === conversion.from && fav.to === conversion.to
                    ) ? 'favorited' : ''}`} 
                    onClick={() => toggleFavorite(conversion)}
                  >
                    {favorites.some(fav => 
                      fav.from === conversion.from && fav.to === conversion.to
                    ) ? '★' : '☆'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnitConverter;