type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  valueColor?: string;
  subColor?: string;
};

export default function StatCard({ label, value, sub, valueColor, subColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 text-left">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-3xl font-bold tracking-tight mt-1 ${valueColor ?? "text-gray-800"}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 font-medium leading-snug ${subColor ?? "text-gray-400"}`}>{sub}</p>}
    </div>
  );
}
