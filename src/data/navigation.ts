export interface NavLink {
  label: string;
  href: string;
}

export interface NavigationData {
  logo: {
    name: string;
    arrow: string;
    href: string;
  };
  status: {
    availability: string;
    separator: string;
    cityPrefix: string;
    fallbackTime: string;
    timeZone: string;
    locale: string;
  };
  links: NavLink[];
  cta: NavLink;
}

export interface FooterData {
  sectionId: string;
  headingPrefix: string;
  headingAccent: string;
  headingSuffix: string;
  subheading: string;
  emailButton: {
    email: string;
    displayEmail: string;
    defaultBadge: string;
    copiedBadge: string;
  };
  telegramCta: NavLink;
  socials: NavLink[];
  copyright: string;
}

export interface SiteMeta {
  lang: string;
  person: {
    name: string;
    jobTitle: string;
    url: string;
    email: string;
    location: string;
  };
}

export const siteMeta: SiteMeta = {
  lang: "ru",
  person: {
    name: "Алекс Морозов",
    jobTitle: "Визуальный и бренд-дизайнер",
    url: "https://alexmorozov.design",
    email: "hello@alexmorozov.design",
    location: "Тбилиси",
  },
};

export const navigationData: NavigationData = {
  logo: {
    name: "АЛЕКС МОРОЗОВ",
    arrow: "↗",
    href: "#top",
  },
  status: {
    availability: "Открыт для проектов",
    separator: "|",
    cityPrefix: "📍 Тбилиси,",
    fallbackTime: "--:--",
    timeZone: "Asia/Tbilisi",
    locale: "ru-RU",
  },
  links: [
    { label: "Кейсы (6)", href: "#works" },
    { label: "Песочница", href: "#playground" },
    { label: "Обо мне", href: "#about" },
  ],
  cta: {
    label: "Написать мне",
    href: "#contact",
  },
};

export const footerData: FooterData = {
  sectionId: "contact",
  headingPrefix: "Есть задача, стартап или просто ",
  headingAccent: "безумная идея",
  headingSuffix: "? Давайте обсудим.",
  subheading:
    "Напишите мне пару строк о вашем проекте, примерных сроках и бюджете — я отвечу в течение рабочего дня, и мы договоримся о коротком созвоне-знакомстве.",
  emailButton: {
    email: "hello@alexmorozov.design",
    displayEmail: "HELLO@ALEXMOROZOV.DESIGN",
    defaultBadge: "Скопировать адрес 📋",
    copiedBadge: "✨ Адрес скопирован в буфер обмена!",
  },
  telegramCta: {
    label: "Написать в Telegram ↗",
    href: "https://t.me/",
  },
  socials: [
    { label: "Behance", href: "#top" },
    { label: "Dribbble", href: "#top" },
    { label: "Are.na", href: "#top" },
    { label: "Instagram", href: "#top" },
    { label: "LinkedIn", href: "#top" },
  ],
  copyright:
    "© Алекс Морозов. Собрано с любовью к сеткам. Шрифты: Inter Tight & Instrument Serif.",
};
