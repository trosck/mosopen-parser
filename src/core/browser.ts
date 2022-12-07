import { Browser, BrowserContext, Page } from "playwright";

export default class BaseBrowser {
  page: Page | null = null
  context: BrowserContext | null = null

  constructor(readonly browser: Browser) {}

  async openContext() {
    this.context = await this.browser.newContext()
    this.page = await this.context.newPage()
  }

  async closeContext() {
    await this.page?.close()
    await this.context?.close()
  }
}
