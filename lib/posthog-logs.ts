import { posthog } from './posthog'

export const posthogLogs = {
  signInCompleted() {
    posthog?.logger.info('sign-in completed', { flow: 'password' })
  },
  subscriptionExpanded() {
    posthog?.logger.info('subscription expanded', { source: 'home_dashboard' })
  },
}
