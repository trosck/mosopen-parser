import { JSDOM } from "jsdom";
import logger from "@/core/logger";
import { mosopenClient } from "@/core/axios";
import { TRegion } from "./regions";

export type TStreet = {
  /** Название улицы */
  name: string,
  /** Уникальный ID улицы на портале */
  id: string,
  /** Ссылка улицы на портале */
  link: string
}

export default async (region: TRegion): Promise<TStreet[]> => {
  const { data } = await mosopenClient.get(`/region/${region.code}/streets`)
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
