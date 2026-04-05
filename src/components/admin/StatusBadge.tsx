"use client";

import { useEffect, useRef, useState } from "react";

type Status = "attending" | "invited" | "declined";

const statusConfig: Record<
  Status,
  { label: string; className: string; dotClass: string }
> = {
  attending: {
    label: "Attending",
    className: "status-attending",
    dotClass: "status-dot-attending",
  },
  invited: {
    label: "Pending",
    className: "status-invited",
    dotClass: "status-dot-invited",
  },
  declined: {
    label: "Declined",
    className: "status-declined",
    dotClass: "status-dot-declined",
  },
};

const allStatuses: Status[] = ["attending", "invited", "declined"];

export default function StatusBadge({
  status,
  onChange,
}: {
  status: Status;
  onChange?: (newStatus: Status) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const config = statusConfig[status] ?? {
    label: status,
    className: "status-not-invited",
    dotClass: "",
  };

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!onChange) {
    return (
      <span className={`status-badge ${config.className}`}>
        {config.label}
      </span>
    );
  }

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`status-badge ${config.className} cursor-pointer`}
      >
        {config.label}
        <svg
          className="ml-1.5 -mr-1"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
        >
          <path
            d="M2.5 4L5 6.5L7.5 4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="status-dropdown">
          {allStatuses.map((s) => {
            const sc = statusConfig[s];
            return (
              <button
                key={s}
                className={`status-dropdown-item ${s === status ? "active" : ""}`}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
              >
                <span className={`status-dot ${sc.dotClass}`} />
                {sc.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function NotInvitedBadge() {
  return <span className="status-badge status-not-invited">—</span>;
}
