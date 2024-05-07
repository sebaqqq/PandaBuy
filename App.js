import "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Navigation from "./components/Routes/Navigation";

export default function App() {
  return (
    <SafeAreaProvider>
      <Navigation />
    </SafeAreaProvider>
  );
}
