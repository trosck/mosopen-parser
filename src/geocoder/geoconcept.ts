import { readFile, writeFile } from "fs/promises"
import playwright, { Page, BrowserContext } from "playwright"
import { sleep, retryOnError } from "@trosckey/scraper-utils"
import { URLParams } from "@trosckey/url-params"
import { TAddress } from "@/aggregate";
import logger from "@/core/logger"

const CDP_URL = ""
const DEMO_URL = "https://gcweb.geoconcept.com/search.html"
const API_URL = "https://gcweb.geoconcept.com/GCWEBPROXY/geoconcept-web/api/lbs/geocode/v2.json"

;(async () => {
  const addresses = JSON.parse(
    await readFile("result_aggregated.json", "utf-8")
  ) as string[]

  const ApiUrl = new URLParams(API_URL)

  const browser = await playwright.chromium.connectOverCDP(CDP_URL)
  let context: BrowserContext | null = await browser.newContext()
  let page: Page | null = await context.newPage()

  const openContext = async () => {
    context = await browser.newContext()
    page = await context.newPage()
    await page.goto(DEMO_URL)
  }

  const closeContext = async () => {
    await page?.close()
    await context?.close()
  }

  const result: TAddress[] = []
  for (const address of addresses) {
    ApiUrl.set("addressLine", address)

    logger.info(`Parse ${address}`)
    await sleep(500)

    await retryOnError(
      async () => {
        const response = await page?.evaluate(url => (
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
        await closeContext()
        await openContext()
      }
    )
  }

  await writeFile("result_addresses.json", JSON.stringify(result))
  await closeContext()
})();
