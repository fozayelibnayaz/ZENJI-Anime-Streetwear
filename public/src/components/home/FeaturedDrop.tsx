import { products, drops } from "@/content/products";
import { queryCatalogue } from "@/lib/catalogue";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** The four pieces the label wants you to see first. */
export function FeaturedDrop() {
  const featured = queryCatalogue({ sort: "featured" }, products).slice(0, 4);

  return (
    <section className="shell py-20" aria-labelledby="featured-heading">
      <SectionHeading
        eyebrow={`Collection // ${drops.origin.code}`}
        title={<span id="featured-heading">Latest drops</span>}
        intro={drops.origin.blurb}
        link={{ href: "/drop", label: "View all" }}
      />
      <ProductGrid className="mt-10" products={featured} priorityCount={2} />
    </section>
  );
}
