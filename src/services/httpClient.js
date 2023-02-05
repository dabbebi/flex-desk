import axios from "axios";
import { url } from "./url";


export const client = axios.create({ baseURL: url });