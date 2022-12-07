import { readFile, writeFile } from "fs/promises"
import playwright from "playwright"
import cli from "cli"

import dotenv from "dotenv"
dotenv.config()

import logger from "@/core/logger"
import DadataGeocoder from "./geocoder/dadata";
import GeoconceptGeocoder from "./geocoder/geoconcept";

const { type, cdp_url } = cli.parse({
  file: [ "t", "Geocoder type", "string", "dadata"],
  cdp_url: ["cdp", "Chrome cdp ws URL", "string"]
});

;(async () => {
  const addresses = JSON.parse(
    await readFile("addresses_list.json", "utf-8")
  ) as string[]

  const browser = await playwright.chromium.connectOverCDP(
    cdp_url || process.env?.cdp_url
  )

  const geocoder = new (
    type === "dadata"
      ? DadataGeocoder
      : GeoconceptGeocoder
  )(browser)

  process.on("SIGINT", function() {
    logger.info("Caught interrupt signal")
    geocoder.stop()
  });

  const result = await geocoder.geocode(addresses)

  await geocoder.closeContext()
  await browser.close()

  await writeFile("addresses_with_geo.json", JSON.stringify(result))
})();
