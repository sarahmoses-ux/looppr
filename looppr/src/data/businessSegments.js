// Detail content for each business vertical's dedicated page
// (pages/BusinessSegment.jsx, routed at /business/:slug). Keep in sync with
// the summary cards in pages/Business.jsx's SEGMENTS array — every summary
// card should link to a slug defined here.
export const BUSINESS_SEGMENTS = [
  {
    slug: 'airbnb-hosts',
    name: 'Airbnb superhosts',
    range: '8–20 lbs/day',
    heroEyebrow: 'For Airbnb superhosts',
    heroTitle: 'Fresh linens for every guest, without a laundry room.',
    heroBody:
      "Running back-to-back turnovers means towels and sheets have to be spotless and ready before the next guest checks in. Looppr picks up dirty linen after checkout and returns it washed, folded and ready to make the bed — on your schedule, not a laundromat's.",
    stat: { value: '24 hrs', label: 'guaranteed turnaround' },
    painPoints: [
      { title: 'Tight turnover windows', body: 'Same-day checkout-to-checkin gaps leave no time to run loads yourself.' },
      { title: 'Guest-facing quality', body: 'One grey towel or stained sheet shows up in a review.' },
      { title: 'Multiple listings', body: 'Coordinating pickups across two, three or ten units by hand doesn’t scale.' },
    ],
    handled: [
      { title: 'Bed sheets & duvet covers', body: 'Washed, pressed and folded to make-the-bed ready.' },
      { title: 'Bath & hand towels', body: 'Hotel-fold finish, every turnover.' },
      { title: 'Guest robes & welcome kits', body: 'For listings that offer them, laundered the same cycle.' },
      { title: 'Emergency same-day turns', body: 'For back-to-back bookings with no gap day.' },
    ],
    testimonial: {
      quote:
        'Managing linens across three units used to eat my mornings. Now bags go out after checkout and come back folded before the next guest arrives.',
      author: 'Priya R. · Airbnb superhost, Looppr Business Starter plan',
    },
  },
  {
    slug: 'boutique-hotels',
    name: 'Boutique hotels',
    range: '50–200 lbs/day',
    heroEyebrow: 'For boutique hotels',
    heroTitle: 'Hotel-grade linen turnaround without an on-site laundry.',
    heroBody:
      "Between housekeeping, staff uniforms and guest linens, small hotel teams end up managing laundry instead of running the property. Looppr takes the daily linen cycle off your plate with pickups timed to housekeeping's schedule.",
    stat: { value: '50–200 lbs', label: 'typical daily volume handled' },
    painPoints: [
      { title: 'Housekeeping bottlenecks', body: 'Room turns wait on linen that’s still mid-cycle.' },
      { title: 'Staff uniform cycles', body: 'Front desk and housekeeping uniforms need their own rotation.' },
      { title: 'Surge weekends & events', body: 'Occupancy spikes shouldn’t mean linen shortages.' },
    ],
    handled: [
      { title: 'Bed linens & duvet covers', body: 'Daily pickup matched to your housekeeping schedule.' },
      { title: 'Bath towels & robes', body: 'Consistent, hotel-standard finish.' },
      { title: 'Staff uniforms', body: 'Front desk, housekeeping and F&B, laundered separately from guest linen.' },
      { title: 'Banquet & event linens', body: 'Surge capacity for weekends and booked events.' },
    ],
    testimonial: {
      quote:
        'Our housekeeping team stopped babysitting a laundry room and started focusing on rooms. Linens show up on schedule, every day.',
      author: 'Marcus T. · General manager, boutique hotel partner',
    },
  },
  {
    slug: 'gyms-studios',
    name: 'Gyms & studios',
    range: '30–80 lbs/day',
    heroEyebrow: 'For gyms & studios',
    heroTitle: 'Clean towels every class, without a laundry closet.',
    heroBody:
      'Members expect a fresh towel stack at every class. Looppr picks up used towels and mats on a set schedule and returns them washed and folded before your next session block.',
    stat: { value: 'Daily pickups', label: 'matched to your class schedule' },
    painPoints: [
      { title: 'Daily towel volume', body: 'A busy class schedule burns through towel stock fast.' },
      { title: 'Mat & apparel hygiene', body: 'Shared equipment needs a reliable wash cycle, not a spot clean.' },
      { title: 'Staff time on laundry', body: 'Front-desk hours spent running loads instead of helping members.' },
    ],
    handled: [
      { title: 'Workout towels', body: 'Washed and restocked on your class-block schedule.' },
      { title: 'Yoga & exercise mats', body: 'Wiped-clean handling with a proper wash cycle.' },
      { title: 'Staff apparel', body: 'Trainer and front-desk uniforms, laundered on rotation.' },
      { title: 'Locker room linens', body: 'Shower towels and robes for full-service locations.' },
    ],
    testimonial: {
      quote: 'We used to run out of clean towels by the 6pm class. Looppr’s daily pickup fixed that overnight.',
      author: 'Jordan K. · Studio owner, Looppr Business Starter plan',
    },
  },
  {
    slug: 'med-spas-salons',
    name: 'Med spas & salons',
    range: '10–30 lbs/day',
    heroEyebrow: 'For med spas & salons',
    heroTitle: 'Treatment linens returned with the care your clients expect.',
    heroBody:
      'Robes and treatment linens need to come back soft, sanitary and on time for the next appointment. Looppr handles the wash cycle with the gentle, consistent care a spa or salon requires — no more back-office laundry runs between clients.',
    stat: { value: 'Gentle-care cycle', label: 'on every order' },
    painPoints: [
      { title: 'Appointment-to-appointment turnaround', body: 'Linens need to be ready before the next client sits down.' },
      { title: 'Delicate fabric care', body: 'Robes and treatment linens can’t survive a rough commercial cycle.' },
      { title: 'Limited back-of-house storage', body: 'Small spaces mean small linen inventory to work with.' },
    ],
    handled: [
      { title: 'Treatment robes', body: 'Gentle-cycle wash, returned soft and fresh.' },
      { title: 'Facial & massage linens', body: 'Sorted and laundered to your care spec.' },
      { title: 'Hand towels', body: 'Restocked on the schedule your appointment book runs on.' },
      { title: 'Staff smocks & aprons', body: 'Laundered separately from client-facing linens.' },
    ],
    testimonial: {
      quote: 'Robes come back soft and on time, every single day. It’s one less thing my team has to think about.',
      author: 'Elena V. · Med spa owner, Looppr Business Starter plan',
    },
  },
]

export function getBusinessSegment(slug) {
  return BUSINESS_SEGMENTS.find((s) => s.slug === slug)
}
