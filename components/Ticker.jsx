// Single source of truth — update here, reflects everywhere (Ticker + Stats)
export const SITE_STATS = [
  { num: '6M+',  label: 'Total Views'    },
  { num: '80+',  label: 'Train Reviews'  },
  { num: '42K+', label: 'Subscribers'    },
  { num: '7+',   label: 'Years On Track' },
];

const TICKER_ITEMS = [
  `${SITE_STATS[0].num} ${SITE_STATS[0].label}`,
  `${SITE_STATS[1].num} Train Reviews`,
  'Pakistan Railways · Documented',
  'Lahore · Karachi · Peshawar · Quetta',
  'Now Booking Collaborations',
  `${SITE_STATS[2].num} Subscribers`,
];

export default function Ticker() {
  const all = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="ticker">
      <div className="ticker-inner">
        {all.map((item, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}