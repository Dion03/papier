import {
  forwardRef, useEffect, useRef, useState,
  type ChangeEvent, type DragEvent, type InputHTMLAttributes, type ReactNode,
} from 'react';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { useMergedRefs } from '../lib/slot';
import { useControllable } from '../lib/useControllable';
import { Field } from './Field';
import { Close, File as FileIcon, Upload } from './icons';

export interface FileRejection { file: File; reason: 'type' | 'size' | 'count'; message: string }

export interface FileFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'children' | 'size'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  hideLabel?: boolean;
  /** The chosen files. */
  value?: File[];
  defaultValue?: File[];
  onFilesChange?: (files: File[]) => void;
  /** Called with files that were refused, and why. They are also announced in the field. */
  onReject?: (rejections: FileRejection[]) => void;
  /** Allowed types, as for the native input: ".jpg,.png", "image/*" or "application/pdf". */
  accept?: string;
  multiple?: boolean;
  /** Largest file in bytes. */
  maxSize?: number;
  /** Most files at once, with `multiple`. */
  maxFiles?: number;
  /** Text in the drop zone; defaults to the "choose files" label. */
  dropText?: ReactNode;
}

/** Whether a file matches an accept string such as ".jpg,image/*". */
export function acceptsFile(file: File, accept?: string): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.split(',').map((a) => a.trim().toLowerCase()).filter(Boolean).some((a) =>
    a.startsWith('.') ? name.endsWith(a) : a.endsWith('/*') ? type.startsWith(a.slice(0, -1)) : type === a);
}

/** A byte count as "840 kB" or "2,4 MB" in the given locale. */
export function formatFileSize(bytes: number, locale: string): string {
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;
  let i = 0;
  let n = bytes;
  while (n >= 1000 && i < units.length - 1) { n /= 1000; i++; }
  return new Intl.NumberFormat(locale, { style: 'unit', unit: units[i], unitDisplay: 'short', maximumFractionDigits: i < 2 ? 0 : 1 }).format(n);
}

const sameFile = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

/**
 * A file input with a drop zone and a list of chosen files. The real <input type="file">
 * covers the zone, so clicking, the keyboard, screen readers and form submission work as
 * usual; dropped and removed files are written back to it. Files of the wrong type, too
 * large or too many are refused with a message. Images show a small preview.
 * The ref points at the input.
 */
export const FileField = forwardRef<HTMLInputElement, FileFieldProps>(function FileField(
  {
    label, hint, error, hideLabel, required, disabled, id, className, value: valueProp, defaultValue = [], onFilesChange, onReject,
    accept, multiple = false, maxSize, maxFiles, dropText, 'aria-describedby': describedBy, ...rest
  }, ref,
) {
  const labels = useLabels();
  const [files, setFiles] = useControllable<File[]>(valueProp, defaultValue, onFilesChange);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<FileRejection[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const inputRef = useMergedRefs(input, ref);
  const list = useRef<HTMLUListElement>(null);
  const focusAfterRemove = useRef<number | null>(null);
  const depth = useRef(0);

  // Keep the native input's FileList equal to what is shown, so a plain form submit sends it.
  useEffect(() => {
    const el = input.current;
    if (!el || typeof DataTransfer === 'undefined') return;
    try {
      const dt = new DataTransfer();
      files.forEach((f) => dt.items.add(f));
      el.files = dt.files;
    } catch { /* older browsers: the input keeps its own selection */ }
  }, [files]);

  useEffect(() => {
    if (focusAfterRemove.current === null) return;
    const buttons = list.current?.querySelectorAll<HTMLButtonElement>('.pp-file__remove');
    const target = buttons?.[Math.min(focusAfterRemove.current, buttons.length - 1)];
    (target ?? input.current)?.focus();
    focusAfterRemove.current = null;
  }, [files]);

  const add = (incoming: File[]) => {
    const refused: FileRejection[] = [];
    let next = multiple ? [...files] : [];
    for (const file of incoming) {
      if (!acceptsFile(file, accept)) refused.push({ file, reason: 'type', message: labels.fileTypeNotAllowed(file.name) });
      else if (maxSize !== undefined && file.size > maxSize) refused.push({ file, reason: 'size', message: labels.fileTooLarge(file.name, formatFileSize(maxSize, labels.locale)) });
      else if (!multiple && incoming.length > 1 && next.length >= 1) refused.push({ file, reason: 'count', message: labels.tooManyFiles(1) });
      else if (maxFiles !== undefined && next.length >= maxFiles && !next.some((f) => sameFile(f, file))) refused.push({ file, reason: 'count', message: labels.tooManyFiles(maxFiles) });
      else next = [...next.filter((f) => !sameFile(f, file)), file];
    }
    setRejected(refused);
    if (refused.length) onReject?.(refused);
    if (next.length !== files.length || next.some((f, i) => f !== files[i])) setFiles(next);
    else if (input.current && typeof DataTransfer !== 'undefined') {
      // Nothing changed, but the native input now holds the refused pick: put the list back.
      try { const dt = new DataTransfer(); files.forEach((f) => dt.items.add(f)); input.current.files = dt.files; } catch { /* see above */ }
    }
  };

  const remove = (index: number) => {
    focusAfterRemove.current = index;
    setRejected([]);
    setFiles(files.filter((_, i) => i !== index));
  };

  const onDrag = (e: DragEvent<HTMLDivElement>, kind: 'enter' | 'over' | 'leave' | 'drop') => {
    if (disabled || !Array.from(e.dataTransfer?.types ?? []).includes('Files')) return;
    e.preventDefault();
    if (kind === 'enter') { depth.current++; setDragging(true); }
    if (kind === 'over') e.dataTransfer.dropEffect = 'copy';
    if (kind === 'leave') { depth.current = Math.max(0, depth.current - 1); if (!depth.current) setDragging(false); }
    if (kind === 'drop') { depth.current = 0; setDragging(false); add(Array.from(e.dataTransfer.files)); }
  };

  return (
    <Field {...{ label, hint, error, hideLabel, required, id, describedBy }} className={cx('pp-file', className)}>
      {(control) => (
        <>
          <div
            className="pp-file__zone"
            data-dragging={dragging || undefined}
            data-disabled={disabled || undefined}
            onDragEnter={(e) => onDrag(e, 'enter')}
            onDragOver={(e) => onDrag(e, 'over')}
            onDragLeave={(e) => onDrag(e, 'leave')}
            onDrop={(e) => onDrag(e, 'drop')}
          >
            <input
              ref={inputRef}
              type="file"
              className="pp-file__input"
              accept={accept}
              multiple={multiple}
              disabled={disabled}
              required={required && files.length === 0}
              onChange={(e: ChangeEvent<HTMLInputElement>) => add(Array.from(e.target.files ?? []))}
              {...control}
              {...rest}
            />
            <Upload className="pp-file__icon" width={22} height={22} />
            <span className="pp-file__text" aria-hidden="true">{dropText ?? labels.chooseFiles(multiple)}</span>
          </div>
          <div className="pp-file__rejected" role="status">
            {rejected.length > 0 && <ul>{rejected.map((r, i) => <li key={i}><span aria-hidden="true">! </span>{r.message}</li>)}</ul>}
          </div>
          {files.length > 0 && (
            <ul ref={list} className="pp-file__list">
              {files.map((f, i) => (
                <FileRow key={`${f.name}-${f.size}-${f.lastModified}`} file={f} size={formatFileSize(f.size, labels.locale)}
                  removeLabel={labels.removeFile(f.name)} disabled={disabled} onRemove={() => remove(i)} />
              ))}
            </ul>
          )}
        </>
      )}
    </Field>
  );
});

function FileRow({ file, size, removeLabel, disabled, onRemove }: { file: File; size: string; removeLabel: string; disabled?: boolean; onRemove: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!file.type.startsWith('image/') || typeof URL.createObjectURL !== 'function') return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <li className="pp-file__item">
      <span className="pp-file__thumb" aria-hidden="true">
        {preview ? <img src={preview} alt="" /> : <FileIcon width={18} height={18} />}
      </span>
      <span className="pp-file__meta">
        <span className="pp-file__name">{file.name}</span>
        <span className="pp-file__size">{size}</span>
      </span>
      <button type="button" className="pp-file__remove" aria-label={removeLabel} title={removeLabel} disabled={disabled} onClick={onRemove}>
        <Close width={16} height={16} />
      </button>
    </li>
  );
}
