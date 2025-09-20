import SortingChart from "./components/SortingChart";
import SortingProvider from "./contexts/SortingContext";

function App() {
    return (
        <SortingProvider>
            <SortingChart />
        </SortingProvider>
    );
}

export default App;
