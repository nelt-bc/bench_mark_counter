import * as fs from "fs";
import * as path from "path";

export class Database {
  private readonly dbPath: string;
  private cacheData: Record<string, Record<string, string>> = {};

  constructor(dbName: string = "near") {
    // Ensure db folder exists at root
    this.dbPath = path.join(`${dbName}.json`);
    this.ensureDbFolder();
  }

  /**
   * Ensures the db folder exists
   */
  private ensureDbFolder(): void {
    if (!fs.existsSync(path.join(process.cwd(), "db"))) {
      fs.mkdirSync(path.join(process.cwd(), "db"), { recursive: true });
    }
  }

  /**
   * Read all data from the database file
   */
  private readData(prefix: string = ""): Record<string, any> {
    const filePath = path.join(
      process.cwd(),
      "db",
      prefix.length > 0 ? `${prefix}.${this.dbPath}` : this.dbPath
    );
    if (this.cacheData[filePath]) return this.cacheData[filePath];

    try {
      if (!fs.existsSync(filePath)) return {};
      const data = fs.readFileSync(filePath, "utf8");
      const parsedData = JSON.parse(data);
      this.cacheData[filePath] = parsedData;
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading database:", error);
      return {};
    }
  }

  /**
   * Write data to the database file
   */
  private writeData(data: Record<string, any>, prefix: string = ""): void {
    try {
      const filePath = path.join(
        process.cwd(),
        "db",
        prefix.length > 0 ? `${prefix}.${this.dbPath}` : this.dbPath
      );

      const oldData = this.readData(prefix);
      fs.writeFileSync(filePath, JSON.stringify({...oldData, ...data}, null, 2), "utf8");
      this.cacheData = {}
    } catch (error) {
      console.error("Error writing to database:", error);
      throw error;
    }
  }

  /**
   * Get all keys
   */
  keys(prefix: string = ""): string[] {
    const data = this.readData(prefix);
    return Object.keys(data);
  }

  /**
   * Get all values
   */
  values(prefix: string = ""): any[] {
    const data = this.readData(prefix);
    return Object.values(data);
  }

  /**
   * Get all values
   */
  entries(prefix: string = ""): Record<string, string> {
    return this.readData(prefix);
  }

  /**
   * Set multiple key-value pairs at once
   */
  setMultiple(entries: Record<string, any>, prefix: string = ""): void {
    const data = this.readData(prefix);
    Object.assign(data, entries);
    this.writeData(data, prefix);
  }
}

// Export a default instance for convenience
export const db = new Database();
