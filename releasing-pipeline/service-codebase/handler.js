exports.handle = async event => {
  console.info('EVENT', event);
  return process.env.SERVICE_NAME;
}