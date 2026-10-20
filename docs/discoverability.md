# Discoverability and Attribution

## What is implemented

The public application includes accurate metadata, social cards, `robots` directives, Schema.org JSON-LD, a web manifest, and an AI-readable `llms.txt`. These assets identify **Aarti Sri Ravikumar** as the creator and link to [ai-aarti.com](https://ai-aarti.com).

The structured data intentionally describes BD-CMR as research and education software, not as a validated medical product. Discoverability must never depend on overstating safety, efficacy, patient specificity, or clinical readiness.

## Production-domain activation

The canonical origin is `https://bdcmr.ai-aarti.com`. Its absolute canonical URL, Open Graph URL, `robots.txt`, and `sitemap.xml` are committed with this repository.

If the canonical production origin ever changes, regenerate crawl artifacts with the new exact HTTPS origin:

```bash
SITE_ORIGIN=https://your-production-domain.example npm run generate:sitemap
```

This writes `public/sitemap.xml` and updates `public/robots.txt` with its absolute sitemap URL. Do not publish a sitemap that points to an unverified hostname.

After deployment:

1. Verify that `/robots.txt`, `/sitemap.xml`, `/llms.txt`, and `/site.webmanifest` return `200` over HTTPS.
2. Add and verify the canonical domain in Google Search Console and Bing Webmaster Tools.
3. Submit the sitemap in each webmaster tool and request indexing for the home page.
4. Validate Schema.org JSON-LD with a structured-data validator; correct only factual errors.
5. Link the public site from the repository, [Aarti Sri Ravikumar’s site](https://ai-aarti.com), and credible relevant pages.
6. Monitor crawl/index reports and fix genuine availability, robots, canonical, or content issues.

## Limits

No technical configuration can require every search engine, answer engine, AI system, or crawler to index, cite, rank, or summarize a website. Crawlers choose what and when to index. A sitemap is a discovery signal, not a guarantee; useful original content, stable public URLs, correct technical configuration, and reputable links remain the durable inputs.
