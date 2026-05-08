import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function MealPlanModal({ onClose }) {
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/recipes`)
      .then((r) => r.json())
      .then(setRecipes)
      .catch(() => setError("Failed to load recipes"));
  }, []);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const generate = async () => {
    if (selected.length < 2) return setError("Please select at least 2 recipes.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/meal-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_ids: selected }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Failed to generate meal plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 text-lg">🥗 Meal Planner</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="p-5">
          {!result ? (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Select 2–5 recipes to generate a combined shopping list and meal plan.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-2 mb-5">
                {recipes.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      selected.includes(r.id)
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={() => toggle(r.id)}
                      className="accent-green-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.title}</p>
                      <p className="text-xs text-gray-500">{r.cuisine} • {r.difficulty}</p>
                    </div>
                  </label>
                ))}
                {recipes.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No saved recipes yet. Extract some recipes first!</p>
                )}
              </div>

              <button
                onClick={generate}
                disabled={loading || selected.length < 2}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-3 rounded-xl font-medium transition"
              >
                {loading ? "Generating..." : `Generate Meal Plan (${selected.length} selected)`}
              </button>
            </>
          ) : (
            <div className="space-y-5">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">📅 Recipes in Plan</h4>
                <ul className="space-y-1">
                  {result.recipes?.map((r, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="text-green-500">✓</span> {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">🛒 Combined Shopping List</h4>
                <div className="grid grid-cols-2 gap-4">
                  {result.combined_shopping_list && Object.entries(result.combined_shopping_list).map(([cat, items]) =>
                    items?.length > 0 ? (
                      <div key={cat}>
                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 capitalize">{cat}</h5>
                        <ul className="space-y-1">
                          {items.map((item, i) => (
                            <li key={i} className="text-sm text-gray-700 flex gap-2">
                              <span className="text-gray-300">☐</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              {result.meal_plan_notes && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold text-green-800 mb-1 text-sm">💡 Prep Tips</h4>
                  <p className="text-sm text-green-700">{result.meal_plan_notes}</p>
                </div>
              )}

              <button
                onClick={() => { setResult(null); setSelected([]); }}
                className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50 py-2.5 rounded-xl text-sm transition"
              >
                ← Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
