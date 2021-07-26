# GitHub Action: validate JSON with multiple local schemas

This Action allows to validate JSON using multiple schemas stored locally and referenced by `$ref` in the main schema.
It uses [ajv](https://ajv.js.org/), a JS validator.

## Inputs
- `main_schema_path`: Path to the main schema, default is `'${{ github.workspace }}/schema.json'`
- `additional_schemas_dir`: Path to the folder containing the referenced schemas, default is `'${{ github.workspace }}/additional_schemas/'`
- `data_path`: Path to the JSON file to validate, default is `'${{ github.workspace }}/data.json'`

## Output
- `validity`: Validity of data according to the schema


## Example workflow

An example `.github/workflows/validate.yml` workflow to run JSON validation on the repository. Note that you have to run `actions/checkout@v2` to allow the `jsonschema_validator` to read your directory via the `${{ github.workspace }}` var.

```yaml
name: Validate JSON

on:
  push:
    paths:
      - 'schema.json'
      - 'exemple-valide.json'

jobs:
  validate_json:
    runs-on: ubuntu-latest
    steps:
      - name: checking out repo
        uses: actions/checkout@v2
      - name: build the schema and validate the data
        uses: idrissad/jsonschema_validator@main
        id: validation
        with:
          main_schema_path: ${{ github.workspace }}/schema.json
          additional_schemas_dir: ${{ github.workspace }}/GeoJSON_schemas/
          data_path: ${{ github.workspace }}/exemple-valide.json
      - name: print the results
        run: echo "${{ steps.validation.outputs.validity }}"
```

## Example schemas

Here is a real-life example of a way you can reference several schemas between each others and validate them with this Action. The yaml example inputs just above are adapted to the schemas below.

*schema.json*
```
{
  "$id": "https://github.com/PnX-SI/schema_randonnee/raw/v0.3.0/schema.json",
  "$schema": "http://json-schema.org/draft-07/schema",
  "title": "My main schema",
  "definitions": {
    "GeoJSON_LineString": {
      "$id": "linestring",
      "$ref": "https://geojson.org/schema/LineString.json"
    },
    "GeoJSON_Point": {
      "$id": "point",
      "$ref": "https://geojson.org/schema/Point.json"
    }
  }
  etc.
}
```

*GeoJSON_schemas/LineString.json*
```
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://geojson.org/schema/LineString.json",
  "title": "GeoJSON LineString"
  etc.
}
```

*GeoJSON_schemas/Point.json*
```
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://geojson.org/schema/Point.json",
  "title": "GeoJSON Point"
  etc.
}
```

The additional schemas ids are resolved against the base URI of the main schema by the `ajv.addSchema()` method, so the real URI of schema GeoJSON Point become `https://github.com/PnX-SI/schema_randonnee/raw/v0.3.0/schema.json#https://geojson.org/schema/Point.json`. This URI is then linked by the `$ref` value, as it's also resolved against the base URI of the main schema. Here, `$id` are web addresses, but there are no HTTP requests whatsoever, everything is done locally and `$id` could be simple words.