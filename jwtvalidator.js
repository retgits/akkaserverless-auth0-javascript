/**
 * Import the libraries needed to validate the JWT token from the user request
 */
import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';

class JWTValidator {
    header
    client

    /**
     * Creates an instance of JWTValidator
     * @param {string} header the name of the header parameter that contains the JWT token
     * @param {string} uri the URI to find the JWKS file
     */
    constructor(header, uri) {
        this.header = header;
        this.client = new jwksClient.JwksClient({
            jwksUri: uri
        });
    }

    /**
     * Validate and decode the JWT token
     * @param {*} metadata the metadata of the Akka Serverless request
     * @returns a decoded JWT token
     * @throws an error when decoding fails
     */
    async validateAndDecode(metadata) {
        const jwtHeader = metadata.entries.find(entry => entry.key === this.header);
        const token = jwtHeader.stringValue;

        let result = jwt.decode(token, { complete: true });
        if(result == null) {
            throw new Error('Unable to obtain valid JWT token')
        }

        const kid = result.header.kid;

        if(this.client == null) {
            throw new Error('To validate with JWKS the withJWKS method must be called first')
        }
        const key = await this.client.getSigningKey(kid);
        const signingKey = key.getPublicKey();

        try {
            var decoded = jwt.verify(token, signingKey, { complete: true });
            return decoded
        } catch (err) {
            throw new Error('Unable to verify JWT token');
        }
    }
}

export default JWTValidator;