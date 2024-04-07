import { Hono } from "hono"
import apiRequestRawHtml from "../helpers/apiRequestRawHtml"
import DomParser from "dom-parser"

const raw = new Hono()

raw.get("/:id", async (c) => {
  const id = c.req.param("id")

  try {
    const parser = new DomParser()
    const html = await apiRequestRawHtml(`https://www.imdb.com/title/${id}`)
    const dom = parser.parseFromString(html)

    if (
      dom.getElementsByTagName("title")[0].textContent === "404 Error - IMDb"
    ) {
      c.status(404)
      return c.json({ message: "Not Found" })
    }

    const nextData = dom.getElementsByAttribute("id", "__NEXT_DATA__")
    const json = JSON.parse(nextData[0].textContent)
    const props = json.props.pageProps

    return c.json(props)
  } catch (error) {
    c.status(500)
    return c.json({
      message: error.message,
    })
  }
})

export default raw
