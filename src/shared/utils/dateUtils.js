/**
 * Utilidades para manejo de fechas sin problemas de zona horaria
 */

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD usando la zona horaria local
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const getTodayLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Obtiene el año-mes actual en formato YYYY-MM usando la zona horaria local
 * @returns {string} Año-mes en formato YYYY-MM
 */
export const getCurrentYearMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Convierte una fecha en formato YYYY-MM-DD a objeto Date local
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {Date} Objeto Date en zona horaria local
 */
export const parseLocalDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;
  
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return null;
  
  return new Date(year, month - 1, day); // month es 0-indexed
};

/**
 * Obtiene el nombre del día de la semana para una fecha dada
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string} Nombre del día de la semana
 */
export const getDayName = (dateString) => {
  const date = parseLocalDate(dateString);
  if (!date || isNaN(date.getTime())) return '';
  
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dayNames[date.getDay()];
};

/**
 * Verifica si una fecha está en el mes actual
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {boolean} true si la fecha está en el mes actual
 */
export const isCurrentMonth = (dateString) => {
  if (!dateString) return false;
  return dateString.substring(0, 7) === getCurrentYearMonth();
};

/**
 * Verifica si una fecha es hoy
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {boolean} true si la fecha es hoy
 */
export const isToday = (dateString) => {
  return dateString === getTodayLocalDate();
};