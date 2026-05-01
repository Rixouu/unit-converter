import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { convertUnits, conversionRates } from '../utils/conversionUtils';
import { conversionFormulas } from '../utils/conversionFormulas';
import { ArrowDownUp, Star, Minus, Plus, Ruler, Weight, Thermometer, Droplets, Square } from 'lucide-react';
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

  const categories = Object.keys(conversionRates);

  const categoryIcon = {
    length: Ruler,
    mass: Weight,
    temperature: Thermometer,
    volume: Droplets,
    area: Square,
  };

  const decrementPrecision = () => setPrecision((p) => Math.max(0, p - 1));
  const incrementPrecision = () => setPrecision((p) => Math.min(6, p + 1));

  return (
    <main className="min-h-dvh bg-[linear-gradient(145deg,#FDF6F9_0%,#F5F0FB_50%,#EFF6FF_100%)] px-4 py-6 md:px-8 md:py-12 flex justify-center">
      <div className="w-full max-w-[980px]">
        <div className="w-full bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-[0_2px_40px_rgba(180,100,140,0.10),0_1px_8px_rgba(180,100,140,0.06)] border border-[rgba(220,190,210,0.25)]">
          <div className="px-5 pt-[max(1.25rem,env(safe-area-inset-top,0px))] pb-4 bg-white dark:bg-zinc-900 border-b border-[#F5EDF3] dark:border-zinc-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[linear-gradient(135deg,#E8608A,#C4447A)] flex items-center justify-center shrink-0 shadow-[0_10px_30px_rgba(196,68,122,0.20)]">
              <img src="/icon-unit-converter.png" alt="Unit Converter" className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-[#1E1228] dark:text-zinc-50 tracking-[-0.2px] truncate">Unit Converter</p>
              <p className="text-[11px] text-[#A890B0] dark:text-zinc-400 truncate">Premium real-time conversion</p>
            </div>
            <div className="ml-auto">
              <Select value={i18n.language} onValueChange={(v) => i18n.changeLanguage(v)}>
                <SelectTrigger className="h-8 w-auto px-3 text-xs font-medium text-[#9070A0] dark:text-zinc-200 bg-[#F8F2F6] dark:bg-zinc-800/60 border border-[#EAE0EE] dark:border-zinc-700 rounded-full shadow-none hover:bg-[#F3EBF1] dark:hover:bg-zinc-800 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#EDE0F0] rounded-2xl shadow-[0_16px_40px_rgba(180,100,140,0.12)]">
                  <SelectItem value="en" className="rounded-xl">EN</SelectItem>
                  <SelectItem value="es" className="rounded-xl">ES</SelectItem>
                  <SelectItem value="fr" className="rounded-xl">FR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="px-4 py-3 bg-[#FDFAFC] border-b border-[#F5EDF3] dark:border-zinc-800 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-2">
              {categories.map((cat) => {
                const active = cat === category;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={[
                      "shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-all",
                      active
                        ? "border-transparent text-white bg-[linear-gradient(135deg,#E8608A,#C4447A)] shadow-[0_2px_8px_rgba(196,68,122,0.28)]"
                        : "bg-[#F8F2F6] text-[#9070A0] border-[#EAE0EE] hover:bg-[#F3EBF1]",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    {t(`categories.${cat}`)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 md:p-6 pb-32 md:pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
              <div className="space-y-3">
                <div className="bg-[#FDF7FB] border border-[#F0E6EE] rounded-[20px] p-4">
                  <p className="text-[10px] font-semibold text-[#C8A0C0] tracking-[0.08em] uppercase mb-2">{t('from') || 'From'}</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="0.00"
                      className="h-12 flex-1 min-w-0 bg-white border-[1.5px] border-[#EDE0F0] rounded-[14px] px-3 text-[22px] font-mono font-medium text-[#1E1228] focus-visible:ring-2 focus-visible:ring-[#E8608A]/20"
                    />
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger className="h-12 w-auto bg-white border-[1.5px] border-[#EDE0F0] rounded-[14px] px-3 text-xs font-semibold text-[#7A4A8A] shadow-none focus:ring-2 focus:ring-[#E8608A]/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-[#EDE0F0] rounded-2xl shadow-[0_16px_40px_rgba(180,100,140,0.12)]">
                        {Object.keys(conversionRates[category]).map((unit) => (
                          <SelectItem key={unit} value={unit} className="rounded-xl text-sm">
                            {t(`units.${unit}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleSwapUnits}
                    className="h-9 w-9 rounded-full bg-white border-[1.5px] border-[#EDE0F0] shadow-[0_1px_6px_rgba(180,100,150,0.08)] flex items-center justify-center text-[#C8809A] active:scale-[0.98]"
                    aria-label={t('swap') || 'Swap'}
                  >
                    <ArrowDownUp className="h-4 w-4" />
                  </button>
                </div>

                <div className="bg-[linear-gradient(135deg,#FDF0F5_0%,#F8EEFA_100%)] border-[1.5px] border-[#F0D8EC] rounded-[20px] p-4">
                  <p className="text-[10px] font-semibold text-[#C8A0C0] tracking-[0.08em] uppercase mb-2">{t('to') || 'To'}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[28px] font-medium text-[#C4447A] tracking-[-0.5px] truncate">
                        {result || '0.00'}
                      </p>
                    </div>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger className="h-12 w-auto bg-white border-[1.5px] border-[#EDE0F0] rounded-[14px] px-3 text-xs font-semibold text-[#7A4A8A] shadow-none focus:ring-2 focus:ring-[#E8608A]/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-[#EDE0F0] rounded-2xl shadow-[0_16px_40px_rgba(180,100,140,0.12)]">
                        {Object.keys(conversionRates[category]).map((unit) => (
                          <SelectItem key={unit} value={unit} className="rounded-xl text-sm">
                            {t(`units.${unit}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleConvert}
                  className="w-full h-12 rounded-[18px] text-base font-semibold text-white bg-[linear-gradient(135deg,#E8608A,#C4447A)] hover:opacity-95 shadow-[0_10px_30px_rgba(196,68,122,0.22)]"
                >
                  {t('convert') || 'Convert'}
                </Button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <div className="bg-[#F8F5FB] border border-[#EDE4F4] rounded-[14px] p-3">
                    <p className="text-[10px] font-semibold text-[#C8A0C0] tracking-[0.08em] uppercase mb-1">{t('formula') || 'Formula'}</p>
                    <p className="font-mono text-[11.5px] text-[#9070A0] break-words">{formula}</p>
                  </div>
                  <div className="bg-[#F8F5FB] border border-[#EDE4F4] rounded-[14px] p-3">
                    <p className="text-[10px] font-semibold text-[#C8A0C0] tracking-[0.08em] uppercase mb-1">{t('precision') || 'Precision'}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={decrementPrecision}
                        className="h-6 w-6 rounded-full bg-white border border-[#E0D0E8] text-[#A070B0] flex items-center justify-center active:scale-[0.98]"
                        aria-label={t('decrease') || 'Decrease'}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-mono text-[15px] font-medium text-[#6A4080] min-w-4 text-center">
                        {precision}
                      </span>
                      <button
                        type="button"
                        onClick={incrementPrecision}
                        className="h-6 w-6 rounded-full bg-white border border-[#E0D0E8] text-[#A070B0] flex items-center justify-center active:scale-[0.98]"
                        aria-label={t('increase') || 'Increase'}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-[#C8A0C0] tracking-[0.08em] uppercase">{t('history') || 'History'}</p>
                  {recentConversions.length > 0 && (
                    <button onClick={clearRecentConversions} className="text-[11px] font-medium text-[#E06090] hover:opacity-80">
                      {t('clear') || 'clear'}
                    </button>
                  )}
                </div>

                <div className="bg-[#FDF7FB] border border-[#F0E6EE] rounded-[16px] px-4 py-3">
                  {recentConversions.length > 0 ? (
                    <div className="divide-y divide-[#F5ECF4]">
                      {recentConversions.map((conv, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-sm text-[#B090C0] truncate">{conv.from}</span>
                            <span className="mx-2 text-xs text-[#DCBAD0]">→</span>
                            <span className="font-mono text-sm font-medium text-[#C4447A] truncate">{conv.to}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleFavorite(conv)}
                            className="shrink-0 text-[#C0A8CC] hover:text-[#C4447A] transition-colors"
                            aria-label={t('favorite') || 'Favorite'}
                          >
                            <Star className={`h-4 w-4 ${favorites.some(f => f.from === conv.from && f.to === conv.to) ? 'fill-[#C4447A] text-[#C4447A]' : ''}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#B090C0]">{t('noHistory') || 'No history'}</p>
                  )}
                </div>

                {favorites.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] font-semibold text-[#C8A0C0] tracking-[0.08em] uppercase mb-2">{t('favorites') || 'Favorites'}</p>
                    <div className="bg-[#FDF7FB] border border-[#F0E6EE] rounded-[16px] px-4 py-3 space-y-2">
                      {favorites.map((fav, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3">
                          <span className="text-sm text-[#B090C0] truncate">{fav.from} → <span className="font-mono text-[#C4447A]">{fav.to}</span></span>
                          <button onClick={() => toggleFavorite(fav)} className="shrink-0 text-[#C4447A] hover:opacity-80" aria-label={t('remove') || 'Remove'}>
                            <Star className="h-4 w-4 fill-current" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 bg-[#FDFAFC]/90 backdrop-blur border-t border-[#F5EDF3] md:hidden pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto max-w-[980px] px-3 pt-2">
          <div className="grid grid-cols-5 gap-1">
            {categories.map((cat) => {
              const active = cat === category;
              const Icon = categoryIcon[cat] ?? Square;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className="flex flex-col items-center justify-center gap-1 py-2"
                  aria-current={active ? "page" : undefined}
                >
                  <span className={active ? "h-6 w-9 rounded-[10px] bg-[#FDE8F1] flex items-center justify-center" : "h-6 w-9 flex items-center justify-center"}>
                    <Icon className={active ? "h-[18px] w-[18px] text-[#C4447A]" : "h-[18px] w-[18px] text-[#C0A8CC]"} />
                  </span>
                  <span className={active ? "text-[10px] font-semibold text-[#C4447A]" : "text-[10px] font-medium text-[#C0A8CC]"}>
                    {t(`categories.${cat}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <PwaInstallBanner />
    </main>
  );
}

export default UnitConverter;
