// Configuração de ambiente
// Para desenvolvimento local, use o IP da sua máquina ou localhost
// Para produção, substitua pela URL do seu servidor

import { Platform } from 'react-native';

// Detecta automaticamente qual URL usar baseado na plataforma
const getApiUrl = () => {
  if (!__DEV__) {
    return 'https://sua-api-producao.com'; // Produção
  }
  
  // Desenvolvimento
  if (Platform.OS === 'android') {
    // Emulador Android usa 10.0.2.2 para acessar localhost da máquina host
    return 'http://10.0.2.2:3232';
  }
  
  if (Platform.OS === 'web') {
    // Web usa localhost
    return 'http://localhost:3232';
  }
  
  // iOS Simulator, Expo Go e dispositivos físicos usam o IP da máquina
  return 'http://192.168.1.13:3232';
};

export const ENV = {
  // URL base da API - Detecta automaticamente baseado na plataforma
  API_URL: getApiUrl(),
  
  // Timeout para requisições (em ms)
  API_TIMEOUT: 10000,
  
  // Versão da API
  API_VERSION: 'v1',
};

// ⚠️ IMPORTANTE PARA TESTES:
// ✅ Web (navegador): Usa localhost automaticamente
// ✅ Expo Go / Dispositivo Físico: Usa o IP da máquina (192.168.1.13)
// ✅ Emulador Android: Usa 10.0.2.2 automaticamente
// ✅ Simulador iOS: Usa o IP da máquina (192.168.1.13)
//
// Para descobrir seu IP:
// - Mac/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
// - Windows: ipconfig
//
// Seu IP atual: 192.168.1.13
// A detecção é automática baseada na plataforma!
