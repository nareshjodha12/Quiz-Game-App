# Quiz App (Vanilla JS)

A small client-side quiz application built with plain HTML, CSS and JavaScript. It's designed to be mobile-friendly and accessible out-of-the-box.

## Quick start

1. Open `index.html` in your browser (double-click or use "Open File" in your browser).
2. Click the "Start" button to begin the quiz.
3. Tap a choice to select it, then use the "Next" button to submit and advance.

No server or build step is required — the app is fully static.

## Mobile friendliness

This app is optimized for Android / mobile browsers:

- The page includes a `meta name="theme-color"` so supported browsers can tint the UI.
- Choices use larger padding and font sizes for comfortable touch targets.
- On narrow screens a sticky "Next" button appears at the bottom so the primary action stays reachable.
- The layout collapses to a single-column choices grid on small screens.

## Accessibility

- Choices are rendered as buttons with `role="radio"` inside a `role="radiogroup"` to improve screen reader semantics.
- Keyboard navigation supported: Arrow keys move focus between choices; Enter/Space selects.
- Timer and progress updates use `aria-live` / `aria-valuenow` attributes so assistive tech is informed of changes.
- Focus outlines (using :focus-visible) are enabled to help keyboard users.

## Files

- `index.html` — app markup and DOM hooks.
- `style.css` — styling, themes and responsive rules.
- `script.js` — quiz logic, accessibility wiring, timer and local leaderboard.

## Testing on Android

1. Copy the project folder to your device, or serve it via local HTTP (for example, using `npx http-server` from the project folder).
2. Open the folder or URL in Chrome on Android.
3. Try selecting answers and tapping Next. Verify the sticky Next button does not overlap the on-screen keyboard.
4. Optionally enable a screen reader (TalkBack) to confirm the radiogroup/aria announcements.

## Troubleshooting

- If choices don't appear, ensure `script.js` is loaded (check console for errors).
- If audio doesn't play on some mobile browsers, interact with the page first (user gesture required for WebAudio playback in many browsers).

## Next steps (optional)

- Integrate remote leaderboard (Firebase) if you want server persistence.
- Add adaptive question categories and charts for historical performance.
- Add unit tests for the JS logic.

---

If you want, I can add a short "Run locally with http-server" snippet or wire Firebase for remote leaderboard persistence.