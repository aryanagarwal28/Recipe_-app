const difficultyColor = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export default function RecipeCard({ recipe }) {
  if (!recipe) return null;

  return (
    <div className="space-y-6">
      {/* Hero Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{recipe.title}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {recipe.cuisine && (
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                  🌍 {recipe.cuisine}
                </span>
              )}
              {recipe.difficulty && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${difficultyColor[recipe.difficulty] || "bg-gray-100 text-gray-600"}`}>
                  📊 {recipe.difficulty}
                </span>
              )}
              {recipe.servings && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  👥 {recipe.servings}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          {[
            { label: "Prep Time", value: recipe.prep_time, icon: "🥄" },
            { label: "Cook Time", value: recipe.cook_time, icon: "🔥" },
            { label: "Total Time", value: recipe.total_time, icon: "⏱️" },
          ].map((item) => item.value && (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xl">{item.icon}</div>
              <div className="text-sm font-semibold text-gray-800 mt-1">{item.value}</div>
              <div className="text-xs text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Ingredients */}
          {recipe.ingredients?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🧂</span> Ingredients
                <span className="ml-auto text-xs text-gray-400 font-normal">{recipe.ingredients.length} items</span>
              </h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-orange-400 mt-1">•</span>
                    <span>
                      <span className="font-medium text-gray-800">
                        {ing.quantity} {ing.unit}
                      </span>{" "}
                      <span className="text-gray-600">{ing.item}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nutrition */}
          {recipe.nutrition && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📊</span> Nutrition (per serving)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Calories", value: recipe.nutrition.calories, color: "bg-red-50 text-red-700" },
                  { label: "Protein", value: recipe.nutrition.protein, color: "bg-blue-50 text-blue-700" },
                  { label: "Carbs", value: recipe.nutrition.carbs, color: "bg-yellow-50 text-yellow-700" },
                  { label: "Fat", value: recipe.nutrition.fat, color: "bg-green-50 text-green-700" },
                ].map((n) => n.value && (
                  <div key={n.label} className={`rounded-xl p-3 text-center ${n.color}`}>
                    <div className="text-sm font-bold">{n.value}</div>
                    <div className="text-xs opacity-75">{n.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructions */}
          {recipe.instructions?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📋</span> Instructions
              </h3>
              <ol className="space-y-4">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed pt-0.5">
                      {step.replace(/^step\s*\d+[:.]\s*/i, "")}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Substitutions */}
          {recipe.substitutions?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🔄</span> Ingredient Substitutions
              </h3>
              <div className="space-y-3">
                {recipe.substitutions.map((sub, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700 line-through opacity-60">{sub.original}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-semibold text-green-700">{sub.substitute}</span>
                    </div>
                    {sub.note && <p className="text-xs text-gray-500 mt-1">{sub.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shopping List */}
          {recipe.shopping_list && Object.keys(recipe.shopping_list).length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🛒</span> Shopping List
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(recipe.shopping_list).map(([category, items]) =>
                  items?.length > 0 ? (
                    <div key={category}>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 capitalize">
                        {category}
                      </h4>
                      <ul className="space-y-1">
                        {items.map((item, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="text-gray-300">☐</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Related Recipes */}
          {recipe.related_recipes?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>✨</span> You Might Also Like
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recipe.related_recipes.map((r, i) => (
                  <div key={i} className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                    <p className="text-sm font-semibold text-orange-800">{r.title}</p>
                    <p className="text-xs text-orange-600 mt-1">{r.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
