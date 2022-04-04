export type eventWeather = {
  uuid: string,
  weather?: {
    temperature: number, // in degF
    feelsLike: number, // in degF
    condition: string,
    rainChance: number,
    snowChance: number,
    windSpeed: number,
  },
  error?: string,
};