// Tabel data.
//
// Aturan skill §9.F: JANGAN pakai border atas + bawah di setiap baris.
// Di sini hanya ada satu garis pemisah antar baris (divide-y), tanpa
// kotak tambahan, dan angka memakai tabular figures supaya kolom tidak
// bergoyang saat nilainya berubah.
export default function DataTable({
  columns,
  rows,
  empty = 'Tidak ada data.',
  rowKey = (r) => r.id,
  onRowClick,
  loading = false,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13.5px]">
        <thead>
          <tr className="border-b border-hairline text-left">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={`px-5 py-3 text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted ${c.headerClass || ''}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-hairline)]">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={`sk-${i}`}>
                {columns.map((c) => (
                  <td key={c.key} className="px-5 py-4">
                    <div className="h-3.5 w-3/5 animate-pulse rounded-[5px] surface-sunken" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-14 text-center text-[13px] text-secondary">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr
                key={rowKey(r)}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={`transition-colors duration-150 hover:surface-hover ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-5 py-3.5 align-middle text-primary ${c.className || ''}`}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
