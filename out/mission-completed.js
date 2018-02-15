"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const FirebaseFirestore = require("@google-cloud/firestore");
let firestore;
/**
 * Initialize in your index.ts.
 * @param adminOptions functions.config().firebase
 */
exports.initialize = (adminOptions) => {
    firestore = new FirebaseFirestore.Firestore(adminOptions);
};
/**
 * When called `markCompleted()`, CompletedError will be thrown if id is already completed.
 */
class CompletedError extends Error {
    constructor(id) {
        super(`${id} has already been completed.`);
        Object.defineProperty(this, 'id', {
            get: () => id
        });
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            this.stack = (new Error()).stack;
        }
    }
    toString() {
        return this.name + ': ' + this.id + ': ' + this.message;
    }
}
exports.CompletedError = CompletedError;
/**
 * Retun true if `id` is completed.
 * @param data event.data.data()
 * @param id id
 */
exports.isCompleted = (data, id) => {
    const completed = data.completed || {};
    return !!completed[id];
};
/**
 * Record completed when one process is complete.
 * Since this process uses Transaction, it takes time to complete, be careful.
 * @param ref event.data.ref
 * @param id id
 */
exports.markCompleted = (ref, id) => __awaiter(this, void 0, void 0, function* () {
    let completed = {};
    const reference = firestore.doc(ref.path);
    yield firestore.runTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
        return transaction.get(reference).then(tref => {
            if (exports.isCompleted(tref.data(), id)) {
                throw new CompletedError(id);
            }
            else {
                completed = tref.data().completed || {};
                completed[id] = true;
                transaction.update(reference, { completed: completed });
            }
        });
    }));
    return completed;
});
/**
 * Remove id from data.completed.
 * @param ref event.data.ref
 * @param data event.data.data()
 * @param id id
 */
exports.remove = (ref, id) => __awaiter(this, void 0, void 0, function* () {
    let completed = {};
    const reference = firestore.doc(ref.path);
    yield firestore.runTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
        return transaction.get(reference).then(tref => {
            completed = tref.data().completed || {};
            delete completed[id];
            transaction.update(reference, { completed: completed });
        });
    }));
    return completed;
});
/**
 * Clear completed.
 * @param ref event.data.ref
 */
exports.clear = (ref) => __awaiter(this, void 0, void 0, function* () {
    yield ref.update({ completed: {} });
    return {};
});
