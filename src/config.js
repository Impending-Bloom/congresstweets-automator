/* eslint-disable */
export const TWITTER_CONFIG = {
  bearer_token: process.env.TWITTER_BEARER_AUTH_TOKEN,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  webhook_prod: process.env.TWITTER_WEBHOOK_PROD_ENV,
  webhook_dev: process.env.TWITTER_WEBHOOK_DEV_ENV,
  app_id: process.env.TWITTER_APP_ID,
  user_id: process.env.TWITTER_USER_ID,
  list_id: process.env.TWITTER_CONGRESS_MEMBER_LIST_ID,
};

export const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
export const TIME_ZONE = process.env.TIME_ZONE || 'America/New_York';
/* eslint-enable */
