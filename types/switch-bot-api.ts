type DefaultStatus = {
  deviceId: string;
  deviceType: string;
  hubDeviceId?: string;
};

export type BotStatus = DefaultStatus & {
  deviceType: 'bot';
  power: 'on' | 'off';
};

export type Status = BotStatus | DefaultStatus;
