import { Alert, Platform } from 'react-native';

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
}

export class ErrorHandler {
  static showError(error: AppError | Error | string, title: string = 'Error') {
    let message = '';
    
    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = error.message;
    } else {
      message = 'Ha ocurrido un error inesperado';
    }

    if (Platform.OS === 'web') {
      // En web, usar window.alert como fallback
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  static showSuccess(message: string, title: string = 'Éxito') {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  static showWarning(message: string, title: string = 'Advertencia') {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  static handleApiError(error: any): AppError {
    if (error.response) {
      // Error de respuesta del servidor
      const statusCode = error.response.status;
      const data = error.response.data;
      
      switch (statusCode) {
        case 400:
          return {
            message: data?.message || 'Datos inválidos',
            code: 'VALIDATION_ERROR',
            statusCode: 400
          };
        case 401:
          return {
            message: 'No autorizado. Por favor, inicia sesión nuevamente',
            code: 'UNAUTHORIZED',
            statusCode: 401
          };
        case 403:
          return {
            message: `No tienes permisos para realizar esta acción`,
            code: 'FORBIDDEN',
            statusCode: 403
          };
        case 404:
          return {
            message: 'Recurso no encontrado',
            code: 'NOT_FOUND',
            statusCode: 404
          };
        case 409:
          return {
            message: data?.message || 'Conflicto: El recurso ya existe',
            code: 'CONFLICT',
            statusCode: 409
          };
        case 422:
          return {
            message: data?.message || 'Error de validación',
            code: 'VALIDATION_ERROR',
            statusCode: 422
          };
        case 500:
          return {
            message: 'Error interno del servidor. Inténtalo más tarde',
            code: 'SERVER_ERROR',
            statusCode: 500
          };
        default:
          return {
            message: data?.message || 'Error del servidor',
            code: 'SERVER_ERROR',
            statusCode: statusCode
          };
      }
    } else if (error.request) {
      // Error de red
      return {
        message: 'Error de conexión. Verifica tu internet',
        code: 'NETWORK_ERROR',
        statusCode: 0
      };
    } else {
      // Error desconocido
      return {
        message: error.message || 'Error desconocido',
        code: 'UNKNOWN_ERROR',
        statusCode: 0
      };
    }
  }

  static getErrorMessage(error: any): string {
    const appError = this.handleApiError(error);
    return appError.message;
  }
}

export default ErrorHandler;
