import { loadConfig } from './config';

const config = loadConfig();

export const emailSES = new sst.aws.Email('MyEmail', {
  sender: config.domain,
});
