import { SITE } from "./site";

export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.origin}/#organization`,
      name: SITE.legalName,
      url: SITE.parentSite,
      email: SITE.email,
      telephone: SITE.phone,
      address: {
        "@type": "PostalAddress",
        addressLocality: SITE.locality,
        addressRegion: SITE.region,
        addressCountry: SITE.country,
      },
      sameAs: SITE.sameAs,
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE.origin}/#localbusiness`,
      name: SITE.legalName,
      url: SITE.parentSite,
      email: SITE.email,
      telephone: SITE.phone,
      address: {
        "@type": "PostalAddress",
        addressLocality: SITE.locality,
        addressRegion: SITE.region,
        addressCountry: SITE.country,
      },
      areaServed: [SITE.locality, SITE.region, SITE.country],
      sameAs: SITE.sameAs,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.origin}/#website`,
      url: SITE.origin,
      name: SITE.name,
      description: SITE.description,
      inLanguage: "en",
      publisher: { "@id": `${SITE.origin}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE.origin}/knowledge?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE.origin}/#product`,
      name: SITE.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: SITE.description,
      url: SITE.origin,
      provider: { "@id": `${SITE.origin}/#organization` },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "MYR",
        description: "Public product overview and demo information.",
      },
    },
    {
      "@type": "WebPage",
      "@id": `${SITE.origin}/#webpage`,
      url: SITE.origin,
      name: SITE.name,
      description: SITE.description,
      isPartOf: { "@id": `${SITE.origin}/#website` },
      about: { "@id": `${SITE.origin}/#product` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE.origin}/studio-pro-logo.png`,
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE.origin}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE.origin,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE.origin}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What does the Studio Pro WhatsApp assistant do?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "It connects a business WhatsApp number, replies to customers automatically with AI, provides a unified inbox and lets a human take over a conversation when needed.",
          },
        },
        {
          "@type": "Question",
          name: "Who operates this service?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `Studio Pro, a web design and software studio in ${SITE.locality}, ${SITE.region}, ${SITE.country}.`,
          },
        },
        {
          "@type": "Question",
          name: "How can I contact Studio Pro?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `Email ${SITE.email} or call ${SITE.phone}.`,
          },
        },
      ],
    },
  ],
};
