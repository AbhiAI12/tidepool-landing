# AGENTS.md
- Static site: no build step, no frameworks, no runtime dependencies. Playwright is a dev dependency only.
- Voice: plain verbs, sentence case, describe what the product does. No superlatives.
- Buttons say what happens ("Request demo"), and the same wording is used in the confirmation.
- Every form field needs a visible label and an inline error message tied via aria-describedby.
- Keep motion tied to user actions. Respect prefers-reduced-motion.
- Run `npm test` before finishing. A new interactive behaviour needs a Playwright test.
