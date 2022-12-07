import { TAddress } from "@/aggregate";
import BaseBrowser from "@/core/browser";

export default class BaseGeocoder extends BaseBrowser {
  /**
   * для остановки геокодирования надо выставить true,
   * в следующей цикле(при следующем адресе) задача
   * остановится
   */
  isStop: boolean = false

  async geocode(addresses: string[]): Promise<TAddress[]> {
    await this.openContext()
    return []
  }

  stop() {
    this.isStop = true
  }
}
