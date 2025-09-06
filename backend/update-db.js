const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function updateRequestsTable() {
  try {
    console.log('🔄 Actualizando tabla requests...');
    
    // Agregar columna extra_amount
    console.log('➕ Agregando columna extra_amount...');
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE requests ADD COLUMN extra_amount DECIMAL(10,2) DEFAULT 0;'
    });
    
    if (addColumnError) {
      console.log('⚠️  Columna extra_amount ya existe o error:', addColumnError.message);
    } else {
      console.log('✅ Columna extra_amount agregada');
    }
    
    // Actualizar registros existentes
    console.log('🔄 Actualizando registros existentes...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: 'UPDATE requests SET extra_amount = COALESCE(budget, 0) WHERE budget IS NOT NULL;'
    });
    
    if (updateError) {
      console.log('⚠️  Error actualizando registros:', updateError.message);
    } else {
      console.log('✅ Registros actualizados');
    }
    
    // Eliminar columna budget
    console.log('🗑️  Eliminando columna budget...');
    const { error: dropColumnError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE requests DROP COLUMN budget;'
    });
    
    if (dropColumnError) {
      console.log('⚠️  Error eliminando columna budget:', dropColumnError.message);
    } else {
      console.log('✅ Columna budget eliminada');
    }
    
    console.log('🎉 Actualización completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateRequestsTable();
