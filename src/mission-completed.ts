import * as functions from 'firebase-functions'
import * as FirebaseFirestore from '@google-cloud/firestore'
import { DeltaDocumentSnapshot } from 'firebase-functions/lib/providers/firestore'

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
export class CompletedError extends Error { }

/**
 * Retun true if `id` is completed.
 * @param snapshot event.data.data()
 * @param id id
 */
export const isCompleted = (snapshot: FirebaseFirestore.DocumentSnapshot, id: string) => {
  const completed = snapshot.data()!.completed || {}
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
      if (isCompleted(tref, id)) {
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

// TODO
// export const remove = (ref: FirebaseFirestore.DocumentReference, id: string) => { }

/**
 * Clear completed.
 * @param ref event.data.ref
 */
export const clear = (ref: FirebaseFirestore.DocumentReference) => {
  return ref.update({ completed: {} })
}
