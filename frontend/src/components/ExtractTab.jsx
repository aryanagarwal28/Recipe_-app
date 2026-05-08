import { useState } from "react";
import RecipeCard from "./RecipeCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ExtractTab() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recipe, setRecipe] = useState(null);

  const isValidUrl = (str) => {
    try { new URL(str); return true; } catch { return false; }
  };

  const handleExtract = async () => {
    if (!url.trim()) return setError("Please enter a URL.");
    if (!isValidUrl(url.trim())) return setError("Please enter a valid URL.");

    setError("");
    setLoading(true);
    setRecipe(null);

    try {
      const res = await fetch(`${API}/api/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Extraction failed");
      }

      const data = await res.json();
      setRecipe(data);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* URL Input Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Extract Recipe from URL
        </h2>
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleExtract()}
            placeholder="https://www.allrecipes.com/recipe/23891/grilled-cheese-sandwich/"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          <button
            onClick={handleExtract}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-3 rounded-lg font-medium text-sm transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Extracting...
              </>
            ) : (
              "🔍 Extract Recipe"
            )}
          </button>
        </div>

        {/* URL Preview */}
        {url && isValidUrl(url) && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            <span>🔗</span>
            <span className="truncate">{url}</span>
          </div>
        )}

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 animate-bounce">🍽️</div>
          <p className="text-gray-600 font-medium">Scraping and analyzing recipe...</p>
          <p className="text-gray-400 text-sm mt-1">This may take 15–30 seconds</p>
          <div className="mt-6 flex justify-center gap-2">
            {["Scraping page", "Processing with AI", "Generating insights"].map((step, i) => (
              <span key={i} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs">
                {step}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Result */}
      {recipe && !loading && <RecipeCard recipe={recipe} />}

      {/* Empty State */}
      {!recipe && !loading && !error && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-6xl mb-4">🥘</div>
          <p className="text-lg font-medium">Paste a recipe URL above to get started</p>
          <p className="text-sm mt-2">Works with AllRecipes, Food Network, BBC Good Food, and more</p>
        </div>
      )}
    </div>
  );
}
