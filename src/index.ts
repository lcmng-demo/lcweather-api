import express from 'express';
import bodyParser from 'body-parser';

import { weatherApi } from './api';
import { eventWeather } from './objects';

const app: express.Application = express();
const port = process.env.PORT || 8888;

app.use(bodyParser.json());

app.post('/api', async (req: express.Request, res: express.Response) => {
  try {
    const eventRequests: any[] = req.body.events;
    const weatherResults: eventWeather[] = await weatherApi.processEvents(eventRequests);
    res.status(200).json(weatherResults);
  } catch(err) {
    res.status(500).send(err);
  }
});

app.listen(port, () => {
  console.log('App listening on port: ', port);
});