'use strict'

const MockDate = require('mockdate')
const MongoClient = require('mongodb').MongoClient
const mongoDbUrl = 'mongodb://localhost:27017/resetNetworksTesting'
const handler = function handler(event, context) {
  return new Promise((resolve, reject) => {
    require('../index').handler(event, context, function (error, result) {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}
const TEST_ACTIVITY_TYPE = 10

describe('handler', function () {
  let db

  before(function () {
    return MongoClient.connect(mongoDbUrl)
      .then((dbConnection) => db = dbConnection)
  })

  beforeEach(function () {
    process.env.MONGO_URL = mongoDbUrl
  })

  it('resets all networks that had no activity in the last hour', function () {
    return setNetworkFixtures(
      [
        {
          code: 'A',
          reset: null,
          latestUserActivity: {
            t: new Date('2014-05-12T14:30:00.000Z')
          },
          latestActivityType: TEST_ACTIVITY_TYPE
        },
        {
          code: 'B',
          reset: null,
          latestApiActivity: {
            t: new Date('2014-05-12T14:30:00.000Z')
          },
          latestActivityType: TEST_ACTIVITY_TYPE
        },
        {
          code: 'C',
          reset: null,
          latestUserActivity: {
            t: new Date('2014-05-12T14:30:00.000Z')
          },
          latestApiActivity: {
            t: new Date('2014-05-12T14:30:00.000Z')
          },
          latestActivityType: TEST_ACTIVITY_TYPE
        },
      ])
      .then(() => {
        MockDate.set(new Date('2014-05-12T15:30:01.000Z'))
        return handler({}, {})
      })
      .then(() => MockDate.reset())
      .then(() => {
        return findNetwork('A')
          .then((networkA) => {
            expect(networkA).toEqual(jasmine.objectContaining({
              reset: new Date('2014-05-12T15:30:01.000Z'),
              drill: false,
              latestActivityType: 5
            }))
          })
      })
      .then(() => {
        return findNetwork('B')
          .then((networkB) => {
            expect(networkB).toEqual(jasmine.objectContaining({
              reset: new Date('2014-05-12T15:30:01.000Z'),
              drill: false,
              latestActivityType: 5
            }))
          })
      })
      .then(() => {
        return findNetwork('C')
          .then((networkC) => {
            expect(networkC).toEqual(jasmine.objectContaining({
              reset: new Date('2014-05-12T15:30:01.000Z'),
              drill: false,
              latestActivityType: 5
            }))
          })
      })
  })

  it('does not reset a network that had user activity in the last hour', function () {
    return setNetworkFixtures(
      [
        {
          code: 'A',
          reset: null,
          latestUserActivity: {
            t: new Date('2014-05-12T14:30:00.000Z')
          },
          latestActivityType: TEST_ACTIVITY_TYPE
        }
      ])
      .then(() => {
        MockDate.set(new Date('2014-05-12T15:30:00.000Z'))
        return handler({}, {})
      })
      .then(() => MockDate.reset())
      .then(() => {
        return findNetwork('A')
          .then((networkA) => {
            expect(networkA.reset).toBeNull()
            expect(networkA.latestActivityType).toEqual(TEST_ACTIVITY_TYPE)
          })
      })
  })

  it('does not reset a network that had API activity in the last hour', function () {
    return setNetworkFixtures(
      [
        {
          code: 'B',
          reset: null,
          latestApiActivity: {
            t: new Date('2014-05-12T14:30:00.000Z')
          },
          latestActivityType: TEST_ACTIVITY_TYPE
        }
      ])
      .then(() => {
        MockDate.set(new Date('2014-05-12T15:30:00.000Z'))
        return handler({}, {})
      })
      .then(() => MockDate.reset())
      .then(() => {
        return findNetwork('B')
          .then((networkB) => {
            expect(networkB.reset).toBeNull()
            expect(networkB.latestActivityType).toEqual(TEST_ACTIVITY_TYPE)
          })
      })
  })

  function findNetwork(code) {
    return db.collection('networks').findOne({code: code})
  }

  function setNetworkFixtures(fixtures) {
    const networks = db.collection('networks')
    return networks.drop()
      .catch((error) => {
        // Ignore collection doesn't exist error
        if (error.message !== 'ns not found') {
          throw error
        }
      })
      .then(() => {
        if (fixtures.length > 0) {
          return networks.insertMany(fixtures)
        }
      })
  }
})
