export type UpiApp = "gpay" | "phonepe" | "paytm";

const APPS: Record<UpiApp, { androidPackage: string; iosPrefix: string }> = {
  gpay: { androidPackage: "com.google.android.apps.nbu.paisa.user", iosPrefix: "gpay://upi/pay" },
  phonepe: { androidPackage: "com.phonepe.app", iosPrefix: "phonepe://pay" },
  paytm: { androidPackage: "net.one97.paytm", iosPrefix: "paytmmp://pay" },
};

export const upiQuery = (id: string, name: string, amount: number, room: string) =>
  `pa=${encodeURIComponent(id)}&pn=${encodeURIComponent(name)}&am=${amount}.00&cu=INR&tn=${encodeURIComponent(`Rent Room ${room}`)}`;

export const upiLink = (query: string) => `upi://pay?${query}`;

// Android can target one app directly. If it's missing, the browser returns to this page.
export function upiAppLink(app: UpiApp, query: string, userAgent: string, returnUrl: string) {
  if (/android/i.test(userAgent)) {
    return `intent://pay?${query}#Intent;scheme=upi;package=${APPS[app].androidPackage};S.browser_fallback_url=${encodeURIComponent(returnUrl)};end`;
  }
  if (/iphone|ipad|ipod/i.test(userAgent)) return `${APPS[app].iosPrefix}?${query}`;
  return upiLink(query);
}
