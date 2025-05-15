export default function SearchSort({ search, onSearch, sort, onSort }) {
  return (
    <div className="fade-in fade-in flex space-x-2 mb-4">
      <input
        type="text"
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder="Пошук..."
        className="fade-in fade-in border p-2 rounded flex-1"
      />
      <select value={sort} onChange={e => onSort(e.target.value)} className="fade-in fade-in border p-2 rounded">
        <option value="">Сортування</option>
        <option value="price_asc">Ціна: зростання</option>
        <option value="price_desc">Ціна: спадання</option>
      </select>
    </div>
  )
}
