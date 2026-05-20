import "./App.css";
import { useFetchGraph } from "./formsFetch";

function App() {
  const tenantId = "1";
  const actionBlueprintId = "1";
  const graphFetch = useFetchGraph(tenantId, actionBlueprintId);
  switch (graphFetch.type) {
    case "success": {
      console.log(graphFetch.data);
      console.log(graphFetch.data.nodes[0].data.component_id);
      break;
    }
    case "loading": {
      console.log("loading graph");
      break;
    }
    case "error": {
      console.log(graphFetch.message);
    }
  }
  return <></>;
}

export default App;
