import React from 'react';
import {
  Plus,
  Users,
  Wallet,
  List,
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  Building2,
  UserCheck,
  ArrowUpDown,
  ArrowLeft,
  Search,
  Edit3,
  Phone,
  MapPin,
  Bell,
  User,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  XCircle,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Download,
  Upload,
  Save,
  Settings,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Check,
  Menu,
  Home,
  BarChart3,
  PieChart,
  TrendingDown,
  Calculator,
  FileText,
  Printer,
  Share2,
  Copy,
  ExternalLink,
  Mail,
  MessageCircle,
  Calendar,
  Clock,
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  Monitor
} from 'lucide-react';

/**
 * Icon component wrapper for consistent styling and sizing
 * @param {Object} props - Component properties
 * @param {string} props.name - Icon name from Lucide React
 * @param {string} props.size - Icon size (xs, sm, md, lg, xl)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.color - Icon color (primary, secondary, success, warning, error)
 * @param {Function} props.onClick - Click handler
 */
const Icon = ({ 
  name, 
  size = 'md', 
  className = '', 
  color = 'current',
  onClick,
  ...rest 
}) => {
  // Size mapping
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10'
  };

  // Color mapping
  const colorClasses = {
    current: 'text-current',
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
    muted: 'text-gray-400'
  };

  // Icon mapping
  const iconMap = {
    // Navigation & Actions
    plus: Plus,
    menu: Menu,
    home: Home,
    search: Search,
    filter: Filter,
    settings: Settings,
    refresh: RefreshCw,
    
    // Arrows & Chevrons
    'arrow-left': ArrowLeft,
    'arrow-up-down': ArrowUpDown,
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
    'chevron-down': ChevronDown,
    'chevron-up': ChevronUp,
    
    // Users & People
    user: User,
    users: Users,
    'user-check': UserCheck,
    
    // Finance & Money
    'dollar-sign': DollarSign,
    wallet: Wallet,
    'credit-card': CreditCard,
    receipt: Receipt,
    calculator: Calculator,
    
    // Charts & Analytics
    'bar-chart': BarChart3,
    'pie-chart': PieChart,
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
    
    // Buildings & Places
    building: Building2,
    globe: Globe,
    'map-pin': MapPin,
    
    // Communication
    phone: Phone,
    mail: Mail,
    bell: Bell,
    'message-circle': MessageCircle,
    
    // Files & Documents
    list: List,
    'file-text': FileText,
    download: Download,
    upload: Upload,
    save: Save,
    printer: Printer,
    copy: Copy,
    share: Share2,
    'external-link': ExternalLink,
    
    // Status & Feedback
    check: Check,
    'check-circle': CheckCircle,
    x: X,
    'x-circle': XCircle,
    'alert-circle': AlertCircle,
    info: Info,
    
    // Editing & Modification
    edit: Edit3,
    trash: Trash2,
    'plus-circle': PlusCircle,
    
    // Time & Calendar
    calendar: Calendar,
    'calendar-days': CalendarDays,
    clock: Clock,
    
    // Visibility
    eye: Eye,
    'eye-off': EyeOff,
    
    // Sorting
    'sort-asc': SortAsc,
    'sort-desc': SortDesc,
    
    // Devices
    smartphone: Smartphone,
    laptop: Laptop,
    tablet: Tablet,
    monitor: Monitor
  };

  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon map`);
    return null;
  }

  const iconClasses = [
    sizeClasses[size] || sizeClasses.md,
    colorClasses[color] || colorClasses.current,
    onClick ? 'cursor-pointer hover:opacity-75 transition-opacity' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <IconComponent 
      className={iconClasses}
      onClick={onClick}
      {...rest}
    />
  );
};

/**
 * Predefined icon components for common use cases
 */
export const NavigationIcons = {
  Menu: (props) => <Icon name="menu" {...props} />,
  Home: (props) => <Icon name="home" {...props} />,
  Back: (props) => <Icon name="arrow-left" {...props} />,
  Search: (props) => <Icon name="search" {...props} />,
  Filter: (props) => <Icon name="filter" {...props} />,
  Settings: (props) => <Icon name="settings" {...props} />,
  Refresh: (props) => <Icon name="refresh" {...props} />
};

export const FinancialIcons = {
  Money: (props) => <Icon name="dollar-sign" {...props} />,
  Wallet: (props) => <Icon name="wallet" {...props} />,
  Card: (props) => <Icon name="credit-card" {...props} />,
  Receipt: (props) => <Icon name="receipt" {...props} />,
  Calculator: (props) => <Icon name="calculator" {...props} />,
  TrendingUp: (props) => <Icon name="trending-up" {...props} />,
  TrendingDown: (props) => <Icon name="trending-down" {...props} />
};

export const UserIcons = {
  User: (props) => <Icon name="user" {...props} />,
  Users: (props) => <Icon name="users" {...props} />,
  UserCheck: (props) => <Icon name="user-check" {...props} />
};

export const ActionIcons = {
  Add: (props) => <Icon name="plus" {...props} />,
  Edit: (props) => <Icon name="edit" {...props} />,
  Delete: (props) => <Icon name="trash" {...props} />,
  Save: (props) => <Icon name="save" {...props} />,
  Copy: (props) => <Icon name="copy" {...props} />,
  Share: (props) => <Icon name="share" {...props} />
};

export const StatusIcons = {
  Success: (props) => <Icon name="check-circle" color="success" {...props} />,
  Error: (props) => <Icon name="x-circle" color="error" {...props} />,
  Warning: (props) => <Icon name="alert-circle" color="warning" {...props} />,
  Info: (props) => <Icon name="info" color="primary" {...props} />
};

export default Icon;