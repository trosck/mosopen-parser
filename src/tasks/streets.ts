import { JSDOM } from "jsdom";
import logger from "@/core/logger";
import axios from "@/core/axios";
import { TRegion } from "./regions";

export type TStreet = {
  name: string,
  id: string,
  link: string
}

export default async (region: TRegion): Promise<TStreet[]> => {
  const { data } = await axios.get(`/region/${region.code}/streets`)
  const { document } = new JSDOM(data).window

  const streets = Array.from(
    document.querySelectorAll("#content div ul li a")
  ).map(
    el => ({
      id: el.getAttribute("href")?.match(/\/street\/(\d+)/)?.[1] as string,
      link: el.getAttribute("href") as string,
      name: el.textContent as string,
    })
  )

  return streets
}
