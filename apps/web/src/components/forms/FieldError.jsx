export function FieldError({ error }) {
  if (!error) return null;

  return (
    <p role="alert" className="mt-1 text-xs font-medium text-rose-700">
      {error.message}
    </p>
  );
}
