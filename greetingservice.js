/**
 * Import the Akka Serverless JavaScript SDK and the JWT Validator
 */
import as from '@lightbend/akkaserverless-javascript-sdk';
import JWTValidator from './jwtvalidator.js';

/**
 * Create a new Action. The Action constructor takes three paramters:
 * * An array of protobuf files that tells this service where to find the API 
 *   definition
 * * The fully qualified name of the gRPC service this Action implements
 * * Any additional options
 */
const greetingservice = new as.Action(
    ['./app.proto'],
    'com.retgits.akkaserverless.actions.GreetingService',
    {
        // Whether serialization should fallback to using JSON if the state 
        // can't be serialized as a protobuf.
        serializeFallbackToJson: true
    }
);

/**
 * The command handlers for this Action.
 * The names of the properties (before the colon) must match the names of the rpc 
 * methods specified in the protobuf file.
 */
greetingservice.commandHandlers = {
    Greeting: generateGreeting
}

/**
 * generateGreeting implements the business logic for the Greeting RPC method. It
 * validates the JWT token passed in the `X-Custom-JWT-Auth` HTTP Header parameter
 * first and if that succeeds, sends back a message. If the validation fails. an
 * HTTP 500 error is sent back.
 * @param {*} request 
 * @param {*} context 
 */
async function generateGreeting(request, context) {
    const validator = new JWTValidator('X-Custom-JWT-Auth', 'https://<your tenant>.auth0.com/.well-known/jwks.json');
    try {
        await validator.validateAndDecode(context.metadata);
        return {
            message: `${request.greeting}, ${request.name}!`
        }
    } catch (err) { 
        return context.fail(err);
    }
}

export default greetingservice;