import { Files } from "./files";
import { Events } from "./events";


export class Rpcs extends Events.Group.merge(Files.Group) {}