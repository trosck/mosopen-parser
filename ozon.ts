import { readFile, writeFile } from "fs/promises";
import playwright, { Browser, BrowserContext, Page } from "playwright";
import { retryOnError, sleep } from "@trosckey/scraper-utils";
import logger from "./src/core/logger";
import { TAddress } from "./src/aggregate";

const PRODUCT_ID = 335069561
const CART_URL = "https://www.ozon.ru/cart"
const CDP_URL = "ws://127.0.0.1:9222/devtools/browser/edaf2a68-9d74-4ea3-b45f-75bccd199a33"

/**
 * информация и максимальном количестве приходит только
 * при загрузке страницы, так что каждый раз надо грузить
 * https://www.ozon.ru/cart и парсить window.__NUXT__
 * 
 * нужные значения в одном из свойств
 * - stockMaxQty
 * - availability
 */

let stop = false
process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  stop = true
});

let browser: Browser | null = null
let page: Page | null = null

type TAddressWithAvailability = TAddress & {
  stock?: number,
  availability?: number
}

;(async () => {
  browser = await playwright.chromium.connectOverCDP(CDP_URL)

  const addresses = JSON.parse(
    await readFile("t.json", "utf-8")
  ) as TAddressWithAvailability[]

  logger.info("Cart updated")

  const result: TAddressWithAvailability[] = []
  for (const address of addresses) {
    try {
      if (stop) break

      page = await browser.newPage()

      await page.goto(CART_URL)
      await addToCart(PRODUCT_ID)

      logger.info("Set address " + address.name);
      await setAddress({ lat: address.lat, lon: address.lon });

      logger.info("Reload page");
      await page.goto(CART_URL)

      logger.info("Get product info");
      const product = await getProduct();

      address.stock = product.stockMaxQty
      address.availability = product.availability

      logger.info(address)
      result.push(address)

      await sleep(750)
    } catch(e) {
      logger.error(e)
    } finally {
      await page?.close()
    }
  }

  await writeFile(
    `product_delivery.${PRODUCT_ID}.json`,
    JSON.stringify(result, null, 1)
  )

  await browser.close()
})();


async function addToCart(product_id: number) {
  return page?.evaluate(id => (
    fetch('https://www.ozon.ru/api/composer-api.bx/_action/addToCart', {
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: JSON.stringify([{ id, quantity: 1 }])
    }).then(r => r.json())
  ), product_id)
}

async function setAddress({ lat, lon }: { lat: number | string, lon: number | string }) {
  return page?.evaluate(({ lat, lon }) => (
    fetch(`https://www.ozon.ru/api/composer-api.bx/page/json/v2?url=/modal/commonDelivery?lat=${lat}&long=${lon}&pid=7&tab=c`, {
      "headers": {
        "content-type": "application/json",
      },
      "body": "{}",
      "method": "POST",
      "credentials": "include"
    }).then(r => r.json())
  ), { lat, lon })
}

async function getProduct() {
  return page?.evaluate(() => (
    // @ts-ignore
    Object.values(window.__NUXT__.state.trackingPayloads).map(
      // @ts-ignore
      payload => JSON.parse(payload)
    ).filter(
      item => item?.type === "product" && typeof item.id === "number"
    )?.[0]
  ))
}
