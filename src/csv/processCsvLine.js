// for testing purpose / sinon
exports.processCsvLine = (name, email, phone, imageUrl, imageTitle) => {
  // @todo this is mock only
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 10000);
  });

}
