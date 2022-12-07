import { JSDOM } from "jsdom";
import { mosopenClient } from "@/core/axios";
import { TStreet } from "./streets";

export type THouse = {
  /** Номер дома */
  name: string,
  /** Адрес с улицей и номером дома */
  full_name: string,
  /** Ссылка дома на портале */
  link: string
}

export default async (street: TStreet): Promise<THouse[]> => {
  const { data } = await mosopenClient.get(`/street/${street.id}`)
  const { document } = new JSDOM(data).window

  const regions = Array.from(
    document.querySelectorAll("script + p a")
  ).map(
    el => ({
      full_name: el.getAttribute("title") as string,
      link: el.getAttribute("href") as string,
      name: el.textContent as string,
    })
  )

  return regions
}
