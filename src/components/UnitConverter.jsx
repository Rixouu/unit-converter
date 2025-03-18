import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { convertUnits, conversionRates } from '../utils/conversionUtils';
import { conversionFormulas } from '../utils/conversionFormulas';
import { ArrowLeftRight, Star, RotateCcw, Globe } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

function UnitConverter() {
  const { t, i18n } = useTranslation();
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

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

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

  return (
    <>
      <div className="w-full bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-5xl py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-medium tracking-tight">
              <span className="font-bold">unit</span>converter
            </h1>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-gray-500" />
              <Select value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
                <SelectTrigger className="w-[110px] h-9 text-sm bg-transparent border-gray-200 hover:bg-gray-50">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-gray-200 shadow-none">
              <CardHeader className="border-b px-6 py-4">
                <CardTitle className="text-base font-medium">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full h-10 bg-transparent border-gray-200 hover:bg-gray-50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(conversionRates).map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {t(`categories.${cat}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">From</label>
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                    <div className="lg:col-span-3">
                      <Input 
                        type="number" 
                        value={value} 
                        onChange={(e) => setValue(e.target.value)} 
                        placeholder="Enter value"
                        className="h-10 bg-transparent border-gray-200"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <Select value={fromUnit} onValueChange={setFromUnit}>
                        <SelectTrigger className="w-full h-10 bg-transparent border-gray-200 hover:bg-gray-50">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(conversionRates[category]).map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {t(`units.${unit}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleSwapUnits} 
                    className="h-8 w-8 rounded-full border-gray-200 hover:bg-gray-50 hover:text-black"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">To</label>
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                    <div className="lg:col-span-3">
                      <Input 
                        type="text" 
                        value={result} 
                        readOnly 
                        placeholder="Result" 
                        className="h-10 bg-transparent border-gray-200"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <Select value={toUnit} onValueChange={setToUnit}>
                        <SelectTrigger className="w-full h-10 bg-transparent border-gray-200 hover:bg-gray-50">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(conversionRates[category]).map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {t(`units.${unit}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col md:flex-row md:justify-between gap-4 p-6 border-t">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Precision</label>
                  <Select value={precision.toString()} onValueChange={(value) => setPrecision(parseInt(value))}>
                    <SelectTrigger className="w-[70px] h-9 bg-transparent border-gray-200 hover:bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6].map((value) => (
                        <SelectItem key={value} value={value.toString()}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleConvert} 
                  className="w-full md:w-auto md:px-6 h-9 bg-black hover:bg-black/90 text-white"
                >
                  Convert
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-gray-200 shadow-none">
              <CardHeader className="border-b px-5 py-3">
                <CardTitle className="text-sm font-medium">Formula</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-xs text-gray-700 font-mono bg-gray-50 p-3 rounded-sm">
                  {formula}
                </p>
              </CardContent>
            </Card>

            {favorites.length > 0 && (
              <Card className="border-gray-200 shadow-none">
                <CardHeader className="border-b px-5 py-3">
                  <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="divide-y divide-gray-100">
                    {favorites.map((favorite, index) => (
                      <li key={index} className="flex justify-between items-center py-2 first:pt-0 last:pb-0">
                        <span className="text-xs text-gray-700">{favorite.from} = {favorite.to}</span>
                        <Button variant="ghost" size="icon" onClick={() => toggleFavorite(favorite)} className="h-7 w-7 hover:bg-gray-50">
                          <Star className="h-3.5 w-3.5 fill-current text-gray-800" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card className="border-gray-200 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-3">
                <CardTitle className="text-sm font-medium">History</CardTitle>
                {recentConversions.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearRecentConversions} className="h-7 px-2 text-xs hover:bg-gray-50">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-4">
                {recentConversions.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {recentConversions.map((conversion, index) => (
                      <li key={index} className="flex justify-between items-center py-2 first:pt-0 last:pb-0">
                        <span className="text-xs text-gray-700">{conversion.from} = {conversion.to}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleFavorite(conversion)}
                          className="h-7 w-7 hover:bg-gray-50"
                        >
                          <Star className={`h-3.5 w-3.5 ${favorites.some(fav => 
                            fav.from === conversion.from && fav.to === conversion.to
                          ) ? 'fill-current text-gray-800' : 'text-gray-400'}`} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 text-center py-2">No conversion history</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export default UnitConverter;