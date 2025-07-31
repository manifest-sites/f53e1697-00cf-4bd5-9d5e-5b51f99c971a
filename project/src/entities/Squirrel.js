import { createEntityClient } from "../utils/entityWrapper";
import schema from "./Squirrel.json";
export const Squirrel = createEntityClient("Squirrel", schema);
