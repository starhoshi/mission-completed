# mission-completed

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> Note: Trigger events are delivered at least once, which means that rarely, spurious duplicates may occur.
> https://cloud.google.com/functions/docs/concepts/events-triggers#triggers

Cloud Functions rarely fire multiple times.
If __multiple payment occurs__, it is a big problem!!

mission-completed uses __transactions__ to prevent multiple trigger events.

If you try to set the completed flag to true many times, CompletedError will be returned.

```ts
await Mission.markCompleted(ref, id) // first: success
await Mission.markCompleted(ref, id) // second: throw CompletedError
```

## Install

```
yarn install mission-completed
```

## Usage

This sample is written in TypeScript.

### 1. Initialize

Initialize event-response in your index.ts.

```ts
import * as Mission from '../mission-completed'
import * as functions from 'firebase-functions'

Mission.initialize(functions.config().firebase)
```

### 2. mark completed in Cloud Functions

If mission has already been completed, throw CompletedError in `Mission.markCompleted(event.data.ref, 'updateUser')`.

```ts
exports.updateUser = functions.firestore.document('users/{userId}')
  .onCreate(async event => {
    if (event.data.data()!.updated) { // prevent infinite loop
      return undefined
    }

    try {
      await Mission.markCompleted(event.data.ref, 'updateUser')
    } catch (error) {
      if (error.constructor === Mission.CompletedError) {
        console.error(error, 'Mission has already been completed.')
      }
    }

    await event.data.ref.update({updated: true})

    return undefined
})
```

This will continue the initial process, but the simultaneous firing process will stop with CompletedError.

## License

MIT
