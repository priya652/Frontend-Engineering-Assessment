/**
 * A tiny inline icon set.
 *
 * Icons are inlined rather than pulled from an icon package: the brief asks us
 * to avoid heavy dependencies, and these nine glyphs cost less than a kilobyte.
 * They inherit `currentColor` and size from font-size, so they compose with any
 * button or text style without extra CSS.
 */
const PATHS = {
  search: 'M11 4a7 7 0 105.2 11.7l3.5 3.6a1 1 0 001.5-1.4l-3.6-3.5A7 7 0 0011 4zm0 2a5 5 0 110 10 5 5 0 010-10z',
  cart: 'M7 18a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM2 3a1 1 0 000 2h1.6l2.5 10.4A2 2 0 008 17h9.5a1 1 0 000-2H8l-.4-1.6h9.6a2 2 0 001.9-1.5L21 6H6.2l-.4-1.6A2 2 0 003.8 3H2z',
  user: 'M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm0 2c-4 0-7.5 2.2-7.5 5v1a1 1 0 001 1h13a1 1 0 001-1v-1c0-2.8-3.5-5-7.5-5z',
  menu: 'M3 6a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm1 5a1 1 0 100 2h16a1 1 0 100-2H4z',
  close: 'M6.2 4.8a1 1 0 00-1.4 1.4l5.8 5.8-5.8 5.8a1 1 0 101.4 1.4l5.8-5.8 5.8 5.8a1 1 0 001.4-1.4L13.4 12l5.8-5.8a1 1 0 00-1.4-1.4L12 10.6 6.2 4.8z',
  star: 'M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.3l6.5-.9L12 2.5z',
  arrowLeft: 'M10.7 5.3a1 1 0 010 1.4L6.4 11H20a1 1 0 110 2H6.4l4.3 4.3a1 1 0 11-1.4 1.4l-6-6a1 1 0 010-1.4l6-6a1 1 0 011.4 0z',
  arrowRight: 'M13.3 5.3a1 1 0 000 1.4l4.3 4.3H4a1 1 0 100 2h13.6l-4.3 4.3a1 1 0 101.4 1.4l6-6a1 1 0 000-1.4l-6-6a1 1 0 00-1.4 0z',
  filter: 'M3 5a1 1 0 011-1h16a1 1 0 01.8 1.6L15 13.3V19a1 1 0 01-1.4.9l-3-1.5a1 1 0 01-.6-.9v-4.2L3.2 5.6A1 1 0 013 5z',
  alert: 'M12 2a1 1 0 01.9.6l9 17A1 1 0 0121 21H3a1 1 0 01-.9-1.4l9-17A1 1 0 0112 2zm0 5a1 1 0 00-1 1v5a1 1 0 002 0V8a1 1 0 00-1-1zm0 9.5a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z',
  box: 'M12 2l9 4.5v11L12 22l-9-4.5v-11L12 2zm0 2.2L5.6 7.4 12 10.6l6.4-3.2L12 4.2zM5 9.1v7.1l6 3v-7.1L5 9.1zm8 10.1l6-3V9.1l-6 3v7.1z',
};

export function Icon({ name, size = '1em', className, ...rest }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={path} />
    </svg>
  );
}

export default Icon;
