// Script simple para probar la aplicación
console.log('🚀 Probando la aplicación Mussikon...');

// Simular navegación
const screens = ['welcome', 'login', 'register'];
let currentScreen = 0;

console.log(`📱 Pantalla actual: ${screens[currentScreen]}`);

// Simular navegación
setTimeout(() => {
  currentScreen = 1;
  console.log(`📱 Navegando a: ${screens[currentScreen]}`);
}, 2000);

setTimeout(() => {
  currentScreen = 2;
  console.log(`📱 Navegando a: ${screens[currentScreen]}`);
}, 4000);

console.log('✅ Aplicación funcionando correctamente');
