import { useState } from "react";
import ExtractTab from "./components/ExtractTab";
import HistoryTab from "./components/HistoryTab";
import MealPlanModal from "./components/MealPlanModal";

export default function App() {
  const [activeTab, setActiveTab] = useState("extract");
  const [mealPlanOpen, setMealPlanOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍳</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Recipe Extractor</h1>
              <p className="text-xs text-gray-500">AI-powered recipe intelligence</p>
            </div>
          </div>
          <button
            onClick={() => setMealPlanOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            🥗 Meal Planner
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-0 border-b border-gray-200">
            {["extract", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition capitalize ${
                  activeTab === tab
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "extract" ? "🔍 Extract Recipe" : "📚 Saved Recipes"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "extract" ? <ExtractTab /> : <HistoryTab />}
      </main>

      {mealPlanOpen && <MealPlanModal onClose={() => setMealPlanOpen(false)} />}
    </div>
  );
}
