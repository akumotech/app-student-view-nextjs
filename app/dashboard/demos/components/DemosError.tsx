export default function DemosError({ message }: { message: string }) {
  return (
    <div className="text-center text-red-500 py-8">
      <h2>Error</h2>
      <p>{message}</p>
    </div>
  );
}
