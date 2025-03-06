# Claude Code Prompts for RDF to Tana Transformer

This document provides a series of focused prompts for Claude Code to implement the RDF to Tana transformation system. Each prompt is designed to generate a specific component of the system while maintaining code quality and testability.

## Prompt 1: Project Setup and Core Types

```
Create a TypeScript project for transforming RDF data to Tana format using SHACL shapes as guides. Set up the following:

1. A modern TypeScript project structure with appropriate tsconfig.json
2. Core type definitions for:
   - SHACL shape information (ShapeInfo, PropertyInfo)
   - Tana output format (TanaSupertag, TanaNode, TanaField)
   - Configuration options (TransformerConfig)
3. Constants for SHACL, RDF, and other relevant namespaces
4. A simple logging utility
5. Basic error types for the application

Include Jest for testing and use rdflib.js for RDF graph manipulation. Focus on clean interfaces and maintainable code. Add JSDoc comments for all public interfaces and functions.
```

## Prompt 2: Shape Analyzer Implementation

```
Implement a ShapeAnalyzer class that extracts structured information from SHACL shapes in an RDF graph. The class should:

1. Extract all sh:NodeShape instances from a graph
2. For each shape:
   - Identify target classes and target nodes
   - Extract property constraints with paths, datatypes, cardinalities, etc.
   - Extract node constraints (closed, disjoint, etc.)
   - Support custom annotations with a specified prefix

Include the following features:
- Support for property paths including predicate paths, sequence paths, and alternative paths
- Handling of common SHACL constraints like datatype, class, nodeKind, minCount, maxCount
- Extraction of human-readable labels and descriptions

Write comprehensive unit tests that use example SHACL shapes including:
- A basic person shape with simple properties
- A shape with various constraints
- A shape with nested shape references
- A shape with custom annotations

Use dependency injection for the RDF library to keep the code testable. Focus on making the extracted information easy to work with in later transformation steps.
```

## Prompt 3: ID Mapping System

```
Create an IDMapper class that handles conversion between RDF IRIs and Tana UIDs. The class should:

1. Generate deterministic, valid Tana UIDs (7-16 alphanumeric chars plus underscore and dash) from IRIs
2. Maintain a bidirectional mapping between IRIs and UIDs
3. Save and load mappings from a JSON file
4. Handle potential collisions by detecting and resolving them

Include helper methods to:
- Retrieve a UID for a given IRI, creating it if it doesn't exist
- Look up an IRI from a UID
- Extract a human-readable label from an IRI for display purposes
- Determine if an IRI has already been mapped

Write thorough unit tests that:
- Verify generated UIDs are valid for Tana (correct length and characters)
- Confirm mappings are deterministic and consistent
- Test persistence and reloading of mappings
- Verify collision detection and resolution

Ensure the implementation is efficient, thread-safe, and handles edge cases like null values, empty strings, and extremely long IRIs.
```

## Prompt 4: Schema Builder

```
Create a SchemaBuilder class that transforms SHACL shape information into Tana supertags and field definitions. The implementation should:

1. Convert each SHACL NodeShape into a Tana supertag with appropriate metadata
2. Transform property constraints into Tana field definitions
3. Handle nested shapes and references between shapes
4. Apply custom configuration options for naming conventions and field types

Key functionality:
- Map SHACL datatypes to Tana field types (text, date, url, reference)
- Convert shape labels and descriptions to Tana supertag metadata
- Determine appropriate field names from property paths
- Handle property groups and organization

Include unit tests that verify:
- Correct conversion of simple shapes to supertags
- Proper handling of nested shapes and references
- Application of configuration options
- Generation of valid Tana schema structure

The class should accept ShapeInfo objects from the ShapeAnalyzer and produce data structures ready for inclusion in the Tana import format.
```

## Prompt 5: Instance Transformer Core

```
Implement an InstanceTransformer class that converts RDF nodes to Tana nodes based on SHACL shapes. The core functionality should:

1. Find instances in an RDF graph that match a given shape's target constraints
2. Transform each matching instance into a Tana node with the appropriate supertag
3. Handle basic property values and convert them to Tana fields
4. Manage references between nodes using the IDMapper

Include methods to:
- Find all nodes matching a shape's target class or target node constraints
- Create a basic Tana node from an RDF node with name, description, etc.
- Extract a display name from an RDF node using rdfs:label, skos:prefLabel, or local name
- Set up the supertag association

Write unit tests that verify:
- Correct identification of matching instances
- Basic transformation of simple instances
- Proper extraction of node names and descriptions
- Creation of valid Tana node structures

Focus on the core instance finding and basic node creation functionality in this implementation. We'll handle more complex property handling in the next prompt.
```

## Prompt 6: Property Value Handlers

```
Extend the InstanceTransformer with property value handlers to process different types of RDF property values into Tana field values. Implement these key components:

1. A PropertyValueHandler interface with methods for different value types
2. Specific handlers for:
   - Literal values (strings, numbers, dates, etc.)
   - Resource references (URIs to other entities)
   - Nested objects (blank nodes or complex structures)
   - Lists and collections
3. A strategy for handling multi-valued properties

Include functionality to:
- Convert XSD datatypes to appropriate JavaScript/Tana types
- Format dates according to Tana's expected format
- Handle language-tagged strings
- Detect and handle circular references
- Create references to other Tana nodes for object properties

Write unit tests covering:
- Handling of all common XSD datatypes
- Multi-valued property conversion
- Reference resolution
- Circular reference detection and handling
- Language tag handling

Make the handlers extensible so custom handlers can be added for specific property paths or datatypes. Use configuration options to control behavior like handling of unrecognized datatypes.
```

## Prompt 7: Complete Transformer and CLI

```
Create a complete RdfToTanaTransformer class that orchestrates the entire transformation process and a Command Line Interface (CLI) to use it. Implement:

1. The main transformer that:
   - Analyzes shapes using ShapeAnalyzer
   - Builds schema with SchemaBuilder
   - Transforms instances with InstanceTransformer
   - Assembles the complete Tana import format
   - Handles configuration options

2. A CLI that:
   - Accepts command line arguments for input files, output file, and configuration
   - Supports different modes (schema-only, validation, full transform)
   - Provides helpful feedback and progress information
   - Returns appropriate exit codes

Include functionality to:
- Generate summary statistics about the transformation
- Validate the output against Tana's expected format
- Save the output to a JSON file
- Print human-readable logs of the transformation process

Write integration tests that:
- Transform a complete example dataset from RDF to Tana format
- Verify the resulting file can be parsed and matches expectations
- Test different configuration options and modes

Make the CLI user-friendly with good error messages, progress indicators, and help text. Support both file inputs and standard input/output for pipeline usage.
```

## Prompt 8: Documentation Generator

```
Implement a DocumentationGenerator class that creates documentation nodes for the generated Tana schema. The generator should:

1. Create a root documentation node with an overview of the knowledge graph
2. Generate documentation for each supertag:
   - Description and purpose
   - List of fields with explanations
   - Relationships to other entity types
   - Constraints and validation rules

3. Include special features to:
   - Generate example instances for each supertag
   - Create visualizations of entity relationships (as text diagrams)
   - Document any technical details or implementation notes

Write unit tests verifying:
- Generation of documentation for a simple schema
- Inclusion of all relevant fields and constraints
- Proper formatting and organization of documentation

Make the documentation user-friendly and informative for non-technical users while still including relevant technical details for developers or data stewards.
```

## Prompt 9: Configuration System

```
Create a comprehensive configuration system for the RDF to Tana transformer. Implement:

1. A Configuration class with:
   - Default settings for all options
   - Methods to load from JSON file or command line arguments
   - Validation of settings for consistency and correctness

2. Configuration options for:
   - Shape filtering (include/exclude patterns)
   - Field naming strategies (camelCase, PascalCase, kebab-case)
   - Handling of multi-valued properties
   - Depth limits for circular references
   - Custom datatype mappings
   - Metadata inclusion/exclusion
   - Logging verbosity and format

3. A schema for configuration files with validation

Include methods to:
- Merge multiple configuration sources with priority
- Apply environment variable overrides
- Save configuration to a file
- Generate a default configuration file

Write unit tests for:
- Loading from different sources
- Validation of configuration
- Application of defaults
- Handling of invalid configurations

Make the configuration system flexible enough to support different use cases while providing sensible defaults and clear validation errors for misconfiguration.
```

## Prompt 10: Testing Utilities and Example Dataset

```
Create testing utilities and an example dataset for the RDF to Tana transformer. Implement:

1. Testing utilities:
   - RDF graph builders for test cases
   - Assertion helpers for common validation patterns
   - Mocks for external dependencies
   - Test fixtures for common SHACL shapes and RDF patterns

2. A complete example dataset:
   - SHACL shapes for common entity types (Person, Organization, Creative Work, etc.)
   - Sample RDF data conforming to those shapes
   - Expected Tana output for validation

3. Performance testing tools:
   - Benchmarking utilities for measuring transformation speed
   - Memory usage tracking
   - Scaling tests for different data sizes

Write meta-tests that verify the testing utilities themselves work correctly. Structure the example dataset to showcase both simple and complex transformation scenarios, including circular references, multi-typed entities, and various constraints.

Make the testing utilities reusable across the project and document them thoroughly for other developers.
```

## Using These Prompts Effectively

For the best results with Claude Code:

1. **Start with the project setup** (Prompt 1) to establish the foundation
2. **Build core components in order** (Prompts 2-4) before tackling instance transformation
3. **Take incremental steps** with the instance transformer (Prompts 5-6)
4. **Integrate components** with the complete transformer (Prompt 7)
5. **Add enhancements** like documentation and configuration (Prompts 8-9)
6. **Create testing utilities** last after having a clear view of the system (Prompt 10)

You may need to make adjustments to later prompts based on the specific implementation details Claude Code generates in earlier steps.

Each prompt builds on the previous ones, so review the code from each step before proceeding to ensure consistency and quality throughout the implementation.
