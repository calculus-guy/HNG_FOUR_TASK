const amqp = require('amqplib');

async function setupRabbitMQ() {
  console.log('🔧 Setting up RabbitMQ exchanges and queues...\n');

  const rabbitMQUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
  
  try {
    // Connect to RabbitMQ
    console.log(`Connecting to RabbitMQ: ${rabbitMQUrl}`);
    const connection = await amqp.connect(rabbitMQUrl);
    const channel = await connection.createChannel();
    console.log('✓ Connected to RabbitMQ\n');

    // Create main exchange
    const exchangeName = 'notifications.direct';
    console.log(`Creating exchange: ${exchangeName}`);
    await channel.assertExchange(exchangeName, 'direct', { 
      durable: true,
      autoDelete: false
    });
    console.log('✓ Exchange created\n');

    // Create Dead Letter Exchange
    const dlqExchange = 'notifications.dlq';
    console.log(`Creating DLQ exchange: ${dlqExchange}`);
    await channel.assertExchange(dlqExchange, 'direct', { 
      durable: true,
      autoDelete: false
    });
    console.log('✓ DLQ Exchange created\n');

    // Create queues with DLQ configuration
    const queues = [
      {
        name: 'email.queue',
        routingKey: 'notification.email',
        exchange: exchangeName
      },
      {
        name: 'push.queue',
        routingKey: 'notification.push',
        exchange: exchangeName
      }
    ];

    for (const queue of queues) {
      console.log(`Creating queue: ${queue.name}`);
      await channel.assertQueue(queue.name, {
        durable: true,
        deadLetterExchange: dlqExchange,
        deadLetterRoutingKey: 'failed',
        messageTtl: 86400000, // 24 hours
        maxPriority: 10
      });

      console.log(`Binding queue ${queue.name} to ${queue.exchange} with routing key ${queue.routingKey}`);
      await channel.bindQueue(queue.name, queue.exchange, queue.routingKey);
      console.log('✓ Queue created and bound\n');
    }

    // Create failed queue (DLQ)
    const failedQueue = 'failed.queue';
    console.log(`Creating failed queue: ${failedQueue}`);
    await channel.assertQueue(failedQueue, {
      durable: true,
      autoDelete: false
    });
    
    console.log(`Binding failed queue to ${dlqExchange}`);
    await channel.bindQueue(failedQueue, dlqExchange, 'failed');
    console.log('✓ Failed queue created and bound\n');

    // Display summary
    console.log('=================================');
    console.log('✅ RabbitMQ Setup Complete!');
    console.log('=================================');
    console.log('\nExchanges Created:');
    console.log(`  - ${exchangeName} (direct)`);
    console.log(`  - ${dlqExchange} (direct)`);
    console.log('\nQueues Created:');
    console.log('  - email.queue → notification.email');
    console.log('  - push.queue → notification.push');
    console.log('  - failed.queue (DLQ)');
    console.log('\nYou can verify this in RabbitMQ Management UI:');
    console.log('  http://localhost:15672');
    console.log('  Username: admin');
    console.log('  Password: admin123\n');

    await channel.close();
    await connection.close();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to setup RabbitMQ:', error.message);
    console.error('\nMake sure:');
    console.error('  1. RabbitMQ is running (docker-compose up -d rabbitmq)');
    console.error('  2. Connection URL is correct');
    console.error('  3. Credentials are correct (admin/admin123)\n');
    process.exit(1);
  }
}

setupRabbitMQ();
