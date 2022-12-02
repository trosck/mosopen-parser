import { JSDOM } from "jsdom";
import logger from "@/core/logger";
import axios from "@/core/axios";

export type TRegion = {
  name: string,
  full_name: string,
  link: string,
  code: string
}

export default async (): Promise<TRegion[]> => {
  const { data } = await axios.get("/regions")
  const { document } = new JSDOM(data).window

  const regions = Array.from(
    document.querySelectorAll("#regions_by_letters a")
  ).map(
    el => ({
      full_name: el.getAttribute("title") as string,
      link: el.getAttribute("href") as string,
      name: el.textContent as string,
      code: el.getAttribute("href")?.match(/\/region\/([\w-]+)/)?.[1] as string
    })
  )

  return regions
}
