import { useState } from 'react';
import { healthPlan } from '../data/healthPlan';
import { MEAL_TYPES, MEAL_PRESETS, RECIPE_SUGGESTIONS } from '../constants';
import { toLocalDateStr, toLocalTimeStr } from '../utils/dateUtils';

export default function Nutrition({ data, addMeal, deleteMeal, addShoppingItem, toggleShoppingItem, deleteShoppingItem, clearCheckedItems, saveFastingEntry, saveFastingSettings, saveFiberEntry, ...rest }) {
  const [selectedDate, setSelectedDate] = useState(toLocalDateStr());
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealForm, setMealForm] = useState({ type: 'lunch', description: '', notes: '' });
  const [activeTab, setActiveTab] = useState('log'); // 'log' | 'presets' | 'recipes' | 'shopping' | 'guide'
  const [shoppingInput, setShoppingInput] = useState('');
  const [shoppingQty, setShoppingQty] = useState('');
  const [shoppingCategory, setShoppingCategory] = useState('produce');
  const [expandedRecipe, setExpandedRecipe] = useState(null);

  const [editingFastSettings, setEditingFastSettings] = useState(false);
  const [fastSettingsForm, setFastSettingsForm] = useState(null);

  const meals = data?.mealLog?.[selectedDate] || [];
  const shoppingList = data?.shoppingList || [];
  const diet = healthPlan.mediterraneanDiet;
  const fastingSettings = data?.fastingSettings || { targetFastHours: 16, feedingWindowHours: 8, typicalFastStart: '20:00', typicalFeedingStart: '12:00' };

  // Nutrition targets from healthPlan
  const targets = healthPlan?.nutritionTargets || { protein: 120, fiber: 30, plants: 5, water: 80 };

  const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Calculate nutrition metrics for a given date
  const calculateNutritionMetrics = (dateStr) => {
    const dateMeals = data?.mealLog?.[dateStr] || [];
    const dailyChecklist = data?.dailyChecklist?.[dateStr] || {};
    const fiberLog = data?.fiberLog?.[dateStr] || {};

    // Protein: count meals with 'protein' tag or description. Each ~30g. Full score if >= 4
    const proteinMeals = dateMeals.filter(m =>
      m.description?.toLowerCase().includes('protein') ||
      m.notes?.toLowerCase().includes('protein') ||
      (m.tags && m.tags.some(t => t.toLowerCase().includes('protein')))
    ).length;
    const proteinEstimate = Math.min(120, proteinMeals * 30);
    const proteinScore = Math.min(25, (proteinMeals >= 4 ? 25 : (proteinMeals / 4) * 25));

    // Fiber: morning + evening fiber supplement = 10 pts, each fiber food = 3 pts, cap at 25
    const fiberSupplements = (fiberLog.morning ? 1 : 0) + (fiberLog.evening ? 1 : 0);
    const fiberFoods = dateMeals.filter(m =>
      m.description?.toLowerCase().includes('fiber') ||
      m.notes?.toLowerCase().includes('fiber') ||
      (m.tags && m.tags.some(t => t.toLowerCase().includes('fiber')))
    ).length;
    const fiberEstimate = (fiberSupplements * 10) + (fiberFoods * 3);
    const fiberScore = Math.min(25, fiberEstimate > 0 ? Math.min(25, (fiberEstimate / 30) * 25) : 0);

    // Plants: count meals with vegetables/salads/fruits. Each = 1 serving. Scale to 20 pts
    const plantServings = dateMeals.filter(m =>
      m.description?.toLowerCase().includes('vegetable') ||
      m.description?.toLowerCase().includes('salad') ||
      m.description?.toLowerCase().includes('fruit') ||
      m.description?.toLowerCase().includes('berry') ||
      (m.tags && m.tags.some(t =>
        t.toLowerCase().includes('vegetable') ||
        t.toLowerCase().includes('salad') ||
        t.toLowerCase().includes('fruit')
      ))
    ).length;
    const plantsScore = Math.min(20, (plantServings / 5) * 20);

    // No alcohol: check dailyChecklist
    const noAlcoholScore = dailyChecklist['no-alcohol'] ? 15 : 0;

    // Low sugar: check dailyChecklist
    const lowSugarScore = dailyChecklist['no-sweets'] ? 15 : 0;

    const totalScore = Math.round(proteinScore + fiberScore + plantsScore + noAlcoholScore + lowSugarScore);

    return {
      score: totalScore,
      proteinEstimate,
      proteinScore,
      fiberEstimate: Math.min(30, fiberEstimate),
      fiberScore,
      plantServings,
      plantsScore,
      noAlcoholScore,
      lowSugarScore,
    };
  };

  const metrics = calculateNutritionMetrics(selectedDate);

  const submitMeal = (e) => {
    e.preventDefault();
    if (!mealForm.description) return;
    addMeal(selectedDate, { ...mealForm, time: toLocalTimeStr() });
    setMealForm({ type: 'lunch', description: '', notes: '' });
    setShowMealModal(false);
  };

  const quickAddPreset = (preset) => {
    addMeal(selectedDate, {
      type: preset.type,
      description: preset.label,
      notes: preset.description,
      time: toLocalTimeStr(),
    });
  };

  const addRecipeIngredients = (recipe) => {
    recipe.ingredients.forEach(item => {
      // Don't add duplicates
      if (!shoppingList.some(s => s.item.toLowerCase() === item.toLowerCase())) {
        addShoppingItem({ item, category: 'recipe' });
      }
    });
  };

  const submitShoppingItem = (e) => {
    e.preventDefault();
    if (!shoppingInput.trim()) return;
    addShoppingItem({ item: shoppingInput.trim(), category: shoppingCategory, qty: shoppingQty.trim() || null });
    setShoppingInput(''); setShoppingQty('');
  };

  // Navigate dates
  const changeDate = (offset) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + offset);
    setSelectedDate(toLocalDateStr(d));
  };

  const isToday = selectedDate === toLocalDateStr();

  // Group meals by type
  const groupedMeals = MEAL_TYPES.map(mt => ({
    ...mt,
    items: meals.filter(m => m.type === mt.id),
  }));

  const SHOPPING_CATEGORIES = [
    { id: 'produce', label: 'Produce', emoji: '🥬' },
    { id: 'protein', label: 'Protein', emoji: '🥩' },
    { id: 'dairy', label: 'Dairy', emoji: '🧀' },
    { id: 'grains', label: 'Grains', emoji: '🌾' },
    { id: 'pantry', label: 'Pantry', emoji: '🫒' },
    { id: 'recipe', label: 'From Recipe', emoji: '📝' },
    { id: 'other', label: 'Other', emoji: '🛒' },
  ];

  const checkedCount = shoppingList.filter(i => i.checked).length;

  const tabs = [
    { id: 'log', label: 'Food Log' },
    { id: 'fasting', label: 'Fasting' },
    { id: 'presets', label: 'Quick Add' },
    { id: 'recipes', label: 'Recipes' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'guide', label: 'Diet Guide' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-white">🥗 Nutrition</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap px-2 ${
              activeTab === tab.id ? 'bg-slate-600 text-blue-400 shadow-sm' : 'text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======== FOOD LOG TAB ======== */}
      {activeTab === 'log' && (
        <>
          {/* Nutrition Score Banner */}
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-800/50 rounded-xl p-6 text-center">
            <div className="mb-2 text-xs text-slate-400 uppercase tracking-wide">Nutrition Score</div>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-3">
              {metrics.score}
            </div>
            <div className="text-sm text-slate-300 mb-4">/ 100</div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all ${
                  metrics.score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  metrics.score >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                  metrics.score >= 40 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                  'bg-gradient-to-r from-red-500 to-orange-500'
                }`}
                style={{ width: `${(metrics.score / 100) * 100}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 mt-2">
              {metrics.score >= 80 ? '🎉 Excellent nutrition day!' :
              metrics.score >= 60 ? '👍 Good progress!' :
              metrics.score >= 40 ? '⚠️ Room for improvement' :
              '💪 Keep working on it'}
            </div>
          </div>

          {/* Daily Targets Display */}
          <div className="space-y-2">
            {/* Protein */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-300">🥩 Protein</span>
                <span className="text-xs font-medium text-blue-400">{metrics.proteinEstimate} / {targets.protein}g</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(100, (metrics.proteinEstimate / targets.protein) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fiber */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-300">🌾 Fiber</span>
                <span className="text-xs font-medium text-emerald-400">{Math.round(metrics.fiberEstimate)} / {targets.fiber}g</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min(100, (metrics.fiberEstimate / targets.fiber) * 100)}%` }}
                />
              </div>
            </div>

            {/* Plants / Servings */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-300">🥬 Plants</span>
                <span className="text-xs font-medium text-green-400">{metrics.plantServings} / {targets.plants} servings</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all"
                  style={{ width: `${Math.min(100, (metrics.plantServings / targets.plants) * 100)}%` }}
                />
              </div>
            </div>

            {/* Water reminder */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">💧 Water</span>
                <span className="text-xs font-medium text-cyan-400">{targets.water} oz target</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Aim for 8-10 glasses throughout the day</div>
            </div>
          </div>

          {/* Date navigator */}
          <div className="flex items-center justify-between">
            <button onClick={() => changeDate(-1)} className="p-2 text-slate-400 hover:text-slate-200">← Prev</button>
            <div className="text-sm font-medium text-slate-300">
              {formatDate(selectedDate)} {isToday && <span className="text-blue-400">(today)</span>}
            </div>
            <button onClick={() => changeDate(1)} className="p-2 text-slate-400 hover:text-slate-200">Next →</button>
          </div>

          {/* Add meal button */}
          <button onClick={() => setShowMealModal(true)}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-green-500 transition-colors">
            + Log Meal
          </button>

          {/* Meals grouped by type */}
          {meals.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
              <div className="text-4xl mb-2">🍽️</div>
              <p className="text-slate-400">No meals logged for this day.</p>
              <p className="text-xs text-slate-500 mt-1">Tap the button above or use Quick Add for common meals.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {groupedMeals.filter(g => g.items.length > 0).map(group => (
                <div key={group.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">{group.emoji} {group.label}</h3>
                  <div className="space-y-2">
                    {group.items.map(meal => (
                      <div key={meal.id} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white">{meal.description}</div>
                          <div className="text-xs text-slate-400">{meal.time}</div>
                          {meal.notes && <div className="text-xs text-slate-500 mt-1">{meal.notes}</div>}
                        </div>
                        <button onClick={() => deleteMeal(selectedDate, meal.id)} className="text-slate-600 hover:text-red-400 text-xs p-1">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Daily summary */}
          {meals.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
              <div className="text-sm text-slate-300">{meals.length} meal{meals.length !== 1 ? 's' : ''} logged</div>
            </div>
          )}

          {/* Mediterranean diet quick tips */}
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-800/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-green-300 mb-2">🫒 Mediterranean Diet Tip</h3>
            <p className="text-xs text-green-200/80">
              Aim for a plate that's half vegetables, a quarter lean protein (fish, chicken, legumes), and a quarter whole grains. Use olive oil as your primary fat.
            </p>
          </div>
        </>
      )}

      {/* ======== FASTING TAB ======== */}
      {activeTab === 'fasting' && (
        <div className="space-y-4">
          {/* Today's fast status */}
          {(() => {
            const todayStr = toLocalDateStr();
            const todayFast = data?.fastingLog?.[todayStr] || {};
            const now = new Date();
            let fastHours = 0, fastMins = 0;
            if (todayFast.fastStart) {
              const end = todayFast.fastEnd ? new Date(todayFast.fastEnd) : now;
              const start = new Date(todayFast.fastStart);
              const diff = (end - start) / 1000 / 60;
              fastHours = Math.floor(diff / 60);
              fastMins = Math.floor(diff % 60);
            }
            const pct = Math.min(1, (fastHours + fastMins / 60) / fastingSettings.targetFastHours);
            const metGoal = (fastHours + fastMins / 60) >= fastingSettings.targetFastHours;
            const fastActive = todayFast.fastStart && !todayFast.fastEnd;

            return (
              <>
                <div className={`p-4 rounded-xl ${
                  fastActive ? 'bg-amber-900/30 border border-amber-700' :
                  metGoal ? 'bg-green-900/30 border border-green-700' :
                  'bg-slate-800 border border-slate-700'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{fastActive ? '🔥' : metGoal ? '✅' : '🍽️'}</div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-white">
                        {fastActive ? 'Currently Fasting' : metGoal ? 'Fast Complete!' : todayFast.fastEnd ? 'Feeding Window' : 'No fast today'}
                      </div>
                      {todayFast.fastStart && (
                        <div className="text-sm text-slate-400">
                          {fastHours}h {fastMins}m {fastActive ? 'fasted so far' : 'total'} / {fastingSettings.targetFastHours}h target
                        </div>
                      )}
                    </div>
                  </div>

                  {todayFast.fastStart && (
                    <div className="mb-3">
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div className={`rounded-full h-3 transition-all ${metGoal ? 'bg-green-500' : 'bg-amber-500'}`}
                          style={{ width: `${pct * 100}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Started: {new Date(todayFast.fastStart).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        {todayFast.fastEnd && <span>Ended: {new Date(todayFast.fastEnd).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!todayFast.fastStart ? (
                      <button onClick={() => saveFastingEntry(todayStr, { fastStart: new Date().toISOString() })}
                        className="flex-1 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-500">
                        Start Fast
                      </button>
                    ) : fastActive ? (
                      <button onClick={() => saveFastingEntry(todayStr, { fastEnd: new Date().toISOString() })}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500">
                        End Fast
                      </button>
                    ) : (
                      <button onClick={() => saveFastingEntry(todayStr, { fastStart: null, fastEnd: null })}
                        className="flex-1 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-500">
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Recent fasting log */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                  <h3 className="font-semibold text-white mb-3">Recent Fasts</h3>
                  {(() => {
                    const log = data?.fastingLog || {};
                    const entries = Object.entries(log)
                      .filter(([_, v]) => v.fastStart && v.fastEnd)
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .slice(0, 7);
                    if (entries.length === 0) return <p className="text-sm text-slate-500">No completed fasts yet.</p>;
                    return (
                      <div className="space-y-2">
                        {entries.map(([date, entry]) => {
                          const dur = (new Date(entry.fastEnd) - new Date(entry.fastStart)) / 1000 / 60 / 60;
                          const hit = dur >= fastingSettings.targetFastHours;
                          return (
                            <div key={date} className="flex items-center gap-3 p-2 bg-slate-700/50 rounded-lg">
                              <span className="text-sm">{hit ? '✅' : '⚠️'}</span>
                              <span className="text-sm text-slate-300 flex-1">
                                {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                              <span className={`text-sm font-medium ${hit ? 'text-green-400' : 'text-amber-400'}`}>
                                {dur.toFixed(1)}h
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </>
            );
          })()}

          {/* Fasting settings */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Settings</h3>
              <button onClick={() => { setFastSettingsForm({...fastingSettings}); setEditingFastSettings(true); }}
                className="text-xs text-blue-400 hover:underline">Edit</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <div className="text-lg font-bold text-amber-400">{fastingSettings.targetFastHours}h</div>
                <div className="text-xs text-slate-400">Fast duration</div>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <div className="text-lg font-bold text-green-400">{fastingSettings.feedingWindowHours}h</div>
                <div className="text-xs text-slate-400">Feeding window</div>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <div className="text-sm font-medium text-slate-300">{fastingSettings.typicalFeedingStart}</div>
                <div className="text-xs text-slate-400">First meal</div>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <div className="text-sm font-medium text-slate-300">{fastingSettings.typicalFastStart}</div>
                <div className="text-xs text-slate-400">Last meal</div>
              </div>
            </div>
          </div>

          {/* IF info */}
          <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-800/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-amber-300 mb-2">About {fastingSettings.targetFastHours}:{fastingSettings.feedingWindowHours} Intermittent Fasting</h3>
            <p className="text-xs text-amber-200/80">
              Fast for {fastingSettings.targetFastHours} hours, eat within a {fastingSettings.feedingWindowHours}-hour window. Benefits include improved insulin sensitivity, reduced inflammation, and better body composition. Pair with your Mediterranean diet for optimal results.
            </p>
          </div>
        </div>
      )}

      {/* Fasting Settings Modal */}
      {editingFastSettings && fastSettingsForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingFastSettings(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Fasting Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Fast Duration (hours)</label>
                <input type="number" value={fastSettingsForm.targetFastHours}
                  onChange={e => setFastSettingsForm(f => ({ ...f, targetFastHours: Number(e.target.value), feedingWindowHours: 24 - Number(e.target.value) }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white mt-1" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Typical First Meal (feeding start)</label>
                <input type="time" value={fastSettingsForm.typicalFeedingStart}
                  onChange={e => setFastSettingsForm(f => ({ ...f, typicalFeedingStart: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white mt-1" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Typical Last Meal (fast start)</label>
                <input type="time" value={fastSettingsForm.typicalFastStart}
                  onChange={e => setFastSettingsForm(f => ({ ...f, typicalFastStart: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white mt-1" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditingFastSettings(false)} className="flex-1 py-2 border border-slate-600 rounded-lg text-sm text-slate-300">Cancel</button>
              <button onClick={() => { saveFastingSettings(fastSettingsForm); setEditingFastSettings(false); }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ======== QUICK ADD / PRESETS TAB ======== */}
      {activeTab === 'presets' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-800/50 rounded-xl p-4">
            <p className="text-sm text-green-300">Tap a meal to quickly log it for today. These are based on your usual eating patterns.</p>
          </div>

          {/* Group presets by meal type */}
          {MEAL_TYPES.map(mt => {
            const presets = MEAL_PRESETS.filter(p => p.type === mt.id);
            if (presets.length === 0) return null;
            return (
              <div key={mt.id} className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-300">{mt.emoji} {mt.label}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {presets.map(preset => (
                    <button key={preset.id} onClick={() => quickAddPreset(preset)}
                      className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all text-left">
                      <span className="text-2xl">{preset.emoji}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{preset.label}</div>
                        <div className="text-xs text-slate-400">{preset.description}</div>
                        <div className="flex gap-1 mt-1">
                          {preset.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-green-400 text-lg">+</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Your patterns note */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">📝 Your Patterns</h3>
            <div className="space-y-1 text-xs text-slate-400">
              <p>• You usually skip breakfast</p>
              <p>• Lunch is typically Oatmeal & Fruit or Yogurt & Fruit</p>
              <p>• Dinner is often a salad, but sometimes eating out</p>
              <p>• Snack on nuts or fruit between meals</p>
            </div>
          </div>
        </div>
      )}

      {/* ======== RECIPES TAB ======== */}
      {activeTab === 'recipes' && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-800/50 rounded-xl p-4">
            <p className="text-sm text-green-300">Mediterranean diet recipes for healthy, anti-inflammatory meals. Tap to see details and add ingredients to your shopping list.</p>
          </div>

          {RECIPE_SUGGESTIONS.map(recipe => (
            <div key={recipe.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <button onClick={() => setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id)}
                className="w-full p-4 flex items-center gap-3 text-left">
                <span className="text-2xl">{recipe.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium text-white">{recipe.name}</div>
                  <div className="text-xs text-slate-400">⏱ {recipe.time}</div>
                  <div className="flex gap-1 mt-1">
                    {recipe.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-blue-900/40 text-blue-400 px-1.5 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <span className="text-slate-500 text-xs">{expandedRecipe === recipe.id ? '▲' : '▼'}</span>
              </button>
              {expandedRecipe === recipe.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-700 pt-3">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Ingredients</h4>
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients.map(ing => (
                        <span key={ing} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{ing}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Steps</h4>
                    <p className="text-sm text-slate-300">{recipe.steps}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => addRecipeIngredients(recipe)}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500">
                      🛒 Add to Shopping List
                    </button>
                    <button onClick={() => {
                      addMeal(selectedDate, {
                        type: 'dinner',
                        description: recipe.name,
                        notes: `Homemade - ${recipe.tags.join(', ')}`,
                        time: toLocalTimeStr(),
                      });
                    }}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500">
                      ✓ Log as Meal
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ======== SHOPPING LIST TAB ======== */}
      {activeTab === 'shopping' && (
        <div className="space-y-4">
          {/* Add item form */}
          <form onSubmit={submitShoppingItem} className="space-y-2">
            <div className="flex gap-2">
              <input type="text" placeholder="Add item..." value={shoppingInput}
                onChange={e => setShoppingInput(e.target.value)}
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <input type="text" placeholder="Qty" value={shoppingQty || ''}
                onChange={e => setShoppingQty(e.target.value)}
                className="w-16 bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400 text-center" />
              <select value={shoppingCategory} onChange={e => setShoppingCategory(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white w-28">
                {SHOPPING_CATEGORIES.filter(c => c.id !== 'recipe').map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
              <button type="submit" className="bg-green-600 text-white px-4 rounded-lg text-sm font-medium">+</button>
            </div>
          </form>

          {/* Quick add from Mediterranean staples */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">🫒 Mediterranean Staples</h3>
            <div className="flex flex-wrap gap-1">
              {['Olive oil', 'Salmon', 'Chicken breast', 'Mixed greens', 'Tomatoes', 'Cucumber', 'Greek yogurt', 'Oatmeal', 'Berries', 'Almonds', 'Lemon', 'Garlic', 'Quinoa', 'Chickpeas', 'Feta cheese'].map(item => (
                <button key={item} onClick={() => {
                  if (!shoppingList.some(s => s.item.toLowerCase() === item.toLowerCase())) {
                    addShoppingItem({ item, category: 'pantry' });
                  }
                }}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    shoppingList.some(s => s.item.toLowerCase() === item.toLowerCase())
                      ? 'bg-green-900/40 text-green-400'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}>
                  {shoppingList.some(s => s.item.toLowerCase() === item.toLowerCase()) ? '✓ ' : '+ '}{item}
                </button>
              ))}
            </div>
          </div>

          {/* Shopping list */}
          {shoppingList.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
              <div className="text-4xl mb-2">🛒</div>
              <p className="text-slate-400">Shopping list is empty.</p>
              <p className="text-xs text-slate-500 mt-1">Add items above or from recipes.</p>
            </div>
          ) : (
            <>
              {/* Group by category */}
              {SHOPPING_CATEGORIES.map(cat => {
                const items = shoppingList.filter(i => i.category === cat.id);
                if (items.length === 0) return null;
                return (
                  <div key={cat.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">{cat.emoji} {cat.label}</h3>
                    <div className="space-y-1">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50">
                          <button onClick={() => toggleShoppingItem(item.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              item.checked ? 'border-green-500 bg-green-500' : 'border-slate-500'
                            }`}>
                            {item.checked && <span className="text-white text-[10px]">✓</span>}
                          </button>
                          <span className={`text-sm flex-1 ${item.checked ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                            {item.item}{item.qty && <span className="text-xs text-slate-500 ml-1">({item.qty})</span>}
                          </span>
                          <button onClick={() => deleteShoppingItem(item.id)} className="text-slate-600 hover:text-red-400 text-xs p-1">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Clear checked */}
              {checkedCount > 0 && (
                <button onClick={clearCheckedItems}
                  className="w-full py-2 border border-slate-600 rounded-lg text-sm text-slate-400 hover:text-red-400 transition-colors">
                  Clear {checkedCount} checked item{checkedCount !== 1 ? 's' : ''}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* ======== DIET GUIDE TAB ======== */}
      {activeTab === 'guide' && (
        <div className="space-y-4">
          {/* Overview */}
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-800/50 rounded-xl p-5">
            <h2 className="font-semibold text-white mb-2">🫒 Mediterranean Diet</h2>
            <p className="text-sm text-slate-300">{diet.description}</p>
          </div>

          {/* Daily targets */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-3">Daily Focus</h3>
            <div className="space-y-2">
              {diet.dailyFocus.map(item => (
                <div key={item.category} className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-white">{item.emoji} {item.category}</span>
                    <span className="text-xs text-green-400 bg-green-900/40 px-2 py-0.5 rounded-full">{item.target}</span>
                  </div>
                  <div className="text-xs text-slate-400">{item.examples}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly targets */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-3">Weekly Focus</h3>
            <div className="space-y-2">
              {diet.weeklyFocus.map(item => (
                <div key={item.category} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <span className="font-medium text-sm text-white">{item.emoji} {item.category}</span>
                  <span className="text-xs text-blue-400">{item.target}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What to limit */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-3">Limit / Avoid</h3>
            <div className="space-y-2">
              {diet.limit.map(item => (
                <div key={item.item} className="flex items-center justify-between p-3 bg-red-900/20 border border-red-900/30 rounded-lg">
                  <span className="font-medium text-sm text-slate-300">🚫 {item.item}</span>
                  <span className="text-xs text-red-400">{item.guideline}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Crohn's note */}
          <div className="bg-purple-900/20 border border-purple-800/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-purple-300 mb-1">Crohn's-Specific Notes</h3>
            <p className="text-xs text-purple-200/80">{diet.crohnsNotes}</p>
          </div>
        </div>
      )}

      {/* Meal Modal */}
      {showMealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowMealModal(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Log Meal</h3>
            <form onSubmit={submitMeal} className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {MEAL_TYPES.map(t => (
                  <button key={t.id} type="button"
                    onClick={() => setMealForm(f => ({ ...f, type: t.id }))}
                    className={`p-2 rounded-lg text-center text-xs transition-all ${
                      mealForm.type === t.id ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-lg">{t.emoji}</div>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Quick preset buttons based on selected meal type */}
              <div className="flex flex-wrap gap-1">
                {MEAL_PRESETS.filter(p => p.type === mealForm.type).map(preset => (
                  <button key={preset.id} type="button"
                    onClick={() => setMealForm(f => ({ ...f, description: preset.label, notes: preset.description }))}
                    className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full hover:bg-slate-600">
                    {preset.emoji} {preset.label}
                  </button>
                ))}
              </div>

              <input type="text" placeholder="What did you eat?" value={mealForm.description}
                onChange={e => setMealForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" required autoFocus />
              <input type="text" placeholder="Notes (optional)" value={mealForm.notes}
                onChange={e => setMealForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowMealModal(false)} className="flex-1 py-2 border border-slate-600 rounded-lg text-sm text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
