/* eslint-disable */
export const TWITTER_CONFIG = {
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  webhook_env: process.env.TWITTER_WEBHOOK_ENV,
  list_id: process.env.TWITTER_LIST_ID,
};

export const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;

export const APP_CONFIG = {
  TWITTER_CONFIG,
  GOOGLE_APPLICATION_CREDENTIALS,
}
/* eslint-enable */
