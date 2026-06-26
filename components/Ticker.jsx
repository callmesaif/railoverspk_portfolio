const ITEMS = [
  '6M+ Total Views',
  '80+ Train Reviews',
  'Pakistan Railways · Documented',
  'Lahore · Karachi · Peshawar · Quetta',
  'Now Booking Collaborations',
  '42K+ Subscribers',
];

export default function Ticker() {
  // Duplicate items so the loop is seamless
  const all = [...ITEMS, ...ITEMS];

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
