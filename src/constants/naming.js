/**
 * NAMING STANDARDS FOR ALLIANCE F&R SYSTEM
 * 
 * This file defines consistent naming conventions used throughout the application.
 * All components, functions, and variables should follow these patterns.
 */

// =============================================================================
// COMPONENT NAMING STANDARDS
// =============================================================================

export const COMPONENT_NAMES = {
  // Form Components
  FORM_INPUT: 'FormInput',
  FORM_SELECT: 'FormSelect', 
  FORM_FIELD_GROUP: 'FormFieldGroup',
  CURRENCY_INPUT: 'CurrencyInput',
  
  // Client Components
  CLIENT_AUTOCOMPLETE: 'ClientAutocomplete',
  CLIENT_MODAL: 'ClientModal',
  CLIENT_SELECT: 'ClientSelect',
  
  // Payment Components
  MIXED_PAYMENT_GROUP: 'MixedPaymentGroup', // Renamed from WalletPaymentGroup
  
  // UI Components
  NAVIGATION_APP: 'NavigationApp',
  FIXED_HEADER: 'FixedHeader',
  FOOTER: 'Footer'
};

// =============================================================================
// FUNCTION NAMING STANDARDS
// =============================================================================

export const FUNCTION_NAMES = {
  // Event Handlers
  HANDLE_INPUT_CHANGE: 'handleInputChange',
  HANDLE_FORM_SUBMIT: 'handleFormSubmit',
  HANDLE_KEYBOARD_NAVIGATION: 'handleKeyboardNavigation',
  HANDLE_MODAL_NAVIGATION: 'handleModalNavigation',
  
  // Mixed Payment Functions
  HANDLE_MIXED_PAYMENT_CHANGE: 'handleMixedPaymentChange',
  ADD_MIXED_PAYMENT: 'addMixedPayment',
  REMOVE_MIXED_PAYMENT: 'removeMixedPayment',
  
  // Utility Functions
  FOCUS_FIELD: 'focusField',
  OPEN_FIELD: 'openField',
  REGISTER_FIELD: 'registerField',
  
  // Validation Functions
  VALIDATE_FORM: 'validateForm',
  VALIDATE_MIXED_PAYMENTS: 'validateMixedPayments',
  
  // State Functions
  RESET_FORM: 'resetForm',
  CLEAR_FORM: 'clearForm',
  INITIALIZE_FORM: 'initializeForm'
};

// =============================================================================
// VARIABLE NAMING STANDARDS
// =============================================================================

export const VARIABLE_NAMES = {
  // State Variables
  FORM_DATA: 'formData',
  FORM_ERRORS: 'formErrors',
  IS_LOADING: 'isLoading',
  IS_SUBMITTING: 'isSubmitting',
  
  // Mixed Payment Variables
  MIXED_PAYMENTS: 'mixedPayments',
  MIXED_PAYMENT_TOTAL: 'mixedPaymentTotal',
  EXPECTED_TOTAL: 'expectedTotal',
  IS_MIXED_PAYMENT_ACTIVE: 'isMixedPaymentActive',
  
  // Navigation Variables
  FIELD_REFS: 'fieldRefs',
  CURRENT_FIELD: 'currentField',
  FIELD_ORDER: 'fieldOrder',
  CURRENT_INDEX: 'currentIndex',
  
  // Configuration Variables
  FIELD_CONFIG: 'fieldConfig',
  FORM_CONFIG: 'formConfig',
  VALIDATION_CONFIG: 'validationConfig'
};

// =============================================================================
// PROP NAMING STANDARDS
// =============================================================================

export const PROP_NAMES = {
  // Common Props
  VALUE: 'value',
  ON_CHANGE: 'onChange',
  ON_CLICK: 'onClick',
  ON_KEY_DOWN: 'onKeyDown',
  ON_SUBMIT: 'onSubmit',
  
  // Form Props
  LABEL: 'label',
  NAME: 'name',
  PLACEHOLDER: 'placeholder',
  REQUIRED: 'required',
  DISABLED: 'disabled',
  READ_ONLY: 'readOnly',
  ERROR: 'error',
  
  // Mixed Payment Props
  PAYMENTS: 'payments',
  ON_PAYMENT_CHANGE: 'onPaymentChange',
  ON_ADD_PAYMENT: 'onAddPayment',
  ON_REMOVE_PAYMENT: 'onRemovePayment',
  TOTAL_EXPECTED: 'totalExpected',
  IS_ACTIVE: 'isActive',
  
  // Navigation Props
  ON_NAVIGATE: 'onNavigate',
  CURRENT_PAGE: 'currentPage',
  IS_SIDEBAR_OPEN: 'isSidebarOpen',
  TOGGLE_SIDEBAR: 'toggleSidebar',
  
  // Client Props
  CLIENTS: 'clients',
  SELECTED_CLIENT: 'selectedClient',
  ON_CLIENT_SELECT: 'onClientSelect',
  ON_CLIENT_CREATED: 'onClientCreated'
};

// =============================================================================
// FILE NAMING STANDARDS
// =============================================================================

export const FILE_NAMES = {
  // Component Files
  COMPONENTS: {
    FORMS: 'FinancialOperationsApp.jsx',
    MODULES: {
      CLIENTS: 'ClientsApp.jsx',
      MOVEMENTS: 'MovementsApp.jsx',
      BALANCES: 'BalancesApp.jsx',
      PENDING_WITHDRAWALS: 'PendingWithdrawalsApp.jsx'
    }
  },
  
  // Configuration Files
  CONFIG: {
    CONSTANTS: 'constants.js',
    FIELD_CONFIGS: 'fieldConfigs.js',
    NAMING: 'naming.js'
  },
  
  // Utility Files
  UTILS: {
    FORMATTERS: 'formatters.js',
    VALIDATORS: 'validators.js',
    HELPERS: 'helpers.js'
  }
};

// =============================================================================
// CSS CLASS NAMING STANDARDS (BEM-like)
// =============================================================================

export const CSS_CLASSES = {
  // Form Classes
  FORM: 'form',
  FORM_GROUP: 'form__group',
  FORM_INPUT: 'form__input',
  FORM_SELECT: 'form__select',
  FORM_ERROR: 'form__error',
  
  // Button Classes
  BUTTON: 'button',
  BUTTON_PRIMARY: 'button--primary',
  BUTTON_SECONDARY: 'button--secondary',
  BUTTON_DANGER: 'button--danger',
  
  // Mixed Payment Classes
  MIXED_PAYMENT: 'mixed-payment',
  MIXED_PAYMENT_GROUP: 'mixed-payment__group',
  MIXED_PAYMENT_ITEM: 'mixed-payment__item',
  MIXED_PAYMENT_TOTAL: 'mixed-payment__total'
};

export default {
  COMPONENT_NAMES,
  FUNCTION_NAMES,
  VARIABLE_NAMES,
  PROP_NAMES,
  FILE_NAMES,
  CSS_CLASSES
};