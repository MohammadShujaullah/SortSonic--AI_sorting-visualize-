import { createContext, useState } from "react";

import { getRandomNumber, getDigit, mostDigits } from "../helpers/math";
import { awaitTimeout } from "../helpers/promises";
import { recommendAlgorithm, getRecommendationDescription } from "../helpers/algorithmRecommender";

export const SortingContext = createContext();
const speedMap = {
    "slow": 1000,
    "normal": 500,
    "fast": 250
}

function SortingProvider({ children }) {
    const [sortingState, setSortingState] = useState({
        array: [],
        delay: speedMap["slow"],
        algorithm: "bubble_sort",
        sorted: false,
        sorting: false,
        arraySize: 12,
        dataDistribution: "random",
        stabilityRequired: false,
        lowMemoryRequired: false,
        recommendation: null,
        metrics: {
            comparisons: 0,
            swaps: 0,
            startTime: null,
            endTime: null,
            duration: 0
        }
    });

    const changeBar = (index, payload) => {
        setSortingState((prev) => ({
            ...prev,
            array: prev.array.map((item, i) => (i === index ? { ...item, ...payload } : item)),
        }));
    };

    const updateMetrics = (type, value = 1) => {
        setSortingState((prev) => ({
            ...prev,
            metrics: {
                ...prev.metrics,
                [type]: prev.metrics[type] + value
            }
        }));
    };

    const resetMetrics = () => {
        setSortingState((prev) => ({
            ...prev,
            metrics: {
                comparisons: 0,
                swaps: 0,
                startTime: null,
                endTime: null,
                duration: 0
            }
        }));
    };

    const generateSortingArray = (sorting) => {
        const generatedArray = Array.from({ length: sortingState.arraySize }, () => {
            return {
                value: getRandomNumber(60, 1000),
                state: "idle",
            };
        });

        setSortingState((prev) => ({
            ...prev,
            array: generatedArray,
            sorted: false,
            sorting: sorting || false,
            metrics: {
                comparisons: 0,
                swaps: 0,
                startTime: null,
                endTime: null,
                duration: 0
            }
        }))
    };

    const bubbleSort = async () => {
        const arr = sortingState.array.map((item) => item.value);

        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                changeBar(j, { state: "selected" });
                changeBar(j + 1, { state: "selected" });
                updateMetrics('comparisons');
                await awaitTimeout(sortingState.delay);

                if (arr[j] > arr[j + 1]) {
                    let temp = arr[j];
                    arr[j] = arr[j + 1];
                    changeBar(j, { value: arr[j + 1] });
                    arr[j + 1] = temp;
                    changeBar(j + 1, { value: temp });
                    updateMetrics('swaps');
                    await awaitTimeout(sortingState.delay);
                }

                changeBar(j, { state: "idle" });
                changeBar(j + 1, { state: "idle" });
            }
        }
    };

    const insertionSort = async () => {
        const arr = sortingState.array.map((item) => item.value);

        for (let i = 1; i < arr.length; i++) {
            let current = arr[i];
            let j = i - 1;

            changeBar(i, { value: current, state: "selected" });

            while (j > -1 && current < arr[j]) {
                arr[j + 1] = arr[j];
                changeBar(j + 1, { value: arr[j], state: "selected" });
                j--;
                await awaitTimeout(sortingState.delay);
                changeBar(j + 2, { value: arr[j + 1], state: "idle" });
            }

            arr[j + 1] = current;
            changeBar(j + 1, { value: current, state: "idle" });
        }
    };

    const selectionSort = async () => {
        const arr = sortingState.array.map((item) => item.value);

        for (let i = 0; i < arr.length; i++) {
            let min = i;
            changeBar(min, { state: "selected" });

            for (let j = i + 1; j < arr.length; j++) {
                changeBar(j, { state: "selected" });
                await awaitTimeout(sortingState.delay);

                if (arr[j] < arr[min]) {
                    changeBar(min, { state: "idle" });
                    min = j;
                    changeBar(min, { state: "selected" });
                } else {
                    changeBar(j, { state: "idle" });
                }
            }

            if (min !== i) {
                let temp = arr[i];
                arr[i] = arr[min];
                changeBar(i, { value: arr[min], state: "idle" });
                arr[min] = temp;
                changeBar(min, { value: temp, state: "idle" });
            } else {
                changeBar(i, { state: "idle" });
                changeBar(min, { state: "idle" });
            }
        }
    };

    const mergeSort = async () => {
        const arr = sortingState.array.map((item) => item.value);
        mergeSortHelper(arr);
    };
    async function mergeSortHelper(arr, start = 0, end = arr.length - 1) {
        if (start >= end) return;

        const middle = Math.floor((start + end) / 2);
        await mergeSortHelper(arr, start, middle);
        await mergeSortHelper(arr, middle + 1, end);
        await mergeSortMerger(arr, start, middle, end);
    }
    async function mergeSortMerger(arr, start, middle, end) {
        let left = arr.slice(start, middle + 1);
        let right = arr.slice(middle + 1, end + 1);

        let i = 0,
            j = 0,
            k = start;

        while (i < left.length && j < right.length) {
            if (left[i] < right[j]) {
                changeBar(k, { value: left[i], state: "selected" });
                arr[k++] = left[i++];
            } else {
                changeBar(k, { value: right[j], state: "selected" });
                arr[k++] = right[j++];
            }
            await awaitTimeout(sortingState.delay);
        }

        while (i < left.length) {
            changeBar(k, { value: left[i], state: "selected" });
            arr[k++] = left[i++];
            await awaitTimeout(sortingState.delay);
        }

        while (j < right.length) {
            changeBar(k, { value: right[j], state: "selected" });
            arr[k++] = right[j++];
            await awaitTimeout(sortingState.delay);
        }

        for (let i = start; i <= end; i++) {
            changeBar(i, { value: arr[i], state: "idle" });
        }
    }

    const quickSort = async () => {
        const arr = sortingState.array.map((item) => item.value);
        quickSortHelper(arr);
    };
    const quickSortHelper = async (arr, start = 0, end = arr.length - 1) => {
        if (start >= end) {
            return;
        }

        const pivot = arr[Math.floor((start + end) / 2)];
        let i = start;
        let j = end;

        while (i <= j) {
            while (arr[i] < pivot) {
                i++;
                updateMetrics('comparisons');
            }
            while (arr[j] > pivot) {
                j--;
                updateMetrics('comparisons');
            }

            if (i <= j) {
                [arr[i], arr[j]] = [arr[j], arr[i]];
                updateMetrics('swaps');
                changeBar(i, { value: arr[i], state: "selected" });
                changeBar(j, { value: arr[j], state: "selected" });

                await awaitTimeout(sortingState.delay);

                changeBar(i, { value: arr[i], state: "idle" });
                changeBar(j, { value: arr[j], state: "idle" });
                i++;
                j--;
            }
        }

        await quickSortHelper(arr, start, j);
        await quickSortHelper(arr, i, end);
    }

    const radixSort = async () => {
        let arr = sortingState.array.map((item) => item.value);
        let maxDigitCount = mostDigits(arr);

        for (let k = 0; k < maxDigitCount; k++) {
            let digitBuckets = Array.from({ length: 10 }, () => []);
            for (let i = 0; i < arr.length; i++) {
                let digit = getDigit(arr[i], k);
                digitBuckets[digit].push(arr[i]);
            }

            arr = [].concat(...digitBuckets);

            for (let i = 0; i < arr.length; i++) {
                changeBar(i, { value: arr[i], state: "selected" });
                await awaitTimeout(sortingState.delay);
                changeBar(i, { value: arr[i], state: "idle" });
            }
        }
    };

    const bucketSort = async () => {
        let arr = sortingState.array.map((item) => item.value);
        const n = arr.length;
        
        // Find min and max values
        const min = Math.min(...arr);
        const max = Math.max(...arr);
        const range = max - min;
        
        // Create buckets
        const bucketCount = Math.floor(n / 2) || 1; // Use n/2 buckets or minimum 1
        const buckets = Array.from({ length: bucketCount }, () => []);
        
        // Distribute elements into buckets
        for (let i = 0; i < n; i++) {
            const bucketIndex = Math.floor(((arr[i] - min) / range) * (bucketCount - 1));
            const actualIndex = Math.min(bucketIndex, bucketCount - 1);
            buckets[actualIndex].push(arr[i]);
            
            // Visualize element being placed in bucket
            changeBar(i, { state: "selected" });
            await awaitTimeout(sortingState.delay);
            changeBar(i, { state: "idle" });
        }
        
        // Sort each bucket using insertion sort
        for (let i = 0; i < bucketCount; i++) {
            if (buckets[i].length > 0) {
                // Insertion sort for the bucket
                for (let j = 1; j < buckets[i].length; j++) {
                    let key = buckets[i][j];
                    let k = j - 1;
                    
                    while (k >= 0 && buckets[i][k] > key) {
                        buckets[i][k + 1] = buckets[i][k];
                        k--;
                    }
                    buckets[i][k + 1] = key;
                }
            }
        }
        
        // Concatenate buckets back to array
        let sortedIndex = 0;
        for (let i = 0; i < bucketCount; i++) {
            for (let j = 0; j < buckets[i].length; j++) {
                arr[sortedIndex] = buckets[i][j];
                
                // Visualize element being placed in final position
                changeBar(sortedIndex, { value: arr[sortedIndex], state: "selected" });
                await awaitTimeout(sortingState.delay);
                changeBar(sortedIndex, { value: arr[sortedIndex], state: "idle" });
                
                sortedIndex++;
            }
        }
    };

    const heapSort = async () => {
        let arr = sortingState.array.map((item) => item.value);
        const n = arr.length;

        // Build max heap (rearrange array)
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await heapify(arr, n, i);
        }

        // Extract elements from heap one by one
        for (let i = n - 1; i > 0; i--) {
            // Move current root to end
            [arr[0], arr[i]] = [arr[i], arr[0]];
            
            // Visualize the swap
            changeBar(0, { value: arr[0], state: "selected" });
            changeBar(i, { value: arr[i], state: "selected" });
            await awaitTimeout(sortingState.delay);
            changeBar(0, { value: arr[0], state: "idle" });
            changeBar(i, { value: arr[i], state: "idle" });

            // Call heapify on the reduced heap
            await heapify(arr, i, 0);
        }
    };

    const heapify = async (arr, n, i) => {
        let largest = i; // Initialize largest as root
        const left = 2 * i + 1; // Left child
        const right = 2 * i + 2; // Right child

        // If left child is larger than root
        if (left < n && arr[left] > arr[largest]) {
            largest = left;
        }

        // If right child is larger than largest so far
        if (right < n && arr[right] > arr[largest]) {
            largest = right;
        }

        // If largest is not root
        if (largest !== i) {
            // Visualize comparison
            changeBar(i, { state: "selected" });
            changeBar(largest, { state: "selected" });
            await awaitTimeout(sortingState.delay);

            // Swap
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            
            // Visualize swap
            changeBar(i, { value: arr[i], state: "idle" });
            changeBar(largest, { value: arr[largest], state: "idle" });
            await awaitTimeout(sortingState.delay);

            // Recursively heapify the affected sub-tree
            await heapify(arr, n, largest);
        }
    };

    const algorithmMap = {
        "bubble_sort": bubbleSort,
        "insertion_sort": insertionSort,
        "selection_sort": selectionSort,
        "merge_sort": mergeSort,
        "quick_sort": quickSort,
        "heap_sort": heapSort,
        "radix_sort": radixSort,
        "bucket_sort": bucketSort
    }

    const startVisualizing = async () => {
        const startTime = Date.now();
        
        setSortingState((prev) => ({
            ...prev,
            sorting: true,
            metrics: {
                ...prev.metrics,
                startTime: startTime,
                comparisons: 0,
                swaps: 0
            }
        }))

        await algorithmMap[sortingState.algorithm]();

        const endTime = Date.now();
        const duration = endTime - startTime;

        setSortingState((prev) => ({
            ...prev,
            sorted: true,
            sorting: false,
            metrics: {
                ...prev.metrics,
                endTime: endTime,
                duration: duration
            }
        }))
    }

    const changeSortingSpeed = (e) => {
        setSortingState((prev) => ({
            ...prev,
            delay: speedMap[e.target.value] || 500
        }))
    }

    const changeAlgorithm = (algorithm) => {
        setSortingState((prev) => ({
            ...prev,
            algorithm
        }))
    }
    
    const getAlgorithmRecommendation = () => {
        const recommendation = recommendAlgorithm({
            arraySize: sortingState.arraySize,
            dataDistribution: sortingState.dataDistribution,
            stabilityRequired: sortingState.stabilityRequired,
            lowMemoryRequired: sortingState.lowMemoryRequired
        });
        
        setSortingState((prev) => ({
            ...prev,
            recommendation
        }));
        
        return recommendation;
    }
    
    const updateRecommendationParams = (params) => {
        setSortingState((prev) => ({
            ...prev,
            ...params
        }));
    }

    const changeArraySize = (size) => {
        setSortingState((prev) => ({
            ...prev,
            arraySize: parseInt(size)
        }))
    }

    return (
        <SortingContext.Provider
            value={{
                sortingState,
                generateSortingArray,
                startVisualizing,
                changeSortingSpeed,
                changeAlgorithm,
                changeArraySize,
                getAlgorithmRecommendation,
                updateRecommendationParams,
                getRecommendationDescription
            }}
        >
            {children}
        </SortingContext.Provider>
    );
}

export default SortingProvider;
