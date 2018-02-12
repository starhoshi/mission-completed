import * as FirebaseFirestore from '@google-cloud/firestore';
/**
 * Initialize in your index.ts.
 * @param adminOptions functions.config().firebase
 */
export declare const initialize: (adminOptions: any) => void;
/**
 * When call `markCompleted()`, it will be thrown if already done.
 */
export declare class CompletedError extends Error {
}
export declare const isCompleted: (snapshot: FirebaseFirestore.DocumentSnapshot, id: string) => boolean;
/**
 * Record completed when one process is complete.
 * Since this process uses Transaction, it takes time to complete, be careful.
 * @param ref event.data.ref
 * @param id mark id
 */
export declare const markCompleted: (ref: FirebaseFirestore.DocumentReference, id: string) => Promise<{
    [id: string]: boolean;
}>;
export declare const clear: (ref: FirebaseFirestore.DocumentReference) => Promise<FirebaseFirestore.WriteResult>;