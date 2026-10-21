"use client";

import { useState } from "react";
import { Plus, SlidersHorizontal, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Inputs";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { cx } from "@/lib/cx";
import type { IdentityApi } from "@/lib/state";

/** The "Image profile" row: pick a saved profile, save a copy, or manage them. */
export function ProfilePicker({ identity, showManage = true }: { identity: IdentityApi; showManage?: boolean }) {
  const [manageOpen, setManageOpen] = useState(false);
  const { profiles, active } = identity;

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
        <User className="size-3.5" aria-hidden />
        Image profile
      </div>
      {profiles.length === 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12.5px] text-muted">No profile yet. Fill in the fields below and it&apos;s saved automatically.</p>
          <Button size="sm" icon={<Plus className="size-3.5" aria-hidden />} onClick={() => identity.saveAsNew()}>
            Save as new
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              className="min-w-0 flex-1 basis-56"
              ariaLabel="Image profile"
              value={active?.id ?? profiles[0].id}
              options={profiles.map((p) => ({ value: p.id, label: p.label }))}
              onChange={identity.select}
            />
            <Button size="sm" icon={<Plus className="size-3.5" aria-hidden />} onClick={() => identity.saveAsNew()}>
              Save as new
            </Button>
            {showManage && (
              <Button size="sm" variant="ghost" icon={<SlidersHorizontal className="size-3.5" aria-hidden />} onClick={() => setManageOpen(true)}>
                Manage
              </Button>
            )}
          </div>
          <p className="mt-1.5 text-[12px] text-muted">
            Changes to the photo, name or handle update “{active?.label ?? profiles[0].label}”.
          </p>
        </>
      )}
      <ManageProfilesModal open={manageOpen} onClose={() => setManageOpen(false)} identity={identity} />
    </div>
  );
}

function ManageProfilesModal({ open, onClose, identity }: { open: boolean; onClose: () => void; identity: IdentityApi }) {
  return (
    <Modal open={open} onClose={onClose} title="Manage image profiles">
      {identity.profiles.length === 0 ? (
        <p className="text-[13px] text-muted">No profiles yet. Type your name or add a photo and one is saved automatically.</p>
      ) : (
        <ul className="space-y-2">
          {identity.profiles.map((p) => {
            const isActive = identity.active?.id === p.id;
            return (
              <li
                key={p.id}
                className={cx("flex items-center gap-2 rounded-xl border p-2", isActive ? "border-accent bg-accent-soft/50" : "border-line")}
              >
                <button
                  type="button"
                  onClick={() => identity.select(p.id)}
                  aria-label={`Use ${p.label}`}
                  className="size-9 shrink-0 overflow-hidden rounded-full bg-gray-200"
                >
                  {p.photo && (
                    // eslint-disable-next-line @next/next/no-img-element -- local data URL
                    <img src={p.photo} alt="" className="size-full object-cover" />
                  )}
                </button>
                <TextInput
                  aria-label="Profile name"
                  defaultValue={p.label}
                  className="h-9"
                  onBlur={(e) => identity.rename(p.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  }}
                />
                <button
                  type="button"
                  onClick={() => identity.remove(p.id)}
                  aria-label={`Delete ${p.label}`}
                  className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-[12px] text-muted">Tap a photo to use that profile. Rename by editing the name.</p>
      <div className="mt-4 flex justify-end">
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
}
