import { useState } from "react";

import { Button } from "@workspace/ui/components/button";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center">
        <Button> Button </Button>
      </div>
      --------------------------------
      <h1>Vite + React</h1>
      <div className="card bg-red-500">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
