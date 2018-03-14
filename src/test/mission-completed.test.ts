import * as admin from 'firebase-admin'
import * as Mission from '../mission-completed'
import 'jest'

jest.setTimeout(20000)

beforeAll(() => {
  const serviceAccount = require('../../sandbox-329fc-firebase-adminsdk.json')
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
  Mission.initialize(admin.firestore())
})

let user: FirebaseFirestore.DocumentReference
const id = 'test'

beforeEach(async () => {
  user = await admin.firestore().collection('mission-user').add({ name: 'test' })
})

describe('markCompleted', async () => {
  describe('not marked completed', async () => {
    test('record completed', async () => {
      const completed = await Mission.markCompleted(user, id)
      expect(completed[id]).toBe(true)
      const updatedUser = await admin.firestore().doc(user.path).get().then(s => s.data()!)
      expect(updatedUser.completed[id]).toBe(true)
    })
  })

  describe('other id already marked completed', async () => {
    test('true', async () => {
      await Mission.markCompleted(user, 'other')
      const completed = await Mission.markCompleted(user, id)
      expect(completed[id]).toBe(true)
      expect(completed.other).toBe(true)
      const updatedUser = await admin.firestore().doc(user.path).get().then(s => s.data()!)
      expect(updatedUser.completed[id]).toBe(true)
    })
  })

  describe('already marked completed', async () => {
    test('true', async () => {
      await Mission.markCompleted(user, id)

      expect.hasAssertions()
      try {
        const aaa = await Mission.markCompleted(user, id)
      } catch (e) {
        expect(e).toBeInstanceOf(Mission.CompletedError)
        const completedError = e as Mission.CompletedError
        expect(completedError.id).toBe(id)
        expect(completedError.stack).toBeDefined()
        expect(completedError.message).toBe(`${id} has already been completed.`)
        expect(completedError).toBeDefined()
      }
    })
  })
})

describe('isCompleted', async () => {
  describe('already marked completed', async () => {
    test('true', async () => {
      const completed = await Mission.markCompleted(user, id)

      const updatedUser = await admin.firestore().doc(user.path).get().then(s => s.data()!)
      expect(Mission.isCompleted(updatedUser, id)).toBe(true)
    })
  })

  describe('not exist completed', async () => {
    test('true', async () => {
      const updatedUser = await admin.firestore().doc(user.path).get().then(s => s.data()!)
      expect(Mission.isCompleted(updatedUser, id)).toBe(false)
    })
  })

  describe('other id marked completed', async () => {
    test('true', async () => {
      const completed = await Mission.markCompleted(user, 'other')

      const updatedUser = await admin.firestore().doc(user.path).get().then(s => s.data()!)
      expect(Mission.isCompleted(updatedUser, id)).toBe(false)
    })
  })
})

describe('remove', async () => {
  describe('already marked completed', async () => {
    test('update to {}', async () => {
      await Mission.markCompleted(user, id)
      await Mission.remove(user, id)

      const updatedUser = await admin.firestore().doc(user.path).get().then(s => s.data()!)
      expect(updatedUser.completed).toEqual({})
    })

    describe('multiple completed', async () => {
      test('update to {}', async () => {
        await Mission.markCompleted(user, 'other')
        await Mission.markCompleted(user, id)
        await Mission.remove(user, id)

        const updatedUser = await admin.firestore().doc(user.path).get().then(s => s.data()!)
        expect(updatedUser.completed).toEqual({ 'other': true })
      })
    })
  })

  describe('not exist completed', async () => {
    test('update to {}', async () => {
      await Mission.remove(user, id)

      const updatedUser = await admin.firestore().doc(user.path).get().then(s => s.data()!)
      expect(updatedUser.completed).toEqual({})
    })
  })
})

describe('clear', async () => {
  describe('already marked completed', async () => {
    test('update to {}', async () => {
      await Mission.markCompleted(user, id)
      await Mission.clear(user)

      const updatedUser = await admin.firestore().doc(user.path).get().then(s => s.data()!)
      expect(updatedUser.completed).toEqual({})
    })
  })

  describe('not exist completed', async () => {
    test('update to {}', async () => {
      await Mission.clear(user)

      const updatedUser = await admin.firestore().doc(user.path).get().then(s => s.data()!)
      expect(updatedUser.completed).toEqual({})
    })
  })
})
