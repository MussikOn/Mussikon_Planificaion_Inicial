const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBalanceTables() {
  try {
    console.log('Creando tablas de balance...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../database/create_balance_tables_simple.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir el SQL en comandos individuales
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);
    
    for (const command of commands) {
      if (command.trim()) {
        console.log('Ejecutando:', command.trim().substring(0, 50) + '...');
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: command.trim() 
        });
        
        if (error) {
          console.error('Error ejecutando comando:', error);
          // Continuar con el siguiente comando
        } else {
          console.log('✓ Comando ejecutado exitosamente');
        }
      }
    }
    
    console.log('✅ Tablas de balance creadas exitosamente');
    
  } catch (error) {
    console.error('Error creando tablas de balance:', error);
  }
}

createBalanceTables();
