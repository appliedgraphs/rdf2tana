# RDF to Tana Transformer

Transform RDF knowledge graphs guided by SHACL shapes into Tana's format for visualization and navigation.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue)](https://www.typescriptlang.org/)

## 🌟 Overview

The RDF to Tana Transformer bridges the gap between semantic web technologies and modern note-taking interfaces. It uses SHACL shapes to transform RDF data into Tana's user-friendly knowledge graph interface.

### Key Features

- **SHACL-Driven Transformation**: Use SHACL shapes to define the structure and transform RDF instances
- **Customizable Mapping**: Configure how RDF properties map to Tana fields
- **IRI Management**: Smart handling of RDF IRIs to Tana UIDs
- **Rich Validation**: Pre-validate your data against SHACL constraints before transformation
- **Complete Documentation**: Generate documentation of your knowledge graph schema in Tana

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rdf-to-tana.git
cd rdf-to-tana

# Install dependencies
npm install
```

### Basic Usage

#### Using Convenience Scripts

We provide several convenience scripts in the `scripts/` directory to make common operations easier:

##### Full Transformation (RDF to Tana)

```bash
./scripts/rdf2tana <shapes_file> <data_file> [output_file]
```

Arguments:
- `shapes_file`: Path to SHACL shapes file (required)
- `data_file`: Path to RDF data file (required)
- `output_file`: Output file path (optional, defaults to tana-import.json)

Example:
```bash
./scripts/rdf2tana examples/people-org/shapes.ttl examples/people-org/instances.ttl my-tana-import.json
```

##### Schema-Only Generation

```bash
./scripts/rdf2tana-schema <shapes_file> [output_file]
```

Arguments:
- `shapes_file`: Path to SHACL shapes file (required)
- `output_file`: Output file path (optional, defaults to tana-schema.json)

Example:
```bash
./scripts/rdf2tana-schema examples/restaurant/shapes.ttl restaurant-schema.json
```

##### Debug Mode

```bash
./scripts/rdf2tana-debug <shapes_file> <data_file> [output_file] [debug_categories]
```

Arguments:
- `shapes_file`: Path to SHACL shapes file (required)
- `data_file`: Path to RDF data file (required)
- `output_file`: Output file path (optional, defaults to tana-import.json)
- `debug_categories`: Debug categories to enable (optional, comma-separated)
  - Available categories: `core`, `schema`, `instance`, `io`, `parser`, `utils`, `transform`, `query`, `perf`
  - Use `*` for all categories

Examples:
```bash
# Enable all debug categories
./scripts/rdf2tana-debug examples/people-org/shapes.ttl examples/people-org/instances.ttl

# Enable only schema and performance logs
./scripts/rdf2tana-debug examples/people-org/shapes.ttl examples/people-org/instances.ttl output.json schema,perf
```

#### Using npm Scripts Directly

For more control or if you prefer npm scripts, you can use:

```bash
# Transform RDF data using SHACL shapes
npm run transform -- --shapes=shapes.ttl --data=data.ttl --output=tana-import.json

# Generate schema only
npm run transform -- --shapes=shapes.ttl --schema-only --output=tana-schema.json

# Run with all debug logging enabled
npm run transform:debug -- --shapes=shapes.ttl --data=data.ttl
```

### Debug Logging

The transformer uses the `debug` library for detailed logging. We provide several convenience scripts:

```bash
# Development with full debug output
npm run dev:debug -- --shapes=shapes.ttl --data=data.ttl

# Development with schema-only logging
npm run dev:schema -- --shapes=shapes.ttl --data=data.ttl

# Development with performance metrics only
npm run dev:perf -- --shapes=shapes.ttl --data=data.ttl
```

You can also use the DEBUG environment variable directly:

```bash
# Show all debug logs
DEBUG=tana:* npm run transform -- [options]

# Show only specific categories
DEBUG=tana:schema,tana:instance,tana:perf npm run transform -- [options]
```

See [Logging Documentation](docs/development/logging.md) for more details.

## 📖 Documentation

### Command Line Options

```
Options:
  --shapes <path>       Path to SHACL shapes file (required)
  --data <path>         Path to RDF data file
  --output <path>       Output file path (default: tana-import.json)
  --schema-only         Generate schema without instance data
  --config <path>       Path to configuration file
  --validate            Validate the RDF data against SHACL shapes
  --id-map <path>       Path to save/load IRI-to-UID mapping
  --custom-prefix <uri> Prefix for custom annotations
  --verbose             Enable verbose logging
```

### Configuration File

You can customize the transformation with a configuration file:

```json
{
  "includeShapes": ["http://example.org/PersonShape", "http://example.org/OrganizationShape"],
  "excludeShapes": [],
  "circularReferenceDepth": 3,
  "includeTechnicalMetadata": false,
  "fieldNamingStrategy": "TitleCase",
  "standardAnnotations": {
    "http://www.w3.org/ns/shacl#order": "control field order",
    "http://www.w3.org/ns/shacl#deactivated": "hide fields from UI",
    "http://www.w3.org/ns/shacl#name": "naming for fields and supertags"
  }
}
```

### Standard SHACL Annotations

The transformer uses standard SHACL annotations to control the transformation:

```turtle
ex:PersonShape
  a sh:NodeShape ;
  sh:name "person" ;       # Explicit supertag name
  rdfs:label "Person" ;    # Display label
  sh:property [
    sh:path schema:name ;
    sh:name "Name" ;       # Field name
    sh:order 1 ;           # Field ordering
    sh:deactivated false ; # Control visibility
  ] .
```

## 🧩 Architecture

The transformer consists of several key components:

1. **Shape Analyzer**: Extracts structured information from SHACL shapes
2. **Schema Builder**: Transforms shapes into Tana supertags and fields
3. **Instance Finder**: Locates RDF nodes matching shapes
4. **Instance Transformer**: Converts RDF nodes to Tana nodes
5. **ID Mapper**: Manages IRI-to-UID conversions
6. **Documentation Generator**: Creates documentation in Tana

## 📊 Example

### SHACL Shape

```turtle
ex:PersonShape
  a sh:NodeShape ;
  sh:name "person" ;
  rdfs:label "Person" ;
  sh:targetClass schema:Person ;
  sh:property [
    sh:path schema:name ;
    sh:name "Name" ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
    sh:order 1 ;
  ] ;
  sh:property [
    sh:path schema:email ;
    sh:name "Email" ;
    sh:datatype xsd:string ;
    sh:order 2 ;
  ] .
```

### RDF Data

```turtle
ex:john a schema:Person ;
  schema:name "John Smith" ;
  schema:email "john@example.com" .
```

### Tana Output

```json
{
  "version": "TanaIntermediateFile V0.1",
  "supertags": [
    {
      "uid": "personTag",
      "name": "Person"
    }
  ],
  "nodes": [
    {
      "uid": "john",
      "name": "John Smith",
      "supertags": ["personTag"],
      "children": [
        {
          "name": "Email",
          "type": "field",
          "children": [
            {
              "name": "john@example.com"
            }
          ]
        }
      ]
    }
  ]
}
```

## 🧪 Testing

The project includes comprehensive tests:

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --grep "Shape Analyzer"
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Projects

- [Tana Import Tools](https://github.com/tanainc/tana-import-tools)
- [SHACL.js](https://github.com/zazuko/shacl-js)
- [RDF-Ext](https://github.com/rdf-ext/rdf-ext)

## 🙏 Acknowledgements

- The Tana team for creating an amazing knowledge management tool
- The semantic web community for RDF and SHACL specifications
