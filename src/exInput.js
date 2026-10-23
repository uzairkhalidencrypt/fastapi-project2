import React, { useEffect, useState } from 'react';
import { get, set, del } from 'idb-keyval'; // Requires: npm install idb-keyval

// ---------------------------------------------------------------------------
// CONFIGURATION CONSTANTS
// Declared at the top level (outside the component) so that:
//   1. They are shared across the whole file (get/set/del/checks all use them).
//   2. They are NOT recreated on every render (putting them inside the
//      component would recreate them hundreds of times as the user types).
//   3. They are easy to find and change in one obvious place.
// ---------------------------------------------------------------------------

// The "address label" for this draft inside IndexedDB.
// Must be UNIQUE across the app (otherwise another feature could overwrite it)
// and CONSISTENT in every get/set/del call (this constant guarantees that).
// Using a constant prevents the classic bug where a typo makes the code
// write drafts to one drawer and read/delete from another.
const KEY = 'contact-form-draft';

// How long (in milliseconds) a draft is allowed to live before being discarded.
// 30 days × 24 hours × 60 min × 60 sec × 1000 ms = 2,592,000,000 ms.
// Written with named units to make it IMPOSSIBLE to misread.
// (A common bug is writing `30 * 24` — that's 720 ms, not 30 days.)

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

function ExInput() {
    // -------------------------------------------------------------------------
    // STATE (the "notepads" that drive what's shown on screen)
    // useState returns [currentValue, setterFunction]. When the setter is
    // called, React re-renders the component so the UI reflects the new value.
    // -------------------------------------------------------------------------

    // What is currently typed in input box 1.
    // Starts empty because we haven't loaded any saved draft yet.
    const [number, setNumber] = useState("");

    // What is currently typed in input box 2.
    const [number2, setNumber2] = useState("");

    // Tracks whether the initial load from IndexedDB has finished.
    // WHY THIS EXISTS: without it, the save effect would fire on the very
    // first render and could overwrite a real draft with empty strings before
    // the load has had a chance to read it. It also prevents the "user typed
    // before load finished" race — we simply don't save until load is done.
    const [hasLoaded, setHasLoaded] = useState(false);

    // -------------------------------------------------------------------------
    // EFFECT 1 — LOAD the saved draft when the component first mounts
    // The empty dependency array [] means: run once, on first render only.
    // -------------------------------------------------------------------------
    useEffect(() => {
        // A "cancelled" flag shared between this effect and its cleanup function.
        // WHY THIS EXISTS: if the user navigates away while the async get() is
        // still in flight, the cleanup runs and flips this flag. When the get()
        // finally resolves, the .then() checks `cancelled` and skips setState,
        // avoiding React's "state update on an unmounted component" warning.
        let cancelled = false;

        // get() is asynchronous — it returns a Promise that resolves to the
        // stored draft, or `undefined` if nothing was ever saved.
        get(KEY)
            .then(d => {
                // Guard 1: if the component was unmounted (cancelled) or the
                // drawer was empty (no draft), stop here — nothing to restore.
                if (cancelled || !d) return;

                // Guard 2: TTL check. If the draft is older than 30 days,
                // delete it from storage and do NOT restore it. This prevents
                // stale drafts from haunting the user months later.
                // Date.now() is current time in ms; d.savedAt is when it was saved.
                if (Date.now() - d.savedAt > TTL_MS) {
                    del(KEY);
                    return;
                }

                // Restore the saved values into state.
                // The ?? operator means: "use the left side, unless it's null or
                // undefined, in which case use the fallback (empty string)".
                // This is safer than ||, which would also replace valid falsy
                // values like 0 (important if a field ever holds a number).
                setNumber(d.number ?? "");
                setNumber2(d.number2 ?? "");
            })
            // If ANYTHING above throws (storage blocked, browser policy, corrupt
            // data), log a clear message instead of letting the promise reject
            // silently. In production you'd also show a small toast to the user.
            .catch(err => console.error("Draft load failed", err))
            // .finally runs whether the promise resolved OR rejected.
            // We use it to flip `hasLoaded` to true so the save effect can begin.
            // The `!cancelled &&` guard means: only set state if we're still
            // mounted (setting state after unmount would warn).
            .finally(() => !cancelled && setHasLoaded(true));

        // Cleanup function — React calls this when the effect is torn down
        // (component unmounts, or the effect re-runs). Flipping the shared
        // flag tells any still-pending async work above to stop trying to
        // update state.
        return () => { cancelled = true; };
    }, []);

    // -------------------------------------------------------------------------
    // EFFECT 2 — SAVE the current values when the user changes them
    // Dependency array [number, number2, hasLoaded] means: re-run this effect
    // whenever any of those values change (i.e. every keystroke, once loaded).
    // -------------------------------------------------------------------------
    useEffect(() => {
        // Guard: don't save anything until the initial load has finished.
        // WHY: on the very first render, `number` and `number2` are both "".
        // If we saved immediately, we'd overwrite the real draft in storage
        // with empty strings before the load effect ever read it.
        if (!hasLoaded) return;

        // "Debounce" — wait until the user STOPS typing for 300 ms before
        // actually writing. WHY: typing fires this effect on every keystroke.
        // Without debounce, typing 20 characters would trigger 20 separate
        // IndexedDB writes. With debounce, only the final value is written.
        // 300 ms is imperceptible to the user but dramatically reduces writes.
        const t = setTimeout(() => {
            // Build the "payload" — the object we store. Keeping a `savedAt`
            // timestamp lets the load effect enforce the TTL later.
            const payload = {
                number,
                number2,
                savedAt: Date.now(),
            };

            // Write to IndexedDB. Non-blocking (asynchronous), so the UI never
            // freezes while writing (unlike localStorage, which blocks).
            // The .catch() is required because `set()` returns a Promise — if
            // storage is full or blocked by the browser, that Promise rejects,
            // and without .catch we'd get an "unhandled rejection" warning.
            set(KEY, payload).catch(err =>
                console.error("Draft save failed", err)
            );
        }, 300);

        // Cleanup: if the user types again before the 300 ms timer fires,
        // cancel the pending save and start a fresh timer in the next effect
        // run. This is what makes debounce work — every keystroke resets
        // the clock, so only a real pause triggers a write.
        return () => clearTimeout(t);
    }, [number, number2, hasLoaded]);

    // -------------------------------------------------------------------------
    // RENDER — what the user sees
    // -------------------------------------------------------------------------
    return (
        <div>
            <h3>Async IndexedDB Method</h3>

            {/*
        Controlled input for box 1:
        - value={number}      → the box always shows whatever is in state
        - onChange={...}      → whenever the user types, update state
        The arrow function `e => setNumber(e.target.value)` reads the
        new text from the event (`e.target.value`) and stores it.
        Because `number` is in the save effect's dependency array, each
        keystroke triggers a (debounced) save automatically.
      */}
            <input
                value={number}
                onChange={e => setNumber(e.target.value)}
                placeholder="hello"
            />

            {/* Controlled input for box 2 — identical pattern, wired to
          `number2` / `setNumber2`. */}
            <input
                value={number2}
                onChange={e => setNumber2(e.target.value)}
                placeholder="num2"
            />
        </div>
    );
}

export default ExInput;