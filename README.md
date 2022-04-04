# LiveControl Weather Assignment

## Synopsis
A demo API that leverages a weather api (https://www.weatherapi.com) to determine the forecast for a provided list of events.

The project uses express to serve one API endpoint (`/api`) that makes callouts to the Weather API using the axios library. There is some light validation that occurs prior to sending a callout for an event, including:
- checking the date of the event to be within 3 days
- ensuring that there is location data included (either postal code or lat/long)

All provided events will be included in the response in some fashion, either augmented with weather information from the API, or with an error message indicating why weather information was not included. Unnecessary properties provided from the request will be discarded in the provided responses, with only event UUIDs being returned.

## Local setup
- Prerequisites
  - Heroku CLI (used to load `.env`)
    - If the CLI is not available locally, there will need to be some code edits made to be able to inject `.env` properly
  - Node (including `npm`)
  - Token for weatherapi.com
- ```npm i```
- Copy `.env.template` to `.env` and populate `WEATHER_API_KEY` with valid token for Weather API
- `npm run dev`
  - Note: `start` will not load `.env` automatically

## Usage
Endpoint: `/api` (accepts POST)

Request body:
```
{
  "events": [
    {
      "uuid": string, // uuid for an event

      "eventDate": string, // yyyy-MM-DD format for a date

      "postCode": (optional) string, // postal code for lookup

      "lat": (optional) number, // latitude value for lookup

      "long": (optional) number, // longitude value for lookup
      ... // further values can be provided but will be ignored
    }
    ... // volume limits dependent on remaining daily requests for weather API
  ]
}
```
Notes:
- To properly look up a location, either `postCode` or __both__ `lat` and `long` must be provided.
- Duplicated UUIDs will each return its own response


Response:
```
[
  {
    "uuid": string, // uuid provided from original request

    "weather": object, // weather data from weather API for the date (if available)

    "error": string, // error associated with looking up the event's data (if available)
  },
  ... // other events, if provided
]
```

## Potential Changes/Enhancements
- Accept weather API key instead of using internal key. This will pass on usage costs to the consumer instead of allowing consumers to potentially overload the included account
- Leverage TypeScript appropriately (typing, classes, etc.)
- Include linters
- Weather API provides Imperial as well as metric. Better UX would be provide an optional switch for which units to return
- Rate control for requests made to the API
- More nuance in error messages for reason validation failed instead of generic "can't process" message at the moment

## Callouts
- Data for "feels like" and "wind speed" are only available for "current day" from the Forecast API and not for the specified date
- Would need to clarify whether "name" is necessary as part of the request. Since it has no bearing on the API callout itself, and the UUID provided can already uniquely associate and identify the incoming and returned events, "name" is not incorporated at the moment but may still be desirable