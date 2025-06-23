# Database Class

A simple key-value database that stores data in JSON files within the `db` folder at the project root.

## Features

- **Key-value storage**: Store any JSON-serializable data
- **Multiple databases**: Create separate database files for different purposes
- **Type safety**: TypeScript support with generic types
- **Automatic folder creation**: Creates the `db` folder if it doesn't exist
- **Error handling**: Graceful error handling for file operations
- **Convenience methods**: Rich API for common operations

## Usage

### Basic Usage

```typescript
import { Database, db } from './utils/db';

// Using the default database instance
db.set('user:1', { name: 'John Doe', email: 'john@example.com' });
const user = db.get('user:1');
console.log(user); // { name: 'John Doe', email: 'john@example.com' }
```

### Creating Custom Database Instances

```typescript
// Create separate database files
const userDb = new Database('users');     // Creates db/users.json
const configDb = new Database('config');  // Creates db/config.json

userDb.set('admin', { role: 'admin', permissions: ['read', 'write'] });
configDb.set('app_name', 'MyApp');
```

### Available Methods

#### Core Operations
- `get<T>(key: string): T | undefined` - Get a value by key
- `set(key: string, value: any): void` - Set a key-value pair
- `delete(key: string): boolean` - Delete a key (returns true if deleted)
- `has(key: string): boolean` - Check if a key exists

#### Utility Methods
- `keys(): string[]` - Get all keys
- `values(): any[]` - Get all values
- `entries(): [string, any][]` - Get all key-value pairs
- `getAll(): Record<string, any>` - Get all data as an object
- `size(): number` - Get the number of keys
- `clear(): void` - Clear all data

#### Batch Operations
- `setMultiple(entries: Record<string, any>): void` - Set multiple key-value pairs at once

#### Utility
- `getDbPath(): string` - Get the database file path

### Type Safety

```typescript
// Type-safe retrieval
const counter = db.get<number>('counter');
const user = db.get<{ name: string; email: string }>('user:1');
```

### File Structure

The database creates JSON files in the `db` folder:

```
db/
├── default.json    # Default database (when using 'db' instance)
├── users.json      # Custom database for users
├── config.json     # Custom database for configuration
└── ...
```

### Error Handling

The database handles common errors gracefully:
- File not found: Returns empty object
- JSON parsing errors: Returns empty object
- Write errors: Throws exception with error details

### Example

See `db-example.ts` for a complete usage example.

## Performance Notes

- Each operation reads/writes the entire file
- Suitable for small to medium datasets
- For large datasets, consider using a proper database
- File operations are synchronous for simplicity 