import docRoutePaths from "./docPaths";

export const rootPaths = {
  root: "/",
  dashboardRoot: "dashboard",
  pagesRoot: "pages",
  miscRoot: "misc",
  authRoot: "authentication",
  pricingRoot: "pricing",
  authDefaultJwtRoot: "default/jwt",
  authDefaultFirebaseRoot: "default/firebase",
  authDefaultAuth0Root: "default/auth0",
  errorRoot: "error",
  ecommerceRoot: "ecommerce",
  ecommerceAdminRoot: "admin",
  ecommerceCustomerRoot: "customer",
  eventsRoot: "events",
  emailRoot: "email",
  kanbanRoot: "kanban",
  calendarRoot: "calendar",
  schedulerRoot: "scheduler",
  appsRoot: "apps",
  crmRoot: "crm",
  fileManagerRoot: "file-manager",
  invoiceRoot: "invoice",
  landingRoot: "landing",
};

const paths = {
  showcase: `/showcase`,

  ecommerce: `/${rootPaths.dashboardRoot}/ecommerce`,
  crm: `/${rootPaths.dashboardRoot}/crm`,
  project: `/${rootPaths.dashboardRoot}/project`,
  analytics: `/${rootPaths.dashboardRoot}/analytics`,
  hrm: `/${rootPaths.dashboardRoot}/hrm`,
  timeTracker: `/${rootPaths.dashboardRoot}/time-tracker`,

  starter: `/${rootPaths.pagesRoot}/starter`,
  notifications: `/${rootPaths.pagesRoot}/notifications`,
  defaultJwtLogin: `/${rootPaths.authRoot}/${rootPaths.authDefaultJwtRoot}/login`,
  defaultJwtSignup: `/${rootPaths.authRoot}/${rootPaths.authDefaultJwtRoot}/sign-up`,
  defaultJwtForgotPassword: `/${rootPaths.authRoot}/${rootPaths.authDefaultJwtRoot}/forgot-password`,
  defaultJwt2FA: `/${rootPaths.authRoot}/${rootPaths.authDefaultJwtRoot}/2fa`,
  defaultJwtSetPassword: `/${rootPaths.authRoot}/${rootPaths.authDefaultJwtRoot}/set-password`,

  defaultAuth0Login: `/${rootPaths.authRoot}/${rootPaths.authDefaultAuth0Root}/login`,

  defaultFirebaseLogin: `/${rootPaths.authRoot}/${rootPaths.authDefaultFirebaseRoot}/login`,
  defaultFirebaseSignup: `/${rootPaths.authRoot}/${rootPaths.authDefaultFirebaseRoot}/sign-up`,
  defaultFirebaseForgotPassword: `/${rootPaths.authRoot}/${rootPaths.authDefaultFirebaseRoot}/forgot-password`,

  defaultLoggedOut: `/${rootPaths.authRoot}/default/logged-out`,
  pricingColumn: `/${rootPaths.pagesRoot}/${rootPaths.pricingRoot}/column`,
  pricingTable: `/${rootPaths.pagesRoot}/${rootPaths.pricingRoot}/table`,

  account: `/${rootPaths.pagesRoot}/account`,
  faq: `/${rootPaths.pagesRoot}/faq`,
  comingSoon: `/${rootPaths.pagesRoot}/coming-soon`,
  404: `/${rootPaths.errorRoot}/404`,

  ecommerceHomepage: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceCustomerRoot}/homepage`,
  products: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceCustomerRoot}/products`,
  productDetails: (productId?: string) =>
    `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceCustomerRoot}/product-details${
      productId ? `/${productId}` : ""
    }`,
  cart: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceCustomerRoot}/cart`,
  customerAccount: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceCustomerRoot}/customer-account`,
  checkout: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceCustomerRoot}/checkout`,
  payment: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceCustomerRoot}/payment`,
  orderConfirmation: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceCustomerRoot}/order-confirmation`,
  wishlist: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceCustomerRoot}/wishlist`,
  orderList: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceCustomerRoot}/order-list`,
  orderDetails: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceCustomerRoot}/order-details`,
  orderTrack: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceCustomerRoot}/order-track`,

  adminProductListing: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceAdminRoot}/product-listing`,
  adminProductList: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceAdminRoot}/product-list`,
  adminOrderList: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceAdminRoot}/order-list`,
  adminOrder: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceAdminRoot}/order`,
  adminCreateOrder: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceAdminRoot}/create-order`,
  adminRefund: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceAdminRoot}/refund`,
  adminInvoiceList: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceAdminRoot}/invoice-list`,
  adminInvoice: `/${rootPaths.appsRoot}/${rootPaths.ecommerceRoot}/${rootPaths.ecommerceAdminRoot}/invoice`,

  email: `/${rootPaths.appsRoot}`,
  emailLabel: (label: string) => `/${rootPaths.appsRoot}/email/list/${label}`,
  emailDetails: (label: string, id: string) => `/${rootPaths.appsRoot}/email/details/${label}/${id}`,

  kanban: `/${rootPaths.appsRoot}/${rootPaths.kanbanRoot}`,
  boards: `/${rootPaths.appsRoot}/${rootPaths.kanbanRoot}/boards`,
  createBoard: `/${rootPaths.appsRoot}/${rootPaths.kanbanRoot}/create-board`,

  createEvent: `/${rootPaths.appsRoot}/${rootPaths.eventsRoot}/create-event`,
  events: `/${rootPaths.appsRoot}/${rootPaths.eventsRoot}/event-detail`,

  leadDetails: `/${rootPaths.appsRoot}/${rootPaths.crmRoot}/lead-details`,
  dealDetails: `/${rootPaths.appsRoot}/${rootPaths.crmRoot}/deal-details`,
  addContact: `/${rootPaths.appsRoot}/${rootPaths.crmRoot}/add-contact`,
  deals: `/${rootPaths.appsRoot}/${rootPaths.crmRoot}/deals`,

  chat: `/${rootPaths.appsRoot}/chat`,
  newChat: `/${rootPaths.appsRoot}/chat/new`,
  chatConversation: (userId?: string) => `${paths.chat}/${userId ? `${userId}` : ""}`,
  social: `/${rootPaths.appsRoot}/social`,
  fileManager: `/${rootPaths.appsRoot}/${rootPaths.fileManagerRoot}`,
  fileManagerFolder: (folderId: string) => `/${rootPaths.appsRoot}/${rootPaths.fileManagerRoot}/${folderId}`,

  invoice: `/${rootPaths.appsRoot}/${rootPaths.invoiceRoot}`,
  invoiceList: `/${rootPaths.appsRoot}/${rootPaths.invoiceRoot}/invoice-list`,
  createInvoice: `/${rootPaths.appsRoot}/${rootPaths.invoiceRoot}/create-invoice`,
  invoicePreview: `/${rootPaths.appsRoot}/${rootPaths.invoiceRoot}/invoice-preview`,
  invoicePreviewWithId: (id: string) => `/${rootPaths.appsRoot}/${rootPaths.invoiceRoot}/invoice-preview/${id}`,

  calendar: `/${rootPaths.appsRoot}/${rootPaths.calendarRoot}`,
  scheduler: `/${rootPaths.appsRoot}/${rootPaths.schedulerRoot}`,

  landingHomepage: `/${rootPaths.pagesRoot}/${rootPaths.landingRoot}/homepage`,
  landingAbout: `/${rootPaths.pagesRoot}/${rootPaths.landingRoot}/about-us`,
  landingContact: `/${rootPaths.pagesRoot}/${rootPaths.landingRoot}/contact`,
  landingHelp: `/${rootPaths.pagesRoot}/${rootPaths.landingRoot}/help`,
  landingFaq: `/${rootPaths.pagesRoot}/${rootPaths.landingRoot}/faq`,
  landing404: `/${rootPaths.pagesRoot}/${rootPaths.landingRoot}/404`,
  landingComingSoon: `/${rootPaths.pagesRoot}/${rootPaths.landingRoot}/coming-soon`,
  landingMaintenance: `/${rootPaths.pagesRoot}/${rootPaths.landingRoot}/maintenance`,

  ...docRoutePaths,
};

export const authPaths = {
  /* ---------------------------------JWT----------------------------------------- */
  login: paths.defaultJwtLogin,
  signup: paths.defaultJwtSignup,
  forgotPassword: paths.defaultJwtForgotPassword,
  setNewPassword: paths.defaultJwtSetPassword,
  twoFactorAuth: paths.defaultJwt2FA,
  /* ---------------------------------Firebase----------------------------------------- */
  // login: paths.defaultFirebaseLogin,
  // signup: paths.defaultFirebaseSignup,
  // forgotPassword: paths.defaultFirebaseForgotPassword,
  /* ---------------------------------Auth0----------------------------------------- */
  // login: paths.defaultAuth0Login,
};

export const apiEndpoints = {
  register: "/auth/register",
  login: "/auth/login",
  logout: "/auth/logout",
  profile: "/auth/profile",
  getUsers: "/users",
  forgotPassword: "/auth/forgot-password",
  setPassword: "/auth/set-password",
  getProduct: (id: string) => `e-commerce/products/${id}`,
};

export default paths;
