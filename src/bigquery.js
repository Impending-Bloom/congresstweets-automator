// Utility functions for accessing Big Query
import GOOGLE_CONFIG from './config';

const { BigQuery } = require('@google-cloud/bigquery');
const bq = new BigQuery();

const dataset = bq.dataset(GOOGLE_CONFIG.bq_dataset);
const tweetsTable = dataset.table(GOOGLE_CONFIG.bq_table);

const getDataFromTable = (query, maxResults=1000) => {
  const results = bq.query(query, { maxResults }, (err, rows) => {
    if (!err) return rows;
    console.error(err);
    return [];
  });
  return results;
}

const postDataToTable = (data) => {
  tweetsTable.insert(data, { ignoreUnknownValues: true }, insertHandler);
}


const insertHandler = (err, apiResponse) => {
  let errorString = '';
  if (err) {
    switch(err.name) {
      case 'PartialFailureError':
        err.errors.forEach(err => {
          errorString += `Error Code: ${err.code}\n`
          errorString += `Error Location: ${err.row.toString()}\n`;
          errorString += `Cause: ${err.errors.map(item => { return item.reason; }).join(', ')}\n`;
          errorString += `Error Message: ${err.errors.map(item => { return item.message; }).join(', ')}\n`;
          errorCount++;
        });
        break;
      default:
        break;
    }
    console.error(errorCount);
  }
  else {
    apiResponse.forEach(item => { console.log(item); })
  }
}