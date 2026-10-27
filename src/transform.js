// Reshapes the Resend Metrics API response (GET /emails/metrics) into the
// merge variables the views render. Runs in TRMNL's default JS runtime.

// Keep in sync with start_date in settings.yml's polling_url.
const DAYS = 15;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function percent(value) {
  if (value === null || value === undefined) return "–";
  return Number(value).toFixed(2) + "%";
}

function transform(input) {
  const range_label = "Last " + DAYS + " days";

  if (!input || !input.totals) {
    const message = (input && input.message) || "Couldn't load metrics from Resend.";
    return { error: message, range_label: range_label };
  }

  const totals = input.totals;
  const emails = totals.sent || 0;

  // The API omits days with no activity, so walk the full range and fill gaps with 0.
  const byPeriod = {};
  (input.data || []).forEach(function (row) { byPeriod[row.period] = row.sent || 0; });

  const days = [];
  const sent = [];
  const start = new Date(String(input.start_date).slice(0, 10) + "T00:00:00Z");
  for (let i = 0; i < DAYS; i++) {
    const day = new Date(start.getTime() + i * 86400000);
    const key = day.toISOString().slice(0, 10);
    days.push(MONTHS[day.getUTCMonth()] + " " + day.getUTCDate());
    sent.push(byPeriod[key] || 0);
  }

  return {
    emails: emails,
    // Rates are meaningless with nothing sent; show a dash instead of 0%.
    deliverability_rate: emails ? percent(totals.delivery_rate) : "–",
    bounce_rate: emails ? percent(totals.bounce_rate) : "–",
    complaint_rate: emails ? percent(totals.complaint_rate) : "–",
    range_label: range_label,
    days: days,
    sent: sent
  };
}
