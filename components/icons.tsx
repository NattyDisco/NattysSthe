import React from 'react';

export interface IconProps {
    className?: string;
    title?: string;
}

const BaseIcon: React.FC<IconProps & { children: React.ReactNode; viewBox?: string; fill?: string; stroke?: string }> = ({ 
    className = "h-6 w-6", 
    title,
    children, 
    viewBox = "0 0 24 24",
    fill = "none",
    stroke = "currentColor"
}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill={fill} viewBox={viewBox} strokeWidth={1.5} stroke={stroke} className={className}>
        {title && <title>{title}</title>}
        {children}
    </svg>
);

export const MenuIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></BaseIcon>
);

export const SearchIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></BaseIcon>
);

export const SunIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></BaseIcon>
);

export const MoonIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></BaseIcon>
);

export const UserCircleIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></BaseIcon>
);

export const PasswordIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></BaseIcon>
);

export const LogoutIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></BaseIcon>
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.114-.94h2.584c.554 0 1.024.398 1.114.94l.213 1.281c.063.374.313.686.645.87.331.185.732.21 1.088.067l1.231-.497c.513-.207 1.104-.001 1.378.472l1.292 2.238c.273.473.153 1.074-.285 1.41l-1.037.797c-.296.227-.453.601-.418.974.035.374.24.71.554.912l1.037.665c.453.291.603.882.355 1.376l-1.292 2.238c-.248.494-.852.709-1.378.502l-1.231-.482c-.356-.139-.757-.114-1.088.071-.332.185-.582.497-.645.87l-.213 1.281c-.09.542-.56.94-1.114.94h-2.584c-.554 0-1.024-.398-1.114-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a1.442 1.442 0 00-1.088-.071l-1.231.482c-.513.207-1.104.001-1.378-.502l-1.292-2.238c-.273-.473-.153-1.074.285-1.41l1.037-.797c.296-.227.453-.601.418-.974a1.442 1.442 0 00-.554-.912l-1.037-.665a1.125 1.125 0 01-.355-1.376l1.292-2.238c.248-.494.852-.709 1.378-.502l1.231.482c.356.139.757.114 1.088-.071.332-.185.582-.497.645-.87l.213-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></BaseIcon>
);

export const BellIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></BaseIcon>
);

export const DashboardIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" /></BaseIcon>
);

export const UsersIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></BaseIcon>
);

export const AttendanceIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></BaseIcon>
);

export const RequestsIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></BaseIcon>
);

export const TasksIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0018 4.5h-2.25a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 0015.75 18.75zM2.25 6.75A2.25 2.25 0 014.5 4.5h2.25a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 016.75 18.75H4.5a2.25 2.25 0 01-2.25-2.25V6.75z" /></BaseIcon>
);

export const PayrollIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75m0 1.5v.75m0 1.5v.75m0 1.5V15m-1.5-1.5h.75m1.5 0h.75m1.5 0h.75m1.5 0H6m-1.5-1.5h.75m1.5 0h.75m1.5 0h.75m1.5 0H6m-1.5-1.5h.75m1.5 0h.75m1.5 0h.75m1.5 0H6m-1.5-1.5h.75m1.5 0h.75m1.5 0h.75m1.5 0H6zM15 3.75H6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 006 21.75h9a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25z" /></BaseIcon>
);

export const BuildingOfficeIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></BaseIcon>
);

export const IdentificationIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></BaseIcon>
);

export const CurrencyDollarIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></BaseIcon>
);

export const ClipboardDocumentListIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0018 4.5h-2.25a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 0015.75 18.75zM2.25 6.75A2.25 2.25 0 014.5 4.5h2.25a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 016.75 18.75H4.5a2.25 2.25 0 01-2.25-2.25V6.75z" /></BaseIcon>
);

export const Cog8ToothIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.114-.94h1.086c.554 0 1.024.398 1.114.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.768.768a1.125 1.125 0 01.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.894.15c.542.09.94.56.94 1.114v1.086c0 .554-.398 1.024-.94 1.114l-.894.149c-.424.07-.764.384-.93.78-.164.398-.142.855.108 1.205l.527.738a1.125 1.125 0 01-.12 1.45l-.768.767a1.125 1.125 0 01-1.45.12l-.737-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.93l-.15.894c-.09.542-.56.94-1.114.94h-1.086c-.554 0-1.024-.398-1.114-.94l-.149-.894c-.07-.424-.384-.764-.78-.93-.398-.164-.855-.142-1.205.108l-.738.527a1.125 1.125 0 01-1.45-.12l-.767-.768a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272-.806.107-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.114v-1.086c0-.554.398-1.024.94-1.114l.894-.149c.424-.07.764-.384.93-.78.164-.398.142-.855-.108-1.205l-.527-.738a1.125 1.125 0 01.12-1.45l.768-.767a1.125 1.125 0 011.45-.12l.737.527c.35.25.806.272 1.204.107.397-.165.71-.505.78-.93l.15-.894z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></BaseIcon>
);

export const FingerPrintIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.263M14.52 3.136a8.277 8.277 0 00-5.02 1.096m10.14 5.019a8.3 8.3 0 00-.202-1.792m-9.74 11.579a9.916 9.916 0 000-2.4c0-1.2.32-2.4.92-3.48m1.23-2.52a4.5 4.5 0 014.24 3.06m-2.12 7.14a1.31 1.31 0 102.62 0c0-.66-.54-1.2-1.31-1.2a1.31 1.31 0 00-1.31 1.2zm-2.62-5.4a4.5 4.5 0 004.24-3.06" /></BaseIcon>
);

export const ArrowDownOnSquareIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></BaseIcon>
);

export const ArrowUpOnSquareIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></BaseIcon>
);

export const DataAnalyticsIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V19.875c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></BaseIcon>
);

export const ClockIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></BaseIcon>
);

export const MegaphoneIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.033.51.064.769.093l2.31 4.622a.45.45 0 00.404.248h.902a.45.45 0 00.45-.45V3.54a.45.45 0 00-.45-.45h-.902a.45.45 0 00-.404.248L11.11 7.962a12.156 12.156 0 01-.77.093m0 9.18V7.962" /></BaseIcon>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></BaseIcon>
);

export const MinusIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></BaseIcon>
);

export const TrophyIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871V6a3.75 3.75 0 00-7.5 0v5.25h-.871c-.621 0-1.125.504-1.125 1.125v3.375m9 0h-9" /></BaseIcon>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></BaseIcon>
);

export const ExclamationCircleIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></BaseIcon>
);

export const CarIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 00-3 0m3 0h5.25m-1.875-1.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-10.875 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 16.5h16.5M4.5 9h15M5.25 3h13.5A2.25 2.25 0 0121 5.25v13.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75V5.25A2.25 2.25 0 015.25 3z" /></BaseIcon>
);

export const BulkAttendanceIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></BaseIcon>
);

export const BellAlertIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" /></BaseIcon>
);

export const ShoppingCartIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></BaseIcon>
);

export const EditIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></BaseIcon>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></BaseIcon>
);

export const EllipsisVerticalIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></BaseIcon>
);

export const ChartIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0v16.5m0 0h16.5m-15-3v-1.5m1.5 1.5h1.5m-1.5-3v-1.5m1.5 1.5h1.5m4.5-4.5v-1.5m1.5 1.5h1.5M15 9V7.5m1.5 1.5h1.5m-3 4.5v-1.5m1.5 1.5h1.5" /></BaseIcon>
);

export const ChevronLeftIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></BaseIcon>
);

export const ChevronRightIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></BaseIcon>
);

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></BaseIcon>
);

export const ArrowUpIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></BaseIcon>
);

export const ArrowDownIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></BaseIcon>
);

export const EmailIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75-9.75-6.75" /></BaseIcon>
);

export const BriefcaseIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .414-.336.75-.75.75H4.5a.75.75 0 01-.75-.75v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 11.9v2.25m16.5 0c0 .621-.504 1.125-1.125 1.125H5.625A1.125 1.125 0 014.5 14.15m11.25-9.4a1.5 1.5 0 00-1.5-1.5h-4.5a1.5 1.5 0 00-1.5 1.5v2.25h7.5V4.75z" /></BaseIcon>
);

export const PrinterIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12h10.5M6.75 15.75h10.5M3 12.75A2.25 2.25 0 015.25 10.5h13.5A2.25 2.25 0 0121 12.75v3.75a2.25 2.25 0 01-2.25 2.25h-13.5A2.25 2.25 0 013 16.5v-3.75zM15 10.5V4.875C15 4.254 14.496 3.75 13.875 3.75h-3.75C9.504 3.75 9 4.254 9 4.875V10.5h6z" /></BaseIcon>
);

export const CalendarDaysIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></BaseIcon>
);

export const UserGroupIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></BaseIcon>
);

export const ExportIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></BaseIcon>
);

export const ArrowTrendingUpIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.5 4.5L21.75 7.5M21.75 7.5V12m0-4.5H17.25" /></BaseIcon>
);

export const ArrowTrendingDownIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.5-4.5L21.75 16.5M21.75 16.5V12m0 4.5H17.25" /></BaseIcon>
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></BaseIcon>
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></BaseIcon>
);

export const UserIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></BaseIcon>
);

export const XCircleIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></BaseIcon>
);

export const LogoIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></BaseIcon>
);

export const LockClosedIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></BaseIcon>
);

export const LanguageIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896 1.611 1.603 3.332 2.112 5.12" /></BaseIcon>
);

export const ExclamationTriangleIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></BaseIcon>
);

export const InformationCircleIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></BaseIcon>
);

export const PhoneIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.143-5.111-3.43-6.254-6.254l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></BaseIcon>
);

export const WhatsappIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75a9.718 9.718 0 01-4.875-1.312l-4.125 1.125 1.125-4.125A9.75 9.75 0 1112 21.75z" /></BaseIcon>
);

export const SaveIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></BaseIcon>
);

export const CloudArrowUpIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></BaseIcon>
);

export const PaintBrushIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-3.012 3.011l.02.022a1.5 1.5 0 01-2.062 2.062l-.02-.022a4.5 4.5 0 014.5-4.5h.019c.682 0 1.343-.271 1.823-.75l6.495-6.495a1.5 1.5 0 012.122 2.122l-6.495 6.495a1.5 1.5 0 01-1.11.455z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12l4.5 4.5" /></BaseIcon>
);

export const DocumentTextIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></BaseIcon>
);

export const AuditLogIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-1.5l1.13-1.897a6.75 6.75 0 119.331-3.306 6.75 6.75 0 01-9.331 3.306z" /></BaseIcon>
);

export const CloudIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" /></BaseIcon>
);

export const ShiftsIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></BaseIcon>
);

export const CalculatorIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-3-2.25V18m-3-2.25V18m3-3V1.5m-3 0v13.5m-3-13.5v13.5m3-13.5h3.75a1.125 1.125 0 011.125 1.125V15a1.125 1.125 0 01-1.125 1.125H5.625A1.125 1.125 0 014.5 15V2.625c0-.621.504-1.125 1.125-1.125H9z" /></BaseIcon>
);

export const PencilSquareIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></BaseIcon>
);

export const BrainCircuitIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6c0-1.291-.406-2.487-1.1-3.464a6.75 6.75 0 11-9.8 0A6 6 0 006 12.75a6 6 0 006 6zm-1.5-6h.008v.008H10.5V12.75zm3 0h.008v.008H13.5V12.75z" /></BaseIcon>
);

export const PaperClipIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32a1.5 1.5 0 01-2.121-2.121L14.075 8.56" /></BaseIcon>
);

export const GripVerticalIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></BaseIcon>
);

export const EyeIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183.059.18.059.38 0 .559-1.39 4.176-5.325 7.183-9.963 7.183-4.637 0-8.573-3.007-9.963-7.183z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></BaseIcon>
);

export const StarIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></BaseIcon>
);

export const ImportIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></BaseIcon>
);

export const HashtagIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" /></BaseIcon>
);

export const ArrowPathIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></BaseIcon>
);

export const HelpIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></BaseIcon>
);

export const ArrowsPointingOutIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0l-5.25-5.25" /></BaseIcon>
);

export const ArrowsPointingInIcon: React.FC<IconProps> = (props) => (
    <BaseIcon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v4.5M9 7.5H4.5M9 7.5L3.75 2.25M9 21v-4.5M9 16.5H4.5M9 16.5L3.75 21.75M15 3v4.5M15 7.5h4.5M15 7.5l5.25-5.25M15 21v-4.5M15 16.5h4.5m-4.5 0l5.25 5.25" /></BaseIcon>
);