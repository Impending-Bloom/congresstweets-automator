import asyncReplace from 'string-replace-async'
import _ from 'lodash'
import {
  buildQueries,
  checkDateValidity,
  getActualUrl,
  getTime,
} from './util'

export class Tweet {

  // Retrieve the link to use for GET requests on start up
  static getLink(data, isRetweet) {
    const { user: { screen_name: screenName }, id_str: tweetId } = isRetweet ? data.retweeted_status : data
    return `https://www.twitter.com/${screenName}/statuses/${tweetId}`
  }

  // Parse and clean URLs asynchronously
  static async replaceUrls(data) {
    return asyncReplace(data.full_text, /(\bhttps\:\/\/t\.co\/\w+\b)/gi, async (match) => {
      const nonMediaUrl = (data.entities.urls.find(item => item.url === match) || {}).expanded_url
      if (!nonMediaUrl) {
        if (!_.has(data, 'extended_entities.media')) return match

        const mediaUrls = data.extended_entities.media.filter(item => item.url === match)
        if (!mediaUrls.length) return match
        return mediaUrls.map((item) => {
          if (item.type === 'photo') return item.media_url
          return `${item.media_url} ${_.minBy(item.video_info.variants, 'bitrate').url}`
        }).join(' ')
      } else if (!nonMediaUrl.includes('facebook.com/') && /\.\w{1,4}\/\w+$/.test(nonMediaUrl)) {
        return getActualUrl(nonMediaUrl)
      }
      return nonMediaUrl
    })
  }

  // Parse and clean Tweet text
  static async parseText(data, isRetweet, isQuote) {
    if (isRetweet) {
      if (isQuote) {
        return `RT @${data.retweeted_status.user.screen_name} ` +
          `${await this.replaceUrls(data.retweeted_status)} ` +
          `QT @${data.retweeted_status.quoted_status.user.screen_name} ` +
          `${await this.replaceUrls(data.retweeted_status.quoted_status)}`
      } return `RT @${data.retweeted_status.user.screen_name} ${await this.replaceUrls(data.retweeted_status)}`
    } else if (isQuote) return `${await this.replaceUrls(data)} QT @${data.quoted_status.user.screen_name} ${await this.replaceUrls(data.quoted_status)}`
    return this.replaceUrls(data)
  }

  // Create a new Tweet object
  static async create(data) {
    const isRetweet = !!data.retweeted_status
    const isQuote = !!data.quoted_status || _.has(data, 'retweeted_status.quoted_status')
    data.parsed_text = await this.parseText(data, isRetweet, isQuote)
    data.link = this.getLink(data, isRetweet)
    return Promise.resolve(new Tweet(data))
  }

  // Tweet Constructor
  constructor(data) {
    this.id = data.id_str
    this.screen_name = data.user.screen_name
    this.user_id = data.user.id_str
    this.time = getTime(new Date(data.created_at), true)
    this.link = data.link
    this.text = data.parsed_text
    this.source = data.source.split('"nofollow"\>')[1].slice(0, -4)
  }
}