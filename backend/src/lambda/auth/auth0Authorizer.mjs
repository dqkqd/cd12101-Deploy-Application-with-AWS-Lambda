import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')
const certificate = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJVmblu1jEOttZMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi00ZmljZ2E1bzNzcm44M2V3LnVzLmF1dGgwLmNvbTAeFw0yMzA4MTAx
MDQ2NTdaFw0zNzA0MTgxMDQ2NTdaMCwxKjAoBgNVBAMTIWRldi00ZmljZ2E1bzNz
cm44M2V3LnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAOs6obuZXfkP7Maaz5NkLLt6TSEIEL0l7oKnlovzWe6jYFMLhPQVKAp/7Q3D
+H2BY8cG0vc+WkLut2AwaCcd2zItIHBQCabokbk4okrdbby5NmJCJ049Td/vYJoN
67rSbM3/SQIk6mK8d8SNQqDdd3KCvwIgucyQXukzdUmIvGDVTfQmJJABEq9yKxBD
JBgsERDX0Rak/4IdBnSGJxbLbwNMNKh10nLcFJeuD5jcyuzojxTuuXUPLuTw8wMw
371Nf/ule7PukdIcD7q23KRuqiBSS3aIeaFyMu5isu6igNCKpMLvZ5uF5CPvyMsz
tqID0voapDloawH0MsC8yqgrz9cCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUE3zuIjCa2V2hzW+V/M6bsLnWdGwwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQA1R7VBvX5Df7scnq8KIzCr1TuX4ovyEbMnT8wzwyOQ
fvsJb+Btv/1RCSE6SHYqzE36hINXsK51FA37ANLdgJylj930VLse/RO94W2c2hvd
xLLZoH6OKUJOso3LgnShWNG0gAd0MQo+Rgvny7LiLTLVeFQctTqHrDkSOlQmqP3J
hnVp3mary9aECSyR/mf29Xwmx3iMfj6aD5bpFg9PPH0TgD9LNwa9GN9gqDRes8QQ
FqVlIbck01/SXgmeaZz42UoBUBpj6euuQpwCQvbTWXA0EvEC+hK+mqfUNQSqnvT3
3VL9gDXW3piCxhGOzq4Tt8LMNkZ8BUJW3bXwTWy6NTnd
-----END CERTIFICATE-----`

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  return jsonwebtoken.verify(token, certificate, { algorithms: ['RS256'] })
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
