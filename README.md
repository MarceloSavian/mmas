# Authentication Serverless

A serverless application built using [SST v3](https://docs.sst.dev), powered by AWS infra infrastructure including Lambda, API Gateway, Dynamo DB. The goal of this project was to build a simple authetication service and test out new technologies like SST V3.

## Architecture

- **API Gateway** for HTTP interface
- **Lambda** functions for business logic
- **DynamoDB** as primary database
- **SST Console** for managing and debugging in development

## Getting Started

- Node.js >= 18
- AWS CLI configured (I suggest you to use [aws-vault](https://github.com/99designs/aws-vault) which sets everything up in your terminal)

## Running Locally

**IMPORTANT**
This project is currently designed to be under `marcelosavian.com` domain, if you don't want to have a domain configured and generate a random URL you can comment out the whole domain section in `/infra/api.ts` (lines 8 to 12). 

After setup, install dependencies:

```
npm install
```

Then start the development server:

```
npm run dev
```

You can also define a specific stage, and in the current code will deploy the api in a url like `{stage}.api.marcelosavian.com`
```
npm run dev -- --stage=marcelo
```

You should see in you console the link to call you API. 

You can also use [debug mode with VScode](https://sst.dev/docs/live/#breakpoints) to test it (Although I did not yet managed to make it work) or see logs in [SST console](https://console.sst.dev/) giving the permissions needed.

## Project Structure

```plaintext . 
.
├── infra/           # Infrastructure defined using SST constructs
├── functions/       # Lambda function source code
│   ├── data/
│   │   ├── protocols/    # Interfaces used by services
│   │   ├── services/     # Core API logic
│   ├── domain/
│   │   ├── models/       # Main API models
│   │   ├── usecases/     # Service definitions
│   ├── infra/            # Third-party packages and protocol implementations
│   │   ├── repositories/ # Database repositories
│   │   ├── criptography  # criptography packages adapters
│   ├── handlers/
│       ├── routes/       # HTTP handlers (should depend only on core)
│       ├── shared/       # Shared logic like error handlers
│       ├── domain/       # Proxy function definitions
├── sst.config.ts    # SST configuration
└── README.md

```

## Deployment 

To deploy your app run:

```
npm run deploy
```

You can also define a stage:
```
npm run deploy -- --stage=marcelo
```

## Refresh infrastructure
 
Sometimes your local setup may become out of sync with the cloud infrastructure, and CDK might throw an error. SST v3 includes a helpful feature to resolve this:

```
npm run refresh -- --stage=your-stage
```
This will refresh the local state with the current cloud state. After that, npm run dev should work smoothly again. This is similar to terraform plan.

## Testing

Once your API is deployed and running, you can test the POST /v1/signup endpoint using curl:

```
curl --location 'https://api.test.marcelosavian.com/v1/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "Marcelo",
    "email": "marcelo.savian@gmail.com",
    "password": "test12345",
    "role": "ADMIN"
}'
```

Once you signed up you should be able to login through this endpoint:

```
curl --location 'https://api.test.marcelosavian.com/v1/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "marcelo.savian@gmail.com",
    "password": "test12345"
}'
```
IMPORTANT: Because I don't have access to full SES service from AWS I am currently returing the MFA code in the response of the login which should never happen in production

After receiving the mfaCode you can use this endpoint to get the accessToken:

``` 
curl --location 'https://api.test.marcelosavian.com/v1/mfa-check' \
--header 'Content-Type: application/json' \
--data '{
    "otpId": "7c80123f-6a00-4e09-b73d-c88d8f9e563c",
    "otpCode": "411855"
}'
```

