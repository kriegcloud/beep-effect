import { kebabCase } from "es-toolkit";

export const _id = Array.from({ length: 40 }, (_, index) => `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b${index + 1}`);
export const _postTitles = [
  `The Future of Renewable Energy: Innovations and Challenges Ahead`,
  `Exploring the Impact of Artificial Intelligence on Modern Healthcare`,
  `Climate Change and Its Effects on Global Food Security`,
  `The Rise of Remote Work: Benefits, Challenges, and Future Trends`,
  `Understanding Blockchain Technology: Beyond Cryptocurrency`,
  `Mental Health in the Digital Age: Navigating Social Media and Well-being`,
  `Sustainable Fashion: How the Industry is Going Green`,
  `Space Exploration: New Frontiers and the Quest for Extraterrestrial Life`,
  `The Evolution of E-Commerce: Trends Shaping the Online Retail Landscape`,
  `Cybersecurity in the 21st Century: Protecting Data in a Digital World`,
  `The Role of Big Data in Transforming Business Strategies`,
  `Genetic Engineering: Ethical Considerations and Future Prospects`,
  `Urban Farming: A Solution to Food Deserts and Urban Sustainability`,
  `The Psychology of Consumer Behavior: What Drives Our Purchasing Decisions?`,
  `Renewable Energy vs. Fossil Fuels: Which is the Future?`,
  `Artificial Intelligence in Education: Enhancing Learning Experiences`,
  `The Impact of Climate Change on Global Migration Patterns`,
  `5G Technology: Revolutionizing Connectivity and Communication`,
  `The Gig Economy: Opportunities, Risks, and the Future of Work`,
  `Smart Cities: Integrating Technology for Sustainable Urban Living`,
  `The Influence of Pop Culture on Modern Society`,
  `Innovations in Medicine: From Telehealth to Personalized Treatment`,
  `The Environmental Cost of Fast Fashion: What Can Consumers Do?`,
  `The Intersection of Art and Technology: Digital Art in the 21st Century`,
] as const;
const MOCK_ID = _id[1]!;
const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: "/auth",
  AUTH_DEMO: "/auth-demo",
  DASHBOARD: "/dashboard",
} as const;

const withAuthRoot = <T extends string>(path: T extends `/${string}` ? never : T) => `${ROOTS.AUTH}/${path}` as const;

export const paths = {
  comingSoon: "/coming-soon",
  maintenance: "/maintenance",
  pricing: "/pricing",
  payment: "/payment",
  about: "/about-us",
  contact: "/contact-us",
  faqs: "/faqs",
  docs: "/docs",
  page403: "/error/403",
  page404: "/error/404",
  page500: "/error/500",
  components: "/components",
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id: string) => `/product/${id}`,
    demo: { details: `/product/${MOCK_ID}` },
  },
  post: {
    root: `/post`,
    details: (title: string) => `/post/${kebabCase(title)}`,
    demo: { details: `/post/${kebabCase(MOCK_TITLE)}` },
  },
  // AUTH
  auth: {
    signIn: withAuthRoot("sign-in"),
    signUp: withAuthRoot("sign-up"),
    updatePassword: withAuthRoot(`update-password`),
    resetPassword: withAuthRoot(`reset-password`),
    verify: withAuthRoot(`verify`),
    twoFactor: {
      root: withAuthRoot(`two-factor`),
      otp: withAuthRoot(`two-factor/otp`),
    },
    acceptInvitation: withAuthRoot(`accept-invitation/accept-invitation`),
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    mail: `${ROOTS.DASHBOARD}/mail`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    fileManager: `${ROOTS.DASHBOARD}/file-manager`,
    permission: `${ROOTS.DASHBOARD}/permission`,
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
      course: `${ROOTS.DASHBOARD}/course`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      cards: `${ROOTS.DASHBOARD}/user/cards`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      demo: { edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit` },
    },
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoice`,
      new: `${ROOTS.DASHBOARD}/invoice/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/invoice/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}/edit`,
      },
    },
    post: {
      root: `${ROOTS.DASHBOARD}/post`,
      new: `${ROOTS.DASHBOARD}/post/new`,
      details: (title: string) => `${ROOTS.DASHBOARD}/post/${kebabCase(title)}`,
      edit: (title: string) => `${ROOTS.DASHBOARD}/post/${kebabCase(title)}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/post/${kebabCase(MOCK_TITLE)}`,
        edit: `${ROOTS.DASHBOARD}/post/${kebabCase(MOCK_TITLE)}/edit`,
      },
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      details: (id: string) => `${ROOTS.DASHBOARD}/order/${id}`,
      demo: { details: `${ROOTS.DASHBOARD}/order/${MOCK_ID}` },
    },
    job: {
      root: `${ROOTS.DASHBOARD}/job`,
      new: `${ROOTS.DASHBOARD}/job/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/job/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    tour: {
      root: `${ROOTS.DASHBOARD}/tour`,
      new: `${ROOTS.DASHBOARD}/tour/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/tour/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}/edit`,
      },
    },
  },
} as const;
