export interface PushCampaign {
  id: string;
  title: string;
  body: string;
  /**
   * Optional call-to-action label displayed within supported notification UI.
   * Browsers expose this via actions or when opening a landing page.
   */
  cta?: string;
  /**
   * Landing page path opened when the notification is tapped.
   * Should be a relative URL so the PWA can route offline.
   */
  url?: string;
  /**
   * Marketing persona or trigger the campaign is designed for.
   */
  segment: 'booking' | 'research' | 'stay-prep';
  /**
   * High-level benefit statement to surface in install messaging.
   */
  valueProp: string;
}

export const pushCampaigns: PushCampaign[] = [
  {
    id: 'booking-reminders',
    title: 'Viewing confirmed – here\'s what to expect',
    body: 'We\'ll send you a heads-up as soon as your preferred slot is confirmed and follow up with reminders so nothing slips through.',
    cta: 'Review your viewing plan',
    url: '/#book-viewing',
    segment: 'booking',
    valueProp: 'Stay on top of viewing confirmations and get real-time schedule updates.'
  },
  {
    id: 'insider-guide',
    title: 'Unlock the Apple Cottage insider guide',
    body: 'Receive hand-picked tips about the best rooms to explore, hidden garden corners and nearby walks tailored to your stay.',
    cta: 'See the guide highlights',
    url: '/#highlights',
    segment: 'research',
    valueProp: 'Get insider property tips and local recommendations delivered instantly.'
  },
  {
    id: 'arrival-checklist',
    title: 'Arrival checklist ready for you',
    body: 'We\'ll nudge you with directions, parking details and Wi-Fi info the day before you travel so arrival is stress-free.',
    cta: 'Open the pre-arrival checklist',
    url: '/#plan-your-stay',
    segment: 'stay-prep',
    valueProp: 'Receive pre-arrival reminders with directions, access codes and insider tips.'
  }
];

export const installValuePropositions = pushCampaigns.map((campaign) => campaign.valueProp);
