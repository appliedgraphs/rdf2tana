# RDF to Tana Knowledge Graph Integration

## Project Overview

### What We're Trying to Do
Create a system that transforms RDF data guided by SHACL shapes into Tana's format, allowing knowledge graphs to be visualized, navigated, and potentially edited using Tana's user-friendly interface.

### Why We Want to Do It
- Leverage Tana's structured note-taking interface as an intuitive frontend for knowledge graphs
- Make complex RDF data accessible to non-technical users via a familiar interface
- Maintain the semantic richness of RDF while providing a more approachable UI than traditional graph visualization tools
- Enable domain experts to interact with knowledge graphs without requiring expertise in RDF or SPARQL

### Core Approach
1. Use SHACL shapes to define the structure and types of entities in our knowledge graph
2. Transform SHACL shapes into Tana supertags (schema)
3. Use shapes to identify matching instances in the RDF graph
4. Transform matching RDF nodes into Tana nodes with the appropriate supertags and fields
5. Export as Tana's JSON import format for initial loading
6. Potentially use the API for incremental updates in the future

## Implementation Design

### Overall Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   RDF Graph     │    │  SHACL Shapes    │    │ Custom Config   │
│                 │    │                  │    │                 │
└────────┬────────┘    └────────┬─────────┘    └────────┬────────┘
         │                      │                       │
         │                      │                       │
         ▼                      ▼                       ▼
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                RDF to Tana Transformer                         │
│                                                                │
│   ┌───────────────────┐        ┌───────────────────────┐      │
│   │                   │        │                       │      │
│   │  Schema Builder   │        │ Instance Transformer  │      │
│   │                   │        │                       │      │
│   └───────────────────┘        └───────────────────────┘      │
│                                                                │
└──────────────────────────────┬─────────────────────────────────┘
                              │
                              │
                              ▼
                    ┌──────────────────────┐
                    │                      │
                    │  Tana Import JSON    │
                    │                      │
                    └──────────────────────┘
                              │
                              │
                              ▼
                      ┌───────────────┐
                      │               │
                      │  Tana System  │
                      │               │
                      └───────────────┘
```

### Key Components

#### 1. Shape Analyzer
Parses SHACL shapes and extracts entity types, properties, and constraints.

#### 2. Schema Builder
Transforms SHACL shapes into Tana supertags and field definitions.

#### 3. Instance Finder
Uses shape information to find matching nodes in the RDF graph.

#### 4. Instance Transformer
Converts RDF nodes into Tana nodes with appropriate fields and references.

#### 5. Tana JSON Builder
Assembles all generated components into the Tana import JSON format.

#### 6. ID Mapping Manager
Maintains mapping between RDF IRIs and Tana UIDs.

## Pseudocode of Key Interfaces

### Shape Analyzer

```typescript
interface ShapeInfo {
  targetClass?: string;            // The rdf:type this shape targets
  nodeShape: RDFNode;              // Reference to the shape node in the graph
  label: string;                   // Human-readable label for the shape
  properties: PropertyInfo[];      // Property constraints defined by this shape
  constraints: Constraint[];       // Node-level constraints
  customAnnotations: Map<string, any>; // Any additional custom annotations
}

interface PropertyInfo {
  path: string;                    // The property path (predicate)
  nodeKind?: string;               // IRI, BlankNode, Literal, etc.
  datatype?: string;               // If literal, the XSD datatype
  shapes?: ShapeInfo[];            // For node references, target shapes
  minCount?: number;               // Minimum cardinality
  maxCount?: number;               // Maximum cardinality
  customAnnotations: Map<string, any>; // Custom annotations
}

function analyzeShapes(shapesGraph: RDFGraph): ShapeInfo[] {
  // Extract all sh:NodeShape instances
  // For each shape, extract properties and constraints
  // Return structured shape information
}
```

### Schema Builder

```typescript
interface TanaSupertag {
  uid: string;                    // Unique identifier for the supertag
  name: string;                   // Display name for the tag
  description?: string;           // Optional description
}

interface TanaFieldDefinition {
  uid: string;                    // Unique identifier
  name: string;                   // Field name
  fieldType: "text" | "date" | "url" | "reference"; // Type of field
  parentTagId: string;            // Which supertag this belongs to
}

function buildTanaSchemaFromShapes(shapes: ShapeInfo[]): {
  supertags: TanaSupertag[];
  fields: TanaFieldDefinition[];
} {
  // For each shape, create a supertag
  // For each property, create a field definition
  // Handle property paths and constraints
  // Return complete schema
}
```

### Instance Transformer

```typescript
interface TanaNode {
  uid: string;                    // Unique identifier
  name: string;                   // Display name
  description?: string;           // Optional description
  supertags?: string[];           // Applied supertags (by UID)
  children?: (TanaNode | TanaField)[]; // Child nodes and fields
  refs?: string[];                // References to other nodes
  type?: "node" | "field" | "image" | "codeblock" | "date";
}

interface TanaField {
  uid: string;                    // Unique identifier
  name: string;                   // Field name
  children?: TanaNode[];          // Field values
  type: "field";
}

function transformInstances(
  rdfGraph: RDFGraph, 
  shapes: ShapeInfo[], 
  idMap: Map<string, string>
): TanaNode[] {
  const nodes = [];
  
  // For each shape, find matching instances in the graph
  for (const shape of shapes) {
    const instances = findInstancesForShape(rdfGraph, shape);
    
    // Transform each instance to a Tana node
    for (const instance of instances) {
      const tanaNode = createTanaNodeFromRDF(instance, shape, rdfGraph, idMap);
      nodes.push(tanaNode);
    }
  }
  
  return nodes;
}
```

### ID Mapping Manager

```typescript
class IDMapper {
  private iriToUid = new Map<string, string>();
  
  // Get or create a UID for an IRI
  getUidForIri(iri: string): string {
    if (!this.iriToUid.has(iri)) {
      // Generate a valid Tana UID (7-16 chars, alphanumeric + _ and -)
      const uid = this.generateValidUid(iri);
      this.iriToUid.set(iri, uid);
    }
    return this.iriToUid.get(iri)!;
  }
  
  // Generate a valid Tana UID from an IRI
  private generateValidUid(iri: string): string {
    // Hash the IRI and format as valid Tana UID
    const hash = createHash('md5').update(iri).digest('hex');
    return hash.substring(0, 15).replace(/[^A-Za-z0-9_-]/g, '_');
  }
  
  // Save mapping to a file for future reference
  saveMapping(filePath: string): void {
    // Serialize the mapping to JSON and save
  }
  
  // Load existing mapping from a file
  loadMapping(filePath: string): void {
    // Load and parse mapping from JSON
  }
}
```

### Complete Transformer

```typescript
class RdfToTanaTransformer {
  private shapesGraph: RDFGraph;
  private dataGraph: RDFGraph;
  private idMapper: IDMapper;
  private config: TransformerConfig;
  
  constructor(
    shapesGraph: RDFGraph, 
    dataGraph: RDFGraph,
    config: TransformerConfig
  ) {
    this.shapesGraph = shapesGraph;
    this.dataGraph = dataGraph;
    this.idMapper = new IDMapper();
    this.config = config;
  }
  
  // Main transformation method
  transform(): TanaImportData {
    // Analyze shapes
    const shapes = analyzeShapes(this.shapesGraph);
    
    // Build schema (supertags and fields)
    const schema = buildTanaSchemaFromShapes(shapes);
    
    // Transform instances
    const nodes = transformInstances(this.dataGraph, shapes, this.idMapper);
    
    // Create summary statistics
    const summary = this.createSummary(nodes);
    
    // Assemble complete Tana import format
    return {
      version: "TanaIntermediateFile V0.1",
      summary,
      supertags: schema.supertags,
      nodes
    };
  }
  
  // Generate a complete import file
  async generateImportFile(outputPath: string): Promise<void> {
    const importData = this.transform();
    await writeFile(outputPath, JSON.stringify(importData, null, 2));
  }
}
```

## Tricky Parts and Solutions

### 1. IRIs vs. Tana UIDs

**Challenge**: RDF uses IRIs as identifiers, but Tana has specific constraints on UIDs (7-16 alphanumeric characters plus _ and -).

**Solution**:
- Create a consistent mapping between IRIs and Tana UIDs
- Store the original IRI in a field or description
- Maintain an external mapping file for bidirectional lookup

```typescript
function createUidFromIri(iri: string): string {
  // Hash the IRI to create a deterministic UID
  const hash = crypto.createHash('md5').update(iri).digest('hex');
  // Take the first 15 characters and ensure they're valid
  return hash.substring(0, 15).replace(/[^A-Za-z0-9_-]/g, '_');
}
```

### 2. Complex Property Paths

**Challenge**: SHACL supports complex property paths (sequences, alternatives, inversions) that have no direct equivalent in Tana.

**Solution**:
- For simple property paths, map directly to Tana fields
- For complex paths, create computed fields or multiple fields
- Annotate the SHACL shapes with guidance on how to handle complex paths

```typescript
function handlePropertyPath(path: RDFNode, shapeGraph: RDFGraph): FieldDefinition[] {
  if (isSimplePath(path)) {
    return [createSimpleField(path)];
  } else if (isSequencePath(path)) {
    // Create a field that represents the composition of paths
    return [createComputedField(path)];
  } else if (isAlternativePath(path)) {
    // Create multiple fields, one for each alternative
    return extractAlternatives(path).map(createSimpleField);
  }
  // Handle other cases
}
```

### 3. Circular References

**Challenge**: RDF graphs can contain circular references, which need careful handling when converted to Tana's format.

**Solution**:
- Detect circular references during transformation
- For circular references, create normal references in Tana
- Use a depth-limited traversal algorithm

```typescript
function transformNodeWithDepthLimit(
  node: RDFNode, 
  shape: ShapeInfo, 
  visitedNodes: Set<string>, 
  depth: number
): TanaNode {
  if (depth <= 0 || visitedNodes.has(node.value)) {
    // Create a reference-only node
    return createReferenceNode(node);
  }
  
  visitedNodes.add(node.value);
  // Process normally with the depth limit
  // ...
}
```

### 4. Handling SHACL Constraints

**Challenge**: SHACL has rich validation constraints that can't be directly represented in Tana.

**Solution**:
- Perform validation during transformation
- Document constraints in field descriptions
- Apply any constraints that can be mapped to Tana's field types

```typescript
function applyConstraints(field: TanaField, propertyInfo: PropertyInfo): TanaField {
  // Set field type based on datatype
  if (propertyInfo.datatype === 'xsd:date') {
    field.dataType = 'date';
  }
  
  // Add constraint info to description
  if (propertyInfo.minCount || propertyInfo.maxCount) {
    field.description = `${field.description || ''} [Cardinality: ${propertyInfo.minCount || 0}..${propertyInfo.maxCount || '*'}]`;
  }
  
  return field;
}
```

### 5. Storing Technical Metadata

**Challenge**: Need to store technical RDF metadata (like IRIs) without cluttering the user interface.

**Solution**:
- Create a dedicated "Metadata" field with the IRI
- Use a consistent naming convention with a prefix like "_"
- Store in description when appropriate

```typescript
function addMetadataField(node: TanaNode, iri: string): TanaNode {
  // Add a metadata field with the IRI
  const metadataField: TanaField = {
    uid: generateUid(),
    name: "_iri",
    type: "field",
    children: [{
      uid: generateUid(),
      name: iri,
      type: "node"
    }]
  };
  
  node.children = node.children || [];
  node.children.push(metadataField);
  
  return node;
}
```

## Implementation Strategy

### Phase 1: Basic Transformation

1. Implement the Shape Analyzer to extract SHACL shape information
2. Build the Schema Builder to create Tana supertags and fields
3. Create the Instance Transformer for basic RDF to Tana conversion
4. Implement the ID Mapper to handle IRI-to-UID conversion
5. Generate complete Tana import files

### Phase 2: Enhanced Features

1. Add support for complex property paths
2. Implement better handling of circular references
3. Add custom annotations for controlling transformation
4. Create a configuration system for customizing the transformation

### Phase 3: API Integration (Optional)

1. Implement delta detection between RDF graph versions
2. Create incremental update functionality using Tana's API
3. Build a synchronization system for keeping Tana in sync with the RDF source

## Additional Considerations

### 1. Configuration Options

Create a flexible configuration system to control how the transformation works:

```typescript
interface TransformerConfig {
  // Which shapes to include/exclude
  includeShapes?: string[];
  excludeShapes?: string[];
  
  // How to handle circular references
  circularReferenceDepth: number;
  
  // Whether to include technical metadata
  includeTechnicalMetadata: boolean;
  
  // Field naming conventions
  fieldNamingStrategy: "camelCase" | "TitleCase" | "kebab-case";
  
  // How to handle datatypes
  datatypeMappings: Map<string, string>;
}
```

### 2. Custom SHACL Annotations

Define custom annotations to control the transformation:

```
ex:PersonShape
  a sh:NodeShape ;
  sh:targetClass schema:Person ;
  ex:tanaDisplay "compact" ;  # Custom annotation for display hint
  ex:tanaHideMetadata true ;  # Hide technical metadata
  sh:property [
    sh:path schema:name ;
    ex:tanaPriority 1 ;  # Order in the UI
    ex:tanaFieldType "primary" ;  # Special field designation
  ] .
```

### 3. Documentation Generation

Generate documentation for the Tana knowledge graph:

```typescript
function generateDocumentation(shapes: ShapeInfo[]): TanaNode {
  const docNode: TanaNode = {
    uid: generateUid(),
    name: "Knowledge Graph Documentation",
    type: "node"
  };
  
  // Create a child node for each entity type
  for (const shape of shapes) {
    const shapeDoc = createShapeDocumentation(shape);
    docNode.children = docNode.children || [];
    docNode.children.push(shapeDoc);
  }
  
  return docNode;
}
```

### 4. Internationalization

Support for multiple languages in the RDF data:

```typescript
function getLocalizedName(node: RDFNode, graph: RDFGraph, language: string): string {
  // Try to find a name in the preferred language
  const labelTriples = graph.match(node, RDFS.label, null);
  
  // Filter by language if available
  const localizedLabels = labelTriples.filter(triple => 
    triple.object.language === language
  );
  
  if (localizedLabels.length > 0) {
    return localizedLabels[0].object.value;
  }
  
  // Fall back to any label
  if (labelTriples.length > 0) {
    return labelTriples[0].object.value;
  }
  
  // Last resort, use the local name from the IRI
  return extractLocalName(node.value);
}
```

## Conclusion

The RDF to Tana transformation system provides a powerful way to make knowledge graphs accessible through Tana's user-friendly interface. By leveraging SHACL shapes to guide the transformation, we can create a structured representation that maintains the semantics of the original RDF while taking advantage of Tana's features.

The proposed approach handles the key challenges of identifier mapping, property representation, and structural transformation in a way that balances technical accuracy with user experience. The system can be extended with additional features like documentation generation, internationalization support, and incremental updates via the API.

This solution allows domain experts to interact with knowledge graph data in a familiar, note-taking interface while preserving the underlying semantic structure. The transformation pipeline is customizable through configuration options and custom annotations, making it adaptable to different knowledge graph domains and use cases.
