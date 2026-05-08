import { useState, useEffect } from "react";
import RecipeCard from "./RecipeCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function HistoryTab() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/recipes`);
      const data = await res.json();
      setRecipes(data);
    } catch {
      setError("Failed to load saved recipes.");
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (id) => {
    setModalLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`${API}/api/recipes/${id}`);
      const data = await res.json();
      setSelected(data);
    } catch {
      alert("Failed to load recipe details.");
    } finally {
      setModalLoading(false);
    }
  };

  const difficultyBadge = (d) => {
    const map = { easy: "bg-green-100 text-green-700", medium: "bg-yellow-100 text-yellow-700", hard: "bg-red-100 text-red-700" };
    return map[d] || "bg-gray-100 text-gray-600";
  };

  if (loading) return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-5xl mb-3 animate-spin">🍴</div>
      <p>Loading saved recipes...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-xl text-sm">
      ⚠️ {error}
    </div>
  );

  if (recipes.length === 0) return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-6xl mb-4">📭</div>
      <p className="text-lg font-medium">No recipes saved yet</p>
      <p className="text-sm mt-1">Extract your first recipe from the Extract tab</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Saved Recipes</h2>
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
          {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Recipe</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Cuisine</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Difficulty</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recipes.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-800 max-w-xs truncate">{r.title}</p>
                  <p className="text-xs text-gray-400 truncate max-w-xs">{r.url}</p>
                </td>
                <td className="px-5 py-4 text-gray-600">{r.cuisine || "—"}</td>
                <td className="px-5 py-4">
                  {r.difficulty ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${difficultyBadge(r.difficulty)}`}>
                      {r.difficulty}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  }) : "—"}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => openDetails(r.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {(selected || modalLoading) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-gray-50 rounded-2xl w-full max-w-5xl my-8">
            <div className="flex items-center justify-between p-5 bg-white rounded-t-2xl border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 text-lg">
                {selected ? selected.title : "Loading..."}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-5">
              {modalLoading ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-4xl animate-bounce mb-3">🍽️</div>
                  <p>Loading recipe details...</p>
                </div>
              ) : (
                <RecipeCard recipe={selected} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
