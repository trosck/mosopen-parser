import { readFile, writeFile } from "fs/promises"
import playwright, { Page, BrowserContext } from "playwright"
import { sleep, retryOnError } from "@trosckey/scraper-utils"
import { URLParams } from "@trosckey/url-params"
import { TAddress } from "@/aggregate";
import logger from "@/core/logger"
import BaseGeocoder from "./base";

const DEMO_URL = "https://gcweb.geoconcept.com/search.html"
const API_URL = "https://gcweb.geoconcept.com/GCWEBPROXY/geoconcept-web/api/lbs/geocode/v2.json"

export default class GeoconceptGeocoder extends BaseGeocoder {
  async openContext() {
    await super.openContext()
    await this.page?.goto(DEMO_URL)
  }

  async geocode(addresses: string[]): Promise<TAddress[]> {
    const result = await super.geocode([])

    const ApiUrl = new URLParams(API_URL)
    for (const address of addresses) {
      if (this.isStop) break

      ApiUrl.set("addressLine", address)

      logger.info(`Parse ${address}`)
      await sleep(500)

      await retryOnError(
        async () => {
          const response = await this.page?.evaluate(url => (
            fetch(url, {
              "referrerPolicy": "no-referrer",
              "body": null,
              "method": "GET",
              "credentials": "include"
            }).then(r => r.json())
          ), ApiUrl.url)
    
          const responseAddress = response?.geocodedAddresses?.[0]
          result.push({
            name: address,
            lat: responseAddress?.x,
            lon: responseAddress?.y
          })
        }, 2, async error => {
          logger.error(error)
          await this.closeContext()
          await this.openContext()
        }
      )
    }

    return result
  }
}

