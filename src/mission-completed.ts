import * as functions from 'firebase-functions'
import * as FirebaseFirestore from '@google-cloud/firestore'

let firestore: FirebaseFirestore.Firestore

/**
 * Initialize in your index.ts.
 * @param adminOptions functions.config().firebase
 */
export const initialize = (adminOptions: any) => {
  firestore = new FirebaseFirestore.Firestore(adminOptions)
}

/**
 * When called `markCompleted()`, CompletedError will be thrown if id is already completed.
 */
export class CompletedError extends Error {
  id: string
  name: 'CompletedError'
  message: string
  stack?: string

  constructor(id: string) {
    super(`${id} has already been completed.`)

    Object.defineProperty(this, 'id', {
      get: () => id
    })

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error()).stack
    }
  }

  toString() {
    return this.name + ': ' + this.id + ': ' + this.message
  }
}

/**
 * Retun true if `id` is completed.
 * @param data event.data.data()
 * @param id id
 */
export const isCompleted = (data: any, id: string) => {
  const completed = data.completed || {}
  return !!completed[id]
}

/**
 * Record completed when one process is complete.
 * Since this process uses Transaction, it takes time to complete, be careful.
 * @param ref event.data.ref
 * @param id id
 */
export const markCompleted = async (ref: FirebaseFirestore.DocumentReference, id: string) => {
  let completed: { [id: string]: boolean } = {}
  await firestore.runTransaction(async (transaction) => {
    return transaction.get(ref).then(tref => {
      if (isCompleted(tref.data()!, id)) {
        throw new CompletedError(id)
      } else {
        completed = tref.data()!.completed || {}
        completed[id] = true
        transaction.update(ref, { completed: completed })
      }
    })
  })

  return completed
}

/**
 * Remove id from data.completed.
 * @param ref event.data.ref
 * @param data event.data.data()
 * @param id id
 */
export const remove = async (ref: FirebaseFirestore.DocumentReference, id: string) => {
  let completed: { [id: string]: boolean } = {}
  const reference = firestore.doc(ref.path)
  await firestore.runTransaction(async (transaction) => {
    return transaction.get(reference).then(tref => {
      completed = tref.data()!.completed || {}
      delete completed[id]
      transaction.update(reference, { completed: completed })
    })
  })

  return completed
}

/**
 * Clear completed.
 * @param ref event.data.ref
 */
export const clear = async (ref: FirebaseFirestore.DocumentReference) => {
  await ref.update({ completed: {} })
  return {}
}
