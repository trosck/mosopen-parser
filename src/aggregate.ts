import { readFile, writeFile } from "fs/promises";
import { TRegionWithStreetsAndHouses } from "./index";

/**
 * агрегация addresses.json, на выходе
 * получаем массив с названиями улиц
 * и домов
 */

export type TAddress = {
  name: string,
  lat: string,
  lon: string
}

;(async () => {
  const regionsWithStreetsAndHouses = JSON.parse(
    await readFile("addresses.json", "utf-8")
  ) as TRegionWithStreetsAndHouses[]

  const addresses: string[] = []

  regionsWithStreetsAndHouses.forEach(region => {
    region.streets.forEach(street => {
      street.houses.forEach(house => {
        addresses.push(`Москва, ${house.full_name}`)
      })
    })
  })

  await writeFile("addresses_list.json", JSON.stringify(addresses))
})();
