export function StatCard({ label, value, hint, icon: Icon, trend }) {
  return (
    <div className="rounded-xl border border-[#D6EEE7] bg-[#F5F0EB] p-6 group transition-all duration-200 hover:shadow-md hover:border-[#2BA68A]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#5A6872]">{label}</p>
          <p className="mt-2 font-['Instrument_Serif'] text-3xl text-[#2A2E35]">{value}</p>
          {hint && <p className="mt-1 text-sm text-[#5A6872]">{hint}</p>}
          {trend && (
            <p className={`mt-2 text-sm font-medium ${trend.up ? "text-[#2BA68A]" : "text-[#E8825A]"}`}>
              {trend.up ? "↑" : "↓"} {trend.value}% from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D6EEE7] text-[#2BA68A] group-hover:bg-[#2BA68A] group-hover:text-white transition-all duration-200">
            <Icon />
          </div>
        )}
      </div>
    </div>
  );
}
