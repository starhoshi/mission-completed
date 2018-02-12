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
 * When call `markCompleted()`, it will be thrown if already done.
 */
class CompletedError extends Error {
}
exports.CompletedError = CompletedError;
exports.isCompleted = (snapshot, id) => {
    const completed = snapshot.data().completed || {};
    return !!completed[id];
};
/**
 * Record completed when one process is complete.
 * Since this process uses Transaction, it takes time to complete, be careful.
 * @param ref event.data.ref
 * @param id mark id
 */
exports.markCompleted = (ref, id) => __awaiter(this, void 0, void 0, function* () {
    let completed = {};
    yield firestore.runTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
        return transaction.get(ref).then(tref => {
            if (exports.isCompleted(tref, id)) {
                throw new CompletedError(id);
            }
            else {
                completed = tref.data().completed || {};
                completed[id] = true;
                transaction.update(ref, { completed: completed });
            }
        });
    }));
    return completed;
});
// TODO
// export const remove = (ref: FirebaseFirestore.DocumentReference, id: string) => { }
exports.clear = (ref) => {
    return ref.update({ completed: {} });
};
// export const clearCompleted<T extends HasNeoTask>(model: T) {
//   let neoTask = NeoTask.makeNeoTask(model)
//   delete neoTask.completed
//   model.neoTask = neoTask.rawValue()
//   await model.reference.update({ neoTask: neoTask.rawValue() })
//   return model
// }
// static isCompleted<T extends HasNeoTask>(model: T, step: string) {
//   if (!model.neoTask) { return false }
//   if (!model.neoTask.completed) { return false }
//   return !!model.neoTask.completed[step]
// }
// const orderRef = firestore.doc(this.order.getPath())
// const orderPromise = transaction.get(orderRef).then(tref => {
//   const transactionOrder = new this.initializableClass.order()
//   transactionOrder.init(tref)
//   if (Retrycf.NeoTask.isCompleted(transactionOrder, step)) {
//     throw new Retrycf.CompletedError(step)
//   } else {
//     const neoTask = Retrycf.NeoTask.makeNeoTask(transactionOrder)
//     const completed = { [step]: true }
//     neoTask.completed = completed
//     transaction.update(orderRef, { neoTask: neoTask.rawValue() })
//   }
// })
// promises.push(orderPromise)
