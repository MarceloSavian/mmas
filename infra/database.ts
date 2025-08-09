const mmasTable = new sst.aws.Dynamo('MMAS', {
  fields: {
    PK: 'string',
    SK: 'string',
    GSI1PK: 'string',
    GSI1SK: 'string',
  },
  primaryIndex: { hashKey: 'PK', rangeKey: 'SK' },
  globalIndexes: {
    GSI1: { hashKey: 'GSI1PK', rangeKey: 'GSI1SK' },
  },
});

export { mmasTable };
