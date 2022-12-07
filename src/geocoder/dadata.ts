import { sleep, retryOnError } from "@trosckey/scraper-utils"
import { TAddress } from "@/aggregate";
import logger from "@/core/logger"
import BaseGeocoder from "./base";

const DEMO_URL = "https://dadata.ru/api/geocode/"
const API_URL = "https://dadata.ru/demo/v2/clean/address"

export default class DadataGeocoder extends BaseGeocoder {
  async openContext() {
    await super.openContext()
    await this.page?.goto(DEMO_URL)
    await this.page?.waitForSelector(".api-sampler__header")
  }

  async geocode(addresses: string[]): Promise<TAddress[]> {
    const result = await super.geocode([])

    for (const address of addresses) {
      if (this.isStop) break

      logger.info(`Parse ${address}`)
      await sleep(1000)

      await retryOnError(
        async () => {
          const response = await this.page?.evaluate(
            ({ url, address }) => {
              // @ts-ignore
              const { CSRF_TOKEN, API_KEY } = window.DA.settings
              return fetch(url, {
                "headers": {
                  "authorization": `Token ${API_KEY}`,
                  "content-type": "application/json",
                  "x-csrftoken": CSRF_TOKEN
                },
                "body": JSON.stringify([address]),
                "method": "POST",
                "credentials": "include"
              }).then(r => r.json())
            },
            { url: API_URL, address }
          )
    
          const responseAddress = response?.[0]
          result.push({
            name: address,
            lat: responseAddress.geo_lat,
            lon: responseAddress.geo_lon
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
