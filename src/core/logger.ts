import { pino } from "pino"
import PinoPretty from "pino-pretty"

const stream = PinoPretty({
  colorize: true,
  ignore: "pid,hostname"
})

const logger = pino(stream)

export default logger
