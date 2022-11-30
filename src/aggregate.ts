import { readFile, writeFile } from "fs/promises";
import logger from "./core/logger";
import { TRegionWithStreetsAndHouses } from "./index";

/**
 * агрегация result.json, на выходе
 * получаем массив с названиями улиц
 * и домов
 */

export type TAddress = {
  name: string,
  lat: string,
  lon: string
}

// берем каждый N начиная с первого
const EVERY_N = 100

;(async () => {
  const regionsWithStreetsAndHouses = JSON.parse(
    await readFile("result.json", "utf-8")
  ) as TRegionWithStreetsAndHouses[]

  const addresses: string[] = []

  regionsWithStreetsAndHouses.forEach(region => {
    region.streets.forEach(street => {
      street.houses.forEach(house => {
        addresses.push([
          "Москва",
          house.full_name
        ].join(", "))
      })
    })
  })

  await writeFile(
    "result_aggregated.json",
    JSON.stringify(
      addresses.filter(
        (address, index) => index === 0 || (index + 1) % EVERY_N === 0
      )
    )
  )
})();
