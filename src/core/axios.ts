import axios from "axios"
import AxiosRetry from "axios-retry"

import logger from "@/core/logger"

AxiosRetry(
  axios,
  {
    retries: 5,
    retryDelay: () => 15000,
    retryCondition: () => true,
    shouldResetTimeout: true,
    onRetry: (retryCount, error) => {
      logger.error(
        `Error while fetching data, retries ${retryCount} time ` +
        `${error.name}: ${error.message}`
      )
    }
  }
)

const mosopenClient = axios.create({
  baseURL: "http://mosopen.ru",
  headers: {
    "Accept": "text/html,application/xhtml+xml,application/xml;" +
              "q=0.9,image/avif,image/webp,image/apng,*/*;" +
              "q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "en-US,en;q=0.9,ru;q=0.8,ru-RU;q=0.7",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "DNT": "1",
    "Host": "mosopen.ru",
    "Pragma": "no-cache",
    "Referer": "http://mosopen.ru/",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
                  "(KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
  }
})

export { axios, mosopenClient }
