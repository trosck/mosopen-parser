import { TAddress } from "@/aggregate";
import { Browser, BrowserContext, Page } from "playwright";

export default class BaseGeocoder {
  /**
   * для остановки геокодирования надо выставить true,
   * в следующей цикле(при следующем адресе) задача
   * остановится
   */
  isStop: boolean = false
  page: Page | null = null
  context: BrowserContext | null = null

  constructor(private readonly browser: Browser) {}

  async openContext() {
    this.context = await this.browser.newContext()
    this.page = await this.context.newPage()
  }

  async closeContext() {
    await this.page?.close()
    await this.context?.close()
  }

  async geocode(addresses: string[]): Promise<TAddress[]> {
    await this.openContext()
    return []
  }

  stop() {
    this.isStop = true
  }
}
