const basePath = process.cwd();
const fs = require("fs");
const layersDir = `${basePath}/layers`;

const {
  baseUri,
  baseGatewayUri,
  description,
  namePrefix,
  network,
  solanaMetadata,
} = require(`${basePath}/src/config.js`);
const { layerConfigurations } = require(`${basePath}/src/config.js`);
const { getElements } = require("../src/main.js");

// If this is the first time this is being run
// check for a IMX directory in build
if (!fs.existsSync(`${basePath}/build/imx_json`)){
    fs.mkdirSync(`${basePath}/build/imx_json`, { recursive: true });
}

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);

// We only need one sample to define the schema
let sample_item = data[0]

// IMX is ETH only so ignore the nextwork
let metadata = []

// We only support one layer config atm.
if(layerConfigurations.length > 1) {
    console.log(`THIS ONLY SUPPORTS ONE LAYER CONFIGUATION ATM`);
    return;
}

// Exclude attributes as these are obtained differently
delete sample_item.attributes

// Add main fields schema
for(var key in sample_item) {
    key_value_metadata = {
        "name": String(key),
        "type": getIMXUserSpecifiedType(key) ?? getIMXType(sample_item[key])
    }
    metadata.push(key_value_metadata)
}

// Add all NFT attributes schema
let layers = layerConfigurations[0].layersOrder;
layers.forEach((layer) => {

    // get elements for each layer
    let elementsNames = [];
    let elements = getElements(`${layersDir}/${layer.name}/`);
    elements.forEach((element) => {
        elementsNames.push(element.name);
    });

    metadata.push({
        "name": layer.name,
        "type": "enum",
        "value": elementsNames,
        "filterable": true
    })
});

schema = {
    "metadata": metadata
}

fs.writeFileSync(
    `${basePath}/build/imx_json/schema.json`,
    JSON.stringify(schema, null, 2)
);

console.log(`IMX schema was generated in /build/imx_json/schema.json`)

// Add overrides here
function getIMXUserSpecifiedType(key) {
    if(key == 'somethingCustom') {
        return "discrete"
    }
    return null;
}

function getIMXType(object) {

    if (typeof object === 'string' || object instanceof String) {
        return "text";
    }

    if(typeof object == 'number') {
        return "continuous";
    }

    if(typeof object == 'boolean') {
        return "boolean";
    }

    // Got here? uknown type
    throw new Error('Unknown type, cannot parse to IMX types (see https://docs.x.immutable.com/docs/asset-metadata)')
}