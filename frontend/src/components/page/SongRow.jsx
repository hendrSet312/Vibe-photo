export default function SongRow({ song, number, active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-current={active}
      aria-label={`Preview ${song.title} by ${song.artist}`}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#000000] ${active ? 'bg-[#fcc20f]' : 'bg-white hover:bg-neutral-100'}`}
    >
      <span className="w-6 shrink-0 font-dell-ui text-xs text-black">{number}</span>
      <span className="min-w-0 flex-1 truncate">
        <span className="font-dell-heading text-sm text-black">{song.title}</span>
        {' '}
        <span className="font-dell-body text-sm text-neutral-600">{song.artist}</span>
      </span>
      <span className="shrink-0 font-dell-ui text-[10px] uppercase text-neutral-600">
        {song.matchLabel || 'Good Match'}
      </span>
    </button>
  )
}
