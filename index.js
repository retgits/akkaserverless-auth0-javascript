/**
 * Import the Akka Serverless JavaScript SDK and the Action that implements the
 * GreetingService
 */
import as from '@lightbend/akkaserverless-javascript-sdk';
import greetingservice from './greetingservice.js';

/**
 * Create a new Akka Serverless server instance and bind the greetingservice to
 * it. The server will listen on port 8080 and bind to all interfaces
 */
const server = new as.AkkaServerless();
server.addComponent(greetingservice);
server.start({bindAddress:'0.0.0.0', bindPort:'8080'});