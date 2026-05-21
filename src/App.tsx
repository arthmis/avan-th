import "./App.css";
import { FormList } from "./Components/FormList";
import { useFetchGraph } from "./formsFetch";

function App() {
  const tenantId = "1";
  const actionBlueprintId = "1";
  const forms = useFetchGraph(tenantId, actionBlueprintId);

  return (
    <>
      {forms.type === "success" && <FormList forms={forms.data} />}
      {forms.type === "loading" && <h1>Loading</h1>}
      {forms.type === "error" && <h1>Error</h1>}
    </>
  );
}

export default App;
