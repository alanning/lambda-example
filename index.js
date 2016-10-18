"use strict"

//////////////////////////////////////////////////////////////////////
// Reset networks 
const MongoClient = require('mongodb').MongoClient

let config = {}
try {
  config = require('./env.json')
} catch (doesNotExit) {}

const mongoDbUrl = process.env.MONGO_URL || config.MONGO_URL
const DEFAULT_ACTIVITY_TYPE = 5

exports.handler = function handler(event, context, callback) {
  return MongoClient.connect(mongoDbUrl)
    .then(function resetNetworks(db) {
      const networks = db.collection('networks')
      const now = new Date()
      const oneHour = 60 * 60 * 1000
      const cutOffTime = new Date(now.getTime() - oneHour)
      return networks.updateMany(
        {
          $and: [
            {$or: [
              {'latestUserActivity': {$exists: false}},
              {'latestUserActivity': {$eq: null}},
              {'latestUserActivity.t': {$lt: cutOffTime}}
            ]},
            {$or: [
              {'latestApiActivity': {$exists: false}},
              {'latestApiActivity': {$eq: null}},
              {'latestApiActivity.t': {$lt: cutOffTime}}
            ]}
          ]
        },
        {$set: {
          drill: false,
          reset: now,
          latestActivityType: DEFAULT_ACTIVITY_TYPE
        }})
        .then(
          () => db.close(),
          (error) => {
            db.close()
            throw error
          }
        )
    })
    .then(() => callback(null), callback)
}
