# Warband Companion Harmony Planner

A fast, local-first party planner for the 16 recruitable companions in *Mount & Blade: Warband*. Select companions to see conflicts, positive relationships, recruitment cost, noble count, and starting-skill coverage.

This is version 2 of the original **Companion Harmony Visualizer Tool**, first developed by [AL2D](https://github.com/al2d-x) as a university project in October 2023. The implementation is new; the behavior and recovered companion dataset were reconstructed from the author's original Java application.

## Features

- All 16 companions, including costs, noble status, skills, likes, dislikes, and objections
- Order-independent conflict and affinity analysis
- Four conflict-free party presets preserved from the original tool
- Party-relevant or complete skill coverage views
- Search by companion, skill, or objection
- Plain-text party export
- Responsive, accessible interface
- No accounts, cookies, analytics, network requests, or runtime dependencies

## Run locally

Serve the `docs` directory with any static HTTP server. For example:

```powershell
python -m http.server 8080 --directory docs
```

Then open <http://localhost:8080>.

Opening `index.html` directly is not supported because the app uses native JavaScript modules.

## Windows launcher

Double-click **Launch Warband Companion Planner.url** to open the published application in your default browser. It requires an internet connection but does not require Java, Python, Node.js, or an installation.

## Test

Node.js 20 or newer is required. The app itself does not require Node.js; it is only used for the test suite.

```powershell
npm test
```

## Publish with GitHub Pages

1. Create a public repository named `warband-companion-harmony-planner` under the `al2d-x` account.
2. Push the `main` branch.
3. In **Settings → Pages**, choose **Deploy from a branch**, select `main`, and select the `/docs` folder.

The site will be available at:

<https://al2d-x.github.io/warband-companion-harmony-planner/>

## Project structure

```text
docs/                 Static application and GitHub Pages source
tests/                Domain-logic regression tests
.github/workflows/    Continuous integration
```

The recovered JAR files, decompiler output, and archaeology notes are intentionally excluded from this public repository.

## Credits and disclaimer

Created by [AL2D](https://github.com/al2d-x). This independent fan project is not affiliated with or endorsed by TaleWorlds Entertainment. *Mount & Blade: Warband* names and setting belong to their respective owners.

## License

[MIT](LICENSE)
