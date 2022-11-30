import { readFile, writeFile } from "fs/promises"
import playwright, { Page, BrowserContext } from "playwright"
import { sleep, retryOnError } from "@trosckey/scraper-utils"
import { URLParams } from "@trosckey/url-params"
import { TAddress } from "@/aggregate";
import logger from "@/core/logger"

const CDP_URL = "ws://127.0.0.1:9222/devtools/browser/edaf2a68-9d74-4ea3-b45f-75bccd199a33"
const DEMO_URL = "https://dadata.ru/api/geocode/"
const API_URL = "https://dadata.ru/demo/v2/clean/address"

let stop = false
process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  stop = true
});

;(async () => {
  const addresses = JSON.parse(
    await readFile("result_aggregated.json", "utf-8")
  ) as string[]

  const browser = await playwright.chromium.connectOverCDP(CDP_URL)
  let context: BrowserContext | null = null
  let page: Page | null = null

  const openContext = async () => {
    context = await browser.newContext()
    page = await context.newPage()
    await page.goto(DEMO_URL)
    await page.waitForSelector(".api-sampler__header")
  }

  const closeContext = async () => {
    await page?.close()
    await context?.close()
  }

  await openContext()

  const result: TAddress[] = []
  for (const address of addresses) {
    if (stop) break

    logger.info(`Parse ${address}`)
    await sleep(1000)

    await retryOnError(
      async () => {
        const response = await page?.evaluate(({ url, address }) => {
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
        }, { url: API_URL, address })
  
        const responseAddress = response?.[0]
        result.push({
          name: address,
          lat: responseAddress.geo_lat,
          lon: responseAddress.geo_lon
        })
      }, 2, async error => {
        logger.error(error)
        await closeContext()
        await openContext()
      }
    )
  }

  await writeFile("result_addresses.json", JSON.stringify(result))
  await closeContext()
  await browser.close()
})();
