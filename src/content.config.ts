import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const headingSegmentSchema = z.object({
  text: z.string(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
});

const sectionSchema = z.discriminatedUnion("component", [
  z.object({
    component: z.literal("Hero"),
    headingSegments: z.array(headingSegmentSchema),
    body: z.string(),
    primaryCta: z.string(),
    primaryHref: z.string(),
    secondaryCta: z.string(),
    secondaryHref: z.string(),
    showreel: z.object({
      bgImage: z.string(),
      tagLeft: z.string(),
      tagRight: z.string(),
      title: z.string(),
      subtitle: z.string(),
      cursorBadge: z.string(),
      modalTitle: z.string(),
      modalDescription: z.string(),
      closeLabel: z.string(),
    }),
  }),
  z.object({
    component: z.literal("SelectedWorks"),
    sectionId: z.string(),
    heading: z.string(),
    indexLabel: z.string(),
    projects: z.array(
      z.object({
        title: z.string(),
        year: z.string(),
        description: z.string(),
        image: z.string(),
        imageAlt: z.string(),
        badge: z.string(),
        tags: z.array(z.string()),
      })
    ),
    archiveLabel: z.string(),
    archiveHref: z.string(),
  }),
  z.object({
    component: z.literal("Playground"),
    sectionId: z.string(),
    heading: z.string(),
    indexLabel: z.string(),
    cardHeading: z.string(),
    cardSubheading: z.string(),
    items: z.array(
      z.object({
        image: z.string(),
        imageAlt: z.string(),
        caption: z.string(),
        wide: z.boolean(),
      })
    ),
  }),
  z.object({
    component: z.literal("About"),
    sectionId: z.string(),
    heading: z.string(),
    indexLabel: z.string(),
    photo: z.object({
      image: z.string(),
      imageAlt: z.string(),
      sticker: z.string(),
    }),
    bio: z.object({
      heading: z.string(),
      paragraphs: z.array(z.string()),
      stackTitle: z.string(),
      stackTags: z.array(z.string()),
    }),
    services: z.object({
      heading: z.string(),
      items: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
        })
      ),
    }),
  }),
  z.object({
    component: z.literal("SocialProof"),
    heading: z.string(),
    indexLabel: z.string(),
    quoteSymbol: z.string(),
    testimonials: z.array(
      z.object({
        quote: z.string(),
        authorName: z.string(),
        authorRole: z.string(),
        avatar: z.string(),
        avatarAlt: z.string(),
      })
    ),
    cv: z.object({
      heading: z.string(),
      rows: z.array(
        z.object({
          role: z.string(),
          period: z.string(),
        })
      ),
      ctaLabel: z.string(),
      ctaHref: z.string(),
    }),
  }),
]);

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    seo: z.object({
      title: z.string(),
      description: z.string(),
      canonical: z.string().optional(),
      ogImage: z.string().optional(),
      noindex: z.boolean().optional(),
    }),
    sections: z.array(sectionSchema).optional(),
  }),
});

export const collections = { pages };
