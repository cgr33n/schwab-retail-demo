"use client";

export default function ResetButton() {
  async function reset() {
    await fetch("/api/debug/reset", { method: "POST" });
    window.location.reload();
  }

  return (
    <button className="btn btn-danger" onClick={reset} type="button">
      Reset demo data
    </button>
  );
}
