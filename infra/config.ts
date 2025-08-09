import * as zod from 'zod';

const Env = zod.enum(['test', 'prod']);
type Env = zod.infer<typeof Env>;

export const AppConfig = zod.object({
  domain: zod.string(),
  certificateArn: zod.string(),
});
export type AppConfig = zod.infer<typeof AppConfig>;

export const loadConfig = (): AppConfig => {
  const env = Env.catch('test').parse($app.stage);

  const domain =
    $app.stage == env
      ? `api.${env}.marcelosavian.com`
      : `${$app.stage}.api.${env}.marcelosavian.com`;

  const config: Record<Env, AppConfig> = {
    test: {
      domain,
      certificateArn:
        'arn:aws:acm:eu-west-3:435238036861:certificate/da8d33e0-a1a4-4d00-902a-8bd6d30d5c83',
    },
    prod: {
      domain,
      certificateArn: 'to-be-created',
    },
  };

  return config[env];
};
