import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/content/products";
import { site } from "@/content/site";
import { getProduct, isSoldOut, relatedProducts } from "@/lib/catalogue";
import { sizeCharts } from "@/content/sizing";
import { centsToDollars } from "@/lib/money";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { PurchasePanel } from "@/components/commerce/PurchasePanel";
import { PriceTag } from "@/components/commerce/PriceTag";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { VisitLogger } from "@/components/commerce/VisitLogger";
import { StickyBuyBar } from "@/components/commerce/StickyBuyBar";
import { Disclosure } from "@/components/ui/Disclosure";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { shipping } from "@/content/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Piece not found" };

  return {
    title: `${product.name} — ${product.colourway}`,
    description: `${product.tagline} ${product.gsm}gsm ${product.fabric}, ${product.fit.toLowerCase()}. Shipped Australia-wide from Melbourne.`,
    openGraph: {
      title: `${product.name} — ZENJI`,
      description: product.tagline,
      images: [{ url: product.images.front }],
    },
    alternates: { canonical: `${site.url}/drop/${product.slug}` },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = relatedProducts(product);
  const chart = sizeCharts[product.category];
  const soldOut = isSoldOut(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.story,
    sku: product.slug.toUpperCase(),
    brand: { "@type": "Brand", name: site.name },
    image: [`${site.url}${product.images.front}`],
    offers: {
      "@type": "Offer",
      priceCurrency: "AUD",
      price: centsToDollars(product.price).toFixed(2),
      availability: soldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url: `${site.url}/drop/${product.slug}`,
    },
  };

  return (
    <article className="shell py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <VisitLogger slug={product.slug} />
      <StickyBuyBar product={product} />

      <nav aria-label="Breadcrumb" className="label mb-8">
        <Link href="/" className="hover:text-bone">
          Home
        </Link>
        <span className="mx-2 text-ash">/</span>
        <Link href="/drop" className="hover:text-bone">
          Drop
        </Link>
        <span className="mx-2 text-ash">/</span>
        <span className="text-fog">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <ProductGallery product={product} />

        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="label">
            {product.drop === "origin" ? "THE_ORIGIN_DROP" : "SHADOW_PROTOCOL"} · <span className="jp">{product.kanji}</span>{" "}
            {product.romaji}
          </p>
          <h1 className="display mt-3 text-4xl sm:text-6xl">{product.name}</h1>
          <PriceTag price={product.price} compareAt={product.compareAt} size="lg" className="mt-4" />

          <p className="mt-5 text-base leading-relaxed text-fog">{product.tagline}</p>

          <div className="mt-8">
            <PurchasePanel product={product} />
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-bone/10 pt-6 font-mono text-[0.7rem] uppercase tracking-[0.12em]">
            <div>
              <dt className="text-steel">Weight</dt>
              <dd className="mt-1 text-bone">{product.gsm} gsm</dd>
            </div>
            <div>
              <dt className="text-steel">Colourway</dt>
              <dd className="mt-1 text-bone">{product.colourway}</dd>
            </div>
            <div>
              <dt className="text-steel">Fit</dt>
              <dd className="mt-1 text-bone">{product.fit}</dd>
            </div>
            <div>
              <dt className="text-steel">Released</dt>
              <dd className="mt-1 text-bone">{product.releasedAt}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <Disclosure summary="The story" defaultOpen>
              <p>{product.story}</p>
            </Disclosure>
            <Disclosure summary="Fabric & care">
              <p className="mb-3">{product.fabric}</p>
              <ul className="space-y-1.5">
                {product.care.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span aria-hidden="true" className="text-oxide">
                      —
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </Disclosure>
            <Disclosure summary="Measurements">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[20rem] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-bone/15">
                      {["Size", "Chest cm", "Length cm", "Sleeve cm"].map((heading) => (
                        <th key={heading} scope="col" className="label py-2 font-normal">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono text-sm">
                    {chart.map((spec) => (
                      <tr key={spec.size} className="border-b border-bone/8">
                        <th scope="row" className="py-2 pr-4 font-normal text-bone">
                          {spec.size}
                        </th>
                        <td className="py-2 pr-4">{spec.chest}</td>
                        <td className="py-2 pr-4">{spec.length}</td>
                        <td className="py-2">{spec.sleeve || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Disclosure>
            <Disclosure summary="Shipping & returns">
              <ul className="space-y-2">
                {shipping.slice(0, 4).map((zone) => (
                  <li key={zone.zone} className="flex flex-wrap justify-between gap-2">
                    <span className="text-bone">{zone.zone}</span>
                    <span className="font-mono text-xs text-steel">
                      {zone.speed} · {zone.price}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Thirty-day exchange on unworn pieces. First AU exchange is free —{" "}
                <Link href="/support" className="text-bone underline underline-offset-4 hover:text-oxide">
                  full policy
                </Link>
                .
              </p>
            </Disclosure>
          </div>
        </div>
      </div>

      <section className="mt-24" aria-labelledby="related-heading">
        <SectionHeading eyebrow="Pairs with" title={<span id="related-heading">Rest of the chapter</span>} link={{ href: "/drop", label: "View all" }} />
        <ProductGrid className="mt-10" products={related} />
      </section>
    </article>
  );
}
