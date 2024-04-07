import { Hono } from "hono"
import { cors } from "hono/cors"
import awards from "./routes/awards"
import critics from "./routes/critics"
import index from "./routes/index"
import reviews from "./routes/reviews"
import title from "./routes/title"
import raw from "./routes/raw"
import cache from "./helpers/cache"
import search from "./routes/search"
import userRoutes from "./routes/user"

const app = new Hono()

app.use("*", cors())
app.use("*", cache)

app.route("/awards", awards)
app.route("/critics", critics)
app.route("/search", search)
app.route("/title", title)
app.route("/raw", raw)
app.route("/reviews", reviews)
app.route("/user", userRoutes)
app.route("/", index)

app.fire()
