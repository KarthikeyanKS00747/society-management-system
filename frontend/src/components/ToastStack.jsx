import { useNotificationStore } from "../viewmodels/useNotificationStore";

function ToastStack() {
  const items = useNotificationStore((s) => s.items);
  const dismiss = useNotificationStore((s) => s.dismiss);

  if (items.length === 0) return null;

  return (
    <div className="toast-stack" role="region" aria-live="polite" aria-label="Notifications">
      {items.map((note) => (
        <div key={note.id} className={`toast toast--${note.type || "info"}`} role="status">
          <div className="toast-message">{note.message}</div>
          <button
            className="toast-close"
            type="button"
            onClick={() => dismiss(note.id)}
            aria-label="Dismiss notification"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastStack;
