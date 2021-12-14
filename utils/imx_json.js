const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const fs = require("fs");

const {
  baseUri,
  baseGatewayUri,
  description,
  namePrefix,
  network,
  solanaMetadata,
} = require(`${basePath}/src/config.js`);

// If this is the first time this is being run
// check for a IMX directory in build
if (!fs.existsSync(`${basePath}/build/imx_json`)){
  fs.mkdirSync(`${basePath}/build/imx_json`, { recursive: true });
}

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);

data.forEach((item) => {
  if (network == NETWORK.sol) {
    item.name = `${namePrefix} #${item.edition}`;
    item.description = description;
    item.creators = solanaMetadata.creators;
  } else {
    item.name = `${namePrefix} #${item.edition}`;
    item.description = description;
    item.image = `${baseUri}/${item.edition}.png`;
    item.image_url = `${baseGatewayUri}/${item.edition}.png`;
  }

  // Flatten all attributes
  let attributes = item.attributes;
  attributes.forEach((attribute) => {
    type = attribute.trait_type;
    value = attribute.value;
    item[type] = value;
  });
  delete item.attributes;

  fs.writeFileSync(
    `${basePath}/build/imx_json/${item.edition}.json`,
    JSON.stringify(item, null, 2)
  );
});

fs.writeFileSync(
  `${basePath}/build/imx_json/_metadata.json`,
  JSON.stringify(data, null, 2)
);

console.log(`Generated IMX mutable metadata for all assets`);