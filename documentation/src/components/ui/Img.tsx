import NextImage, { type ImageProps } from "next/image";
import { withBasePath } from "@/lib/asset";

/**
 * next/image with the deployment base path applied.
 *
 * Use this for anything served out of /public. Everything else about the API is
 * unchanged — width/height, sizes, priority and lazy loading all behave exactly
 * as they do upstream.
 */
export function Img({ src, ...rest }: ImageProps) {
  return <NextImage src={typeof src === "string" ? withBasePath(src) : src} {...rest} />;
}
