import { writeFile } from "fs/promises";
import { sleep } from "@trosckey/scraper-utils"

import parse_regions, { TRegion } from "@/tasks/regions"
import parse_houses, { THouse } from "@/tasks/houses"
import parse_streets, { TStreet } from "@/tasks/streets"
import logger from "@/core/logger";

export type TStreetWithHouses = TStreet & { houses: THouse[] }
export type TRegionWithStreetsAndHouses = TRegion & { streets: TStreetWithHouses[] }

;(async () => {
  const result = await parse_regions() as TRegionWithStreetsAndHouses[]

  for (const region of result) {
    logger.info("")
    logger.info(`Parse region "${region.name}"`)
    await sleep(1000)

    const streets = await parse_streets(region) as TStreetWithHouses[]
    for (const street of streets) {
      logger.info(`Parse street "${street.name}"`)
      await sleep(1000)

      street.houses = await parse_houses(street)
    }

    region.streets = streets
  }

  await writeFile(`result.json`, JSON.stringify(result))
})();
