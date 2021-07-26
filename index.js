const core = require('@actions/core');
const fs = require('fs');
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const schema_path = core.getInput('main_schema_path');
const schemas_dir = core.getInput('additional_schemas_dir');
const data_path = core.getInput('data_path');


const ajv = new Ajv({allErrors: true, strict: false});
addFormats(ajv);

let add_schemas = fs.readdirSync(schemas_dir);

for (let add_schema of add_schemas) {
    add_schema_path = schemas_dir + add_schema
    ajv.addSchema(require(add_schema_path), add_schema);
};

const schema = require(schema_path);
const validate = ajv.compile(schema);

test(require(data_path));

// Test de validité : si valide, l'action va à son terme, si non valide, l'action échoue et les erreurs s'affichent
function test(data) {
  const valid = validate(data);
  if (valid) core.setOutput('validity', "Valid!")
    else
        core.setFailed("Invalid:\n" + ajv.errorsText(validate.errors, {separator: "\n"}))
};