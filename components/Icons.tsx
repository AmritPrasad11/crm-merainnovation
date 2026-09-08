import React from 'react';

export function Icon({ d, className = 'w-4 h-4', ...props }: { d: string | string[]; className?: string; [key: string]: any }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
}

export const Menu = (props: any) => (
  <Icon d={['M4 12h16', 'M4 6h16', 'M4 18h16']} {...props} />
);

export const X = (props: any) => (
  <Icon d={['M18 6 6 18', 'm6 6 12 12']} {...props} />
);

export const Trash = (props: any) => (
  <Icon d={['M3 6h18', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2']} {...props} />
);

export const Archive = (props: any) => (
  <Icon d={['M21 8v13H3V8', 'M1 3h22v5H1z', 'M10 12h4']} {...props} />
);

export const Download = (props: any) => (
  <Icon d={['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3']} {...props} />
);

export const Upload = (props: any) => (
  <Icon d={['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm17 8-5-5-5 5', 'M12 3v12']} {...props} />
);

export const ArrowLeft = (props: any) => (
  <Icon d={['M19 12H5', 'm12 19-7-7 7-7']} {...props} />
);

export const LayoutDashboard = (props: any) => (
  <Icon
    d={[
      'M3 3h7v7H3z',
      'M14 3h7v4h-7z',
      'M14 11h7v10h-7z',
      'M3 14h7v7H3z',
    ]}
    {...props}
  />
);

export const Building2 = (props: any) => (
  <Icon
    d={[
      'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z',
      'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2',
      'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2',
      'M10 6h4',
      'M10 10h4',
      'M10 14h4',
      'M10 18h4',
    ]}
    {...props}
  />
);

export const Users = (props: any) => (
  <Icon
    d={[
      'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
      'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
      'M22 21v-2a4 4 0 0 0-3-3.87',
      'M16 3.13a4 4 0 0 1 0 7.75',
    ]}
    {...props}
  />
);

export const CalendarClock = (props: any) => (
  <Icon
    d={[
      'M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5',
      'M16 2v4',
      'M8 2v4',
      'M3 10h18',
      'M17.5 17.5 16 16.25V14',
      'M22 16a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z',
    ]}
    {...props}
  />
);

export const Send = (props: any) => (
  <Icon d={['m22 2-7 20-4-9-9-4Z', 'M22 2 11 13']} {...props} />
);

export const MessageSquare = (props: any) => (
  <Icon d={['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z']} {...props} />
);

export const FileText = (props: any) => (
  <Icon
    d={[
      'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z',
      'M14 2v4a2 2 0 0 0 2 2h4',
      'M10 9H8',
      'M16 13H8',
      'M16 17H8',
    ]}
    {...props}
  />
);

export const ShieldAlert = (props: any) => (
  <Icon
    d={[
      'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      'M12 8v4',
      'M12 16h.01',
    ]}
    {...props}
  />
);

export const FileCheck = (props: any) => (
  <Icon
    d={[
      'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z',
      'M14 2v4a2 2 0 0 0 2 2h4',
      'm9 15 2 2 4-4',
    ]}
    {...props}
  />
);

export const LayoutTemplate = (props: any) => (
  <Icon
    d={[
      'M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z',
      'M21 9H3',
      'M9 21V9',
    ]}
    {...props}
  />
);

export const BarChart3 = (props: any) => (
  <Icon d={['M3 3v18h18', 'M18 17V9', 'M13 17V5', 'M8 17v-3']} {...props} />
);

export const UserCheck = (props: any) => (
  <Icon
    d={[
      'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
      'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
      'm16 11 2 2 4-4',
    ]}
    {...props}
  />
);

export const Settings = (props: any) => (
  <Icon
    d={[
      'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
      'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    ]}
    {...props}
  />
);

export const LogOut = (props: any) => (
  <Icon d={['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5', 'M21 12H9']} {...props} />
);

export const CheckCircle2 = (props: any) => (
  <Icon d={['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'm9 12 2 2 4-4']} {...props} />
);

export const Clock = (props: any) => (
  <Icon d={['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 6v6l4 2']} {...props} />
);

export const AlertTriangle = (props: any) => (
  <Icon
    d={['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z', 'M12 9v4', 'M12 17h.01']}
    {...props}
  />
);

export const TrendingUp = (props: any) => (
  <Icon d={['m22 7-8.5 8.5-5-5L1 18', 'M16 7h6v6']} {...props} />
);

export const Award = (props: any) => (
  <Icon
    d={[
      'm15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526',
      'M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
    ]}
    {...props}
  />
);

export const ArrowRight = (props: any) => (
  <Icon d={['M5 12h14', 'm12 5 7 7-7 7']} {...props} />
);

export const Sparkles = (props: any) => (
  <Icon
    d={[
      'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
    ]}
    {...props}
  />
);

export const Plus = (props: any) => (
  <Icon d={['M5 12h14', 'M12 5v14']} {...props} />
);

export const Search = (props: any) => (
  <Icon d={['m21 21-4.3-4.3', 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z']} {...props} />
);

export const Filter = (props: any) => (
  <Icon d={['M22 3H2l8 9.46V19l4 2v-8.54L22 3z']} {...props} />
);

export const ArrowUpDown = (props: any) => (
  <Icon d={['m7 15 5 5 5-5', 'm7 9 5-5 5 5']} {...props} />
);

export const MapPin = (props: any) => (
  <Icon
    d={['M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z', 'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z']}
    {...props}
  />
);

export const Bot = (props: any) => (
  <Icon
    d={[
      'M12 8V4H8',
      'M2 14h2',
      'M20 14h2',
      'M15 13v2',
      'M9 13v2',
      'M5 10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8Z',
    ]}
    {...props}
  />
);

export const Microscope = (props: any) => (
  <Icon
    d={[
      'M6 18h8',
      'M3 22h18',
      'M14 22a7 7 0 1 0-14 0',
      'M9 14h2',
      'M9 12a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2',
      'M12 2v2',
    ]}
    {...props}
  />
);

export const Phone = (props: any) => (
  <Icon
    d={[
      'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
    ]}
    {...props}
  />
);

export const Mail = (props: any) => (
  <Icon d={['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', 'm22 6-10 7L2 6']} {...props} />
);

export const User = (props: any) => (
  <Icon d={['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z']} {...props} />
);

export const ChevronRight = (props: any) => (
  <Icon d={['m9 18 6-6-6-6']} {...props} />
);

export const Shield = (props: any) => (
  <Icon d={['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z']} {...props} />
);

export const Edit = (props: any) => (
  <Icon d={['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z']} {...props} />
);

export const ArrowUpRight = (props: any) => (
  <Icon d={['M7 17 17 7', 'M7 7h10v10']} {...props} />
);

export const Globe = (props: any) => (
  <Icon
    d={['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M2 12h20', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z']}
    {...props}
  />
);

export const Calendar = (props: any) => (
  <Icon
    d={['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z']}
    {...props}
  />
);

export const ChevronDown = (props: any) => (
  <Icon d={['m6 9 6 6 6-6']} {...props} />
);

export const Lock = (props: any) => (
  <Icon d={['M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z', 'M7 11V7a5 5 0 0 1 10 0v4']} {...props} />
);

export const ShieldCheck = (props: any) => (
  <Icon d={['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'm9 12 2 2 4-4']} {...props} />
);

export const Server = (props: any) => (
  <Icon d={['M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z', 'M2 14a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4z', 'M6 8h.01', 'M6 16h.01']} {...props} />
);

export const Database = (props: any) => (
  <Icon d={['M12 2c5.523 0 10 1.79 10 4s-4.477 4-10 4S2 8.21 2 6s4.477-4 10-4z', 'M21 12c0 2.21-4.477 4-10 4s-10-1.79-10-4', 'M21 18c0 2.21-4.477 4-10 4s-10-1.79-10-4', 'M3 6v12', 'M21 6v12']} {...props} />
);

export const RotateCcw = (props: any) => (
  <Icon d={['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5']} {...props} />
);

export const ArrowRightLeft = (props: any) => (
  <Icon d={['m16 3 4 4-4 4', 'M20 7H4', 'm8 21-4-4 4-4', 'M4 17h16']} {...props} />
);

export const Edit2 = (props: any) => (
  <Icon d={['M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z']} {...props} />
);

export const XCircle = (props: any) => (
  <Icon d={['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'm15 9-6 6', 'm9 9 6-6']} {...props} />
);

export const Eye = (props: any) => (
  <Icon d={['M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z']} {...props} />
);
