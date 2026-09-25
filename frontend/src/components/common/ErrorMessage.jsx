export default function ErrorMessage({ message }) {
  if (!message) return null
  return (
    <p className="mt-4 border border-black bg-[#d77a7a] p-3 font-dell-body text-sm text-black" role="alert">
      {message}
    </p>
  )
}
