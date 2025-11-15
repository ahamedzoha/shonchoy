import { BrowserRouter as Router } from "react-router-dom";

import { AppProvider } from "./providers/AppProvider";
import { AppRoutes } from "./routes/Router";

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;
