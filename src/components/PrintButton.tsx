"use client";

export default function PrintButton() {
  return (
    <button className="btn btn-primary no-print" onClick={() => window.print()} type="button">
      Download PDF
    </button>
  );
}
