import axios from 'axios';
import moment from 'moment';
import { randomInt, randomUUID } from 'crypto';

import { weatherApi } from '../api';
import { eventWeather, lcEvent, weatherRes } from '../objects';
import Constants from '../constants';
import weather from '../api/weather';

const DATE_FORMAT = 'yyyy-MM-DD';
const priorDateEvent: lcEvent = {
  uuid: randomUUID(),
  eventDate: moment().subtract(2, 'days').format(DATE_FORMAT),
  postCode: '10010',
};
const validEvent: lcEvent = {
  uuid: randomUUID(),
  eventDate: moment().add(1, 'days').format(DATE_FORMAT),
  postCode: '90210',
};
const validLatLongEvent: lcEvent = {
  uuid: randomUUID(),
  eventDate: moment().format(DATE_FORMAT),
  lat: 48.864716,
  long: 2.349014,
}
const futureDateEvent: lcEvent = {
  uuid: randomUUID(),
  eventDate: moment().add(5, 'days').format(DATE_FORMAT),
  postCode: 'ON L3R 0Y5',
};
const missingLocationEvent: lcEvent = {
  uuid: randomUUID(),
  eventDate: moment().format(DATE_FORMAT),
};
const allData: lcEvent[] = [
  priorDateEvent,
  validEvent,
  validLatLongEvent,
  futureDateEvent,
  missingLocationEvent,
];

const generateRandomForecast = (params: any) => {
  return {
    data: {
      location: {
        name: 'randomville' + randomInt(999),
      },
      current: {
        feelslike_f: Math.random() * 100,
        wind_mph: Math.random() * 20,
      },
      forecast: {
        forecastday: [
          {
            date: params.dt,
            day: {
              temp: randomInt(100),
              condition: {
                text: 'Sunny',
              },
              daily_chance_of_rain: randomInt(100),
              daily_chance_of_snow: randomInt(100),
            }
          }
        ]
      }
    } as weatherRes
  };
};

describe('API functions test', () => {

  it('processes valid events', () => {
    expect.assertions(5);

    const earlyDateInvalid = weatherApi.isValidEvent(priorDateEvent);
    expect(earlyDateInvalid).toBe(false);

    const validEventValid = weatherApi.isValidEvent(validEvent);
    expect(validEventValid).toBe(true);

    const validLocationValid = weatherApi.isValidEvent(validLatLongEvent);
    expect(validLocationValid).toBe(true);

    const futureDateInvalid = weatherApi.isValidEvent(futureDateEvent);
    expect(futureDateInvalid).toBe(false);

    const missingLocationInvalid = weatherApi.isValidEvent(missingLocationEvent);
    expect(missingLocationInvalid).toBe(false);
  });

  it('calls out to api using latlong', () => {
    const replaceImp = (details: lcEvent) => {
      return async (url: string, config: any) => {
        expect(config.params.dt).toBe(details.eventDate);
        if (details.postCode) {
          expect(config.params.q).toBe(details.postCode);
        } else {
          expect(config.params.q).toBe(`${details.lat},${details.long}`);
        }
        expect(config.params.key).toBe(process.env.WEATHER_API_KEY);
      };
    };

    expect.assertions(6);

    jest.spyOn(axios, 'get').mockImplementationOnce(replaceImp(validEvent));
    weatherApi.getWeather(validEvent);

    jest.spyOn(axios, 'get').mockImplementationOnce(replaceImp(validLatLongEvent));
    weatherApi.getWeather(validLatLongEvent);
  });

  it ('processes a list of supplied events', async () => {
    jest.spyOn(axios, 'get').mockImplementation(async (url: string, config: any) => {
      return generateRandomForecast(config.params);
    });
    expect.assertions(6);

    const response: eventWeather[] = await weatherApi.processEvents(allData);
    expect(response.length).toBe(allData.length);

    response.forEach((weatherResponse: eventWeather) => {
      switch (weatherResponse.uuid) {
        case priorDateEvent.uuid: {
          expect(weatherResponse.error).toBe(Constants.INVALID_EVENT_ERR);
          break;
        }
        case validEvent.uuid: {
          expect(weatherResponse).toHaveProperty('weather');
          break;
        }
        case validLatLongEvent.uuid: {
          expect(weatherResponse).toHaveProperty('weather');
          break;
        }
        case futureDateEvent.uuid: {
          expect(weatherResponse.error).toBe(Constants.INVALID_EVENT_ERR);
          break;
        }
        case missingLocationEvent.uuid: {
          expect(weatherResponse.error).toBe(Constants.INVALID_EVENT_ERR);
          break;
        }
        default:
          expect(weatherResponse).toHaveProperty('weather');
      }
    });
  });

});