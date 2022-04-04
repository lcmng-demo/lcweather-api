import axios, { AxiosRequestConfig } from 'axios';
import moment from 'moment';

import {
  forecastDay,
  lcEvent,
  eventWeather,
  weatherRes
} from '../objects';
import Constants from '../constants';

const isValidEvent = (event: lcEvent): boolean => {
  const today: moment.Moment = moment().startOf('day');
  const hasLocationData: boolean = !!event.postCode ||
    (Number.isFinite(event.lat) && Number.isFinite(event.long));
  const eventDate: moment.Moment = moment(event.eventDate).startOf('day');
  const hasValidDate: boolean = eventDate.isValid();
  const withinDateRange: boolean = hasValidDate &&
    0 <= eventDate.diff(today, 'days') &&
    eventDate.diff(today, 'days') <= 3;
  return hasLocationData && withinDateRange;
};

const getWeather = async (event: lcEvent): Promise<any> => {
  const payload: AxiosRequestConfig = {
    params: {
      key: process.env.WEATHER_API_KEY,
      q: event.postCode || `${event.lat},${event.long}`,
      dt: event.eventDate,
    }
  };
  const forecastRes = await axios.get(`${process.env.WEATHER_URL}/forecast.json`, payload);
  return forecastRes;
};

const processEvents = async (details: any[]): Promise<eventWeather[]> => {
  const events: Promise<eventWeather>[] = details.map(async (event: lcEvent) => {
    if (!isValidEvent(event)) {
      return {
        uuid: event.uuid,
        error: Constants.INVALID_EVENT_ERR,
      } as eventWeather;
    }

    const res = await getWeather(event);
    if (!res.data) {
      return {
        uuid: event.uuid,
        error: Constants.NO_FORECAST_DATA_ERR,
      } as eventWeather;
    }

    const details: weatherRes = res.data;
    const matchedDay = details.forecast.forecastday.find((element: forecastDay) => {
      return element.date === event.eventDate;
    }) as forecastDay;
    if (!matchedDay) {
      return {
        uuid: event.uuid,
        error: Constants.NO_DAY_ERR,
      } as eventWeather;
    }

    return {
      uuid: event.uuid,
      weather: {
        temperature: matchedDay.day.temp,
        feelsLike: details.current.feelslike_f,
        condition: matchedDay.day.condition.text,
        rainChance: matchedDay.day.daily_chance_of_rain,
        snowChance: matchedDay.day.daily_chance_of_snow,
        windSpeed: details.current.wind_mph,
      },
    } as eventWeather;
  });
  return Promise.all(events);
};

export default {
  getWeather,
  isValidEvent,
  processEvents,
};