type forecastDay = {
  date: string,
  day: {
    temp: number,
    condition: {
      text: string,
    },
    daily_chance_of_rain: number,
    daily_chance_of_snow: number,
  }
}

type weatherRes = {
  location: {
    name: string,
  },
  current: {
    feelslike_f: number,
    wind_mph: number,
  }
  forecast: {
    forecastday: forecastDay[],
  }
}

export type {
  forecastDay,
  weatherRes,
}