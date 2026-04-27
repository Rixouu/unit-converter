import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { convertUnits, conversionRates } from '../utils/conversionUtils';
import { conversionFormulas } from '../utils/conversionFormulas';
import { ArrowLeftRight, Star, RotateCcw, Globe, Hash } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PwaInstallBanner } from './PWAInstallBanner';

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

  const formatResult = (val) => {
    const numValue = parseFloat(val);
    if (isNaN(numValue)) return '';
    if (Math.abs(numValue) >= 1e9 || Math.abs(numValue) < 1e-9) {
      return numValue.toExponential(precision);
    }
    return parseFloat(numValue.toFixed(precision)).toString();
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
    const prevFrom = fromUnit;
    setFromUnit(toUnit);
    setToUnit(prevFrom);
    if (result) {
        setValue(result);
        setResult('');
    }
  };

  const toggleFavorite = (conversion) => {
    setFavorites(prevFavorites => {
      const existingIndex = prevFavorites.findIndex(fav => 
        fav.from === conversion.from && fav.to === conversion.to
      );
      if (existingIndex >= 0) {
        return prevFavorites.filter((_, index) => index !== existingIndex);
      } else {
        return [...prevFavorites, conversion];
      }
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-12 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 p-8 md:p-12 relative overflow-hidden">
        
        {/* Language Selector */}
        <div className="absolute top-8 right-8">
          <Select value={i18n.language} onValueChange={(v) => i18n.changeLanguage(v)}>
            <SelectTrigger className="w-[100px] h-8 text-[11px] font-semibold uppercase tracking-wider bg-zinc-50 border-none hover:bg-zinc-100 transition-colors rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="es">ES</SelectItem>
              <SelectItem value="fr">FR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="w-20 h-20 bg-[#E91E63] rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-[#E91E63]/20">
            <img src="/icon-unit-converter.png" alt="Unit Converter" className="w-12 h-12 brightness-0 invert" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">Unit Converter</h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">Premium real-time conversion for professional workflows.</p>
        </div>

        {/* Category Selector */}
        <div className="mb-8">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full h-12 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-2xl text-lg font-medium hover:bg-zinc-100 transition-colors">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(conversionRates).map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize py-3">
                  {t(`categories.${cat}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conversion Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">{t('from') || 'From'}</label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={value} 
                  onChange={(e) => setValue(e.target.value)} 
                  placeholder="0.00"
                  className="h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-2xl text-xl font-semibold px-4 focus-visible:ring-2 focus-visible:ring-[#E91E63]/20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Select value={fromUnit} onValueChange={setFromUnit}>
                    <SelectTrigger className="w-auto h-8 bg-white dark:bg-zinc-900 border-none shadow-sm rounded-lg text-xs font-bold px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(conversionRates[category]).map((unit) => (
                        <SelectItem key={unit} value={unit} className="text-xs">
                          {t(`units.${unit}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-center pb-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSwapUnits} 
                className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-[#E91E63] hover:bg-[#E91E63]/5 transition-all"
              >
                <ArrowLeftRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">{t('to') || 'To'}</label>
              <div className="relative">
                <Input 
                  type="text" 
                  value={result} 
                  readOnly 
                  placeholder="0.00" 
                  className="h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-2xl text-xl font-semibold px-4"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Select value={toUnit} onValueChange={setToUnit}>
                    <SelectTrigger className="w-auto h-8 bg-white dark:bg-zinc-900 border-none shadow-sm rounded-lg text-xs font-bold px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(conversionRates[category]).map((unit) => (
                        <SelectItem key={unit} value={unit} className="text-xs">
                          {t(`units.${unit}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
            <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl px-4 h-12">
              <Hash size={16} className="text-zinc-400" />
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('precision') || 'Precision'}</label>
              <Select value={precision.toString()} onValueChange={(v) => setPrecision(parseInt(v))}>
                <SelectTrigger className="w-12 h-8 bg-transparent border-none font-bold text-zinc-700 dark:text-zinc-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6].map((v) => (
                    <SelectItem key={v} value={v.toString()}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleConvert} 
              className="flex-1 h-12 bg-[#E91E63] hover:bg-[#E91E63]/90 text-white rounded-2xl text-lg font-bold shadow-lg shadow-[#E91E63]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('convert') || 'Convert'}
            </Button>
          </div>
        </div>

        {/* Footer Grid: Formula, History, Favorites */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">{t('formula') || 'Formula'}</h4>
            <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 leading-relaxed bg-white dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100/50 dark:border-zinc-800">
              {formula}
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('history') || 'History'}</h4>
              {recentConversions.length > 0 && (
                <button onClick={clearRecentConversions} className="text-[10px] font-bold text-[#E91E63] uppercase tracking-wider hover:opacity-80 transition-opacity">
                  {t('clear') || 'Clear'}
                </button>
              )}
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[120px] pr-1">
              {recentConversions.length > 0 ? (
                recentConversions.map((conv, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100/50 dark:border-zinc-800 group">
                    <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 truncate pr-2">{conv.from} = {conv.to}</span>
                    <button 
                      onClick={() => toggleFavorite(conv)}
                      className="text-zinc-300 hover:text-yellow-400 transition-colors"
                    >
                      <Star className={`h-3.5 w-3.5 ${favorites.some(f => f.from === conv.from && f.to === conv.to) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-zinc-400 text-center py-4">{t('noHistory') || 'No history'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Favorites Section (Optional: only if exists) */}
        {favorites.length > 0 && (
          <div className="mt-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">{t('favorites') || 'Favorites'}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favorites.map((fav, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100/50 dark:border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 truncate">{fav.from} = {fav.to}</span>
                  <button onClick={() => toggleFavorite(fav)} className="text-yellow-400 hover:text-zinc-300 transition-colors">
                    <Star className="h-3.5 w-3.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      
      <PwaInstallBanner />
    </main>
  );
}

export default UnitConverter;