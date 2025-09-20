import { useContext, useState, useEffect } from "react";
import { SortingContext } from "../contexts/SortingContext";

function AlgorithmRecommender() {
    const { 
        sortingState, 
        getAlgorithmRecommendation, 
        updateRecommendationParams, 
        changeAlgorithm 
    } = useContext(SortingContext);

    const [showRecommendation, setShowRecommendation] = useState(false);

    // Get recommendation when parameters change
    useEffect(() => {
        if (showRecommendation) {
            getAlgorithmRecommendation();
        }
    }, [
        showRecommendation,
        sortingState.arraySize,
        sortingState.dataDistribution,
        sortingState.stabilityRequired,
        sortingState.lowMemoryRequired
    ]);

    const handleDistributionChange = (e) => {
        updateRecommendationParams({ dataDistribution: e.target.value });
    };

    const handleStabilityChange = (e) => {
        updateRecommendationParams({ stabilityRequired: e.target.checked });
    };

    const handleMemoryChange = (e) => {
        updateRecommendationParams({ lowMemoryRequired: e.target.checked });
    };

    const applyRecommendation = () => {
        if (sortingState.recommendation) {
            changeAlgorithm(sortingState.recommendation.algorithm);
        }
    };

    return (
        <div className="glass-effect rounded-2xl p-6 mb-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white-light">Algorithm Recommendation</h2>
                <button
                    onClick={() => setShowRecommendation(!showRecommendation)}
                    className="px-4 py-2 rounded-xl glass-effect text-white-light hover:bg-white/10 transition-all duration-300"
                >
                    {showRecommendation ? "Hide" : "Show"} Recommender
                </button>
            </div>

            {showRecommendation && (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-lg font-medium text-white-light mb-4">Data Characteristics</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-secondary-300 mb-2">Data Distribution</label>
                                    <select
                                        value={sortingState.dataDistribution}
                                        onChange={handleDistributionChange}
                                        disabled={sortingState.sorting}
                                        className="w-full px-4 py-2 rounded-xl glass-effect text-white-light bg-transparent border border-secondary-600 focus:border-primary-500 focus:outline-none transition-all duration-300"
                                    >
                                        <option value="random">Random</option>
                                        <option value="nearly_sorted">Nearly Sorted</option>
                                        <option value="reversed">Reversed</option>
                                        <option value="few_unique">Few Unique Values</option>
                                        <option value="uniform_distribution">Uniform Distribution</option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="stability"
                                        checked={sortingState.stabilityRequired}
                                        onChange={handleStabilityChange}
                                        disabled={sortingState.sorting}
                                        className="w-4 h-4 accent-primary-500"
                                    />
                                    <label htmlFor="stability" className="text-secondary-300">
                                        Stability Required
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="memory"
                                        checked={sortingState.lowMemoryRequired}
                                        onChange={handleMemoryChange}
                                        disabled={sortingState.sorting}
                                        className="w-4 h-4 accent-primary-500"
                                    />
                                    <label htmlFor="memory" className="text-secondary-300">
                                        Low Memory Usage Required
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            {sortingState.recommendation ? (
                                <div className="bg-gradient-to-r from-primary-900/30 to-secondary-900/30 p-6 rounded-xl border border-primary-700/50">
                                    <h3 className="text-xl font-bold text-primary-400 mb-2">
                                        Recommended: {sortingState.recommendation.name}
                                    </h3>
                                    <p className="text-secondary-300 mb-4">
                                        {sortingState.recommendation.explanation.join(", ")}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div>
                                            <span className="text-xs text-secondary-400">Time Complexity</span>
                                            <p className="text-white-light font-mono">
                                                {sortingState.recommendation.timeComplexity}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-secondary-400">Space Complexity</span>
                                            <p className="text-white-light font-mono">
                                                {sortingState.recommendation.spaceComplexity}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={applyRecommendation}
                                        disabled={sortingState.sorting || sortingState.algorithm === sortingState.recommendation.algorithm}
                                        className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sortingState.algorithm === sortingState.recommendation.algorithm
                                            ? "Currently Selected"
                                            : "Apply Recommendation"}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-secondary-400">
                                        Adjust parameters to get a recommendation
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AlgorithmRecommender;