const ORDER_STATUSES = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default function OrderStatusFilter({ value, onChange }) {
  return (
    <select
      className="border px-3 py-2 rounded-md"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">All Orders</option>
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
