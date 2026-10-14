import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'atendezap-template-para-rwh6u14l',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_Z-Dku-VMgPKku-vmMxhXXfcmhCOMGlLh',
  authRequired: false,
  auth: { mode: 'headless' },
})
