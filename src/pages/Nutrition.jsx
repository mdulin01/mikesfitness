import { useState } from 'react';
import { healthPlan } from '../data/healthPlan';
import { MEAL_TYPES } from '../constants';

export default function Nutrition({ data, addMeal, deleteMeal, ...rest }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealForm, setMealForm] = useState({ type: 'breakfast', description: '', notes: '' });
  const [activeTab, setActiveTab] = useState('log'); // 'log' | 'guide'

  const meals = data?.mealLog?.[selectedDate] || [];
  const diet = healthPlan.mediterraneanDiet;

  const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const submitMeal = (e) => {
    e.preventDefault();
    if (!mealForm.description) return;
    addMeal(selectedDate, { ...mealForm, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
    setMealForm({ type: 'breakfast', description: '', notes: '' });
    setShowMealModal(false);
  };

  // Navigate dates
  const changeDate = (offset) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Group meals by type
  const groupedMeals = MEAL_TYPES.map(mt => ({
    ...mt,
    items: meals.filter(m => m.type === mt.id),
  }));

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-white">🥗 Nutrition</h1>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-700/50 rounded-lg p-1">
        {[
          { id: 'log', label: 'Food Log' },
          { id: 'guide', label: 'Diet Guide' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-slate-600 text-blue-400 shadow-sm' : 'text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'log' && (
        <>
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
              <p className="text-xs text-slate-500 mt-1">Tap the button above to start tracking.</p>
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
