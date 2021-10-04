import { VercelRequest, VercelResponse } from '@vercel/node';
import got from 'got';
import { BotStatus, Status } from '../types/switch-bot-api';

const getBotState = async (id: string, token: string) => {
  const { body } = await got.get<{ body?: Status }>(
    `https://api.switch-bot.com/v1.0/devices/${id}/status`,
    {
      headers: {
        Authorization: token
      },
      responseType: 'json'
    }
  );

  if (body.body?.deviceType === 'Bot') {
    return (body.body as BotStatus).power === 'on';
  }

  throw new Error('Unknown device type');
};

const sendCommand = async (id: string, token: string, turnOn: boolean) => {
  await got.post(`https://api.switch-bot.com/v1.0/devices/${id}/commands`, {
    headers: {
      Authorization: token
    },
    json: {
      command: turnOn ? 'turnOn' : 'turnOff',
      parameter: 'default',
      commandType: 'command'
    },
    responseType: 'json'
  });
};

export default async (
  req: VercelRequest,
  res: VercelResponse
): Promise<void> => {
  const { deviceId, token } = req.query as {
    deviceId?: string;
    token?: string;
  };
  if (typeof deviceId !== 'string' || typeof token !== 'string') {
    res.status(400).send('Invalid request');
    return;
  }

  try {
    const currentStatus = await getBotState(deviceId, token);
    const nextStatus = !currentStatus;

    await sendCommand(deviceId, token, nextStatus);

    res.json({
      power: nextStatus ? 'on' : 'off'
    });
  } catch (e) {
    console.error(e);

    res.status(400).send('Request failed');
  }
};
