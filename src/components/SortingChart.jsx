import { useContext, useEffect, useState } from "react";

import { SortingContext } from "../contexts/SortingContext";
import algorithmInfos from "../data/algorithmInfos";
import AlgorithmRecommender from "./AlgorithmRecommender";

function SortingChart() {
    const { sortingState, generateSortingArray, startVisualizing, changeSortingSpeed, changeAlgorithm, changeArraySize } = useContext(SortingContext);
    
    // Settings state
    const [showSettings, setShowSettings] = useState(false);
    const [audioSettings, setAudioSettings] = useState({
        enabled: true,
        volume: 0.5,
        comparisonSound: true,
        swapSound: true,
        startSound: true,
        completeSound: true,
        newArraySound: true
    });

    // Tooltip state
    const [tooltip, setTooltip] = useState({
        show: false,
        content: '',
        x: 0,
        y: 0
    });

    // Audio context for sound generation
    const [audioContext, setAudioContext] = useState(null);

    // Initialize audio context
    useEffect(() => {
        if (audioSettings.enabled && !audioContext) {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            setAudioContext(ctx);
        }
    }, [audioSettings.enabled, audioContext]);

    // Sound generation functions
    const playSound = (frequency, duration, type = 'sine', customVolume = null) => {
        if (!audioSettings.enabled || !audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        // Use custom volume if provided, otherwise use default volume calculation
        const volumeMultiplier = customVolume !== null ? customVolume : 0.1;
        const finalVolume = audioSettings.volume * volumeMultiplier;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(finalVolume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    };

    const playComparisonSound = () => {
        if (audioSettings.comparisonSound) playSound(800, 0.08, 'sine', 0.3);
    };

    const playSwapSound = () => {
        if (audioSettings.swapSound) {
            // Play a charming swap sound: musical "click" with harmonic resonance
            const baseFreq = 1000; // Base frequency
            const harmonics = [1, 1.5, 2, 2.5]; // Harmonic series for rich sound
            const duration = 0.15;
            
            harmonics.forEach((harmonic, index) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    const frequency = baseFreq * harmonic;
                    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    // Create a "pluck" effect with quick attack and decay
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(audioSettings.volume * 0.15 * (1 / harmonic), audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + duration);
                }, index * 20); // Slight stagger for harmonic richness
            });
        }
    };

    const playStartSound = () => {
        if (audioSettings.startSound) playSound(1000, 0.25, 'sine', 0.35);
    };

    const playCompleteSound = () => {
        if (audioSettings.completeSound) {
            // Play a charming completion melody: C-E-G-C (ascending)
            const melody = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            const noteDuration = 0.3;
            const noteGap = 80; // Gap between notes in milliseconds
            
            melody.forEach((frequency, index) => {
                setTimeout(() => {
                    // Add a slight vibrato effect for the last note
                    if (index === melody.length - 1) {
                        // Play the final note with a slight frequency modulation
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        const lfo = audioContext.createOscillator(); // Low frequency oscillator for vibrato
                        const lfoGain = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        lfo.connect(lfoGain);
                        lfoGain.connect(oscillator.frequency);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                        oscillator.type = 'sine';
                        lfo.frequency.setValueAtTime(5, audioContext.currentTime); // 5Hz vibrato
                        lfoGain.gain.setValueAtTime(10, audioContext.currentTime); // Small frequency modulation
                        
                        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(audioSettings.volume * 0.25, audioContext.currentTime + 0.01);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + noteDuration);
                        
                        oscillator.start(audioContext.currentTime);
                        lfo.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + noteDuration);
                        lfo.stop(audioContext.currentTime + noteDuration);
                    } else {
                        playSound(frequency, noteDuration, 'sine', 0.2);
                    }
                }, index * noteGap);
            });
        }
    };

    const playNewArraySound = () => {
        if (audioSettings.newArraySound) playSound(600, 0.15);
    };

    // Tooltip functions
    const showTooltip = (event, content) => {
        setTooltip({
            show: true,
            content: content,
            x: event.clientX,
            y: event.clientY
        });
    };

    const hideTooltip = () => {
        setTooltip({
            show: false,
            content: '',
            x: 0,
            y: 0
        });
    };

    useEffect(() => {
        generateSortingArray();
    }, []);

    useEffect(() => {
        if (sortingState.arraySize !== sortingState.array.length) {
            generateSortingArray();
        }
    }, [sortingState.arraySize]);

    // Play completion sound when sorting finishes
    useEffect(() => {
        if (sortingState.sorted && !sortingState.sorting) {
            playCompleteSound();
        }
    }, [sortingState.sorted, sortingState.sorting]);

    const algorithms = [
        { key: "bubble_sort", name: "Bubble Sort" },
        { key: "insertion_sort", name: "Insertion Sort" },
        { key: "selection_sort", name: "Selection Sort" },
        { key: "merge_sort", name: "Merge Sort" },
        { key: "quick_sort", name: "Quick Sort" },
        { key: "heap_sort", name: "Heap Sort" },
        { key: "radix_sort", name: "Radix Sort" },
        { key: "bucket_sort", name: "Bucket Sort" }
    ];

    return (
        <div className="min-h-screen py-8 px-4">
            {/* Header Section */}
            <div className="text-center mb-12 animate-fade-in relative">
                <button
                    onClick={() => setShowSettings(true)}
                    className="absolute top-0 right-0 p-3 rounded-full glass-effect hover:bg-white/10 transition-all duration-300 group"
                    title="Settings"
                >
                    <svg className="w-6 h-6 text-white-light group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-4">
                    Sorting Visualizer
                </h1>
                <p className="text-xl text-secondary-300 max-w-2xl mx-auto">
                    Watch sorting algorithms in action with beautiful visualizations
                </p>
            </div>

            {/* Algorithm Recommender */}
            <AlgorithmRecommender />
            
            {/* Algorithm Selection */}
            <div className="glass-effect rounded-2xl p-6 mb-8 max-w-6xl mx-auto">
                <h2 className="text-2xl font-semibold text-white-light mb-6 text-center">Choose Algorithm</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {algorithms.map((algo) => (
                <button
                            key={algo.key}
                            onClick={() => changeAlgorithm(algo.key)}
                            disabled={sortingState.sorting}
                            className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                                sortingState.algorithm === algo.key
                                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 scale-105"
                                    : "glass-effect text-secondary-200 hover:bg-white/10 hover:scale-105"
                            } ${sortingState.sorting ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {algo.name}
                </button>
                    ))}
                </div>
            </div>

            {/* Visualization Container */}
            <div className="max-w-6xl mx-auto">
                <div className="glass-effect rounded-2xl p-6 mb-8">
                    <div className="chart-container">
                    <div className="base"></div>
                    {sortingState.array.map((bar, i) => (
                        <div key={i} className="bar-container">
                            <div className={`select-none bar bar-${bar.state}`} style={{ height: `${Math.floor((bar.value / 1000) * 100)}%` }}>
                                    <p className={`text-xs font-mono font-semibold text-center ${bar.state === "idle" ? "text-primary-200" : "text-accent-200"}`}>
                                        {bar.value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Real-time Metrics */}
                <div className="glass-effect rounded-2xl p-6 mb-8">
                    <h3 className="text-xl font-semibold text-white-light mb-4 text-center">Sorting Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary-400">
                                {sortingState.metrics.comparisons}
                            </div>
                            <div className="text-sm text-secondary-300">Comparisons</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-accent-400">
                                {sortingState.metrics.swaps}
                            </div>
                            <div className="text-sm text-secondary-300">Swaps</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">
                                {sortingState.metrics.duration > 0 ? `${sortingState.metrics.duration}ms` : '0ms'}
                            </div>
                            <div className="text-sm text-secondary-300">Time</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">
                                {sortingState.array.length}
                            </div>
                            <div className="text-sm text-secondary-300">Elements</div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="glass-effect rounded-2xl p-6 mb-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <button 
                                disabled={sortingState.sorting} 
                                onClick={() => {
                                    playStartSound();
                                    startVisualizing();
                                }} 
                                className="push-btn"
                            >
                                {sortingState.sorting ? "Sorting..." : "Start Sorting"}
                    </button>
                            <button 
                                disabled={sortingState.sorting} 
                                onClick={() => {
                                    playNewArraySound();
                                    generateSortingArray();
                                }} 
                                className="px-6 py-3 rounded-xl glass-effect text-white-light hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                        New Array
                    </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-white-light font-medium">Speed:</label>
                    <select
                        disabled={sortingState.sorting}
                        onChange={changeSortingSpeed}
                        defaultValue="slow"
                                    className="bg-secondary-800 text-white-light px-4 py-2 rounded-xl border border-secondary-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="slow">Slow</option>
                        <option value="normal">Normal</option>
                        <option value="fast">Fast</option>
                    </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-white-light font-medium">Array Size:</label>
                                <input
                                    type="range"
                                    min="5"
                                    max="50"
                                    value={sortingState.arraySize}
                                    onChange={(e) => changeArraySize(e.target.value)}
                                    disabled={sortingState.sorting}
                                    className="range-slider w-24 h-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <span className="text-white-light font-mono text-sm min-w-[2rem]">
                                    {sortingState.arraySize}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Algorithm Information */}
                <div className="glass-effect rounded-2xl p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold gradient-text mb-4">
                            {algorithmInfos[sortingState.algorithm].name}
                        </h2>
                        <p className="text-lg text-secondary-300 leading-relaxed max-w-4xl mx-auto">
                            {algorithmInfos[sortingState.algorithm].description}
                        </p>
                    </div>
                    
                    {/* Complexity Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-secondary-600">
                                    <th className="px-6 py-4 text-xl font-semibold text-white-light border-r border-secondary-600" rowSpan={2}>
                                        Algorithm
                                    </th>
                                    <th className="px-6 py-4 text-xl font-semibold text-white-light border-r border-secondary-600" colSpan={3}>
                                        Time Complexity
                                    </th>
                                    <th className="px-6 py-4 text-xl font-semibold text-white-light">Space Complexity</th>
                                </tr>
                                <tr className="border-b border-secondary-600">
                                    <th className="px-6 py-3 text-sm font-medium text-secondary-300">Best</th>
                                    <th className="px-6 py-3 text-sm font-medium text-secondary-300">Average</th>
                                    <th className="px-6 py-3 text-sm font-medium text-secondary-300 border-r border-secondary-600">Worst</th>
                                    <th className="px-6 py-3 text-sm font-medium text-secondary-300">Worst</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(algorithmInfos).map((key, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors duration-200">
                                        <td className={`px-6 py-4 font-medium text-white-light border-r border-secondary-600 ${i === 0 ? "pt-6" : ""}`}>
                                            {algorithmInfos[key].name}
                                        </td>
                                        <td className={`px-6 py-4 ${i === 0 ? "pt-6" : ""}`}>
                                            <span 
                                                className={`px-3 py-1.5 rounded-lg text-sm font-mono font-semibold bg-${algorithmInfos[key].time_complexity.best[1]} cursor-help`}
                                                onMouseEnter={(e) => showTooltip(e, algorithmInfos[key].recurrence_relation.best)}
                                                onMouseLeave={hideTooltip}
                                            >
                                                {algorithmInfos[key].time_complexity.best[0]}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 ${i === 0 ? "pt-6" : ""}`}>
                                            <span 
                                                className={`px-3 py-1.5 rounded-lg text-sm font-mono font-semibold bg-${algorithmInfos[key].time_complexity.average[1]} cursor-help`}
                                                onMouseEnter={(e) => showTooltip(e, algorithmInfos[key].recurrence_relation.average)}
                                                onMouseLeave={hideTooltip}
                                            >
                                                {algorithmInfos[key].time_complexity.average[0]}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 border-r border-secondary-600 ${i === 0 ? "pt-6" : ""}`}>
                                            <span 
                                                className={`px-3 py-1.5 rounded-lg text-sm font-mono font-semibold bg-${algorithmInfos[key].time_complexity.worst[1]} cursor-help`}
                                                onMouseEnter={(e) => showTooltip(e, algorithmInfos[key].recurrence_relation.worst)}
                                                onMouseLeave={hideTooltip}
                                            >
                                                {algorithmInfos[key].time_complexity.worst[0]}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 ${i === 0 ? "pt-6" : ""}`}>
                                            <span className={`px-3 py-1.5 rounded-lg text-sm font-mono font-semibold bg-${algorithmInfos[key].space_complexity[1]}`}>
                                                {algorithmInfos[key].space_complexity[0]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Tooltip */}
            {tooltip.show && (
                <div 
                    className="fixed z-50 px-4 py-2 bg-secondary-800 text-white-light rounded-lg shadow-2xl border border-secondary-600 max-w-xs"
                    style={{
                        left: tooltip.x + 10,
                        top: tooltip.y - 40,
                        pointerEvents: 'none'
                    }}
                >
                    <div className="text-sm font-mono">
                        {tooltip.content}
                    </div>
                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-secondary-800"></div>
                </div>
            )}

            {/* Settings Dialog Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-effect rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold gradient-text">Settings</h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <svg className="w-6 h-6 text-white-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Audio Settings Section */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-white-light mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                                Audio Settings
                            </h3>
                            
                            {/* Master Audio Toggle */}
                            <div className="flex items-center justify-between mb-4 p-4 rounded-xl bg-white/5">
                                <div>
                                    <div className="font-medium text-white-light">Enable Audio</div>
                                    <div className="text-sm text-secondary-300">Master audio control</div>
                                </div>
                                <button
                                    onClick={() => setAudioSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${
                                        audioSettings.enabled ? 'bg-primary-500' : 'bg-secondary-600'
                                    }`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                        audioSettings.enabled ? 'translate-x-7' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>

                            {/* Volume Control */}
                            {audioSettings.enabled && (
                                <div className="mb-4 p-4 rounded-xl bg-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-white-light">Volume</span>
                                        <span className="text-sm text-secondary-300">{Math.round(audioSettings.volume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={audioSettings.volume}
                                        onChange={(e) => setAudioSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                                        className="w-full h-2 bg-secondary-600 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            )}

                            {/* Individual Sound Controls */}
                            {audioSettings.enabled && (
                                <div className="space-y-3">
                                    {[
                                        { key: 'comparisonSound', label: 'Comparison Sound', desc: 'Play when comparing elements' },
                                        { key: 'swapSound', label: 'Swap Sound', desc: 'Play when swapping elements' },
                                        { key: 'startSound', label: 'Start Sound', desc: 'Play when sorting begins' },
                                        { key: 'completeSound', label: 'Complete Sound', desc: 'Play when sorting finishes' },
                                        { key: 'newArraySound', label: 'New Array Sound', desc: 'Play when generating new array' }
                                    ].map(({ key, label, desc }) => (
                                        <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                            <div>
                                                <div className="font-medium text-white-light">{label}</div>
                                                <div className="text-sm text-secondary-300">{desc}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (key === 'comparisonSound') playComparisonSound();
                                                        else if (key === 'swapSound') playSwapSound();
                                                        else if (key === 'startSound') playStartSound();
                                                        else if (key === 'completeSound') playCompleteSound();
                                                        else if (key === 'newArraySound') playNewArraySound();
                                                    }}
                                                    className="px-3 py-1 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                                                >
                                                    Test
                                                </button>
                                                <button
                                                    onClick={() => setAudioSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                                                    className={`relative w-10 h-5 rounded-full transition-colors ${
                                                        audioSettings[key] ? 'bg-primary-500' : 'bg-secondary-600'
                                                    }`}
                                                >
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                                                        audioSettings[key] ? 'translate-x-5' : 'translate-x-0.5'
                                                    }`} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Close Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                            >
                                Close Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SortingChart;
