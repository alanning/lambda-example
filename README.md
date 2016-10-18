# lambda-example

Example: Periodically execute a node script to update a mongodb database using Amazon Lambda

### Dependencies

```
npm install
```

## Testing

### Once

```
npm test
```

### Watch mode

```
npm test -- --watch
```

## Deployment

1.) Create a file named `env.json` with the production MongoDB url as content, like this:

```json
{
  "MONGO_URL": "mongodb://..."
}
```

2.) Pack the lambda function with: `npm run pack`

3.) Deploy the lambda function by uploading the `resetNetworks.zip`
    in the AWS web UI for the lambda function
