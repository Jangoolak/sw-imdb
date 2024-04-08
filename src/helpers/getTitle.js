import apiRequestRawHtml from "./apiRequestRawHtml"
import DomParser from "dom-parser"
import seriesFetcher from "./seriesFetcher"

export default async function getTitle(id) {
  const parser = new DomParser()
  const html = await apiRequestRawHtml(`https://www.imdb.com/title/${id}`)
  const dom = parser.parseFromString(html)

  if (dom.getElementsByTagName("title")[0].textContent === "404 Error - IMDb") {
    return { status: 404 }
  }

  const nextData = dom.getElementsByAttribute("id", "__NEXT_DATA__")
  const json = JSON.parse(nextData[0].textContent)
  const props = json.props.pageProps

  const getCast = (lookFor) => {
    const result = props.mainColumnData[lookFor].edges

    return result
      ? result.map((e) => {
          return {
            id: e.node.name.id,
            name: e.node.name.nameText.text,
          }
        })
      : []
  }

  const getCredits = (lookFor) => {
    const result = props.mainColumnData[lookFor]?.[0]?.credits

    return result
      ? result.map((e) => {
          return {
            id: e.name.id,
            name: e.name.nameText.text,
          }
        })
      : []
  }

  return {
    id: id,
    review_api_path: `/reviews/${id}`,
    imdb: `https://www.imdb.com/title/${id}`,
    contentType: props.aboveTheFoldData.titleType.id,
    contentRating: props.aboveTheFoldData?.certificate?.rating ?? "N/A",
    isSeries: props.aboveTheFoldData.titleType.isSeries,
    productionStatus:
      props.aboveTheFoldData.productionStatus.currentProductionStage.id,
    isReleased:
      props.aboveTheFoldData.productionStatus.currentProductionStage.id ===
      "released",
    title: props.aboveTheFoldData.titleText.text,
    image: props.aboveTheFoldData.primaryImage?.url ?? "",
    images: props.mainColumnData.titleMainImages.edges
      .filter((e) => e.__typename === "ImageEdge")
      .map((e) => e.node.url),
    plot: props.aboveTheFoldData.plot?.plotText?.plainText ?? "",
    runtime:
      props.aboveTheFoldData.runtime?.displayableProperty?.value?.plainText ??
      "",
    runtimeSeconds: props.aboveTheFoldData.runtime?.seconds ?? 0,
    rating: {
      count: props.aboveTheFoldData.ratingsSummary?.voteCount ?? 0,
      star: props.aboveTheFoldData.ratingsSummary?.aggregateRating ?? 0,
    },
    award: {
      wins: props.mainColumnData.wins?.total ?? 0,
      nominations: props.mainColumnData.nominations?.total ?? 0,
    },
    genre: props.aboveTheFoldData.genres.genres.map((e) => e.id),
    releaseDetailed: {
      date: new Date(
        props.aboveTheFoldData.releaseDate.year,
        props.aboveTheFoldData.releaseDate.month - 1,
        props.aboveTheFoldData.releaseDate.day,
      ).toISOString(),
      day: props.aboveTheFoldData.releaseDate.day,
      month: props.aboveTheFoldData.releaseDate.month,
      year: props.aboveTheFoldData.releaseDate.year,
      releaseLocation: {
        country: props.mainColumnData.releaseDate?.country?.text,
        cca2: props.mainColumnData.releaseDate?.country?.id,
      },
      originLocations:
        props.mainColumnData.countriesOfOrigin?.countries.map((e) => ({
          country: e.text,
          cca2: e.id,
        })) ?? [],
    },
    year: props.aboveTheFoldData.releaseDate.year,
    spokenLanguages:
      props.mainColumnData.spokenLanguages?.spokenLanguages.map((e) => ({
        language: e.text,
        id: e.id,
      })) ?? [],
    filmingLocations: props.mainColumnData.filmingLocations.edges.map(
      (e) => e.node.text,
    ),
    actors_v2: getCast("cast"),
    creators_v2: getCredits("creators"),
    directors_v2: getCredits("directors"),
    writers_v2: getCredits("writers"),
    ...(props.aboveTheFoldData.titleType.isSeries
      ? await seriesFetcher(id)
      : {}),
  }
}
