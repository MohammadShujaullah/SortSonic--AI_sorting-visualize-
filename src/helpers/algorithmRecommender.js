/**
 * Algorithm Recommender
 * 
 * This module provides recommendations for sorting algorithms based on:
 * - Array size
 * - Data distribution
 * - Stability requirements
 * - Space constraints
 */

/**
 * Recommends the best sorting algorithm based on array characteristics
 * @param {Object} params - Parameters for recommendation
 * @param {number} params.arraySize - Size of the array to be sorted
 * @param {string} params.dataDistribution - Distribution of data ('random', 'nearly_sorted', 'reversed', 'few_unique')
 * @param {boolean} params.stabilityRequired - Whether stability is required
 * @param {boolean} params.lowMemoryRequired - Whether low memory usage is required
 * @returns {Object} Recommended algorithm with explanation
 */
export function recommendAlgorithm({
    arraySize = 10,
    dataDistribution = 'random',
    stabilityRequired = false,
    lowMemoryRequired = false
}) {
    // Define algorithm characteristics
    const algorithms = {
        bubble_sort: {
            name: "Bubble Sort",
            goodFor: ['small_arrays', 'nearly_sorted'],
            stable: true,
            inPlace: true,
            spaceComplexity: 'O(1)',
            timeComplexityWorst: 'O(n²)',
            timeComplexityBest: 'O(n)',
            maxRecommendedSize: 100
        },
        insertion_sort: {
            name: "Insertion Sort",
            goodFor: ['small_arrays', 'nearly_sorted', 'online_sorting'],
            stable: true,
            inPlace: true,
            spaceComplexity: 'O(1)',
            timeComplexityWorst: 'O(n²)',
            timeComplexityBest: 'O(n)',
            maxRecommendedSize: 100
        },
        selection_sort: {
            name: "Selection Sort",
            goodFor: ['small_arrays'],
            stable: false,
            inPlace: true,
            spaceComplexity: 'O(1)',
            timeComplexityWorst: 'O(n²)',
            timeComplexityBest: 'O(n²)',
            maxRecommendedSize: 100
        },
        merge_sort: {
            name: "Merge Sort",
            goodFor: ['large_arrays', 'guaranteed_performance'],
            stable: true,
            inPlace: false,
            spaceComplexity: 'O(n)',
            timeComplexityWorst: 'O(n log n)',
            timeComplexityBest: 'O(n log n)',
            maxRecommendedSize: Infinity
        },
        quick_sort: {
            name: "Quick Sort",
            goodFor: ['large_arrays', 'average_case_performance'],
            stable: false,
            inPlace: true,
            spaceComplexity: 'O(log n)',
            timeComplexityWorst: 'O(n²)',
            timeComplexityBest: 'O(n log n)',
            maxRecommendedSize: Infinity
        },
        heap_sort: {
            name: "Heap Sort",
            goodFor: ['large_arrays', 'guaranteed_performance'],
            stable: false,
            inPlace: true,
            spaceComplexity: 'O(1)',
            timeComplexityWorst: 'O(n log n)',
            timeComplexityBest: 'O(n log n)',
            maxRecommendedSize: Infinity
        },
        radix_sort: {
            name: "Radix Sort",
            goodFor: ['large_arrays', 'integer_data'],
            stable: true,
            inPlace: false,
            spaceComplexity: 'O(n + k)',
            timeComplexityWorst: 'O(nk)',
            timeComplexityBest: 'O(nk)',
            maxRecommendedSize: Infinity
        },
        bucket_sort: {
            name: "Bucket Sort",
            goodFor: ['large_arrays', 'uniform_distribution'],
            stable: true,
            inPlace: false,
            spaceComplexity: 'O(n + k)',
            timeComplexityWorst: 'O(n²)',
            timeComplexityBest: 'O(n + k)',
            maxRecommendedSize: Infinity
        }
    };

    // Score each algorithm based on the parameters
    const scores = {};
    let explanations = {};

    for (const [key, algo] of Object.entries(algorithms)) {
        let score = 0;
        let explanation = [];

        // Array size considerations
        if (arraySize <= algo.maxRecommendedSize) {
            score += 1;
        } else {
            score -= 2;
            explanation.push(`Not ideal for arrays of size ${arraySize}`);
        }

        // Small array optimization
        if (arraySize < 50 && algo.goodFor.includes('small_arrays')) {
            score += 2;
            explanation.push("Good for small arrays");
        }

        // Large array optimization
        if (arraySize > 100 && algo.goodFor.includes('large_arrays')) {
            score += 2;
            explanation.push("Efficient for large arrays");
        }

        // Data distribution considerations
        if (dataDistribution === 'nearly_sorted' && algo.goodFor.includes('nearly_sorted')) {
            score += 3;
            explanation.push("Excellent for nearly sorted data");
        }

        if (dataDistribution === 'random' && algo.goodFor.includes('average_case_performance')) {
            score += 2;
            explanation.push("Good for randomly distributed data");
        }

        if (dataDistribution === 'uniform_distribution' && algo.goodFor.includes('uniform_distribution')) {
            score += 3;
            explanation.push("Optimized for uniform data distribution");
        }

        // Stability requirements
        if (stabilityRequired && algo.stable) {
            score += 2;
            explanation.push("Maintains relative order of equal elements");
        } else if (stabilityRequired && !algo.stable) {
            score -= 3;
            explanation.push("Does not maintain order of equal elements");
        }

        // Memory constraints
        if (lowMemoryRequired && algo.inPlace) {
            score += 2;
            explanation.push("Uses minimal extra memory");
        } else if (lowMemoryRequired && !algo.inPlace) {
            score -= 2;
            explanation.push("Requires additional memory");
        }

        scores[key] = score;
        explanations[key] = explanation;
    }

    // Find the algorithm with the highest score
    let bestAlgorithm = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    return {
        algorithm: bestAlgorithm,
        name: algorithms[bestAlgorithm].name,
        explanation: explanations[bestAlgorithm],
        timeComplexity: algorithms[bestAlgorithm].timeComplexityWorst,
        spaceComplexity: algorithms[bestAlgorithm].spaceComplexity
    };
}

/**
 * Get a friendly description of why an algorithm was recommended
 * @param {Object} recommendation - The recommendation object
 * @returns {string} A user-friendly explanation
 */
export function getRecommendationDescription(recommendation) {
    if (!recommendation) return "";
    
    const { name, explanation } = recommendation;
    
    return `${name} is recommended because it ${explanation.join(", ").toLowerCase()}.`;
}