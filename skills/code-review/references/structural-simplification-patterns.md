# Structural Simplification Patterns (Deep Reference)

Load this reference during **Pass 2** (Architecture & Maintainability) of a code review
when you want to push beyond surface-level cleanup toward genuinely simpler design.
These patterns are inspired by `thermo-nuclear-code-quality-review`.

---

## What Is Structural Simplification?

**Structural simplification** means using the existing architecture's shape to make
a change simpler rather than bolting on new code that fights against the grain. The
best review finding is often not "this could be cleaner" but **"this whole set of
changes disappears if we reframe the problem this way."**

A structural simplification finding is high-leverage: it may require restructuring,
but the payoff is deleting categories of complexity rather than merely rearranging
them.

---

## Pattern 1: Disappearing Branches

**The smell:** New conditionals bolted onto existing paths. Feature flags, nullable
modes, special-case booleans that thread through unrelated code.

**The simplifying move:** Reframe the state model so the conditionals disappear.

**Example before:**
```typescript
function render() {
  if (this.mode === 'preview' && this.user?.isAdmin) {
    return <AdminPreview />;
  }
  if (this.mode === 'preview') {
    return <StandardPreview />;
  }
  return <FullRender />;
}
```

**After (with a dispatcher or strategy pattern):**
```typescript
const renderers = {
  'preview.admin': AdminPreview,
  'preview': StandardPreview,
  'default': FullRender,
};
```

Or even simpler — push the decision into the callers so this function doesn't
need to know about modes at all.

**Key insight:** When you see new conditionals spreading across files, it's often
because the **boundary is wrong**. Push the variability to where it belongs.

---

## Pattern 2: Abstraction That Earns Its Keep

**The smell:** A wrapper, factory, adapter, or helper that passes through to
another implementation with no meaningful transformation, validation, or indirection
that buys anything.

**The simplifying move:** Delete the wrapper. Call the underlying implementation directly.

**Example before:**
```typescript
class UserService {
  constructor(private repo: UserRepository) {}
  async getUser(id: string) { return this.repo.findById(id); }
  async createUser(data: UserData) { return this.repo.create(data); }
}
```

This is a **pass-through**. It adds indirection without buying anything unless
there's a real reason (testing seam, planned abstraction, behavior that will be
added). If the tests already mock `UserRepository` directly, this adds zero value.

**When to keep an abstraction:**
- It enforces an invariant (validation, logging, access control)
- It translates between two different models/representations
- It's documented as a planned seam for future variation
- Tests depend on it as a mock boundary (and there's no direct mock for the inner API)

---

## Pattern 3: Layer Leakage

**The smell:** Feature-specific logic in a shared path. Implementation details
leaking through public APIs. Business logic in controllers/handlers.

**The simplifying move:** Push the logic to the right layer. If a shared path needs to
behave differently, use a strategy/hook/callback rather than a flag.

**Example before:**
```typescript
// In shared database layer:
async function saveOrder(order: Order, sendNotification: boolean) {
  await db.orders.save(order);
  if (sendNotification) {
    await email.send(...);
  }
}
```

**After:**
```typescript
// Database layer just saves:
async function saveOrder(order: Order) {
  await db.orders.save(order);
}

// Feature code orchestrates:
await saveOrder(order);
if (shouldNotify) {
  await email.send(...);
}
```

**Key insight:** A `bool` parameter on a shared function is a promise that
more bools will follow. A callback/hook/event is a commitment to extensibility.

---

## Pattern 4: Stringly-Typed to Typed

**The smell:** Raw strings used where the project has enums, union types, schemas,
constants, or branded types. Loose dictionaries/maps where typed models exist.

**The simplifying move:** Use the project-owned representation. Parse boundary strings
into types at the edge, then carry typed data through the core.

**Example before:**
```typescript
function processEvent(event: Record<string, unknown>) {
  if (event['type'] === 'user.created') { ... }
  if (event['type'] === 'user.deleted') { ... }
}
```

**After:**
```typescript
type UserEventType = 'user.created' | 'user.deleted';
interface UserEvent { type: UserEventType; payload: unknown; }

function processEvent(event: UserEvent) {
  switch (event.type) {
    case 'user.created': ...
    case 'user.deleted': ...
  }
}
```

**Key insight:** Every `string` that represents a limited set of values is a
bug waiting to happen. The type checker is free — use it.

---

## Pattern 5: Defensive Code That Outlived Its Need

**The smell:** After a refactor, validation checks, null guards, try/catch blocks,
or fallback logic exist that can no longer trigger because the type system or
upstream guarantees have changed.

**The simplifying move:** Delete the dead defensive code.

**Common examples:**
- Null checks after the type was made non-nullable
- try/catch around operations that no longer throw
- Fallback/default values for fields that are now always provided
- `if (result)` after a function that always returns a result

```typescript
// Before (defensive, no longer needed):
const user = await getUser(id);
if (!user) throw new Error('user not found');
// ... use user

// After:
const user = await getUser(id); // throws if not found by contract
// ... use user
```

**Key insight:** Defensive code has a half-life. Every refactor that tightens a
type or strengthens a guarantee makes some defensive check obsolete. Find and
delete them.

---

## Pattern 6: Near-Duplicate Unification

**The smell:** Two or more blocks that are structurally similar but vary in a few
places. Often the result of copy-paste or independent implementations of the
same concept.

**The simplifying move:** Extract the common structure into one parameterized function.
Vary only the parts that actually differ.

**The hard part:** Distinguishing **accidental similarity** (just happens to look
alike but has different semantics) from **essential similarity** (same concept
with different data). Don't unify where the variation is actually meaningful.

---

## Pattern 7: Sequential to Parallel

**The smell:** Independent work serialized for no good reason. Multiple async
operations that don't depend on each other running in sequence.

**The simplifying move:** Run them concurrently. Use `Promise.all`, `Promise.allSettled`,
`async.concurrent`, `asyncio.gather`, `sync.WaitGroup`, or the language's
equivalent.

**Example before:**
```typescript
const user = await getUser(id);
const orders = await getOrders(user.id);
const preferences = await getPreferences(user.id);
```

If `getOrders` and `getPreferences` don't depend on each other, they should
run concurrently after `user` is fetched (or even all three if `user.id` is known).

**Key insight:** Serial is simpler to reason about, which is fine for v1. But
once the shape is clear, parallelizing independent work is often trivial and
can meaningfully improve latency.

---

## Pattern 8: State Machine over Conditionals

**The smell:** Chains of `if/else` or `switch` that track what state a process
is in, with scattered state transitions across multiple functions.

**The simplifying move:** Model the state explicitly. Use a typed state machine or
enum that makes illegal states unrepresentable.

**Before:**
```typescript
let submitted = false;
let approved = false;
let paid = false;

function submit() { if (!submitted) { submitted = true; /* ... */ } }
function approve() { if (submitted && !approved) { approved = true; /* ... */ } }
function pay() { if (approved && !paid) { paid = true; /* ... */ } }
```

**After:**
```typescript
type OrderState = 'draft' | 'submitted' | 'approved' | 'paid' | 'cancelled';
let state: OrderState = 'draft';

const transitions: Record<OrderState, OrderState[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['approved', 'cancelled'],
  approved: ['paid', 'cancelled'],
  paid: [],
  cancelled: [],
};

function transition(to: OrderState) {
  if (!transitions[state].includes(to)) throw new Error(`Invalid transition: ${state} -> ${to}`);
  state = to;
}
```

---

## Recognizing Structural Simplification Opportunities

When reviewing, ask these questions for every non-trivial change:

1. **"Can I reframe the problem so this complexity disappears?"**
2. **"Is this the simplest version of the right idea, or is it a cleaner version of a messy idea?"**
3. **"If I could delete one concept/file/abstraction from this change, what would it be?"**
4. **"Does this change fight the architecture or flow with it?"**
5. **"What am I assuming that I could instead make explicit?"**

The best finding wins you a "delete" rather than a "rewrite".
