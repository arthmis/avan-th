import classes from "./App.module.css";

import { GraphView } from "./Components/GraphView";

function App() {
  return (
    <div className={classes.app}>
      <GraphView />
    </div>
  );
}

export default App;
