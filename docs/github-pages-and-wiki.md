# GitHub Pages and Wiki Publishing

## GitHub Pages

The `Deploy GitHub Pages` workflow builds the full Vite application with the repository subpath and deploys it through GitHub Pages. After the first successful run, enable **Settings → Pages → Build and deployment → GitHub Actions** in the GitHub repository.

The expected project URL is `https://aartisr.github.io/biodigital-cmr/`. It is a secondary public mirror; the canonical project site remains [https://bdcmr.ai-aarti.com](https://bdcmr.ai-aarti.com).

## Wiki publication

The source pages in `/wiki` are publication-ready GitHub Wiki Markdown. GitHub Wikis live in a separate `repository.wiki.git` repository, so these files cannot become the hosted Wiki until they are copied or pushed to that Wiki repository.

Publish the files with matching names into `https://github.com/aartisr/biodigital-cmr/wiki`. Preserve `_Sidebar.md` to retain the navigation. Every page includes an appropriate backlink to the canonical live site.

## Editorial standard

The Pages mirror and Wiki must preserve the project’s research-only boundary. Do not add language that implies validated clinical efficacy, patient-specific output, diagnosis, treatment recommendation, regulatory authorization, or active hospital integration without traceable evidence.
