// Script para probar Swagger
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testSwagger() {
  console.log('📚 Probando documentación Swagger...\n');

  try {
    // Test 1: Verificar que Swagger UI esté disponible
    console.log('1. Verificando Swagger UI...');
    const swaggerResponse = await axios.get(`${BASE_URL}/api-docs`);
    console.log('✅ Swagger UI disponible');
    console.log('   URL: http://localhost:3000/api-docs');
    console.log('');

    // Test 2: Verificar que el JSON de Swagger esté disponible
    console.log('2. Verificando especificación OpenAPI...');
    const specResponse = await axios.get(`${BASE_URL}/api-docs/swagger.json`);
    console.log('✅ Especificación OpenAPI disponible');
    if (specResponse.data && specResponse.data.info) {
      console.log('   Título:', specResponse.data.info.title);
      console.log('   Versión:', specResponse.data.info.version);
      console.log('   Descripción:', specResponse.data.info.description);
    }
    console.log('');

    // Test 3: Verificar endpoints documentados
    console.log('3. Verificando endpoints documentados...');
    if (specResponse.data && specResponse.data.paths) {
      const paths = specResponse.data.paths;
      const endpointCount = Object.keys(paths).length;
      console.log(`✅ ${endpointCount} endpoints documentados`);
      
      // Mostrar algunos endpoints
      const endpoints = Object.keys(paths).slice(0, 5);
      console.log('   Ejemplos de endpoints:');
      endpoints.forEach(endpoint => {
        const methods = Object.keys(paths[endpoint]);
        console.log(`   ${endpoint} (${methods.join(', ')})`);
      });
    } else {
      console.log('⚠️  No se pudieron obtener los endpoints');
    }
    console.log('');

    // Test 4: Verificar esquemas definidos
    console.log('4. Verificando esquemas definidos...');
    if (specResponse.data && specResponse.data.components && specResponse.data.components.schemas) {
      const schemas = specResponse.data.components.schemas;
      const schemaCount = Object.keys(schemas).length;
      console.log(`✅ ${schemaCount} esquemas definidos`);
      
      const schemaNames = Object.keys(schemas).slice(0, 5);
      console.log('   Ejemplos de esquemas:');
      schemaNames.forEach(schema => {
        console.log(`   - ${schema}`);
      });
    } else {
      console.log('⚠️  No se pudieron obtener los esquemas');
    }
    console.log('');

    // Test 5: Verificar tags
    console.log('5. Verificando tags de organización...');
    const tags = (specResponse.data && specResponse.data.tags) || [];
    console.log(`✅ ${tags.length} tags de organización`);
    if (tags.length > 0) {
      console.log('   Tags disponibles:');
      tags.forEach(tag => {
        console.log(`   - ${tag.name}: ${tag.description || 'Sin descripción'}`);
      });
    }
    console.log('');

    console.log('🎉 Documentación Swagger funcionando correctamente!');
    console.log('\n📋 Resumen:');
    console.log('- Swagger UI: ✅');
    console.log('- Especificación OpenAPI: ✅');
    
    if (specResponse.data && specResponse.data.paths) {
      const endpointCount = Object.keys(specResponse.data.paths).length;
      console.log(`- Endpoints documentados: ${endpointCount}`);
    } else {
      console.log('- Endpoints documentados: No disponible');
    }
    
    if (specResponse.data && specResponse.data.components && specResponse.data.components.schemas) {
      const schemaCount = Object.keys(specResponse.data.components.schemas).length;
      console.log(`- Esquemas definidos: ${schemaCount}`);
    } else {
      console.log('- Esquemas definidos: No disponible');
    }
    
    console.log(`- Tags de organización: ${tags.length}`);
    console.log('\n🔗 Accede a la documentación en:');
    console.log('   http://localhost:3000/api-docs');
    console.log('\n💡 Puedes probar los endpoints directamente desde la interfaz de Swagger!');

  } catch (error) {
    console.error('❌ Error al probar Swagger:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Ejecutar pruebas
testSwagger();
