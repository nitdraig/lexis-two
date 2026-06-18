'use client';

import { useRef } from 'react';

// lexis: native <dialog> instead of modal library — focus trap, backdrop, and ESC built in
export function ConfirmDeleteButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()}>
        Delete item
      </button>
      <dialog ref={dialogRef} className="confirm-dialog">
        <h2>Confirm delete</h2>
        <p>This cannot be undone.</p>
        <form method="dialog">
          <button value="cancel">Cancel</button>
          <button value="confirm">Delete</button>
        </form>
      </dialog>
    </>
  );
}
