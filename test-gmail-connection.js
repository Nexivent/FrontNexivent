const net = require('net');

function testPort(host, port) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Probando ${host}:${port}...`);

    const client = new net.Socket();
    client.setTimeout(5000);

    client.on('connect', () => {
      console.log(`✅ Puerto ${port}: CONECTADO exitosamente`);
      client.destroy();
      resolve(true);
    });

    client.on('timeout', () => {
      console.log(`❌ Puerto ${port}: TIMEOUT (no se pudo conectar en 5 segundos)`);
      client.destroy();
      resolve(false);
    });

    client.on('error', (err) => {
      console.log(`❌ Puerto ${port}: ERROR - ${err.message}`);
      resolve(false);
    });

    client.connect(port, host);
  });
}

async function testAllPorts() {
  console.log('═══════════════════════════════════════════════');
  console.log('  PRUEBA DE CONECTIVIDAD A GMAIL');
  console.log('═══════════════════════════════════════════════');

  const port587 = await testPort('smtp.gmail.com', 587);
  const port465 = await testPort('smtp.gmail.com', 465);

  console.log('\n═══════════════════════════════════════════════');
  console.log('  RESULTADO:');
  console.log('═══════════════════════════════════════════════');
  console.log(`Puerto 587 (STARTTLS): ${port587 ? '✅ DISPONIBLE' : '❌ BLOQUEADO'}`);
  console.log(`Puerto 465 (SSL):      ${port465 ? '✅ DISPONIBLE' : '❌ BLOQUEADO'}`);
  console.log('═══════════════════════════════════════════════\n');

  if (port587 || port465) {
    console.log('🎉 ¡Al menos un puerto está disponible!');
    console.log('👉 Puedes intentar enviar correos con Gmail ahora.\n');
  } else {
    console.log('⚠️  Ambos puertos están bloqueados.');
    console.log('💡 Posibles causas:');
    console.log('   - ISP bloqueando puertos SMTP');
    console.log('   - Firewall de red corporativa');
    console.log('   - Antivirus bloqueando conexiones\n');
  }
}

testAllPorts();
