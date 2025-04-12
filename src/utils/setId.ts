import { ObjectId } from "mongodb";
import { SiteData } from "../types.js";

export function setId(item: SiteData) {
  return {
    ...item,
    _id: new ObjectId(),
  };
}
