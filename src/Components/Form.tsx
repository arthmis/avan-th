import type { NodeForm } from "../graph";
import classes from "./Form.module.css";

type Props = {
  data: NodeForm;
  key: string;
};
export function Form({ data }: Props) {
  return (
    <form className={classes.border}>
      <h3>{data.nodeName}</h3>
      <button type="button">Submit</button>
    </form>
  );
}
